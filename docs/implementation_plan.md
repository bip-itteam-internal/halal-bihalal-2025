# Overhaul Plan: Event Invitation & QR Check-in System

This document outlines the step-by-step plan to transform the current guestbook application into a multi-event invitation and check-in system based on the new project brief.

## Phase 1: Tech Stack & Infrastructure 🛠️
- [ ] Install Tailwind CSS, PostCSS, and Autoprefixer.
- [ ] Configure `tailwind.config.ts` and `app/globals.css`.
- [ ] Set up the App Router directory structure (`app/`).
- [ ] Migrate common components to Tailwind (Button, Input, Card).

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

## Phase 4: Guest Experience (Invitation & RSVP) 🎟️
- [ ] **Invitation Page**: `app/invite/[guestId]/page.tsx`
  - **Dynamic Theme**: Inject CSS variables from event branding data.
  - RSVP logic (confirm attendance).
  - QR Code generation.
- [ ] **Success Page**: Confirmation after RSVP.

## Phase 5: Admin Experience (Scanner & Dashboard) 📊
- [ ] **Event Dashboard**: List events and guest summary with **Supabase Realtime** analytics.
- [ ] **Guest Management**: **Import Excel with Review/Preview page**, manual add/edit.
- [ ] **QR Scanner**: `app/scanner/page.tsx` using `html5-qrcode`.
- [ ] **Manual Check-in**: Search and click to check-in.
- [ ] **Welcome Display Board**: `app/display/[eventId]/page.tsx` (TV Monitor) using **Supabase Realtime** for instant welcome effects.

## Phase 6: WhatsApp Integration (NotifAPI) 📱
- [ ] Set up HTTP service for WhatsApp NotifAPI.
- [ ] **Message Template Editor**: Create UI for admin to edit WhatsApp message per event.
- [ ] Implement manual "Send WA" button in Admin Dashboard.
- [ ] Set up **Supabase Edge Function / Cron Job** for automated invitation sending.

## Phase 7: Polish & Deployment 🚀
- [ ] Responsive design check.
- [ ] Performance optimization (Debouncing, caching).
- [ ] Final testing on mobile devices.
