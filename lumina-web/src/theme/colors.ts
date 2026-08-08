/**
 * Lumina colour tokens.
 *
 * Never write a raw hex value in a component. Import from here, or use the
 * matching CSS custom property (`var(--lm-primary)`) declared in theme/tokens.css.
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
  secondaryText: '#77737D',

  success: '#72B88A',
  warning: '#E7A84B',
  error: '#D97979',
} as const;

export type ColorToken = keyof typeof colors;

/**
 * Subject accents. Colour is contextual in Lumina — purple is not the answer
 * to every surface.
 */
export const subjectAccents = {
  math: { base: colors.lavender, deep: colors.deepPurple, wash: colors.softLavender },
  english: { base: colors.pink, deep: '#C46A97', wash: '#FDE7F1' },
} as const;

/** Semantic accents used by lesson nodes, rewards and progress. */
export const accents = {
  lesson: { base: colors.lavender, deep: colors.deepPurple, wash: colors.softLavender },
  practice: { base: colors.softBlue, deep: '#4C7BD1', wash: '#E4EDFF' },
  review: { base: colors.yellow, deep: '#B98B2E', wash: '#FCF2D9' },
  checkpoint: { base: colors.green, deep: '#4E8F68', wash: '#E1F1E4' },
  challenge: { base: colors.pink, deep: '#C46A97', wash: '#FDE7F1' },
  diagnostic: { base: colors.blue, deep: '#3E6FBF', wash: '#E4EDFF' },
} as const;

export type AccentName = keyof typeof accents;
