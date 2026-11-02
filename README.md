# PWEB EXPRESS C01 2026

Anggota Kelompok:

| Nama                   | NRP        |
| ---------------------- | ---------- |
| Umar                   | 5027251005 |
| Keisya Halimah Mulia   | 5027251068 |
| Kaisar Hanif Pratama   | 5027241029 |

## Deskripsi Proyek
Backend MLBB Shop. REST API berbasis Express+TypeScript untuk simulasi sistem toko Mobile Legends, mencakup manajemen Hero, Skin, Player, sistem saldo (Diamond & Battle Point), transaksi pembelian Hero dengan Prisma Transaction, dan rekap Statistik.

## Tech Stack
- Express 5 + TypeScript
- Prisma ORM 7
- PostgreSQL (Neon)

## Setup
1. Install seluruh dependensi:
```bash
   npm install

```

2. file `.env` di root direktori dimasukkan ke connection string database Neon (Pooled dan Direct)

3. Generate Prisma client dan sinkronkan skema database:
```bash
npx prisma generate
npx prisma migrate dev --name init

```


4. Lakukan seeding untuk memasukkan data awal (133 hero, 892 skin, dan 3 player awal):
```bash
npx tsx prisma/seed.ts

```


5. Menyalakan Server:
```bash
npm run dev

```


Server akan berjalan di `http://localhost:3000`.

## Restart Database

saldo kembali semula dan ID ter-reset:

```bash
npx tsx prisma/seed.ts

```

## Bukti Pengujian (Testcases)

Seluruh 28 testcase telah diuji sesuai skenario modul:
[Lihat Folder Asset](asset)

```