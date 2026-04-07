import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type JakartaFormat = 'PPP' | 'p' | 'PPP p' | 'PPPP' | 'MMM d'

/**
 * Format date to Jakarta timezone (Asia/Jakarta)
 */
export function formatJakartaDate(
  date: Date | string | number,
  formatStr: JakartaFormat = 'PPP p',
) {
  const d = new Date(date)

  const baseOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
  }

  // 8 April 2026
  if (formatStr === 'PPP') {
    return new Intl.DateTimeFormat('id-ID', {
      ...baseOptions,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
  }

  // Selasa, 8 April 2026
  if (formatStr === 'PPPP') {
    return new Intl.DateTimeFormat('id-ID', {
      ...baseOptions,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
  }

  // 16.00 WIB
  if (formatStr === 'p') {
    return (
      new Intl.DateTimeFormat('id-ID', {
        ...baseOptions,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d) + ' WIB'
    )
  }

  // 8 Apr
  if (formatStr === 'MMM d') {
    return new Intl.DateTimeFormat('id-ID', {
      ...baseOptions,
      day: 'numeric',
      month: 'short',
    }).format(d)
  }

  // 8 April 2026 16.00 WIB
  return (
    new Intl.DateTimeFormat('id-ID', {
      ...baseOptions,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d) + ' WIB'
  )
}
/**
 * Get current date object in Jakarta timezone
 */
export function getJakartaNow() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  return new Date(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  )
}

/**
 * Build ISO datetime from date + time interpreted as WIB (UTC+7)
 */
export function toJakartaISOString(
  date: Date | string | number,
  time: string = '00:00',
) {
  const d = new Date(date)
  const [hours, minutes] = time.split(':').map((v) => Number(v))
  const dateOnlyMatch =
    typeof date === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(date) : null
  const year = dateOnlyMatch ? Number(dateOnlyMatch[1]) : d.getFullYear()
  const month = dateOnlyMatch ? Number(dateOnlyMatch[2]) - 1 : d.getMonth()
  const day = dateOnlyMatch ? Number(dateOnlyMatch[3]) : d.getDate()
  const utcMs =
    Date.UTC(
      year,
      month,
      day,
      Number.isNaN(hours) ? 0 : hours,
      Number.isNaN(minutes) ? 0 : minutes,
    ) -
    7 * 60 * 60 * 1000

  return new Date(utcMs).toISOString()
}

/**
 * Format currency to IDR
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Generate short random code
 */
export function generateRandomCode(length: number = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed easily confused chars like 0, O, 1, I
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Encode a UUID to a shorter, obfuscated Base64URL string (22 characters).
 */
export function encodeUUID(uuid: string): string {
  if (!uuid) return ''
  const hex = uuid.replace(/-/g, '')
  if (hex.length !== 32) return uuid

  const bytes = new Uint8Array(16)
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
  }

  // Use btoa safely for binary data
  const binString = String.fromCharCode(...bytes)
  return btoa(binString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Decode an obfuscated Base64URL string back to a UUID.
 */
export function decodeUUID(base64url: string): string {
  if (!base64url || base64url.length !== 22) return base64url

  let b64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) {
    b64 += '='
  }

  try {
    const binString = atob(b64)
    const hex = Array.from(binString)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  } catch {
    return base64url
  }
}

/**
 * Convert a string to a URL-friendly slug.
 */
export function toEventSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Calculate distance between two points in meters using Haversine formula
 */
export function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371e3 // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // distance in meters
}
