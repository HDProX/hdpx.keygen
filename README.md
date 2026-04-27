# Keygen Signup — Vercel + Supabase

## Struktur Project

```
hdpx.keygen/
├── api/
│   ├── auth/
│   │   ├── callback.js
│   │   └── google.js
│   ├── login/
│   │   └── popup-google-auth.js
│   ├── trial.js
│   ├── _db.js          ← shared: DB pool, hash, email,
│   ├── user.js         ← POST /api/send-verify, verify, check-email, get-user, logout
│   └── config.js       ← POST /api/app config
├── public/
│   ├── assets/images/
│   │   └── sorce all.svg
│   ├── css/
│   │   ├── styling.css
│   │   ├── pricing.css
│   │   ├── refer.css
│   │   ├── redeem.css
│   │   ├── support.css
│   │   └── billing.css
│   ├── scripts/
│   │   ├── pages/
│	  │   │   ├── account-settings.js
│	  │   │   ├── pricing-inapp.js
│	  │   │   ├── refer-settings.js
│	  │   │   ├── redeem.js
│	  │   │   ├── support.js
│	  │   │   └── billing-settings.js
│   │	  ├── utils/
│	  │   │   ├── prefile_from_app.js
│	  │   │   ├── switcher.js
│	  │   │   ├── app_settings.js
│	  │   │   └── data.js
│   │	  └── templates/
│	  │       ├── password.html
│	  │       ├── forgot-password.html
│	  │       ├── change-password.html
│	  │       ├── login.html
│	  │       ├── redeem.html
│	  │       ├── pricing.html
│	  │       └── support.html
│   └── index.html
├── .gitignore
├── package.json
└── vercel.json
```

---

## Langkah Deploy

### 1. Buat Project Supabase

1. Daftar/login di [supabase.com](https://supabase.com)
2. Klik **New Project** → isi nama & password database → pilih region terdekat
3. Tunggu hingga project siap (~1 menit)

### 2. Buat Tabel di Supabase

Buka **SQL Editor** di dashboard Supabase, lalu jalankan:

```sql
-- Tabel users
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  DEFAULT '',
  salt          VARCHAR(128)  DEFAULT '',
  is_google     BOOLEAN       DEFAULT false,
  phone         VARCHAR(30)   DEFAULT '',
  bio           TEXT          DEFAULT '',
  avatar_url    VARCHAR(512)  DEFAULT '',
  last_login    TIMESTAMPTZ   NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Tabel OTP pending
CREATE TABLE otp_pending (
  email      VARCHAR(255) NOT NULL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  password   TEXT         NOT NULL,
  code       VARCHAR(10)  NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### 3. Ambil DATABASE_URL dari Supabase

1. Buka **Project Settings** → **Database**
2. Scroll ke **Connection string**
3. Pilih tab **URI**
4. Pilih mode **Transaction** (port **6543**) — wajib untuk Vercel serverless
5. Copy URL-nya, ganti `[YOUR-PASSWORD]` dengan password project kamu

Contoh format:

```
postgresql://postgres:[PASSWORD]@db.abcdefgh.supabase.co:6543/postgres?pgbouncer=true
```

### 4. Siapkan Gmail App Password

1. Buka [myaccount.google.com/security](https://myaccount.google.com/security)
2. Aktifkan **2-Step Verification**
3. Cari **App passwords** → buat baru → copy hasilnya (16 karakter)

### 5. Push ke GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

### 6. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New Project** → import repo
2. Di bagian **Environment Variables**, tambahkan:

| Key               | Value                       |
| ----------------- | --------------------------- |
| `DATABASE_URL`    | URL dari langkah 3          |
| `SMTP_HOST`       | `smtp.gmail.com`            |
| `SMTP_PORT`       | `465`                       |
| `SMTP_USER`       | email Gmail kamu            |
| `SMTP_PASS`       | App Password dari langkah 4 |
| `SMTP_FROM`       | email Gmail kamu            |
| `APP_NAME`        | `Keygen`                    |
| `OTP_TTL_SECONDS` | `600`                       |

3. Klik **Deploy** → selesai! 🎉

---

## API Endpoints

| Method | URL                | Body                      | Keterangan                 |
| ------ | ------------------ | ------------------------- | -------------------------- |
| POST   | `/api/send-verify` | `{name, email, password}` | Kirim OTP ke email         |
| POST   | `/api/verify`      | `{email, code}`           | Verifikasi OTP → buat akun |
| POST   | `/api/login`       | `{email, password}`       | Login                      |
| POST   | `/api/get-user`    | `{email}`                 | Ambil data user            |
