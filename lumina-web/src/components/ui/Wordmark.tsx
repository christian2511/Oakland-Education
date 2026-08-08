import './Wordmark.css';

export interface LuminaMarkProps {
  size?: number;
}

/**
 * The Lumina mark: an aperture opening onto light. Abstract on purpose —
 * it doubles as the AI's signature throughout the app.
 */
export function LuminaMark({ size = 40 }: LuminaMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lm-mark-body" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B9A5FF" />
          <stop offset="0.55" stopColor="#8B6FF0" />
          <stop offset="1" stopColor="#6951D8" />
        </linearGradient>
        <radialGradient id="lm-mark-core" cx="0.38" cy="0.32" r="0.72">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.5" stopColor="#F5D98A" />
          <stop offset="1" stopColor="#F5B6D2" />
        </radialGradient>
      </defs>

      {/* Rounded aperture */}
      <path
        d="M24 2c12.15 0 22 9.85 22 22 0 12.15-9.85 22-22 22S2 36.15 2 24C2 11.85 11.85 2 24 2Z"
        fill="url(#lm-mark-body)"
      />
      {/* Soft inner shadow to give the ring volume */}
      <path
        d="M24 2c12.15 0 22 9.85 22 22 0 12.15-9.85 22-22 22S2 36.15 2 24C2 11.85 11.85 2 24 2Z"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.4"
      />
      {/* The light within */}
      <circle cx="24" cy="24" r="10.5" fill="url(#lm-mark-core)" />
      {/* Crescent that turns the circle into an aperture */}
      <path
        d="M24 13.5a10.5 10.5 0 0 1 0 21 14 14 0 0 0 0-21Z"
        fill="rgba(105,81,216,0.28)"
      />
      <circle cx="20.5" cy="20.5" r="3" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

export interface WordmarkProps {
  /** Characters currently revealed. Omit to show the full word. */
  reveal?: number;
  size?: 'md' | 'lg' | 'hero';
  withMark?: boolean;
}

const WORD = 'lumina';

/**
 * The wordmark, optionally partially revealed so the welcome screen can build
 * it letter by letter (l → lu → lum → …). Letters hold their final position
 * from the start, so the word grows into place instead of sliding.
 */
export function Wordmark({ reveal, size = 'lg', withMark = false }: WordmarkProps) {
  const shown = reveal === undefined ? WORD.length : reveal;

  return (
    <div className={`lm-wordmark lm-wordmark--${size}`}>
      {withMark && <LuminaMark size={size === 'hero' ? 56 : size === 'lg' ? 40 : 30} />}
      <span className="lm-wordmark__word" aria-label="lumina">
        {WORD.split('').map((ch, i) => (
          <span key={i} className="lm-wordmark__char" data-shown={i < shown} aria-hidden="true">
            {ch}
          </span>
        ))}
      </span>
    </div>
  );
}
