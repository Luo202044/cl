export type ThemeColor = 'indigo' | 'brown' | 'camellia'
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
  indigo: {
    primary: '#91CFD5',
    primaryHover: '#6BB5BD',
    primaryLight: 'rgba(145, 207, 213, 0.12)',
    primaryGlow: 'rgba(145, 207, 213, 0.4)',
    secondary: '#B8E0E4',
    secondaryGlow: 'rgba(184, 224, 228, 0.5)',
    gradientPrimary: 'linear-gradient(135deg, #91CFD5, #6BB5BD)',
    gradientSecondary: 'linear-gradient(135deg, #B8E0E4, #91CFD5)',
  },
  brown: {
    primary: '#D8C7B5',
    primaryHover: '#C4AE98',
    primaryLight: 'rgba(216, 199, 181, 0.15)',
    primaryGlow: 'rgba(216, 199, 181, 0.4)',
    secondary: '#E5D9CC',
    secondaryGlow: 'rgba(229, 217, 204, 0.5)',
    gradientPrimary: 'linear-gradient(135deg, #D8C7B5, #C4AE98)',
    gradientSecondary: 'linear-gradient(135deg, #E5D9CC, #D8C7B5)',
  },
  camellia: {
    primary: '#E72D48',
    primaryHover: '#C41E36',
    primaryLight: 'rgba(231, 45, 72, 0.12)',
    primaryGlow: 'rgba(231, 45, 72, 0.4)',
    secondary: '#F08A9A',
    secondaryGlow: 'rgba(240, 138, 154, 0.5)',
    gradientPrimary: 'linear-gradient(135deg, #E72D48, #C41E36)',
    gradientSecondary: 'linear-gradient(135deg, #F08A9A, #E72D48)',
  },
}

export const themeColors: ThemeColor[] = ['indigo', 'brown', 'camellia']

export const colorLabels: Record<ThemeColor, string> = {
  indigo: '捣蓝色',
  brown: '凡戴克棕',
  camellia: '茶花红',
}
