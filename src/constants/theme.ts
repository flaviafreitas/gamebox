/**
 * Paleta e tokens de design do GameLog.
 * App dark-first (estilo Letterboxd/Backloggd). O modo escuro é forçado em app.json.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  dark: {
    text: '#F4F5F7',
    textSecondary: '#A0A6B0',
    textMuted: '#6B7280',
    background: '#0F1013',
    surface: '#191B21',
    surfaceAlt: '#23262E',
    border: '#2C303A',
    accent: '#7C5CFF',
    accentText: '#FFFFFF',
    star: '#FFC24B',
    danger: '#F2555A',
    success: '#4ADE80',
    // aliases usados por componentes herdados do template
    backgroundElement: '#191B21',
    backgroundSelected: '#23262E',
  },
  light: {
    text: '#15171C',
    textSecondary: '#4A5160',
    textMuted: '#7A8290',
    background: '#FFFFFF',
    surface: '#F5F6F8',
    surfaceAlt: '#ECEEF2',
    border: '#DCDFE5',
    accent: '#6A45FF',
    accentText: '#FFFFFF',
    star: '#E0A020',
    danger: '#D33A40',
    success: '#1F9D57',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
