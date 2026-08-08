import { motion } from 'framer-motion';
import { IllustrationDefs } from './defs';

/**
 * Diagnostic intro: a sheet of handwritten working with Lumina's light reading
 * *how* it was solved — the product thesis as a single image.
 */
export function DiagnosticScene({ className }: { className?: string }) {
  const id = 'ds';

  return (
    <svg viewBox="0 0 360 280" fill="none" className={className} role="img" aria-label="handwritten working being read by Lumina">
      <IllustrationDefs id={id} />

      <ellipse cx="180" cy="252" rx="112" ry="18" fill={`url(#${id}-ground)`} />

      {/* Back sheet, offset for depth */}
      <rect x="86" y="44" width="188" height="196" rx="26" fill={`url(#${id}-lav)`} opacity="0.4" transform="rotate(-6 180 142)" />

      {/* Main sheet */}
      <g transform="rotate(2 180 142)">
        <rect x="74" y="38" width="196" height="200" rx="28" fill={`url(#${id}-paper)`} filter={`url(#${id}-soft)`} />

        {/* The problem, then the student's steps */}
        <rect x="98" y="66" width="86" height="11" rx="5.5" fill="#25232A" opacity="0.75" />
        <rect x="98" y="98" width="118" height="9" rx="4.5" fill="#B9A5FF" />
        <rect x="98" y="122" width="94" height="9" rx="4.5" fill="#B9A5FF" />

        {/* The step where the misconception happens — marked, not scored */}
        <rect x="90" y="146" width="140" height="30" rx="12" fill="#F5D98A" opacity="0.34" />
        <rect x="98" y="156" width="104" height="9" rx="4.5" fill="#E0BC5F" />

        <rect x="98" y="192" width="72" height="9" rx="4.5" fill="#B8DDBE" />
      </g>

      {/* Lumina's light examining the working */}
      <motion.g
        animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <circle cx="278" cy="96" r="52" fill={`url(#${id}-glow)`} opacity="0.5" />
        <circle cx="278" cy="96" r="26" fill={`url(#${id}-purple)`} />
        <circle cx="270" cy="87" r="8" fill="#FFFFFF" opacity="0.85" />
        {/* Orbiting ring */}
        <motion.ellipse
          cx="278"
          cy="96"
          rx="40"
          ry="15"
          stroke="#B9A5FF"
          strokeWidth="3.5"
          fill="none"
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '278px 96px' }}
        />
      </motion.g>

      {/* Beam connecting the light to the marked step */}
      <path d="M262 122 200 158" stroke="#F5D98A" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 9" opacity="0.85" />

      {/* Small volumes for balance */}
      <motion.circle
        cx="58"
        cy="182"
        r="20"
        fill={`url(#${id}-blue)`}
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      />
      <motion.rect
        x="40"
        y="52"
        width="38"
        height="38"
        rx="14"
        fill={`url(#${id}-pink)`}
        animate={{ y: [0, -11, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      />
    </svg>
  );
}
