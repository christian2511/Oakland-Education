import { motion } from 'framer-motion';
import { IllustrationDefs } from './defs';

/**
 * Welcome / onboarding hero: a student at a tablet, with the pen and a few
 * mathematical volumes drifting around them. Original artwork.
 */
export function WelcomeScene({ className }: { className?: string }) {
  const id = 'ws';
  const float = (delay: number, distance = 8) => ({
    animate: { y: [0, -distance, 0], rotate: [0, delay % 2 ? 4 : -4, 0] },
    transition: { duration: 5.5 + delay, repeat: Infinity, ease: 'easeInOut' as const, delay },
  });

  return (
    <svg viewBox="0 0 400 320" fill="none" className={className} role="img" aria-label="a student writing on a tablet">
      <IllustrationDefs id={id} />

      {/* Ground shadow */}
      <ellipse cx="200" cy="286" rx="118" ry="20" fill={`url(#${id}-ground)`} />

      {/* Floating volumes behind the figure */}
      <motion.g {...float(0.2, 10)}>
        <circle cx="66" cy="82" r="26" fill={`url(#${id}-blue)`} />
        <circle cx="58" cy="72" r="7" fill="#FFFFFF" opacity="0.55" />
      </motion.g>

      <motion.g {...float(1.1, 12)}>
        <rect x="304" y="52" width="52" height="52" rx="18" fill={`url(#${id}-yellow)`} transform="rotate(-12 330 78)" />
        <path d="M318 78h24M330 66v24" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" transform="rotate(-12 330 78)" />
      </motion.g>

      <motion.g {...float(0.7, 9)}>
        <path d="M330 196c14 0 26 12 26 26s-12 26-26 26-26-12-26-26 12-26 26-26Z" fill={`url(#${id}-pink)`} />
        <path d="M318 222h24" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
      </motion.g>

      <motion.g {...float(1.6, 8)}>
        <path
          d="M62 202c9-15 31-15 40 0l14 24c9 15-2 34-20 34H68c-18 0-29-19-20-34l14-24Z"
          fill={`url(#${id}-green)`}
        />
      </motion.g>

      {/* --- figure ---------------------------------------------------------- */}

      {/* Seat / plinth */}
      <path d="M128 246h144c8 0 14 6 14 14v6H114v-6c0-8 6-14 14-14Z" fill={`url(#${id}-lav)`} opacity="0.5" />

      {/* Body */}
      <path
        d="M200 128c30 0 54 24 54 54v46c0 12-10 22-22 22h-64c-12 0-22-10-22-22v-46c0-30 24-54 54-54Z"
        fill={`url(#${id}-purple)`}
      />
      {/* Body highlight */}
      <path
        d="M176 140c-12 10-20 25-20 42v40c0 6 3 11 8 14-3-5-4-10-4-16v-40c0-16 6-30 16-40Z"
        fill="#FFFFFF"
        opacity="0.22"
      />

      {/* Head */}
      <g>
        <path d="M200 54c22 0 38 17 38 38 0 22-17 40-38 40s-38-18-38-40c0-21 16-38 38-38Z" fill={`url(#${id}-skin)`} />
        {/* Hair as a single rounded volume */}
        <path
          d="M200 48c24 0 42 16 42 38 0 6-1 11-3 16-2-14-8-20-14-22-8-3-16 2-25 2-12 0-20-4-27-1-6 3-10 9-11 21-2-5-3-10-3-16 0-22 17-38 41-38Z"
          fill="#4B3C6E"
        />
        {/* Eyes — simple, calm, no expression noise */}
        <circle cx="187" cy="94" r="3.6" fill="#3A3247" />
        <circle cx="213" cy="94" r="3.6" fill="#3A3247" />
        <path d="M193 108c4 4 10 4 14 0" stroke="#3A3247" strokeWidth="3.2" strokeLinecap="round" />
      </g>

      {/* Tablet held at an angle */}
      <g transform="rotate(-8 200 214)">
        <rect x="132" y="178" width="136" height="90" rx="16" fill="#3A3247" opacity="0.16" />
        <rect x="130" y="172" width="136" height="90" rx="16" fill={`url(#${id}-paper)`} />
        <rect x="130" y="172" width="136" height="90" rx="16" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        {/* Written work on the tablet */}
        <path d="M148 196h58M148 212h84M148 228h44" stroke="#B9A5FF" strokeWidth="6" strokeLinecap="round" />
        <path d="M204 228h30" stroke="#F5D98A" strokeWidth="6" strokeLinecap="round" />
      </g>

      {/* Arm reaching to the tablet */}
      <path
        d="M246 168c14 4 22 16 20 30l-4 26"
        stroke={`url(#${id}-purple)`}
        strokeWidth="26"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="261" cy="222" r="12" fill={`url(#${id}-skin)`} />

      {/* Stylus */}
      <motion.g {...float(0.4, 6)}>
        <rect
          x="272"
          y="140"
          width="12"
          height="62"
          rx="6"
          fill={`url(#${id}-lav)`}
          transform="rotate(24 278 171)"
        />
        <path d="M289 199l-6 14 12-4-6-10Z" fill="#6951D8" />
      </motion.g>

      {/* Light from the work — the product idea, quietly */}
      <circle cx="200" cy="214" r="58" fill={`url(#${id}-glow)`} opacity="0.35" />
    </svg>
  );
}
