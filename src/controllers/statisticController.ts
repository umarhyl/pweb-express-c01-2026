import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { sendSuccess } from "../utils/response";

export const getStatistics = async (req: Request, res: Response) => {
  const totalPlayers = await prisma.player.count();

  const totalHeroesOwned = await prisma.playerHero.count();

  const totalDiamondResult = await prisma.player.aggregate({
    _sum: { diamond: true },
  });
  const totalDiamond = totalDiamondResult._sum.diamond || 0;

  const mostOwnedGroup = await prisma.playerHero.groupBy({
    by: ["heroId"],
    _count: { heroId: true },
    orderBy: { _count: { heroId: "desc" } },
    take: 1,
  });

  let mostOwnedHeroData = null;
  if (mostOwnedGroup.length > 0) {
    const heroId = mostOwnedGroup[0].heroId;
    const count = mostOwnedGroup[0]._count.heroId;

    const heroDetail = await prisma.hero.findUnique({
      where: { id: heroId },
      select: { id: true, name: true },
    });

    if (heroDetail) {
      mostOwnedHeroData = {
        hero: heroDetail,
        owners: count,
      };
    }
  }

  const heroesPerRoleGroup = await prisma.hero.groupBy({
    by: ["role"],
    _count: { role: true },
  });

  const heroesPerRole = heroesPerRoleGroup.map((item) => ({
    role: item.role,
    total: item._count.role,
  }));

  sendSuccess(res, 200, "Berhasil mengambil statistik", {
    totalPlayers,
    totalHeroesOwned,
    totalDiamond,
    mostOwnedHero: mostOwnedHeroData,
    heroesPerRole,
  });
};
