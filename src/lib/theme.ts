export type Theme = 'dark' | 'light';

export const THEME_COLORS = {
  dark: {
    primary: '#C8FF00',
    surface: '#0F0F1A',
    surfaceVariant: '#1A1A2E',
    textOnSurface: '#FFFFFF',
    textOnPrimary: '#0F0F1A',
    textMuted: '#9E9EB0',
    success: '#4ADE80',
    danger: '#FF5A5A',
    warning: '#FFB800',
    info: '#60A5FA',
  },
  light: {
    primary: '#C8FF00',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    textOnSurface: '#1A1A2E',
    textOnPrimary: '#1A1A2E',
    textMuted: '#8E8E93',
    success: '#27AE60',
    danger: '#E74C3C',
    warning: '#F39C12',
    info: '#3498DB',
  },
} as const;

export function getColors(theme: Theme = 'dark') {
  return THEME_COLORS[theme];
}

export const LIGHT_COLORS = THEME_COLORS.light;
export const DARK_COLORS = THEME_COLORS.dark;
