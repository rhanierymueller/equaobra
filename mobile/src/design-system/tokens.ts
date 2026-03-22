export const colors = {
  primary: '#E07B2A',
  secondary: '#3B3B3B',
  surface: '#F5F0EB',
  background: '#0D0C0B',
  backgroundCard: '#0F0E0C',
  backgroundModal: '#1A1814',
  success: '#4CAF50',
  danger: '#E53935',
  whatsapp: '#25D366',
  star: '#F59E0B',
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(245,240,235,0.7)',
    muted: 'rgba(245,240,235,0.4)',
    hint: 'rgba(245,240,235,0.25)',
    disabled: 'rgba(245,240,235,0.15)',
  },
  border: {
    default: 'rgba(255,255,255,0.07)',
    light: 'rgba(255,255,255,0.1)',
    medium: 'rgba(255,255,255,0.12)',
  },
} as const

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
} as const

export const fontSize = {
  xs: 10,
  sm: 11,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  '2xl': 17,
  '3xl': 22,
  '4xl': 24,
  '5xl': 28,
} as const

export const lineHeight = {
  tight: 16,
  base: 20,
  relaxed: 24,
  loose: 28,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  '3xl': 32,
  '4xl': 40,
} as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  full: 9999,
} as const

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
} as const

export const opacity = {
  disabled: 0.4,
  pressed: 0.85,
} as const
