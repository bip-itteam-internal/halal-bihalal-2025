import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

const outfit = Outfit({
  variable: '--font-heading',
  subsets: ['latin'],
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
        className={`${inter.variable} ${outfit.variable} font-sans antialiased transition-colors duration-300`}
      >
        <main className="relative flex min-h-screen flex-col">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
