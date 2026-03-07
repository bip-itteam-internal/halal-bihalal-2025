import type { Metadata } from 'next'
import {
  Inter,
  Outfit,
  Amiri,
  Aref_Ruqaa,
  Reem_Kufi,
  Lemonada,
} from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  variable: '--ff-inter',
  subsets: ['latin'],
})

const outfit = Outfit({
  variable: '--ff-outfit',
  subsets: ['latin'],
})

const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['latin', 'arabic'],
  variable: '--ff-amiri',
})

const arefRuqaa = Aref_Ruqaa({
  weight: ['400', '700'],
  subsets: ['latin', 'arabic'],
  variable: '--ff-aref-ruqaa',
})

const reemKufi = Reem_Kufi({
  subsets: ['latin'],
  variable: '--ff-reem-kufi',
})

const lemonada = Lemonada({
  subsets: ['latin'],
  variable: '--ff-lemonada',
})

export const metadata: Metadata = {
  title: 'Halal Bihalal Bharata Group Spesial Konser Wali Band 2026',
  description: 'Spesial Konser Wali Band - QR Check-in & Event Management',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} ${amiri.variable} ${arefRuqaa.variable} ${reemKufi.variable} ${lemonada.variable} font-sans antialiased transition-colors duration-300`}
      >
        <main className="relative flex min-h-screen flex-col">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
