#  SnapNext — SaaS Photo Booth Platform

> Platform photo booth modern berbasis web, dibangun dengan Next.js dan Supabase. Pelanggan bisa menyewa sesi foto, mengambil foto langsung dari browser, dan mengunduh hasilnya secara instan.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-95%25-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

---

##  Fitur Utama

-  **Photo Booth berbasis browser** — tidak perlu install aplikasi
-  **Upload & simpan foto** ke Supabase Storage
-  **Autentikasi pengguna** dengan Supabase Auth
-  **Sistem langganan SaaS** — manajemen paket & kuota sesi
-  **Gallery pribadi** — setiap pengguna punya galeri foto sendiri
-  **Deploy otomatis** ke Vercel

---

##  Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Bahasa | TypeScript |
| Database | PostgreSQL via Supabase |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Styling | Tailwind CSS |
| Deploy | Vercel |

---

##  Cara Menjalankan Lokal

### 1. Clone repo

```bash
git clone https://github.com/adnanadriansyah/Photobox-Saas-main.git
cd Photobox-Saas-main
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Salin file contoh dan isi dengan nilai asli kamu:

```bash
cp env.production.example .env.local
```

Isi nilai berikut di `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

##  Setup Database (Supabase)

Ikuti panduan lengkap di [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md).

Secara singkat:
1. Buat project baru di [supabase.com](https://supabase.com)
2. Jalankan migration SQL yang ada di folder `supabase/`
3. Aktifkan Storage bucket untuk foto

---

##  Struktur Project

```
├── app/                  # Next.js App Router (halaman & API routes)
├── components/           # Komponen React yang bisa digunakan ulang
├── lib/                  # Utilitas, helper, Supabase client
├── public/               # Aset statis
├── supabase/             # Migration & konfigurasi Supabase
├── .env.local            # ⛔ Jangan di-push! (environment variables)
├── MIGRATION_GUIDE.md    # Panduan setup database
└── README.md
```

---

##  Deploy ke Vercel

1. Push repo ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan environment variables di dashboard Vercel
4. Deploy otomatis setiap push ke branch `main`

---

##  Testing

```bash
# Cek koneksi API
node test-api.js

# Cek gallery
node check-gallery.js

# Test photo booth
node test-photobooth.js
```

---

##  Lisensi

Project ini dibuat untuk keperluan pribadi / komersial oleh [@adnanadriansyah](https://github.com/adnanadriansyah).

---

## 🙋 Kontak

Ada pertanyaan atau ingin berkolaborasi? Hubungi lewat GitHub Issues atau langsung ke profil GitHub.
