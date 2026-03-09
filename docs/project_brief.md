
# Bharata Event System

## Project Brief (Updated Architecture)

---

# 1. Project Overview

**Bharata Event** adalah aplikasi web untuk mengelola undangan event
perusahaan seperti:

- Gathering
- Seminar
- Townhall
- Concert / Corporate Entertainment Event

Sistem memungkinkan panitia untuk:

- Mengimpor daftar tamu dari Excel
- Membuka **Public Registration Page** untuk tamu eksternal
- Mengirim link undangan digital
- Mengumpulkan RSVP
- Menggunakan **QR Code untuk proses check-in**
- Mengelola **dua tahap verifikasi check-in**
- Menjalankan **Doorprize Spinner**
- Melihat laporan kehadiran secara realtime

Sistem dirancang untuk:

- Mendukung **1000+ tamu eksternal**
- Mendukung **multi-event**
- Mendukung **aturan masuk berbeda per kategori tamu**

---

# 2. Objectives

Tujuan utama sistem:

1. Digitalisasi undangan event perusahaan
2. Mengumpulkan RSVP sebelum event
3. Mempercepat proses registrasi di venue
4. Mengelola kuota tamu eksternal otomatis
5. Menyediakan fitur hiburan (Doorprize Spinner)
6. Menyediakan data kehadiran realtime

---

# 3. Scope

## 3.1 In Scope

Fitur utama sistem:

- Import tamu dari Excel
- Public registration page
- Digital invitation
- RSVP system
- QR invitation
- **Two-step check-in system**
- Guest type entry rules
- Doorprize spinner
- Dashboard analytics
- Welcome display board

## 3.2 Out of Scope

Tidak termasuk pada versi awal:

- Email invitation
- Seat assignment
- Payment ticketing
- Guest authentication

---

# 4. Guest Categories

Sistem mendukung tiga tipe tamu:

| Guest Type \| Description \|

\|-------------\|-------------\| Internal \| Karyawan perusahaan \| \|
External \| Tamu umum / masyarakat \| \| Tenant \| UMKM tenant booth \|

---

# 5. Guest Entry Rules

Setiap kategori tamu memiliki waktu masuk berbeda.

Data disimpan pada tabel **event_guest_rules**.

Contoh:

| Guest Type \| Open Gate \|

\|-------------\|-----------\| Tenant \| 12:30 \| \| Internal \| 15:00
\| \| External \| 16:00 \|

Tujuan:

- Mengatur flow kedatangan tamu
- Menghindari penumpukan antrean

---

# 6. QR Check-in System

Sistem menggunakan **satu QR Code undangan** dengan **dua tahap
check-in**.

### Step 1 --- Exchange

Tamu menukarkan QR invitation dengan gelang.

Database step:

exchange

### Step 2 --- Entrance

Gelang diverifikasi saat masuk venue.

Database step:

entrance

Constraint database:

    UNIQUE (guest_id,event_id,step)

Artinya:

- Exchange hanya bisa sekali
- Entrance hanya bisa sekali

---

# 7. System Architecture

Struktur utama database:

    events
       │
       ├── event_guest_rules
       │
       ├── guest_events
       │       │
       │       └── guests
       │
       └── checkins

---

# 8. Database Tables

## events

Menyimpan data utama event.

Fields:

- id
- name
- event_date
- location
- description
- dress_code
- logo_url

---

## guests

Menyimpan data tamu.

Fields:

- id
- guest_type
- full_name
- phone
- email
- address
- metadata
- rsvp_status

---

## guest_events

Relasi many-to-many antara tamu dan event.

Fields:

- id
- guest_id
- event_id
- created_at

---

## event_guest_rules

Aturan jam masuk tamu.

Fields:

- id
- event_id
- guest_type
- open_gate
- close_gate

---

## checkins

Mencatat proses scan.

Fields:

- id
- guest_id
- event_id
- step
- checkin_time
- checkin_by

Constraint:

    UNIQUE (guest_id,event_id,step)

---

# 9. QR Payload

QR Code berisi:

    invitation_code

Contoh:

    HB2026-8F3K2A

Keuntungan:

- lebih aman
- tidak expose UUID
- mudah regenerate

---

# 10. Scanner Flow

Flow scanner:

    Scan QR
    ↓
    Lookup invitation_code
    ↓
    Ambil guest + event
    ↓
    Cek guest_type
    ↓
    Ambil open_gate
    ↓
    Jika waktu belum sesuai → ditolak
    ↓
    Jika valid → insert checkin

---

# 11. Real-time Dashboard

Dashboard menampilkan:

- total tamu
- hadir
- belum hadir
- statistik per kategori

Data realtime menggunakan:

Supabase Realtime

---

# 12. Performance Targets

Sistem dirancang untuk:

- 100--2000 tamu per event
- scan time \< 1 detik
- realtime analytics

---

# 13. Tech Stack

| Layer \| Technology \|

\|------\|-------------\| Frontend \| Next.js \| \| UI \| Chakra UI \|
\| Scanner \| html5-qrcode \| \| Backend \| Supabase \| \| Database \|
PostgreSQL \| \| Hosting \| Vercel \|

---

# 14. Future Improvements

Fitur lanjutan:

- WhatsApp reminder automation
- Anti screenshot QR
- Doorprize elimination grid
- Badge printing
- Multi gate scanner
- Event analytics

---

# 15. Estimated Development Time

Solo developer estimation:

| Task \| Time \|

\|-----\|------\| Database design \| 1 day \| \| Invitation page \| 2
days \| \| QR system \| 1 day \| \| Dashboard \| 1 day \|

Total:

**5 days development**

<style>#mermaid-1773045896892{font-family:sans-serif;font-size:16px;fill:#333;}#mermaid-1773045896892 .error-icon{fill:#552222;}#mermaid-1773045896892 .error-text{fill:#552222;stroke:#552222;}#mermaid-1773045896892 .edge-thickness-normal{stroke-width:2px;}#mermaid-1773045896892 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-1773045896892 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-1773045896892 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-1773045896892 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-1773045896892 .marker{fill:#333333;}#mermaid-1773045896892 .marker.cross{stroke:#333333;}#mermaid-1773045896892 svg{font-family:sans-serif;font-size:16px;}#mermaid-1773045896892 .label{font-family:sans-serif;color:#333;}#mermaid-1773045896892 .label text{fill:#333;}#mermaid-1773045896892 .node rect,#mermaid-1773045896892 .node circle,#mermaid-1773045896892 .node ellipse,#mermaid-1773045896892 .node polygon,#mermaid-1773045896892 .node path{fill:#ECECFF;stroke:#9370DB;stroke-width:1px;}#mermaid-1773045896892 .node .label{text-align:center;}#mermaid-1773045896892 .node.clickable{cursor:pointer;}#mermaid-1773045896892 .arrowheadPath{fill:#333333;}#mermaid-1773045896892 .edgePath .path{stroke:#333333;stroke-width:1.5px;}#mermaid-1773045896892 .flowchart-link{stroke:#333333;fill:none;}#mermaid-1773045896892 .edgeLabel{background-color:#e8e8e8;text-align:center;}#mermaid-1773045896892 .edgeLabel rect{opacity:0.5;background-color:#e8e8e8;fill:#e8e8e8;}#mermaid-1773045896892 .cluster rect{fill:#ffffde;stroke:#aaaa33;stroke-width:1px;}#mermaid-1773045896892 .cluster text{fill:#333;}#mermaid-1773045896892 div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:sans-serif;font-size:12px;background:hsl(80,100%,96.2745098039%);border:1px solid #aaaa33;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-1773045896892:root{--mermaid-font-family:sans-serif;}#mermaid-1773045896892:root{--mermaid-alt-font-family:sans-serif;}#mermaid-1773045896892 flowchart{fill:apa;}</style>
