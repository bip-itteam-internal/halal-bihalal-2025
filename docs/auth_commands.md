# Auth & User Management Commands

Dokumen ini berisi panduan untuk membuat dan mengelola akun admin/staff menggunakan Supabase.

## 1. Persiapan Awal
Pastikan Anda sudah menjalankan SQL di `docs/database_schema.sql` di Supabase SQL Editor untuk menyiapkan tabel `profiles` dan **Trigger Sinkronisasi**.

## 2. Cara Membuat User Baru
Anda disarankan membuat user melalui **Supabase Dashboard > Authentication > Users > Add User**. 

Saat membuat user, masukkan email dan password. Secara default, user akan memiliki role `staff` karena fungsi trigger kita.

---

## 3. Perintah SQL untuk Mengubah Role
Setelah user dibuat di Dashboard, ambil **User ID (UUID)** dari tabel tersebut, dan jalankan perintah ini di SQL Editor untuk menaikkan level akses mereka:

### Menjadi Super Admin
```sql
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE id = 'ID_USER_DARI_DASHBOARD';
```

### Menjadi Admin (Event Manager)
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'ID_USER_DARI_DASHBOARD';
```

---

## 4. Perintah SQL untuk Memberikan Akses Event
Gunakan perintah ini untuk menugaskan seorang **Admin** atau **Staff** ke event tertentu:

### Memberikan Hak Akses Manager ke Event
```sql
INSERT INTO event_permissions (user_id, event_id, role)
VALUES ('UUID_USER', 'UUID_EVENT', 'manager');
```

### Memberikan Hak Akses Scanner (Staff) ke Event
```sql
INSERT INTO event_permissions (user_id, event_id, role)
VALUES ('UUID_USER', 'UUID_EVENT', 'scanner');
```

---

## 5. Tips Keamanan
- Role `super_admin` sebaiknya hanya diberikan kepada 1-2 orang pengembang utama.
- Gunakan role `scanner` untuk HP panitia di lapangan agar data tamu aman dari perubahan tidak sengaja.
