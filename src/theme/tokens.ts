// Tokens del design system "Organic" portados desde design-system/styles.css.
// React Native no soporta oklch()/color-mix(), así que todos los valores
// ya vienen precalculados a hex/rgba — no reintroducir oklch/color-mix acá.

export const colors = {
  bg: '#f5ead8',
  surface: '#ebddc5',
  text: '#201e1d',
  divider: 'rgba(32, 30, 29, 0.16)',
  accent: '#c67139',
  accent2: '#7a8a5e',
  destructive: '#b8492e',

  neutral: {
    100: '#f9f4ed',
    200: '#eee7db',
    300: '#dcd3c4',
    400: '#c0b6a5',
    500: '#a19786',
    600: '#82796a',
    700: '#645c50',
    800: '#474238',
    900: '#2e2b25',
  },
  accentRamp: {
    100: '#fff2eb',
    200: '#ffe1d0',
    300: '#ffc6a5',
    400: '#f6a06b',
    500: '#d67f48',
    600: '#b2622d',
    700: '#8c491a',
    800: '#643312',
    900: '#402310',
  },
  accent2Ramp: {
    100: '#f0fae1',
    200: '#e1eecc',
    300: '#ccdbb2',
    400: '#aebf92',
    500: '#8fa073',
    600: '#728157',
    700: '#56633f',
    800: '#3d472b',
    900: '#272e1b',
  },
} as const;

// Colores de categoría: fondo claro + texto oscuro del mismo hue,
// convertidos desde los oklch() del prototipo (ver design-system/readme.md).
export const categoryColors = {
  almacen: { bg: '#f6e6cb', fg: '#5b3b00' },
  bebidas: { bg: '#d1edfb', fg: '#004964' },
  higiene: { bg: '#f3e1f7', fg: '#55335d' },
  frescos: { bg: colors.accent2Ramp[100], fg: colors.accent2Ramp[800] },
  limpieza: { bg: '#cef0ef', fg: '#004e4e' },
  varios: { bg: colors.accentRamp[100], fg: colors.accentRamp[800] },
} as const;

export type CategoryKey = keyof typeof categoryColors;

export const fonts = {
  heading: 'Caprasimo_400Regular',
  body: 'Figtree_400Regular',
  bodySemiBold: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
} as const;

export const fontSize = {
  h1: 42,
  h2: 32,
  h3: 25,
  h4: 20,
  h5: 16,
  h6: 13,
  body: 15,
} as const;

export const lineHeight = {
  heading: 1.12,
  body: 1.55,
} as const;

// Escala de espaciado tal cual el CSS original (--space-1 .. --space-8).
export const spacing = {
  1: 4.4,
  2: 8.8,
  3: 13.2,
  4: 17.6,
  6: 26.4,
  8: 35.2,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 28,
  pill: 999,
} as const;

// Sombras iOS-only para el MVP (elevation queda listo para cuando se sume Android).
export const shadows = {
  sm: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 8,
  },
} as const;

export const theme = { colors, categoryColors, fonts, fontSize, lineHeight, spacing, radius, shadows };
export type Theme = typeof theme;
