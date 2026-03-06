# Development Rules, Standards & Architecture

Dokumen ini mendefinisikan standar teknis untuk proyek **Event Invitation & QR Check-in System**. Fokus utama adalah **Scalability (Skalabilitas)**, **Modularity (Modularitas)**, dan konsistensi menggunakan **Chakra UI v3**.

## 1. Core Architecture Principles
Sistem ini menggunakan **Next.js 15+ App Router** dengan prinsip-prinsip berikut:
- **Separation of Concerns (SoC)**: Pisahkan antara logika bisnis (actions/services), UI (components), dan data (Supabase).
- **Single Responsibility Principle (SRP)**: Satu komponen atau fungsi hanya melakukan satu hal dengan sangat baik.
- **Chakra UI v3 First**: Gunakan komponen bawaan Chakra UI v3 untuk semua elemen UI. Hindari kustomisasi CSS manual atau Tailwind jika memungkinkan.

## 2. Directory Structure (Modular & Scalable)
- `app/`: Routing-first. Gunakan Route Groups `(admin)`, `(guest)` jika perlu.
- `components/`:
  - `ui/`: Komponen dasar dari Chakra UI (berada di `src/components/ui` setelah `npx chakra-ui@latest add ...`).
  - `modules/`: Komponen spesifik fitur (e.g., `RSVPForm.tsx`, `QRScanner.tsx`).
  - `layout/`: Sidebar, Navigation.
  - `shared/`: Komponen yang digunakan di banyak tempat (e.g., `StatsCard`).
- `lib/`: Integrasi pihak ketiga (Supabase, Utils).
- `services/`: Server Actions & Database logic.
- `hooks/`: Custom hooks.
- `docs/`: Dokumentasi (Schema, spec).

## 3. Tech Stack & State Management
- **Styling**: **Chakra UI v3**. Gunakan system props dan `css` prop.
- **Database**: Supabase.
- **State Management**:
  - **Server State**: RSC & Server Actions.
  - **Global Client State**: Zustand (untuk Active Event context).
  - **Form State**: React Hook Form + Zod.
- **Icons**: Lucide React (diintegrasikan via Chakra `Icon`).

## 4. Chakra UI v3 Development Rules

### Package Constraints
- **Removed**: `@emotion/styled` dan `framer-motion` (tidak lagi diperlukan secara langsung).
- **Icons**: Gunakan `lucide-react`.
- **Next.js**: Gunakan `asChild` prop untuk `Link` integration.

### Import Sources
- Komponen dasar (Box, Flex, Text, Heading, Button, dll) diimpor dari `@chakra-ui/react`.
- Komponen kompleks (Checkbox, Dialog, Tooltip, InputGroup, dll) diimpor dari `@/components/ui`.

### Prop Changes (v2 -> v3)
- `isOpen` → `open`
- `isDisabled` → `disabled`
- `isInvalid` → `invalid`
- `colorScheme` → `colorPalette`
- `spacing` → `gap`
- `noOfLines` → `lineClamp`
- `Divider` → `Separator`
- `Modal` → `Dialog`

### Component Patterns
- **Button Icons**: Gunakan sebagai children: `<Button><Mail /> Email</Button>`.
- **Table**: Gunakan namespace `Table.Root`, `Table.Header`, `Table.Row`, `Table.ColumnHeader`, `Table.Body`, `Table.Cell`.
- **Toast**: Gunakan `toaster.create()` dari `@/components/ui/toaster`.
- **Gradients**: Gunakan `bgGradient="to-r" gradientFrom="..." gradientTo="..."`.

## 5. Scalability & DX
- **Zero Hardcoding**: Data event fetched dari tabel `events`.
- **Self-Documenting Code**: Nama variabel deskriptif.
- **TypeScript**: Hindari `any`. Definisikan interface/type untuk semua data.
- **Commits**: Conventional Commits (`feat:`, `fix:`, dll).

## 6. Documentation Sync
Wajib perbarui `docs/` setiap ada perubahan pada skema atau spec.

---
*Architecture is about the details that are hard to change later. Build it right, build it modular with Chakra UI v3.*
