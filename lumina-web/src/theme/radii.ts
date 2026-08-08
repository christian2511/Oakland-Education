/**
 * Rounded geometry is a defining characteristic of Lumina.
 * Vary the radius by surface size — one radius everywhere reads as a template.
 */
export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  hero: 40,
  pill: 9999,
} as const;

export type Radius = keyof typeof radii;
