# Panduan Migrasi: SQLite → PostgreSQL (Supabase)
## SnapNext SaaS - Production Setup

---

## Overview

```
Local Dev                    Production
─────────────────────        ─────────────────────────────
SQLite (dev.db)         →    PostgreSQL (Supabase)
Prisma ORM              →    Prisma ORM (sama, ganti provider)
seed.ts (lokal)         →    prisma migrate deploy (Vercel CI)
```

---

## Langkah 1 — Buat Project di Supabase

1. Buka https://supabase.com → **New Project**
2. Isi:
   - **Name**: `snapnext-production`
   - **Database Password**: buat password kuat, **simpan baik-baik**
   - **Region**: `Southeast Asia (Singapore)` → paling dekat Indonesia
3. Tunggu ~2 menit sampai project ready

---

## Langkah 2 — Ambil Connection String

Di Supabase Dashboard → **Settings** → **Database**:

```
Transaction pooler (port 6543) → untuk DATABASE_URL
Session pooler  (port 5432)   → untuk DIRECT_URL
```

Format connection string:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:[PORT]/postgres
```

---

## Langkah 3 — Update File Project

### 3a. Ganti schema.prisma

Copy file `schema.prisma` (yang sudah disediakan) ke folder `prisma/` di project kamu.

Perubahan utama dari SQLite:
- `provider = "sqlite"` → `provider = "postgresql"`
- Tambah `directUrl = env("DIRECT_URL")`
- Semua field `String` enum → pakai Prisma `enum` yang proper
- Field JSON (`operatingHours`, `photos`, dll) → dari `String` ke `Json`
- Tambah `@@map("nama_tabel")` untuk konsistensi naming di DB

### 3b. Buat file .env.local (untuk development dengan DB cloud)

```bash
# Di root project, buat file .env.local
cp .env.production.example .env.local
# Lalu isi DATABASE_URL dan DIRECT_URL dari Supabase
```

> ⚠️  Jangan commit `.env.local` ke git! Pastikan ada di `.gitignore`

---

## Langkah 4 — Jalankan Migration

```bash
# Install/update dependencies
npm install

# Generate Prisma client dari schema baru
npx prisma generate

# Push schema ke Supabase (first time setup)
npx prisma db push

# ATAU: kalau mau pakai migration files (recommended untuk production)
npx prisma migrate dev --name init_postgresql
```

Setelah sukses, cek di Supabase Dashboard → **Table Editor** — semua tabel harus sudah muncul.

---

## Langkah 5 — Jalankan Seed

```bash
# Seed data ke PostgreSQL
npx prisma db seed
```

Output yang diharapkan:
```
🌱 Starting seed...
✅ Created Tenant: SnapNext Demo
✅ Created Admin User: admin@snapnext.id
✅ Created Outlets: SnapNext Aceh Utara, SnapNext Lhokseumawe
✅ Created Outlet Configs
✅ Created Frame Templates
✅ Created Vouchers
✅ Created Testimonials
✅ Created Brand Assets
✅ Created API Keys
✅ Created Sample Gallery Data
🎉 Seed completed successfully!
```

---

## Langkah 6 — Deploy ke Vercel

### 6a. Set Environment Variables di Vercel

Vercel Dashboard → Project → **Settings** → **Environment Variables**

Tambahkan satu per satu:
```
DATABASE_URL     → [Transaction pooler URL dari Supabase]
DIRECT_URL       → [Session pooler URL dari Supabase]
JWT_SECRET       → [random string 32+ chars]
NODE_ENV         → production
NEXT_PUBLIC_APP_URL → https://photobox-saas-main-ews1.vercel.app
```

### 6b. Tambah migration script di package.json

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "ts-node prisma/seed.ts"
  }
}
```

> `prisma migrate deploy` akan otomatis jalan saat Vercel build jika kamu tambahkan ke build command.

### 6c. Update Build Command di Vercel

Vercel Dashboard → Settings → **Build & Development Settings**:
```
Build Command: prisma migrate deploy && next build
```

---

## Langkah 7 — Verifikasi

Setelah deploy, cek:

1. **Tabel terbuat** → Supabase Dashboard → Table Editor
2. **App bisa login** → https://photobox-saas-main-ews1.vercel.app/admin/login
   - Email: `admin@snapnext.id`
   - Password: `demo123`
3. **API bisa diakses** → `GET /api/outlets` harus return data

---

## Troubleshooting

### Error: "prepared statement already exists"
Tambahkan `?pgbouncer=true` di DATABASE_URL (sudah ada di template).

### Error: "Can't reach database server"
Pastikan DIRECT_URL menggunakan port `5432`, bukan `6543`.

### Error: Enum tidak dikenali
Jalankan ulang: `npx prisma migrate dev --name fix_enums`

### Migration conflict setelah ubah schema
```bash
npx prisma migrate reset    # ⚠️  HAPUS SEMUA DATA - hanya untuk dev!
npx prisma migrate dev
npx prisma db seed
```

---

## Perbedaan SQLite vs PostgreSQL di Prisma

| Fitur | SQLite (dev) | PostgreSQL (prod) |
|-------|-------------|-------------------|
| Field JSON | `String` | `Json` |
| Enum | `String` | Native `enum` |
| UUID | cuid() | cuid() atau uuid() |
| Concurrent writes | Tidak support | ✅ Support |
| Full-text search | Terbatas | ✅ Support |
| Connection pooling | Tidak perlu | Wajib (pgBouncer) |

---

## Struktur File Setelah Migration

```
prisma/
├── schema.prisma        ← ganti dengan versi PostgreSQL
├── seed.ts              ← tetap sama, tidak perlu diubah
├── migrations/          ← auto-generated oleh prisma migrate
│   └── 20260101_init/
│       └── migration.sql
└── dev.db               ← tidak dipakai di production
```

---

## Checklist Sebelum Go-Live

- [ ] `DATABASE_URL` dan `DIRECT_URL` sudah diset di Vercel
- [ ] `JWT_SECRET` sudah diganti dari default
- [ ] `NEXT_PUBLIC_DEMO_MODE` diset ke `"false"`
- [ ] `prisma migrate deploy` berhasil jalan
- [ ] Login admin berhasil
- [ ] `.env.local` tidak ada di git (cek `.gitignore`)
- [ ] Password default `demo123` sudah diganti
