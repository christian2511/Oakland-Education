/**
 * Lumina design tokens for React Native.
 * Mirrors lumina-web/src/theme/*. Never write a raw hex in a component.
 */

export const colors = {
  background: '#F7F5F0',
  backgroundWarm: '#FBF8F3',
  white: '#FFFFFF',

  softLavender: '#E9E2FF',
  lavender: '#B9A5FF',
  primary: '#8B6FF0',
  deepPurple: '#6951D8',

  softBlue: '#A9C5FF',
  blue: '#7EA8F7',

  pink: '#F5B6D2',
  yellow: '#F5D98A',
  green: '#B8DDBE',

  text: '#25232A',
  textSecondary: '#77737D',
  textTertiary: '#A8A4AE',

  success: '#72B88A',
  warning: '#E7A84B',
  error: '#D97979',

  washLavender: '#F0ECFF',
  washBlue: '#E8F0FF',
  washPink: '#FDEEF5',
  washYellow: '#FCF4DE',
  washGreen: '#E7F3E9',

  line: 'rgba(37,35,42,0.07)',
  lineStrong: 'rgba(37,35,42,0.12)',
  scrim: 'rgba(0,0,0,0.4)',

  glassBg: 'rgba(255,255,255,0.72)',
  glassBgStrong: 'rgba(255,255,255,0.86)',
  glassBorder: 'rgba(255,255,255,0.7)',
} as const;

export type AccentName =
  | 'lesson'
  | 'practice'
  | 'review'
  | 'checkpoint'
  | 'challenge'
  | 'diagnostic';

export const accents: Record<AccentName, { base: string; deep: string; wash: string }> = {
  lesson: { base: colors.lavender, deep: colors.deepPurple, wash: colors.softLavender },
  practice: { base: colors.softBlue, deep: '#4C7BD1', wash: '#E4EDFF' },
  review: { base: colors.yellow, deep: '#B98B2E', wash: '#FCF2D9' },
  checkpoint: { base: colors.green, deep: '#4E8F68', wash: '#E1F1E4' },
  challenge: { base: colors.pink, deep: '#C46A97', wash: '#FDE7F1' },
  diagnostic: { base: colors.blue, deep: '#3E6FBF', wash: '#E4EDFF' },
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  hero: 40,
  pill: 9999,
} as const;

export const spacing = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 24,
  s6: 32,
  s7: 44,
  s8: 64,
  s9: 88,
  gutter: 22,
  contentMax: 640,
  navH: 74,
} as const;

/**
 * RN doesn't do two-part CSS shadows out of the box; we settle on a single
 * elevation preset per surface and let iOS/Android render it appropriately.
 */
export const elevation = {
  e1: {
    shadowColor: '#25232A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  e2: {
    shadowColor: '#25232A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  e3: {
    shadowColor: '#25232A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 12,
  },
  e4: {
    shadowColor: '#25232A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 44,
    elevation: 20,
  },
} as const;

/**
 * Static font families from @expo-google-fonts/plus-jakarta-sans.
 * RN Android ignores `fontWeight` when a static fontFamily is set, so every
 * text style carries the exact family for its weight.
 */
export const fonts = {
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const type = {
  display: { fontFamily: fonts.extrabold, fontSize: 56, lineHeight: 60, letterSpacing: -1.6 },
  h1: { fontFamily: fonts.bold, fontSize: 40, lineHeight: 46, letterSpacing: -1.2 },
  h2: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.75 },
  h3: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 28, letterSpacing: -0.44 },
  body: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 26, letterSpacing: -0.17 },
  bodyLarge: { fontFamily: fonts.medium, fontSize: 19, lineHeight: 29, letterSpacing: -0.23 },
  label: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, letterSpacing: 0.13 },
} as const;

export const motion = {
  micro: 180,
  quick: 280,
  normal: 360,
  slow: 600,
} as const;

/** moti-compatible spring presets. */
export const springs = {
  tap: { type: 'spring' as const, damping: 20, stiffness: 520, mass: 0.7 },
  enter: { type: 'spring' as const, damping: 20, stiffness: 260, mass: 0.9 },
  surface: { type: 'spring' as const, damping: 22, stiffness: 190, mass: 1 },
};
