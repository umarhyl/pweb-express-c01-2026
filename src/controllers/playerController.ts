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
