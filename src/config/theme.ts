export type ThemeColor = 'pink' | 'amber' | 'mint'
export type ThemeMode = 'light' | 'dark'

export interface ThemeColorPreset {
  primary: string
  primaryHover: string
  primaryLight: string
  primaryGlow: string
  secondary: string
  secondaryGlow: string
  gradientPrimary: string
  gradientSecondary: string
}

export const themeColorPresets: Record<ThemeColor, ThemeColorPreset> = {
  pink: {
    primary: '#FF66B2',
    primaryHover: '#FF3385',
    primaryLight: 'rgba(255, 102, 178, 0.12)',
    primaryGlow: 'rgba(255, 102, 178, 0.4)',
    secondary: '#FFB6D9',
    secondaryGlow: 'rgba(255, 182, 217, 0.5)',
    gradientPrimary: 'linear-gradient(135deg, #FF66B2, #FF3385)',
    gradientSecondary: 'linear-gradient(135deg, #FFB6D9, #FF66B2)',
  },
  amber: {
    primary: '#D4A373',
    primaryHover: '#BC8A5F',
    primaryLight: 'rgba(212, 163, 115, 0.12)',
    primaryGlow: 'rgba(212, 163, 115, 0.4)',
    secondary: '#E9D8C0',
    secondaryGlow: 'rgba(233, 216, 192, 0.5)',
    gradientPrimary: 'linear-gradient(135deg, #D4A373, #BC8A5F)',
    gradientSecondary: 'linear-gradient(135deg, #E9D8C0, #D4A373)',
  },
  mint: {
    primary: '#4ECDC4',
    primaryHover: '#3DBDB4',
    primaryLight: 'rgba(78, 205, 196, 0.12)',
    primaryGlow: 'rgba(78, 205, 196, 0.4)',
    secondary: '#95E1D3',
    secondaryGlow: 'rgba(149, 225, 211, 0.5)',
    gradientPrimary: 'linear-gradient(135deg, #4ECDC4, #3DBDB4)',
    gradientSecondary: 'linear-gradient(135deg, #95E1D3, #4ECDC4)',
  },
}

export const themeColors: ThemeColor[] = ['pink', 'amber', 'mint']

export const colorLabels: Record<ThemeColor, string> = {
  pink: '粉色',
  amber: '琥珀暖',
  mint: '薄荷',
}
