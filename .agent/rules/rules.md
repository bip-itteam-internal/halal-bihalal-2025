# Development Rules, Standards & Architecture

Dokumen ini mendefinisikan standar teknis untuk proyek **Event Invitation & QR Check-in System**. Fokus utama adalah **Scalability (Skalabilitas)**, **Modularity (Modularitas)**, dan konsistensi menggunakan **shadcn/ui** dan **Tailwind CSS**.

## 1. Core Architecture Principles

Sistem ini menggunakan **Next.js 15+ App Router** dengan prinsip-prinsip berikut:

- **Separation of Concerns (SoC)**: Pisahkan antara logika bisnis (actions/services), UI (components), dan data (Supabase).
- **Single Responsibility Principle (SRP)**: Satu komponen atau fungsi hanya melakukan satu hal dengan sangat baik.
- **shadcn/ui First**: Gunakan komponen bawaan shadcn/ui untuk semua elemen UI. Gunakan Tailwind CSS untuk kustomisasi style.

## 2. Directory Structure (Modular & Scalable)

- `app/`: Routing-first. Gunakan Route Groups `(admin)`, `(guest)` jika perlu.
- `components/`:
  - `ui/`: Komponen dasar dari shadcn/ui (berada di `src/components/ui` setelah `pnpm dlx shadcn@latest add ...`).
  - `modules/`: Komponen spesifik fitur (e.g., `RSVPForm.tsx`, `QRScanner.tsx`).
  - `layout/`: Sidebar, Navigation.
  - `shared/`: Komponen yang digunakan di banyak tempat (e.g., `StatsCard`).
- `lib/`: Integrasi pihak ketiga (Supabase, Utils).
- `services/`: Server Actions & Database logic.
- `hooks/`: Custom hooks.
- `docs/`: Dokumentasi (Schema, spec).

## 3. Tech Stack & State Management

- **Styling**: **Tailwind CSS**. Gunakan class utility untuk styling.
- **UI Components**: **shadcn/ui**.
- **Database**: Supabase.
- **State Management**:
  - **Server State**: RSC & Server Actions.
  - **Global Client State**: Zustand (untuk Active Event context).
  - **Form State**: React Hook Form + Zod.
- **Icons**: Lucide React.

## 4. UI Development Rules

### Package Constraints

- **Tailwind CSS First**: Semua styling harus memanfaatkan Tailwind CSS utility classes.
- **Icons**: Gunakan `lucide-react`.

### Import Sources

- Komponen dasar diimpor dari `@/components/ui` hasil dari CLI shadcn.
- Hindari membuat komponen UI custom kecuali memang tidak tersedia di shadcn/ui, dan jika membuat pastikan sesuai pedoman desain shadcn.

## 5. Scalability & DX

- **Zero Hardcoding**: Data event fetched dari tabel `events`.
- **Self-Documenting Code**: Nama variabel deskriptif.
- **TypeScript**: Hindari `any`. Definisikan interface/type untuk semua data.
- **Commits**: Conventional Commits (`feat:`, `fix:`, dll).

## 6. Documentation Sync

Wajib perbarui `docs/` setiap ada perubahan pada skema atau spec.

## 7. Package Management

- **Primary Package Manager**: Gunakan **pnpm** untuk semua manajemen dependensi.
- **Workflow**:
  - `pnpm install` untuk instalasi.
  - `pnpm add <pkg>` untuk menambah package.
  - `pnpm dev` untuk menjalankan development server.
  - `pnpm build` untuk production build.
- **Commands**: Hindari penggunaan `npm` atau `yarn`. Gunakan `pnpm dlx` untuk menggantikan `npx`.

## 8. Language Preference (Preferensi Bahasa)

- **Bahasa Indonesia**: Seluruh antarmuka pengguna (UI), teks, placeholder, pesan error, dan dialog aplikasi wajib menggunakan **Bahasa Indonesia** yang baik, formal, dan konsisten.
- Istilah teknis yang umum (seperti Dashboard, Event, Quota) dapat dipertahankan atau disesuaikan dengan konteks yang natural bagi pengguna Indonesia (misal: "Buat Event", "Kuota", "Dasbor").
- Pesan pada terminal, komentar kode, dan dokumentasi ditekankan untuk menggunakan Bahasa Indonesia agar mempermudah pemahaman tim.

---

_Architecture is about the details that are hard to change later. Build it right, build it modular with shadcn/ui._
