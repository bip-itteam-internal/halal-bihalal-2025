import { Calendar, Building2, Stars } from 'lucide-react'

export interface AppTemplate {
  id: string
  name: string
  description: string
  icon: React.ElementType
  thumbnail?: string
  config: {
    primaryColor: string
    secondaryColor: string
    fontHeading: string
    fontBody: string
    radius: string
    mosaicOpacity: number
  }
}

export const INVITATION_TEMPLATES: AppTemplate[] = [
  {
    id: 'corporate-modern',
    name: 'Corporate Modern',
    description:
      'Tampilan bersih, profesional, dan tajam. Cocok untuk acara resmi kantor.',
    icon: Building2,
    config: {
      primaryColor: '#0f172a', // Slate 900
      secondaryColor: '#38bdf8', // Sky 400
      fontHeading: 'Inter, sans-serif',
      fontBody: 'Inter, sans-serif',
      radius: '0.75rem',
      mosaicOpacity: 0.05,
    },
  },
  {
    id: 'festive-halal',
    name: 'Bharata Event Festive',
    description:
      'Nuansa hangat dengan dekorasi Islami. Cocok untuk acara silaturahmi.',
    icon: Stars,
    config: {
      primaryColor: '#065f46', // Emerald 800
      secondaryColor: '#fbbf24', // Amber 400
      fontHeading: 'Bebas Neue, sans-serif',
      fontBody: 'Inter, sans-serif',
      radius: '3rem',
      mosaicOpacity: 0.15,
    },
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    description: 'Perpaduan warna emas dan hitam yang mewah.',
    icon: Calendar,
    config: {
      primaryColor: '#1a1a1a',
      secondaryColor: '#d4af37',
      fontHeading: 'Playfair Display, serif',
      fontBody: 'Inter, sans-serif',
      radius: '0px',
      mosaicOpacity: 0.08,
    },
  },
]
