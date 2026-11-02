import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { HttpError } from "../utils/http-error";
import { parseId } from "../utils/parse";
import { sendSuccess } from "../utils/response";
import { Role, Lane } from "../generated/prisma/client";

export const getAllHeroes = async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (req.query.search) {
    where.name = {
      contains: String(req.query.search),
      mode: "insensitive",
    };
  }
  if (req.query.role) {
    where.role = req.query.role as Role;
  }

  const [totalItems, data] = await Promise.all([
    prisma.hero.count({ where }),
    prisma.hero.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 0;

  sendSuccess(res, 200, "Berhasil mengambil data hero", data, {
    currentPage: page,
    limit,
    totalItems,
    totalPages,
  });
};

export const getHeroById = async (req: Request, res: Response) => {
  const id = parseId(req.params.hero_id, "Hero ID");

  const hero = await prisma.hero.findUnique({
    where: { id },
    include: { skins: true },
  });

  if (!hero) {
    throw new HttpError(404, "Hero tidak ditemukan");
  }

  sendSuccess(res, 200, "Berhasil mengambil data hero", hero);
};

export const createHero = async (req: Request, res: Response) => {
  const { name, role, lane, releaseYear, priceBP, priceDiamond } = req.body ?? {};

  // 1. name, role, lane, atau releaseYear tidak diisi -> 400
  if (
    !name ||
    typeof name !== "string" ||
    name.trim() === "" ||
    !role ||
    !lane ||
    releaseYear === undefined ||
    releaseYear === null ||
    releaseYear === "" ||
    isNaN(Number(releaseYear))
  ) {
    throw new HttpError(400, "name, role, lane, dan releaseYear wajib diisi");
  }

  const existing = await prisma.hero.findUnique({
    where: { name: name.trim() },
  });
  if (existing) {
    throw new HttpError(409, "Nama hero sudah ada");
  }

  // 3. Berhasil -> 201 berisi hero baru
  const newHero = await prisma.hero.create({
    data: {
      name: name.trim(),
      role: role as Role,
      lane: lane as Lane,
      releaseYear: Number(releaseYear),
      priceBP: priceBP != null && priceBP !== "" ? Number(priceBP) : null,
      priceDiamond: priceDiamond != null && priceDiamond !== "" ? Number(priceDiamond) : null,
    },
  });

  sendSuccess(res, 201, "Hero berhasil dibuat", newHero);
};
