# API Specification (Internal)

Dokumen ini merinci endpoint API yang akan dibangun di dalam folder `app/api/`.

## 1. Events
### GET /api/events
Mengambil daftar semua event (untuk dashboard admin).
**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Halal Bihalal 2025",
    "description": "Silaturahmi keluarga besar...",
    "event_date": "2025-04-10T09:00:00Z",
    "location": "Main Hall Lt. 2, Kantor Pusat BIP",
    "dress_code": "Batik Bebas",
    "total_guests": 150,
    "total_checked_in": 45
  }
]
```

### POST /api/events
Membuat event baru.
**Payload:**
```json
{
  "name": "string",
  "event_date": "ISO8601",
  "location": "string"
}
```

## 2. Guests
### GET /api/guests/[guestId]
Digunakan oleh halaman undangan (`/invite/[guestId]/[slug]`) untuk mengambil data personal tamu.
**Response:** `200 OK`
```json
{
  "full_name": "Zulhakim",
  "guest_type": "internal",
  "event": {
    "name": "Halal Bihalal 2025"
  },
  "rsvp_status": "pending"
}
```

### PATCH /api/guests/[guestId]/rsvp
Melakukan konfirmasi kehadiran.
**Payload:**
```json
{
  "rsvp_status": "confirmed"
}
```

## 3. Check-in
### POST /api/checkin
Endpoint yang dipanggil oleh scanner QR di venue.
**Payload:**
```json
{
  "guest_id": "uuid"
}
```
**Response Success:** `200 OK`
```json
{
  "status": "success",
  "guest_name": "Zulhakim"
}
```
**Response Error (Sudah Check-in):** `400 Bad Request`
```json
{
  "status": "error",
  "message": "Tamu ini sudah melakukan check-in pada pukul 09:15"
}
```

## 4. Import & Export
### POST /api/admin/import
Menerima file Excel dan memprosesnya ke database.
**Payload:** `multipart/form-data` (file: .xlsx)
### POST /api/import-guests
Endpoint untuk memproses data tamu. Mendukung alur **Review/Preview** di mana data diparsing di client/server sebelum dikirim secara bulk.
**Payload:** `JSON Array of Guests` (setelah divalidasi admin).

### GET /api/admin/export/[eventId]
Menghasilkan file CSV/Excel berisi rekap kehadiran.

## 5. Assets (Storage)
### POST /api/admin/upload
Mengunggah logo atau background event. Menggunakan Supabase Storage.
**Payload:** `multipart/form-data` (file: image)
**Response:**
```json
{
  "public_url": "https://supabase_url/storage/v1/object/public/assets/logo-event-1.png"
}

