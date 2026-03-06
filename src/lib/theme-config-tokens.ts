import { ThemeConfigTokens } from '@/types'

export const THEME_FONT_FAMILIES = {
  inter: {
    label: 'Inter',
    value: "'Inter', ui-sans-serif, system-ui",
  },
  outfit: {
    label: 'Outfit',
    value: "'Outfit', ui-sans-serif, system-ui",
  },
  poppins: {
    label: 'Poppins',
    value: "'Poppins', ui-sans-serif, system-ui",
  },
  'space-grotesk': {
    label: 'Space Grotesk',
    value: "'Space Grotesk', ui-sans-serif, system-ui",
  },
  playfair: {
    label: 'Playfair Display',
    value: "'Playfair Display', ui-serif, Georgia, serif",
  },
  'source-serif': {
    label: 'Source Serif',
    value: "'Source Serif 4', ui-serif, Georgia, serif",
  },
} as const

export const THEME_SHADOW_PRESETS = {
  none: {
    label: 'None',
    value: 'none',
  },
  soft: {
    label: 'Soft',
    value: '0 8px 24px rgba(15, 23, 42, 0.08)',
  },
  card: {
    label: 'Card',
    value: '0 12px 30px rgba(15, 23, 42, 0.14)',
  },
  lifted: {
    label: 'Lifted',
    value: '0 16px 48px rgba(15, 23, 42, 0.18)',
  },
  dramatic: {
    label: 'Dramatic',
    value: '0 24px 64px rgba(15, 23, 42, 0.3)',
  },
} as const

export type ThemeCssVariables = Record<string, string>

export function resolveThemeConfigTokens(
  config: ThemeConfigTokens = {},
): ThemeCssVariables {
  const bodyFont = config.body_font ?? 'inter'
  const headingFont = config.heading_font ?? 'outfit'
  const shadowPreset = config.shadow_preset ?? 'soft'

  return {
    '--font-sans': THEME_FONT_FAMILIES[bodyFont].value,
    '--font-heading': THEME_FONT_FAMILIES[headingFont].value,
    '--theme-shadow': THEME_SHADOW_PRESETS[shadowPreset].value,
  }
}
