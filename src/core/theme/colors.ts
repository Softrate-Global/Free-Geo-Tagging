/**
 * Minimalist Monochrome Color Palette
 * Strictly Black (#000000), White (#FFFFFF) and neutral tones.
 * No emojis, no saturated colors.
 */
export const colors = {
  background: '#000000',
  surface: '#121212',
  surfaceLight: '#1C1C1E',
  surfaceBorder: '#2C2C2E',
  border: '#38383A',
  
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1A6',
  textMuted: '#636366',
  textInverse: '#000000',

  accent: '#FFFFFF',
  accentSubtle: 'rgba(255, 255, 255, 0.12)',
  accentActive: 'rgba(255, 255, 255, 0.24)',

  overlayDark: 'rgba(0, 0, 0, 0.75)',
  watermarkBg: 'rgba(0, 0, 0, 0.78)',

  // Status indicators in clean monochrome contrast
  statusGood: '#FFFFFF',
  statusWarning: '#D1D1D6',
  statusError: '#8E8E93',
} as const;
