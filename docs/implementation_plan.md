# Overhaul Plan: Event Invitation & QR Check-in System

This document outlines the step-by-step plan to transform the current guestbook application into a multi-event invitation and check-in system based on the new project brief.

## Phase 1: Tech Stack & Infrastructure 🛠️
- [ ] Set up Chakra UI (v3) with Provider.
- [ ] Configure `app/layout.tsx` with ChakraProvider.
- [ ] Set up the App Router directory structure (`app/`).
- [ ] Create common Chakra components (Button, Input, Card).

## Phase 2: Auth & Permissions 🔑
- [ ] Set up Supabase Auth.
- [ ] Create `profiles` and `event_permissions` tables.
- [ ] Implement middleware for role-based protection (`/admin`, `/scanner`).
- [ ] Implement Row Level Security (RLS) based on user roles and permissions.

## Phase 3: Database Layer (Supabase) 💾
- [ ] Create `events` table.
- [ ] Create `guests` table.
- [ ] Create `checkins` table.
- [ ] Create Supabase Storage Bucket (`event-assets`) for logos and backgrounds.
- [ ] Update `lib/supabase.ts` (or `utils/supabaseClient.ts`) to match new types.
- [ ] Implement SQL scripts for RLS (Row Level Security).

## Phase 3: Core Logic & Types 🧩
- [ ] Define TypeScript interfaces for `Event`, `Guest`, and `Checkin`.
- [ ] Create utility for Excel parsing (XLSX).
- [ ] Implement **Theme Config tokens** (Font families & Shadow presets).

## Phase 4: Guest Experience (Invitation & Registration) 🎟️
- [ ] **Invitation Page**: `app/invite/[guestId]/page.tsx`
  - RSVP logic and QR Code display.
- [ ] **Public Registration Page**: `app/register/[eventId]/page.tsx`
  - **Auto-Quota Logic**: Validate `external_quota` before allowing submission.
  - **Category Support**: Allow registration for 'External' and 'Tenant'.
  - **Success Screen**: Show instant E-Ticket (QR Code 1).
- [ ] **Success Page**: Confirmation for both RSVP and Registration.

## Phase 5: Admin Experience (Scanner & Dashboard) 📊
- [ ] **Event Dashboard**: List events and guest summary with **Supabase Realtime** analytics.
- [ ] **Guest Management**: **Import Excel (Internal)** & View Public Registrations.
  - [ ] Toggle to open/close public registration.
- [ ] **QR Scanner**: `app/scanner/page.tsx` using `html5-qrcode`.
  - [ ] **Step 1 Mode (Exchange)**: Scan QR 1 -> Scan & Pair with QR 2 (Bracelet).
  - [ ] **Step 2 Mode (Entrance)**: Scan QR 2 for gate access verification.
- [ ] **Internal Doorprize Spinner**: `app/admin/doorprize/page.tsx`
- [ ] **Welcome Display Board**: `app/display/[eventId]/page.tsx`.

## Phase 8: Data Integrity 🔌
- [ ] Implement race-condition protection for quota counting.
- [ ] Real-time quota counter for admin dashboard.

## Phase 6: WhatsApp Integration (NotifAPI) 📱
- [ ] Set up HTTP service for WhatsApp NotifAPI.
- [ ] **Message Template Editor**: Create UI for admin to edit WhatsApp message per event.
- [ ] Implement manual "Send WA" button in Admin Dashboard.
- [ ] Set up **Supabase Edge Function / Cron Job** for automated invitation sending.

## Phase 7: Polish & Deployment 🚀
- [ ] Responsive design check.
- [ ] Performance optimization (Debouncing, caching).
- [ ] Final testing on mobile devices.
