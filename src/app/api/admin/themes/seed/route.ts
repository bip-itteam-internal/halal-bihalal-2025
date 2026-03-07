import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const defaultThemes = [
  {
    name: 'BIP Classic (Emerald)',
    primary_color: '#059669',
    secondary_color: '#fbbf24',
    template_id: 'modern',
    theme_config: {
      body_font: 'inter',
      heading_font: 'outfit',
      shadow_preset: 'soft',
    },
  },
  {
    name: 'Royal Gold',
    primary_color: '#854d0e',
    secondary_color: '#facc15',
    template_id: 'classic',
    theme_config: {
      body_font: 'source-serif',
      heading_font: 'playfair',
      shadow_preset: 'lifted',
    },
  },
  {
    name: 'Modern Dark',
    primary_color: '#0f172a',
    secondary_color: '#38bdf8',
    template_id: 'modern',
    theme_config: {
      body_font: 'inter',
      heading_font: 'space-grotesk',
      shadow_preset: 'dramatic',
    },
  },
  {
    name: 'Soft Pastel',
    primary_color: '#db2777',
    secondary_color: '#fdf2f8',
    template_id: 'modern',
    theme_config: {
      body_font: 'outfit',
      heading_font: 'poppins',
      shadow_preset: 'soft',
    },
  },
]

export async function POST() {
  const supabase = createAdminClient()

  const results = []
  for (const theme of defaultThemes) {
    const { error } = await supabase
      .from('event_themes')
      .upsert(theme, { onConflict: 'name' })
      .select()

    if (error) {
      results.push({
        name: theme.name,
        status: 'error',
        message: error.message,
      })
    } else {
      results.push({ name: theme.name, status: 'success' })
    }
  }

  return NextResponse.json({ message: 'Seeding completed', results })
}
