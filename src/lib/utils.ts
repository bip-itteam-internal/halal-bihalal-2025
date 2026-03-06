import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type JakartaFormat = 'PPP' | 'p' | 'PPP p'

/**
 * Format date to Jakarta timezone (Asia/Jakarta)
 */
export function formatJakartaDate(
  date: Date | string | number,
  formatStr: JakartaFormat = 'PPP p',
) {
  const d = new Date(date)
  const baseOptions: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Jakarta' }

  if (formatStr === 'PPP') {
    return new Intl.DateTimeFormat('id-ID', {
      ...baseOptions,
      dateStyle: 'long',
    }).format(d)
  }

  if (formatStr === 'p') {
    return new Intl.DateTimeFormat('id-ID', {
      ...baseOptions,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    }).format(d)
  }

  return new Intl.DateTimeFormat('id-ID', {
    ...baseOptions,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).format(d)
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
