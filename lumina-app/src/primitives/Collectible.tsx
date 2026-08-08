import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import type { CollectiblePalette, CollectibleShape } from '@/data/types';

const PALETTES: Record<CollectiblePalette, { hi: string; mid: string; lo: string; glow: string }> = {
  lavender: { hi: '#E4DBFF', mid: '#B9A5FF', lo: '#7B62D4', glow: '#B9A5FF' },
  purple: { hi: '#C4B2FF', mid: '#8B6FF0', lo: '#5A44BE', glow: '#8B6FF0' },
  blue: { hi: '#D6E6FF', mid: '#7EA8F7', lo: '#4470C4', glow: '#7EA8F7' },
  pink: { hi: '#FFD9EA', mid: '#F5A0C6', lo: '#C4658F', glow: '#F5A0C6' },
  yellow: { hi: '#FFEFC2', mid: '#F5CE6E', lo: '#C99429', glow: '#F5CE6E' },
  green: { hi: '#D8F2DD', mid: '#8FCF9E', lo: '#4E8F62', glow: '#8FCF9E' },
  orange: { hi: '#FFDFC4', mid: '#F5A868', lo: '#C46C29', glow: '#F5A868' },
};

/** RN has no `filter: saturate()`, so locked pieces desaturate their colors directly. */
function desaturate(hex: string, keep = 0.18): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  const mix = (c: number) => Math.round(gray + (c - gray) * keep);
  return `#${((1 << 24) | (mix(r) << 16) | (mix(g) << 8) | mix(b)).toString(16).slice(1)}`;
}

const INK = '#3A3247';
const CHEEK = '#FF9EBB';

/**
 * Collectible artwork — 1:1 port of the web `Collectible` SVG.
 *
 * Each piece is built the same way to keep the set feeling like one family:
 * a shaded body, a lit top-left face, a darker underside, a glossy specular
 * highlight and a soft cast shadow underneath. That layering is what gives
 * them weight — they read as little objects a student could pick up, rather
 * than as flat icons, and none of them is an emoji.
 */
export function Collectible({
  shape,
  palette = 'lavender',
  size = 96,
  muted = false,
}: {
  shape: CollectibleShape;
  palette?: CollectiblePalette;
  size?: number;
  muted?: boolean;
}) {
  const base = PALETTES[palette];
  const c = muted ? (hex: string) => desaturate(hex) : (hex: string) => hex;
  const p = { hi: c(base.hi), mid: c(base.mid), lo: c(base.lo), glow: c(base.glow) };
  const uid = `c-${shape}-${palette}${muted ? '-m' : ''}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none" opacity={muted ? 0.55 : 1}>
      <Defs>
        {/* Body: light from the upper left, shadow rolling to the lower right. */}
        <LinearGradient id={`${uid}-body`} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor={p.hi} />
          <Stop offset="0.45" stopColor={p.mid} />
          <Stop offset="1" stopColor={p.lo} />
        </LinearGradient>
        {/* Deeper version for undersides and thickness. */}
        <LinearGradient id={`${uid}-deep`} x1="0" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor={p.mid} />
          <Stop offset="1" stopColor={p.lo} />
        </LinearGradient>
        {/* Glossy sheen laid over the top-left of each form. */}
        <LinearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
        <RadialGradient id={`${uid}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={p.lo} stopOpacity="0.35" />
          <Stop offset="1" stopColor={p.lo} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Cast shadow grounds every collectible on the same imaginary surface. */}
      <Ellipse cx="60" cy="106" rx="30" ry="7" fill={`url(#${uid}-shadow)`} />

      {shape === 'star' && (
        <>
          <Path
            d="M60 16c3 0 5 2 6 5l6 17 18 1c6 0 8 7 4 11l-14 12 5 18c1 6-5 9-10 6l-15-10-15 10c-5 3-11 0-10-6l5-18-14-12c-4-4-2-11 4-11l18-1 6-17c1-3 3-5 6-5Z"
            fill={`url(#${uid}-body)`}
          />
          <Path d="M60 16c3 0 5 2 6 5l6 17-12 6-12-6 6-17c1-3 3-5 6-5Z" fill={`url(#${uid}-gloss)`} opacity="0.5" />
          <Ellipse cx="49" cy="42" rx="6" ry="8" fill="#FFFFFF" opacity="0.65" transform="rotate(-20 49 42)" />
          {/* Face — the thing that makes it collectible rather than decorative. */}
          <Circle cx="51" cy="62" r="3.4" fill={INK} />
          <Circle cx="69" cy="62" r="3.4" fill={INK} />
          <Path d="M53 71c4 4 10 4 14 0" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <Circle cx="44" cy="69" r="4" fill={c(CHEEK)} opacity="0.5" />
          <Circle cx="76" cy="69" r="4" fill={c(CHEEK)} opacity="0.5" />
        </>
      )}

      {shape === 'rocket' && (
        <>
          <Path d="M42 74c-6 6-8 14-7 20 7 1 15-2 20-8l-13-12Z" fill={`url(#${uid}-deep)`} />
          <Path d="M78 74c6 6 8 14 7 20-7 1-15-2-20-8l13-12Z" fill={`url(#${uid}-deep)`} />
          <Path
            d="M60 14c11 8 18 22 18 38 0 12-3 22-8 30H50c-5-8-8-18-8-30 0-16 7-30 18-38Z"
            fill={`url(#${uid}-body)`}
          />
          <Path d="M60 14c-6 4-11 12-14 22 4-4 9-6 14-6V14Z" fill={`url(#${uid}-gloss)`} opacity="0.6" />
          <Circle cx="60" cy="48" r="12" fill="#FFFFFF" opacity="0.9" />
          <Circle cx="60" cy="48" r="8.5" fill={c('#A9C5FF')} />
          <Circle cx="56" cy="44" r="3" fill="#FFFFFF" opacity="0.9" />
          <Path d="M52 82h16l-4 16a4 4 0 0 1-8 0l-4-16Z" fill={c('#F5CE6E')} />
          <Path d="M56 82h8l-2 11a2 2 0 0 1-4 0l-2-11Z" fill={c('#FF9E6E')} />
        </>
      )}

      {shape === 'planet' && (
        <>
          <Circle cx="60" cy="56" r="32" fill={`url(#${uid}-body)`} />
          <Path d="M60 24a32 32 0 0 0-27 49 32 32 0 0 1 44-44 31.8 31.8 0 0 0-17-5Z" fill={`url(#${uid}-gloss)`} opacity="0.45" />
          <Circle cx="47" cy="45" r="6" fill="#FFFFFF" opacity="0.35" />
          <Circle cx="73" cy="66" r="8" fill={p.lo} opacity="0.28" />
          <Circle cx="66" cy="38" r="4" fill={p.lo} opacity="0.22" />
          <Ellipse cx="60" cy="58" rx="46" ry="12" stroke={p.lo} strokeWidth="7" fill="none" transform="rotate(-18 60 58)" />
          <Ellipse cx="60" cy="58" rx="46" ry="12" stroke={p.hi} strokeWidth="3" fill="none" transform="rotate(-18 60 58)" />
          <Circle cx="50" cy="54" r="3.2" fill={INK} />
          <Circle cx="68" cy="52" r="3.2" fill={INK} />
          <Path d="M52 63c4 3 9 3 13-1" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
        </>
      )}

      {shape === 'gem' && (
        <>
          <Path d="M60 18 96 44 78 96H42L24 44 60 18Z" fill={`url(#${uid}-body)`} />
          <Path d="M60 18 96 44 60 56 24 44 60 18Z" fill={p.hi} opacity="0.9" />
          <Path d="M60 56 96 44 78 96 60 56Z" fill={p.lo} opacity="0.42" />
          <Path d="M60 56 24 44 42 96 60 56Z" fill="#FFFFFF" opacity="0.22" />
          <Path d="M60 18 42 40l18 6 18-6-18-22Z" fill="#FFFFFF" opacity="0.45" />
          <Circle cx="52" cy="64" r="3" fill={INK} />
          <Circle cx="68" cy="64" r="3" fill={INK} />
          <Path d="M55 72c3 3 7 3 10 0" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}

      {shape === 'medal' && (
        <>
          <Path d="M42 16h14l8 26H50L42 16Z" fill={c('#7EA8F7')} />
          <Path d="M78 16H64l-8 26h14l8-26Z" fill={c('#5A88D8')} />
          <Circle cx="60" cy="70" r="28" fill={`url(#${uid}-body)`} />
          <Circle cx="60" cy="70" r="21" fill={p.lo} opacity="0.24" />
          <Circle cx="60" cy="70" r="18" fill={`url(#${uid}-deep)`} />
          <Path d="M60 42a28 28 0 0 0-22 45 28 28 0 0 1 36-38 27.8 27.8 0 0 0-14-7Z" fill="#FFFFFF" opacity="0.3" />
          <Path
            d="M60 56l4.2 8.6 9.5 1.4-6.9 6.7 1.7 9.4-8.5-4.4-8.5 4.4 1.7-9.4-6.9-6.7 9.5-1.4L60 56Z"
            fill={c('#FFF6DC')}
          />
        </>
      )}

      {shape === 'flame' && (
        <>
          <Path
            d="M60 14c14 14 26 26 26 44a26 26 0 0 1-52 0c0-10 5-18 10-24 2 5 5 8 8 9-2-12 2-22 8-29Z"
            fill={`url(#${uid}-body)`}
          />
          <Path d="M60 46c7 7 13 13 13 22a13 13 0 0 1-26 0c0-9 6-15 13-22Z" fill={c('#FFF0C4')} />
          <Path d="M60 14c-6 7-10 17-8 29-3-1-6-4-8-9-5 6-10 14-10 24 0 6 2 11 5 15-1-4-2-8-2-12 0-16 11-32 23-47Z" fill="#FFFFFF" opacity="0.3" />
          <Circle cx="54" cy="70" r="2.8" fill={INK} />
          <Circle cx="66" cy="70" r="2.8" fill={INK} />
          <Path d="M56 78c3 3 5 3 8 0" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}

      {shape === 'cloud' && (
        <>
          <Path
            d="M38 82a20 20 0 0 1-2-40 24 24 0 0 1 45-6 18 18 0 0 1 1 46H38Z"
            fill={`url(#${uid}-body)`}
          />
          <Path d="M36 42a24 24 0 0 1 34-14 24 24 0 0 0-31 20 20 20 0 0 0-3 34 20 20 0 0 1 0-40Z" fill="#FFFFFF" opacity="0.55" />
          <Circle cx="50" cy="62" r="3.4" fill={INK} />
          <Circle cx="70" cy="62" r="3.4" fill={INK} />
          <Path d="M53 71c4 4 10 4 14 0" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <Circle cx="42" cy="69" r="4" fill={c(CHEEK)} opacity="0.45" />
          <Circle cx="78" cy="69" r="4" fill={c(CHEEK)} opacity="0.45" />
        </>
      )}

      {shape === 'heart' && (
        <>
          <Path
            d="M60 96C36 80 22 66 22 50a20 20 0 0 1 38-9 20 20 0 0 1 38 9c0 16-14 30-38 46Z"
            fill={`url(#${uid}-body)`}
          />
          <Path d="M42 30a20 20 0 0 0-20 20c0 10 6 19 15 28-6-9-9-17-9-26a20 20 0 0 1 14-22Z" fill="#FFFFFF" opacity="0.4" />
          <Ellipse cx="44" cy="46" rx="8" ry="6" fill="#FFFFFF" opacity="0.55" transform="rotate(-28 44 46)" />
          <Circle cx="49" cy="60" r="3.2" fill={INK} />
          <Circle cx="71" cy="60" r="3.2" fill={INK} />
          <Path d="M52 69c5 4 11 4 16 0" stroke={INK} strokeWidth="2.9" strokeLinecap="round" />
        </>
      )}

      {shape === 'crown' && (
        <>
          <Path d="M26 44l14 14 20-26 20 26 14-14-8 46H34l-8-46Z" fill={`url(#${uid}-body)`} />
          <Path d="M34 90h52l-2 10H36l-2-10Z" fill={`url(#${uid}-deep)`} />
          <Path d="M26 44l14 14 20-26-6-8-28 20Z" fill="#FFFFFF" opacity="0.4" />
          <Circle cx="26" cy="42" r="6" fill={p.hi} />
          <Circle cx="60" cy="30" r="7" fill={p.hi} />
          <Circle cx="94" cy="42" r="6" fill={p.hi} />
          <Circle cx="60" cy="72" r="6" fill={c('#F5A0C6')} />
          <Circle cx="44" cy="76" r="4" fill={c('#A9C5FF')} />
          <Circle cx="76" cy="76" r="4" fill={c('#8FCF9E')} />
        </>
      )}

      {shape === 'lightning' && (
        <>
          <Path d="M68 12 34 62h20l-8 46 40-54H64l4-42Z" fill={`url(#${uid}-body)`} />
          <Path d="M68 12 34 62h10L68 26V12Z" fill="#FFFFFF" opacity="0.45" />
          <Circle cx="56" cy="52" r="2.8" fill={INK} />
          <Circle cx="68" cy="48" r="2.8" fill={INK} />
          <Path d="M57 61c3 2 6 1 8-2" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      {shape === 'trophy' && (
        <>
          <Path d="M34 24h52v20a26 26 0 0 1-52 0V24Z" fill={`url(#${uid}-body)`} />
          <Path d="M34 28H22v8a16 16 0 0 0 14 16" stroke={p.lo} strokeWidth="7" fill="none" strokeLinecap="round" />
          <Path d="M86 28h12v8a16 16 0 0 1-14 16" stroke={p.lo} strokeWidth="7" fill="none" strokeLinecap="round" />
          <Path d="M34 24h14v22a26 26 0 0 0 4 14 26 26 0 0 1-18-16V24Z" fill="#FFFFFF" opacity="0.38" />
          <Rect x="52" y="68" width="16" height="16" fill={`url(#${uid}-deep)`} />
          <Path d="M36 84h48l4 14H32l4-14Z" fill={`url(#${uid}-body)`} />
          <Path d="M36 84h10l-3 14H32l4-14Z" fill="#FFFFFF" opacity="0.3" />
          <Circle cx="52" cy="40" r="3" fill={INK} />
          <Circle cx="68" cy="40" r="3" fill={INK} />
          <Path d="M55 49c3 3 7 3 10 0" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}

      {shape === 'moon' && (
        <>
          <Path d="M72 14a44 44 0 1 0 26 78A38 38 0 0 1 72 14Z" fill={`url(#${uid}-body)`} />
          <Path d="M72 14a44 44 0 0 0-38 66 44 44 0 0 1 26-62 38 38 0 0 1 12-4Z" fill="#FFFFFF" opacity="0.4" />
          <Circle cx="42" cy="44" r="6" fill={p.lo} opacity="0.22" />
          <Circle cx="34" cy="66" r="4" fill={p.lo} opacity="0.2" />
          <Circle cx="52" cy="76" r="5" fill={p.lo} opacity="0.18" />
          <Circle cx="46" cy="52" r="3" fill={INK} />
          <Circle cx="62" cy="56" r="3" fill={INK} />
          <Path d="M48 65c4 3 8 2 11-1" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}

      {shape === 'shield' && (
        <>
          <Path d="M60 12c13 9 26 12 36 12v34c0 24-17 37-36 44-19-7-36-20-36-44V24c10 0 23-3 36-12Z" fill={`url(#${uid}-body)`} />
          <Path d="M60 12c-13 9-26 12-36 12v34c0 13 5 23 13 30-4-8-6-17-6-27V21c10-1 19-4 29-9Z" fill="#FFFFFF" opacity="0.35" />
          <Path d="M46 58l10 10 20-22" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      )}

      {shape === 'sprout' && (
        <>
          <Path d="M60 100V54" stroke={p.lo} strokeWidth="8" strokeLinecap="round" />
          <Path d="M60 62c-14 0-24-8-26-22 14-2 24 6 26 22Z" fill={`url(#${uid}-deep)`} />
          <Path d="M60 54c14-2 22-12 22-26-14 0-22 10-22 26Z" fill={`url(#${uid}-body)`} />
          <Path d="M60 54c8-2 14-8 17-17-8 3-14 9-17 17Z" fill="#FFFFFF" opacity="0.35" />
          <Circle cx="55" cy="76" r="2.8" fill={INK} />
          <Circle cx="65" cy="76" r="2.8" fill={INK} />
          <Path d="M57 84c2 2 4 2 6 0" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}
