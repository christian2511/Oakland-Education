/**
 * Shared gradient + shadow definitions for Lumina's illustrations.
 *
 * All illustration artwork in this app is original. The reference material
 * informed the language — rounded volumes, pastel palette, soft directional
 * light from the upper left — not the drawings themselves.
 */
export function IllustrationDefs({ id }: { id: string }) {
  return (
    <defs>
      {/* Volumetric fills: a light face, a mid body, a shaded underside. */}
      <linearGradient id={`${id}-lav`} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#D9CDFF" />
        <stop offset="0.55" stopColor="#B9A5FF" />
        <stop offset="1" stopColor="#8B6FF0" />
      </linearGradient>

      <linearGradient id={`${id}-purple`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="#A991FF" />
        <stop offset="0.6" stopColor="#8B6FF0" />
        <stop offset="1" stopColor="#6951D8" />
      </linearGradient>

      <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#CBDDFF" />
        <stop offset="0.55" stopColor="#A9C5FF" />
        <stop offset="1" stopColor="#7EA8F7" />
      </linearGradient>

      <linearGradient id={`${id}-pink`} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#FBDCEA" />
        <stop offset="0.55" stopColor="#F5B6D2" />
        <stop offset="1" stopColor="#E094BA" />
      </linearGradient>

      <linearGradient id={`${id}-yellow`} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#FCEEC4" />
        <stop offset="0.55" stopColor="#F5D98A" />
        <stop offset="1" stopColor="#E0BC5F" />
      </linearGradient>

      <linearGradient id={`${id}-green`} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#DCEFDF" />
        <stop offset="0.55" stopColor="#B8DDBE" />
        <stop offset="1" stopColor="#8FC49A" />
      </linearGradient>

      <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#F3EFE8" />
      </linearGradient>

      <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="#FFE0C9" />
        <stop offset="1" stopColor="#F0BE9C" />
      </linearGradient>

      {/* Warm contact shadow that grounds each floating volume. */}
      <radialGradient id={`${id}-ground`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#6951D8" stopOpacity="0.22" />
        <stop offset="1" stopColor="#6951D8" stopOpacity="0" />
      </radialGradient>

      {/* Glow used behind light sources. */}
      <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#F5D98A" stopOpacity="0.9" />
        <stop offset="0.5" stopColor="#F5D98A" stopOpacity="0.35" />
        <stop offset="1" stopColor="#F5D98A" stopOpacity="0" />
      </radialGradient>

      <filter id={`${id}-soft`} x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#6951D8" floodOpacity="0.18" />
      </filter>
    </defs>
  );
}
