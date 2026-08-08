export const fonts = {
  sans: "'Plus Jakarta Sans', 'Inter', 'DM Sans', system-ui, -apple-system, sans-serif",
} as const;

/** Type scale. Sizes are rem-based so OS text scaling is respected. */
export const type = {
  display: { size: '3.5rem', weight: 700, tracking: '-0.035em', leading: 1.02 },
  h1: { size: '2.5rem', weight: 700, tracking: '-0.03em', leading: 1.08 },
  h2: { size: '1.875rem', weight: 700, tracking: '-0.025em', leading: 1.15 },
  h3: { size: '1.375rem', weight: 600, tracking: '-0.02em', leading: 1.25 },
  body: { size: '1.0625rem', weight: 500, tracking: '-0.01em', leading: 1.5 },
  bodyLarge: { size: '1.1875rem', weight: 500, tracking: '-0.012em', leading: 1.5 },
  label: { size: '0.9375rem', weight: 600, tracking: '-0.005em', leading: 1.35 },
  caption: { size: '0.8125rem', weight: 600, tracking: '0.01em', leading: 1.35 },
} as const;

export const weights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;
