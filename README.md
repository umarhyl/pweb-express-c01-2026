# PWEB Express C01 2026

REST API Modul 4 berbasis Express, TypeScript, Prisma, dan PostgreSQL Neon. Repository ini juga menjadi backend untuk Tahap 2 Challenge Modul 5 melalui resource `Post`.

## Anggota Kelompok

| Nama | NRP |
| --- | --- |
| Umar | 5027251005 |
| Keisya Halimah Mulia | 5027251068 |
| Kaisar Hanif Pratama | 5027241029 |

## Deskripsi

Fitur utama Modul 4 adalah backend MLBB Shop yang mencakup pengelolaan hero, skin, player, saldo Diamond dan Battle Point, transaksi pembelian hero, serta statistik. Untuk Challenge Modul 5, backend ditambah REST API post agar frontend React dapat melakukan operasi GET, POST, DELETE, dan pencarian.

## Teknologi

- Express 5 dan TypeScript
- Prisma ORM 7
- PostgreSQL Neon
- CORS

## Persiapan

1. Instal dependensi:

   ```powershell
   npm install
   ```

2. Salin `.env.example` menjadi `.env`, lalu isi koneksi Neon:

   ```env
   PORT=3000
   DATABASE_URL="connection-string-pooled"
   DATABASE_URL_UNPOOLED="connection-string-direct"
   ```

   Jangan commit file `.env` karena berisi kredensial database.

3. Generate Prisma Client dan terapkan migration yang sudah tersedia:

   ```powershell
   npx prisma generate
   npx prisma migrate deploy
   ```

4. Jalankan server:

   ```powershell
   npm run dev
   ```

Server berjalan di `http://localhost:3000`. Pemeriksaan server dan database tersedia di `GET /health`.

## API Post untuk Challenge Modul 5

| Method | Endpoint | Fungsi | Status berhasil |
| --- | --- | --- | --- |
| `GET` | `/api/posts` | Mengambil seluruh post | 200 |
| `GET` | `/api/posts?search=kata` | Mencari judul post secara case-insensitive | 200 |
| `POST` | `/api/posts` | Membuat post baru | 201 |
| `DELETE` | `/api/posts/:id` | Menghapus post berdasarkan ID | 200 |

Contoh body `POST /api/posts`:

```json
{
  "title": "Belajar useEffect",
  "content": "Mengambil data dari REST API",
  "author": "Keisya"
}
```

`title` wajib berupa string yang tidak kosong. `content` dan `author` bersifat opsional.

Contoh respons berhasil:

```json
{
  "status": true,
  "message": "Berhasil mengambil data post",
  "data": []
}
```

Array `data` kosong berarti request berhasil tetapi belum ada post atau tidak ada hasil pencarian. Kondisi tersebut bukan error.

## Error Handling

Backend menyediakan penanganan untuk:

- validasi title kosong dengan status 400;
- parameter ID yang tidak valid;
- route yang tidak tersedia dengan status 404;
- data Prisma yang tidak ditemukan;
- konflik unique constraint dan relasi database;
- error internal dengan format respons JSON yang konsisten.

## CORS

CORS mengizinkan frontend development pada:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

## Struktur Penambahan Tahap 2

```text
prisma/
├── schema.prisma
└── migrations/
    └── 20261120000000_add_posts/
src/
├── controllers/
│   └── postController.ts
├── routes/
│   └── post.routes.ts
└── index.ts
```

## Pemeriksaan Kode

```powershell
npm run typecheck
npx prisma migrate status
```

Frontend Challenge Modul 5: [pweb-challenge-modul5-c01-2026](https://github.com/umarhyl/pweb-challenge-modul5-c01-2026).

## Data Awal Modul 4

Untuk menjalankan seed MLBB Shop:

```powershell
npm run seed
```

Folder `asset` berisi bukti pengujian testcase Modul 4.
