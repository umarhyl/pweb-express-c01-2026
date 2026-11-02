import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { HttpError } from "../utils/http-error";
import { parseId } from "../utils/parse";
import { sendSuccess } from "../utils/response";

export const createPlayer = async (req: Request, res: Response) => {
  const { nickname } = req.body ?? {};

  if (!nickname || typeof nickname !== "string" || nickname.trim() === "") {
    throw new HttpError(400, "Nickname wajib diisi");
  }

  const existing = await prisma.player.findUnique({
    where: { nickname: nickname.trim() },
  });
  if (existing) {
    throw new HttpError(409, "Nickname sudah digunakan");
  }

  const player = await prisma.player.create({
    data: { nickname: nickname.trim() },
  });

  sendSuccess(res, 201, "Player berhasil dibuat", player);
};

export const getPlayerById = async (req: Request, res: Response) => {
  const id = parseId(req.params.player_id, "Player ID");

  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      playerHeroes: {
        include: {
          hero: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const formattedPlayer = {
    id: player.id,
    nickname: player.nickname,
    bp: player.bp,
    diamond: player.diamond,
    createdAt: player.createdAt,
    heroes: player.playerHeroes.map((ph) => ({
      heroId: ph.heroId,
      name: ph.hero.name,
      currency: ph.currency,
      pricePaid: ph.pricePaid,
    })),
  };

  sendSuccess(res, 200, "Berhasil mengambil data player", formattedPlayer);
};

export const updatePlayer = async (req: Request, res: Response) => {
  const id = parseId(req.params.player_id, "Player ID");

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const { nickname } = req.body ?? {};
  if (!nickname || typeof nickname !== "string" || nickname.trim() === "") {
    throw new HttpError(400, "Nickname wajib diisi");
  }

  const existing = await prisma.player.findUnique({
    where: { nickname: nickname.trim() },
  });
  if (existing && existing.id !== id) {
    throw new HttpError(409, "Nickname sudah digunakan oleh player lain");
  }

  const updatedPlayer = await prisma.player.update({
    where: { id },
    data: { nickname: nickname.trim() },
  });

  sendSuccess(res, 200, "Nickname berhasil diperbarui", updatedPlayer);
};

export const deletePlayer = async (req: Request, res: Response) => {
  const id = parseId(req.params.player_id, "Player ID");

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  await prisma.player.delete({ where: { id } });

  sendSuccess(res, 200, "Player berhasil dihapus");
};

export const topUp = async (req: Request, res: Response) => {
  const id = parseId(req.params.player_id, "Player ID");
  const { amount } = req.body ?? {};

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new HttpError(400, "Amount harus bilangan bulat lebih dari 0");
  }

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const updatedPlayer = await prisma.player.update({
    where: { id },
    data: { diamond: { increment: amount } },
  });

  sendSuccess(res, 200, "Top up berhasil", {
    playerId: updatedPlayer.id,
    amount,
    diamond: updatedPlayer.diamond,
  });
};

export const matchResult = async (req: Request, res: Response) => {
  const id = parseId(req.params.player_id, "Player ID");
  const { result } = req.body ?? {};

  if (result !== "WIN" && result !== "LOSE") {
    throw new HttpError(400, "Result harus WIN atau LOSE");
  }

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const bpEarned = result === "WIN" ? 300 : 100;

  const updatedPlayer = await prisma.player.update({
    where: { id },
    data: { bp: { increment: bpEarned } },
  });

  sendSuccess(res, 200, "Hadiah match berhasil ditambahkan", {
    playerId: updatedPlayer.id,
    result,
    bpEarned,
    bp: updatedPlayer.bp,
  });
};

export const buyHero = async (req: Request, res: Response) => {
  const id = parseId(req.params.player_id, "Player ID");
  const { heroId, currency } = req.body ?? {};

  if (!heroId || (currency !== "BP" && currency !== "DIAMOND")) {
    throw new HttpError(400, "heroId harus diisi dan currency harus BP atau DIAMOND");
  }

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const hero = await prisma.hero.findUnique({ where: { id: Number(heroId) } });
  if (!hero) {
    throw new HttpError(404, "Hero tidak ditemukan");
  }

  const price = currency === "BP" ? hero.priceBP : hero.priceDiamond;
  if (price === null) {
    throw new HttpError(400, `Hero ${hero.name} tidak bisa dibeli dengan ${currency}`);
  }

  const alreadyOwned = await prisma.playerHero.findUnique({
    where: {
      playerId_heroId: {
        playerId: id,
        heroId: Number(heroId),
      },
    },
  });
  if (alreadyOwned) {
    throw new HttpError(409, "Player sudah memiliki hero tersebut");
  }

  const currentBalance = currency === "BP" ? player.bp : player.diamond;
  if (currentBalance < price) {
    throw new HttpError(400, `Saldo ${currency} tidak cukup`);
  }

  const updateBalanceQuery = prisma.player.update({
    where: { id },
    data: {
      [currency === "BP" ? "bp" : "diamond"]: { decrement: price },
    },
  });

  const createPlayerHeroQuery = prisma.playerHero.create({
    data: {
      playerId: id,
      heroId: Number(heroId),
      currency: currency as "BP" | "DIAMOND",
      pricePaid: price,
    },
  });

  const [updatedPlayer] = await prisma.$transaction([
    updateBalanceQuery,
    createPlayerHeroQuery,
  ]);

  sendSuccess(res, 201, "Hero berhasil dibeli", {
    hero: {
      id: hero.id,
      name: hero.name,
    },
    currency,
    pricePaid: price,
    balance: {
      bp: updatedPlayer.bp,
      diamond: updatedPlayer.diamond,
    },
  });
};
