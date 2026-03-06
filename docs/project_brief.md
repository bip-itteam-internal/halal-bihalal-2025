# Event Invitation & QR Check-in System

## Project Brief

---

# 1. Project Overview

Event Invitation & QR Check-in System adalah aplikasi web yang digunakan untuk mengelola undangan event perusahaan seperti **Halal Bi Halal, Gathering, Seminar, atau Townhall**.

Sistem ini memungkinkan panitia untuk:

- Mengimpor daftar tamu dari Excel (Internal)
- **Halaman Registrasi Publik (Self-Ticket)**: Untuk pendaftaran tamu eksternal mandiri
- Mengirim link undangan digital
- Mengumpulkan RSVP konfirmasi kehadiran
- Menghasilkan QR Code untuk check-in
- **Manajemen Dua Sesi**: Sesi Siang (Karyawan) dan Sesi Malam (Puncak Acara)
- **Distribusi Gelang Konser**: Sebagai penanda akses untuk sesi malam
- **Fitur Doorprize Spinner**: Khusus untuk tamu internal yang hadir
- Melihat laporan kehadiran real-time

Sistem dirancang agar:

- **mendukung tamu karyawan dan tamu eksternal (Kuota Otomatis 1000 pax)**
- **dapat digunakan untuk banyak event (multi-event)**

---

# 2. Objectives

Tujuan utama sistem ini adalah:

1. Mengelola undangan event secara digital
2. Mengumpulkan data RSVP kehadiran sebelum event
3. Mempercepat proses check-in saat event dengan sistem **Double Verification** (QR + Gelang)
4. Mengelola kuota tamu eksternal secara mandiri dan real-time (**Internal Ticketing**)
5. Menyediakan fitur hiburan terintegrasi (Doorprize Spinner) untuk internal
6. Menyediakan data kehadiran secara realtime

---

# 3. Scope

## 3.1 In Scope

Fitur yang termasuk dalam sistem:

- Import daftar tamu dari Excel (Internal)
- **Public Registration Page** (External Ticketing)
- Digital invitation & RSVP
- QR Code invitation
- **Dual Session Check-in System** (Siang & Malam)
- **Concert Bracelet Tracking** (Pemberian gelang saat scan)
- **Internal Doorprize Spinner**
- Dashboard daftar tamu & Rekap kehadiran
- Welcome Display Board

## 3.2 Out of Scope

Fitur berikut tidak termasuk dalam versi awal:

- Email invitation
- WhatsApp automation (Hanya manual trigger / API)
- Seat assignment
- Payment/ticketing
- Authentication untuk tamu

---

# 4. User Roles

## 4.1 Guest (Tamu)

Tamu undangan (Internal Karyawan) atau pendaftar mandiri (Eksternal 1000 pax) yang menerima link invitation unik atau mendaftar via landing page.

**Hak akses:**

- Membuka halaman undangan / Halaman registrasi publik.
- Melakukan RSVP / Pendaftaran Mandiri.
- Mendapatkan QR Code (E-Ticket) untuk ditukar gelang (Siang/Sore).

**Workflow:**

```mermaid
graph TD
    subgraph Internal
    I1[Link via WA] --> I2[Konfirmasi RSVP]
    end
    
    subgraph External
    E1[Landing Page Registrasi] --> E2[Isi Data & Submit]
    E2 --> E3{Cek Kuota < 1000?}
    E3 -- Ya --> E4[Data Tersimpan]
    E3 -- Penuh --> E5[Tampilkan Maaf, Kuota Penuh]
    end
    
    I2 --> G4[Dapat QR Code]
    E4 --> G4
    G4 --> G5[Scan di Venue -> Terima Gelang]
    G5 --> G6[Masuk Acara Malam dg Gelang]
```

## 4.2 Super Admin

Pemilik sistem dengan otoritas penuh (**Omnipotent**). Super Admin memiliki akses ke **seluruh fitur di semua role** (Guest, Admin, dan Staff Scanner) tanpa terkecuali. Hal ini dirancang agar Super Admin dapat mengelola, menguji, dan melakukan tindakan operasional tanpa perlu berpindah akun.

**Hak akses:**

- **All-in-One Access**: Melakukan fungsi Admin, Staff Scanner, hingga melihat simulasi Invitations.
- **User Management**: Eksklusif—membuat, mengedit, dan mengelola akun Admin/Staff lain.
- **System-Wide Control**: Akses penuh ke seluruh Event, Branding, dan Data Manajemen.

**Workflow:**

```mermaid
graph TD
    SA1[Login Super Admin] --> SA2[Full Feature Access]
    SA2 --> SA3[User & Staff Management]
    SA2 --> SA4[Event Management & Guest Ops]
    SA2 --> SA5[QR Scanning & Check-in]
    SA3 --> SA6[Operational Excellence]
    SA4 --> SA6
    SA5 --> SA6
```

## 4.3 Admin / Panitia (Event Manager)

Pengelola operasional event. Memiliki akses penuh terhadap fitur sistem untuk mengelola event, **kecuali** fitur manajemen pengguna/staff.

**Hak akses:**

- **Full Event Control**: Membuat, mengedit, dan mengelola detil Event serta Branding/Tema.
- **Guest Operations**: Manajemen tamu (Import Excel & **Input Manual satu per satu**), Edit, dan Delete data tamu.
- **Invitation Management**: Mengelola pengiriman undangan (link/WhatsApp).
- **Analytics & Report**: Melihat Dashboard, Real-time Analytics, dan Export data (CSV/Excel).
- **Note**: Memiliki semua kemampuan operasional seperti Super Admin, namun dilarang mengakses User Management (tidak bisa membuat/mengatur akun Admin dan Staff lain).
- Mengelola data eksternal dari GForm (Setor ke IT).
- Menjalankan Spinner Doorprize.
- Memantau kuota 1000 tamu eksternal.

**Workflow:**

```mermaid
graph TD
    A1[Login Admin] --> A2[Buat/Pilih Event]
    A2 --> A3[Atur Branding & Theme]
    A3 --> A4[Kelola Tamu & Undangan]
    A4 --> A5[Monitoring Dashboard & Reports]
```

## 4.4 Staff Scanner (Registration Staff)

**Tugas di Venue:**
1. **Sesi Siang (Internal):** Scan QR -> Beri Gelang.
2. **Sesi Sore (External - 16:30):** Scan QR -> Beri Gelang (Cek Kuota).
3. **Sesi Malam:** Scan Gelang/QR untuk akses masuk final.

---

# 5. Key Features

### Public Registration Page (External Ticketing)
- **Self-Service:** Tamu eksternal mendaftar sendiri melalui link publik. Mencakup masyarakat umum, mahasiswa, atau pihak lain di luar daftar undangan resmi.
- **Easy Registration:** Hanya memerlukan input **Nama Lengkap** dan **Nomor WhatsApp** untuk mempermudah pendaftaran.
- **Auto-Quota:** Pendaftaran otomatis ditutup jika mencapai 1000 orang.
- **Instant E-Ticket:** QR Code langsung muncul setelah pendaftaran berhasil.

### Dual Session Check-in Logic
- **Sesi Siang:** Registrasi awal tamu internal, pemberian gelang konser untuk acara malam.
- **Sesi Malam:** Registrasi ulang menggunakan barcode pada gelang yang sudah diberikan.

### External Guest Management
- **Open Gate:** Mulai pukul 16:30 (setelah sesi siang selesai).
- **Kuota:** Dibatasi maksimal 1000 orang.
- **Data Source:** Pengisian GForm yang datanya disetor ke IT untuk di-import.

### Internal Doorprize Spinner
- Fitur undian berhadiah (Spinner) yang hanya bisa dimenangkan oleh tamu dengan kategori `internal` yang sudah hadir.
- Menggunakan filter `registration_source = 'admin_invite'` untuk memastikan hadiah tidak jatuh ke pendaftar publik eksternal (masyarakat umum).

### Concert Bracelet System
- Gelang fisik dengan barcode unik sebagai akses masuk sesi malam.
- Barcode pada gelang tersinkronisasi dengan ID tamu di sistem.

### WhatsApp Invitation Service (NotifAPI)

Sistem dapat mengirimkan pesan WhatsApp otomatis berisi link undangan personal.

- **Provider**: WhatsApp NotifAPI.
- **Customizable**: Admin dapat mengatur isi pesan per event.
- **Dynamic Tags**: Mendukung tag otomatis seperti `{name}` untuk sapaan tamu dan `{link}` untuk link undangan.
- **Trigger**: Cron job atau Button Click manual.

---

## 5.1 Event Management

Admin dapat membuat event baru.

Data event:

- nama event
- tanggal & jam event
- lokasi event
- Deskripsi / Sambutan
- Dress Code
- logo event
- Custom WhatsApp Template (Support dynamic tags: `{name}`, `{link}`, `{event_name}`, `{location}`)

---

## 5.2 Guest Import (Excel) with Preview

Admin dapat mengimport daftar tamu melalui file Excel dengan tahap **Review & Pre-validation**.

### Import Flow:

1. **Upload**: Admin memilih file Excel.
2. **Review**: Sistem menampilkan tabel pratinjau data di dashboard.
3. **Validate**: Admin dapat mengedit nama, memperbaiki nomor WA, atau menghapus baris duplikat langsung di tabel pratinjau.
4. **Finalize**: Setelah divalidasi, admin menekan tombol "Confirm Import" untuk menyimpan data ke database.

Format Excel:

| Guest Type                                                                                                     | Employee Id    | Full Name   | Department     | Position | Company                  | WA         |
| -------------------------------------------------------------------------------------------------------------- | -------------- | ----------- | -------------- | -------- | ------------------------ | ---------- |
| internal                                                                                                       | BIP-0006-03-21 | Zulhakim    | General Affair | Security | PT Bharata Internasional | 0838959159 |
| external                                                                                                       |                | Ahmad Fauzi |                |          | Vendor Partner           | 0812345678 |
| *(Note: Untuk tamu **internal**, Company otomatis terisi "PT Bharata Internasional" jika dikosongkan)* |                |             |                |          |                          |            |

Mapping:

| Excel Column | Database Field |
| ------------ | -------------- |
| Guest Type   | guest_type     |
| Employee Id  | employee_id    |
| Full Name    | full_name      |
| Department   | department     |
| Position     | position       |
| Company      | company        |
| WA           | phone          |

---

## 5.3 Digital Invitation

Setiap tamu memiliki link undangan unik yang personal.

Contoh:

/invite/{guest_id}/{slug-nama-tamu}

Link digunakan untuk:

- Membuka undangan dengan sapaan personal ("Halo, [Nama]!")
- Melakukan RSVP
- Menampilkan QR Code

---

## 5.4 RSVP (Konfirmasi Kehadiran)

Tamu melakukan konfirmasi kehadiran melalui halaman undangan.

Data RSVP akan disimpan ke database.

---


## 5.6 QR Code Invitation

Setelah RSVP berhasil, sistem menampilkan QR Code.

Isi QR Code:

guest_id

QR digunakan saat check-in di venue.

---

## 5.7 QR Check-in System

Panitia menggunakan halaman scanner.

Flow:

Scan QR
↓
Ambil guest_id
↓
Tampilkan data tamu
↓
Check-in

---

## 5.8 Manual Check-in

Jika tamu tidak membawa QR:

Panitia search nama
↓
Klik check-in

---

### Rekap kehadiran (Real-time)

Dashboard menggunakan **Supabase Realtime** untuk menyajikan data yang otomatis terupdate tanpa refresh:

- Total tamu
- Sudah hadir
- Belum hadir
- Kehadiran per Departemen/Posisi

---

## 5.10 Welcome Display Board (Real-time TV Monitor)

Halaman khusus untuk ditampilkan di layar besar/TV di area registrasi.

- **Real-time**: Menggunakan **Supabase Realtime** untuk mendengarkan setiap proses scan yang sukses.
- **Visual**: Menampilkan pesan selamat datang secara dinamis: *"Selamat Datang, [Nama Tamu] - [Departemen/Instansi]"*.
- **Branding**: Tampilan menyesuaikan tema event yang aktif.

---

# 6. System Architecture

Frontend Web App
│
│
▼
Supabase (PostgreSQL)

Semua data tamu disimpan di database Supabase.

Tidak ada dependency ke API eksternal.

---

# 7. Database Schema

## 7.1 event_themes

Digunakan untuk menyimpan konfigurasi tema dan branding visual untuk setiap event.

| Field                     | Tipe / Deskripsi                           |
| :------------------------ | :----------------------------------------- |
| **id**              | Primary Key (UUID/Serial)                  |
| **name**            | Nama tema                                  |
| **primary_color**   | Warna utama tema                           |
| **secondary_color** | Warna sekunder tema                        |
| **background_url**  | URL gambar latar belakang                  |
| **template_id**     | ID template layout yang digunakan          |
| **theme_config**    | Konfigurasi tambahan (fonts, shadows, dll) |

---

## 7.2 events

Menyimpan data utama setiap acara/event yang dibuat.

| Field                           | Tipe / Deskripsi                      |
| :------------------------------ | :------------------------------------ |
| **id**                    | Primary Key (UUID/Serial)             |
| **theme_id**              | Foreign Key ke `event_themes`       |
| **name**                  | Nama event                            |
| **description**           | Deskripsi atau sambutan event         |
| **event_date**            | Tanggal & jam pelaksanaan             |
| **location**              | Lokasi acara                          |
| **dress_code**            | Ketentuan pakaian                     |
| **logo_url**              | URL logo khusus event                 |
| **created_at**            | Waktu pembuatan data                  |

---

## 7.3 guests

Menyimpan daftar tamu undangan beserta status RSVP mereka.

| Field                      | Tipe / Deskripsi                                 |
| :------------------------- | :----------------------------------------------- |
| **id**               | Primary Key (UUID)                               |
| **event_id**         | Foreign Key ke `events`                        |
| **guest_type**       | `internal` atau `external`                   |
| **employee_id**      | ID Karyawan (khusus tamu internal)               |
| **full_name**        | Nama lengkap tamu                                |
| **department**       | Departemen (untuk internal)                      |
| **position**         | Jabatan                                          |
| **company**          | Perusahaan (Default: "PT Bharata Internasional") |
| **phone**            | Nomor WhatsApp/Telepon                           |
| **rsvp_status**      | Status konfirmasi kehadiran                      |
| **wa_sent_at**       | Timestamp pengiriman undangan via WA             |
| **created_at**       | Waktu data di-import/dibuat                      |

---

## 7.4 checkins

Mencatat riwayat kehadiran tamu di lokasi acara.

| Field                  | Tipe / Deskripsi                                        |
| :--------------------- | :------------------------------------------------------ |
| **id**           | Primary Key (UUID/Serial)                               |
| **guest_id**     | Foreign Key ke `guests` (Unique: 1 tamu = 1 check-in) |
| **checkin_time** | Waktu saat tamu melakukan scan/check-in                 |
| **checkin_by**   | Identitas staff yang melakukan proses check-in          |

**Constraint:** satu tamu hanya bisa check-in sekali.

---

# 8. Detailed Feature Flows

## 8.1 Event Preparation & Branding Flow

Proses awal di mana Admin menyiapkan identitas visual dan informasi dasar event.

```mermaid
graph TD
    A[Admin Login] --> B[Buat Event Baru]
    B --> C[Isi Data: Nama, Tgl, Lokasi, Dresscode]
    C --> D[Pilih Template/Preset Layout]
    D --> E[Upload Logo & Background]
    E --> F[Atur Variabel Warna CSS]
    F --> G[Sistem Generate Tema Dinamis]
    G --> H[Event Siap Digunakan]
```

---

## 8.2 Guest Data Management Flow

Alur penambahan data tamu baik melalui impor massal maupun input manual.

```mermaid
graph TD
    A[Admin Dashboard] --> B{Metode Input?}
    B -- Massal --> C[Upload File Excel]
    C --> D[Sistem Parsing & Preview Baris Data]
    D --> E{Data Valid?}
    E -- Tidak --> F[Admin Edit Langsung di Preview]
    F --> D
    E -- Ya --> G[Konfirmasi Import]
  
    B -- Manual --> H[Buka Form Tambah Tamu]
    H --> I[Isi Data: Nama, WA, Tipe, dll]
    I --> J[Simpan Data]
  
    G --> K[Sistem Generate Unique UUID]
    J --> K
    K --> L[Generate Link Personal]
    L --> M[Data Tersimpan di Supabase]
```

---

## 8.3 WhatsApp Invitation Distribution Flow

Proses pengiriman undangan otomatis menggunakan layanan NotifAPI.

```mermaid
graph TD
    A[Admin Pilih Target Tamu] --> B[Admin Pilih Template Pesan]
    B --> C[Sistem Iterasi Setiap Tamu]
    C --> D[Mapping Tag: {name}, {link}, {event_name}]
    D --> E[Panggil NotifAPI via Edge Function]
    E --> F[Update Status: wa_sent_at]
    F --> G[Logging Status Pengiriman]
```

---

## 8.4 Guest RSVP & QR Code Generation Flow

Interaksi tamu dari menerima pesan hingga mendapatkan bukti registrasi.

```mermaid
graph TD
    A[Tamu Klik Link di WhatsApp] --> B[Buka Halaman Undangan Personal]
    B --> C[Tamu Klik Konfirmasi Hadir]
    C --> D[Update rsvp_status]
    D --> E[Sistem Generate QR Code Guest ID]
    E --> F[Tampilkan QR Code & Animasi Sukses]
```

---


## 8.6 Real-time QR Scanner & Check-in Flow

Proses registrasi di lokasi acara dengan penanganan berbagai skenario.

```mermaid
graph TD
    A[Panitia Scan QR Tamu] --> B[Ambil UUID dari QR]
    B --> C{Cek UUID di Database?}
    C -- Tidak Ditemukan --> D[Pesan: Undangan Tidak Valid!]
    C -- Ada --> E{Sudah Check-in?}
    E -- Ya --> F[Pesan: Tamu Sudah Terdaftar pada Jam XX:XX]
    E -- Belum --> G[Tampilkan Data: Nama, Dept]
    G --> H[Klik Check-in]
    H --> I[Update checkins & checkin_time]
    I --> J[Trigger Supabase Realtime Broadcast]
```

---

## 8.7 Real-time Welcome Board & Analytics Flow

Bagaimana data kehadiran disajikan secara instan di layar monitor.

```mermaid
graph TD
    A[Trigger: New Entry in checkins Table] --> B[Supabase Realtime Broadcast]
    B --> C[Welcome Board: Update Nama Tamu Terakhir]
    B --> D[Admin Dashboard: Increment Counter Hadir]
    B --> E[Admin Dashboard: Re-calculate Statistik per Dept]
    C --> F[Visual Animasi Selamat Datang Muncul di TV]
    D --> G[Chart Statistik Terupdate Otomatis]
```

---

# 9. Edge Cases

### QR sudah digunakan

Guest sudah check-in

---

### RSVP belum dilakukan

Scanner tetap menampilkan tamu.

---

### QR tidak valid

Undangan tidak ditemukan

---

### Guest lupa QR

Panitia search nama
↓
Manual check-in

---

# 10. Non Functional Requirements

### Performance

- QR scanning < 1 detik
- query database cepat

### Scalability

- mendukung 1000+ tamu
- mendukung banyak event

### Reliability

- database tunggal
- tidak bergantung API eksternal

---

# 11. Tech Stack

| Category                     | Technology            | Description                                       |
| :--------------------------- | :-------------------- | :------------------------------------------------ |
| **Frontend**           | Next.js               | React framework for web development               |
| **Styling**            | Tailwind CSS          | Utility-first CSS framework                       |
| **QR Scanner**         | html5-qrcode          | Library for cross-platform QR code scanning       |
| **Backend / Database** | Supabase (PostgreSQL) | Open source Firebase alternative                  |
| **Deployment**         | Vercel                | Platform for frontend frameworks and static sites |

---

# 12. MVP Deliverables

Versi pertama sistem mencakup:

- event management
- import tamu dari Excel
- digital invitation
- RSVP konfirmasi kehadiran
- QR invitation
- QR scanner
- check-in system
- laporan kehadiran

---

# 13. Development Timeline (Solo Developer)

Database & architecture

1 hari

RSVP & invitation page

2 hari

QR code + scanner

1 hari

Dashboard & testing

1 hari

Total estimasi:

5 hari development

---

# 14. Success Metrics

Keberhasilan sistem diukur dari:

- jumlah RSVP yang terkumpul
- waktu check-in < 3 detik
- antrian registrasi minimal

---

# 15. Future Improvements

Fitur yang bisa ditambahkan di masa depan:

- WhatsApp reminder
- seat assignment
- event analytics dashboard
- multi check-in gate
- badge printing

# 16. Excel Import Specification

Admin dapat mengupload file Excel untuk menambahkan daftar tamu ke event.

## Supported Format

File format:

.xlsx
.csv

## Required Columns

| Column      | Required | Description               |
| ----------- | -------- | ------------------------- |
| Guest Type  | yes      | internal / external       |
| Employee Id | optional | hanya untuk internal      |
| Full Name   | yes      | nama tamu                 |
| Department  | optional | departemen karyawan       |
| Position    | optional | jabatan                   |
| Company     | optional | perusahaan tamu eksternal |
| WA          | optional | nomor WhatsApp            |

---

## Example Excel

| Guest Type | Employee Id    | Full Name         | Department     | Position           | Company        | WA           |
| ---------- | -------------- | ----------------- | -------------- | ------------------ | -------------- | ------------ |
| internal   | BIP-0006-03-21 | Zulhakim          | General Affair | Security           |                | 0838959159   |
| internal   | BIP-0008-02-22 | Endri Tri Pranoto | Finance        | Finance Supervisor |                | 085770277720 |
| external   |                | Ahmad Fauzi       |                |                    | Vendor Partner | 0812345678   |

---

## Import Process

```mermaid
graph TD
    A[Upload Excel] --> B[Parse Excel]
    B --> C[Validate rows]
    C --> D[Insert guests]
    D --> E[Return import result]
```

Import result example:

Imported: 120
Duplicate: 3
Invalid: 1

---

# 17. QR Code System

Setiap tamu memiliki QR Code unik.

QR berisi:

guest_id

Contoh payload:

f4c8a6c0-62d2-4c12-bf5a-93a1b1f9f1c4

---

## QR Generation

QR di-generate setelah RSVP selesai.

Library yang bisa digunakan:

qrcode

atau

react-qr-code

---

# 18. QR Scanner System

Panitia menggunakan halaman scanner.

Library scanner:

html5-qrcode

---

## Scanner Flow

```mermaid
graph TD
    A[Scan QR] --> B[Get guest_id]
    B --> C[Fetch guest data]
    C --> D[Display guest info]
    D --> E[Confirm check-in]
```

---

## Scanner Display Example

Name: Zulhakim
Department: General Affair

Status: Not Checked-in

Button:

CHECK-IN

---

# 20. Project Structure

Contoh struktur project menggunakan Next.js App Router.

```
event-invitation-system
│
├── app
│   ├── invite
│   │   └── [guestId]
│   │       └── page.tsx
│   │
│   ├── scanner
│   │   └── page.tsx
│   │
│   ├── dashboard
│   │   └── page.tsx
│   │
│   └── api
│       ├── rsvp
│       ├── checkin
│       └── import
│
├── components
│   ├── QRCode
│   ├── Scanner
│   └── GuestCard
│
├── lib
│   ├── supabase.ts
│   └── excelParser.ts
│
├── types
│   └── guest.ts
│
└── utils
    └── date.ts
```

# 21. Pages Specification

## Invitation Page

Route:

`/invite/[guestId]`

Features:

- show guest info
- confirm RSVP
- show QR code

## Scanner Page

Route:

`/scanner`

Features:

- camera scanner
- show guest data
- check-in button

## Admin Dashboard

Route:

`/dashboard`

Features:

- guest list
- RSVP status
- check-in status
- import Excel
- Branding & Theme settings (Color picker, Logo upload)

# 22. Security Considerations

## Prevent Double Check-in

Database constraint:

unique checkin per guest

## Validate Guest

Jika guest tidak ditemukan:

Invalid QR

## Security Checks

1. **Anti-Duplication**: User cannot check-in twice.
2. **Access Control**: Invitations are unique via UUID.

# 23. Performance Optimization

## Database Index

Index penting:

- guests(event_id)
- checkins(guest_id)

## Query Optimization

Scanner hanya mengambil data yang diperlukan:

- name
- department
- checkin_status

# 24. Deployment Plan

Frontend Deployment:

Vercel

Database:

Supabase

Environment Variables:

- SUPABASE_URL
- SUPABASE_ANON_KEY

# 25. Estimated Capacity

Sistem dirancang untuk:

100 – 2000 tamu per event

Scanner throughput:

1–2 detik per tamu

# 26. Future Roadmap

...

# 27. Dynamic Theming

Setiap event dapat memiliki identitas visual sendiri yang disimpan di database.

### Theme Variables:

- `--primary-color`: Warna tombol dan aksen utama.
- `--secondary-color`: Warna aksen pendukung.
- Logo: Gambar logo unik per event.
- Background: Gambar latar belakang halaman undangan.
- **Font & Shadow Tokens**: Pilihan font (misal: Playfair Display, Inter) dan gaya bayangan (shadow) yang disimpan dalam `theme_config` (JSONB).

### Implementation:

Sistem akan mengambil data tema dari tabel `events` dan menyajikannya sebagai CSS Custom Properties (CSS Variables) di root halaman undangan.

# 28. Layout Templates (Presets)

Untuk mempermudah panitia, sistem menyediakan pilihan layout:

1. **Elegant**: Cocok untuk Halal Bihalal, pernikahan, atau acara formal.
2. **Modern**: Cocok untuk Seminar, Townhall, atau acara korporat.
3. **Festive**: Cocok untuk Family Gathering atau acara santai.

Setiap template akan menyesuaikan tata letak komponen (Logo di tengah vs di pinggir) dan font yang digunakan.
