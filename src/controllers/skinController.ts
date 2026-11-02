import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { HttpError } from "../utils/http-error";
import { parseId } from "../utils/parse";
import { sendSuccess } from "../utils/response";
import { Rarity } from "../generated/prisma/client";

export const getAllSkins = async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (req.query.heroId) {
    where.heroId = Number(req.query.heroId);
  }
  if (req.query.rarity) {
    where.rarity = req.query.rarity as Rarity;
  }

  const [totalItems, data] = await Promise.all([
    prisma.skin.count({ where }),
    prisma.skin.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "asc" },
      include: {
        hero: {
          select: { name: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 0;

  sendSuccess(res, 200, "Berhasil mengambil data skin", data, {
    currentPage: page,
    limit,
    totalItems,
    totalPages,
  });
};

export const getSkinById = async (req: Request, res: Response) => {
  const id = parseId(req.params.skin_id, "Skin ID");

  const skin = await prisma.skin.findUnique({
    where: { id },
    include: {
      hero: {
        select: { name: true },
      },
    },
  });

  if (!skin) {
    throw new HttpError(404, "Skin tidak ditemukan");
  }

  sendSuccess(res, 200, "Berhasil mengambil data skin", skin);
};
