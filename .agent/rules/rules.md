# Project Rules & Standards: Halal Bihalal 2025

Dokumen ini berisi aturan teknis, standar arsitektur, dan pedoman desain untuk memastikan proyek tetap **Maintainable**, **Scalable**, dan **User-Focused**.

---

## 🏗 1. Arsitektur & Struktur Folder

Proyek ini menggunakan **Next.js 15+ (App Router)** dengan struktur modular:

- `src/app/`: Routing & Page-level logic.
  - Gunakan `layout.tsx` untuk persistent UI.
  - Gunakan `page.tsx` sebagai entry point, usahakan tetap clean (pindahkan UI besar ke modul).
- `src/components/`:
  - `ui/`: Komponen atomik/dasar (shadcn/ui).
  - `modules/`: Komponen kompleks per fitur (e.g., `register/`, `auth/`, `admin/`).
  - `shared/`: Komponen reusable lintas modul (e.g., `particles/`, `loaders/`).
- `src/lib/`: Utilitas, konfigurasi client (Supabase, API clients), dan helper murni.
- `src/services/`: Logika Server-side (Server Actions, Database Queries).
- `src/types/`: Definisi TypeScript (Shared Interfaces).
- `src/hooks/`: Custom React Hooks.

---

## 🎨 2. Design System: "Halal Theme"

Aplikasi ini memiliki identitas visual yang spesifik:

### Warna & Estetika
- **Background Utama**: Ultra-dark green/black (`#0a1b1a`, `#0a1a19`).
- **Primary Accent**: Gold/Amber (Tailwind `amber-400/500` atau token `halal-primary`).
- **Secondary Accent**: Sky Blue (untuk Karyawan/Internal).
- **Glassmorphism**: Gunakan `backdrop-blur-md` dan border transparan (`border-white/10`) pada card.
- **Atmosphere**: Gunakan `Particles` dan `ShootingStars` pada landing/hero section untuk kesan premium.

### Tipografi
- Font Utama: **Outfit** atau **Inter** (Sans-serif).
- Headings: Gunakan `font-black` dan `tracking-tight` untuk judul besar berkesan modern.
- Labels: Gunakan `text-[10px]` atau `text-xs` dengan `tracking-[0.2em]` dan `uppercase` untuk label kategori.

### Animasi (Framer Motion)
- Gunakan `motion` untuk transisi halaman dan masuknya komponen.
- Gunakan `whileHover={{ y: -5 }}` atau `scale` halus untuk elemen interaktif.
- Animasi harus halus (`ease: [0.16, 1, 0.3, 1]`) dan tidak mengganggu UX.

---

## 💻 3. Aturan Coding & Standardisasi

### TypeScript
- **Stricness**: Hindari penggunaan `any`. Selalu definisikan tipe untuk props dan data API.
- **Interfaces**: Gunakan `interface` untuk definisi object yang bisa di-extend.

### Komponen React (Client vs Server)
- Gunakan `'use client'` hanya jika diperlukan (interaktivitas, state, hooks).
- Pisahkan logika berat ke Client Component yang diakhiri nama `-client.tsx` (e.g., `RegistrationClient.tsx`).
- Manfaatkan Server Components untuk fetching data awal guna performa SEO dan kecepatan muat.

### Form & Validasi
- Gunakan **React Hook Form** + **Zod** untuk semua formulir.
- Error message harus user-friendly dan dalam Bahasa Indonesia.
- Tampilkan loading state (disable button + spinner) saat proses submit.

---

## ⚙ 4. Workflow & Tools

### Manajemen Package
- Wajib menggunakan **pnpm**.
- Hindari duplikasi package. Gunakan `pnpm dlx` untuk runner tool.

### Git & Commits
- Gunakan **Conventional Commits**:
  - `feat:` (fitur baru).
  - `fix:` (perbaikan bug).
  - `refactor:` (perubahan kode tanpa merubah fungsi).
  - `ui:` (perubahan visual/styling).
  - `docs:` (dokumentasi).

### Kebijakan Bahasa
- **UI/UX**: Wajib menggunakan **Bahasa Indonesia** yang formal (aku/kamu diganti menjadi Anda/Penonton/Pengunjung).
- **Kode**: Nama variabel, fungsi, dan komentar tetap menggunakan Bahasa Inggris untuk alasan teknis universal (kecuali data dummy/statis tertentu).

---

## 🛡 5. Maintainability Checklist
- [ ] Komponen tidak terlalu besar (> 300 baris sebaiknya dipecah).
- [ ] Tidak ada hardcoded warna (gunakan Tailwind classes atau CSS variables).
- [ ] Image sudah dioptimasi menggunakan `next/image`.
- [ ] Responsive design (Mobile-first approach).
- [ ] Linter & Formatter (`pnpm lint`) berjalan tanpa error sebelum deploy.

---

*Setiap perubahan besar pada arsitektur atau spec wajib didiskusikan dan diupdate ke dalam dokumen ini.*
