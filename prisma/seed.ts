import fs from "fs";
import path from "path";
import prisma from "../src/config/prisma";
import { Role, Lane, Rarity, Currency } from "../src/generated/prisma/client";

async function main() {
  console.log("Seeding database...");

  // 1. Kosongkan semua tabel dengan raw query
  await prisma.$executeRawUnsafe(
    `TRUNCATE "PlayerHero", "Player", "Skin", "Hero" RESTART IDENTITY CASCADE;`
  );

  // 2. Masukkan semua hero dengan createMany
  const heroesPath = path.join(process.cwd(), "data", "heroes.json");
  const rawHeroes = JSON.parse(fs.readFileSync(heroesPath, "utf-8"));
  const heroesData = rawHeroes.map((h: any) => ({
    name: h.name,
    role: h.primaryRole as Role,
    lane: h.primaryLane as Lane,
    releaseYear: Number(h.releaseYear),
    priceBP: h.priceBP != null && h.priceBP !== "" ? Number(h.priceBP) : null,
    priceDiamond: h.priceDiamond != null && h.priceDiamond !== "" ? Number(h.priceDiamond) : null,
  }));

  await prisma.hero.createMany({
    data: heroesData,
  });
  console.log(`Berhasil memasukkan ${heroesData.length} hero.`);

  // 3. Masukkan semua skin dengan createMany
  const skinsPath = path.join(process.cwd(), "data", "skins.json");
  const rawSkins = JSON.parse(fs.readFileSync(skinsPath, "utf-8"));
  const skinsData = rawSkins.map((s: any) => ({
    name: s.name,
    heroId: Number(s.heroId),
    rarity: s.rarity as Rarity,
    priceDiamond: s.priceDiamond != null && s.priceDiamond !== "" ? Number(s.priceDiamond) : null,
  }));

  await prisma.skin.createMany({
    data: skinsData,
  });
  console.log(`Berhasil memasukkan ${skinsData.length} skin.`);

  // 4. Masukkan 3 player
  await prisma.player.createMany({
    data: [
      { nickname: "ArekITS", bp: 1500, diamond: 75 },
      { nickname: "SangPushRank", bp: 13000, diamond: 2892 },
      { nickname: "MageSurabaya", bp: 10000, diamond: 0 },
    ],
  });

  // Masukkan 4 data PlayerHero
  await prisma.playerHero.createMany({
    data: [
      { playerId: 1, heroId: 18, currency: Currency.BP, pricePaid: 2000 },
      { playerId: 1, heroId: 1, currency: Currency.BP, pricePaid: 10800 },
      { playerId: 2, heroId: 84, currency: Currency.DIAMOND, pricePaid: 599 },
      { playerId: 2, heroId: 56, currency: Currency.BP, pricePaid: 32000 },
    ],
  });

  // Pastikan sequence ID di Postgres sinkron
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Player"', 'id'), coalesce(max(id), 1)) FROM "Player";`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Hero"', 'id'), coalesce(max(id), 1)) FROM "Hero";`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Skin"', 'id'), coalesce(max(id), 1)) FROM "Skin";`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"PlayerHero"', 'id'), coalesce(max(id), 1)) FROM "PlayerHero";`
  );

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("Gagal saat seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
