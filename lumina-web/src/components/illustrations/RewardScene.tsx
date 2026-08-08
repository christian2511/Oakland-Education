import { motion } from 'framer-motion';
import { IllustrationDefs } from './defs';

/**
 * Lesson-completion mark: a faceted gem of light. Reads as earned rather than
 * as a game trophy, and carries no emoji.
 */
export function RewardScene({ className, size = 140 }: { className?: string; size?: number }) {
  const id = 'rs';

  return (
    <svg width={size} height={size} viewBox="0 0 140 140" fill="none" className={className} aria-hidden="true">
      <IllustrationDefs id={id} />

      <circle cx="70" cy="70" r="62" fill={`url(#${id}-glow)`} opacity="0.55" />

      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Gem body — three facets so the volume reads without outlines */}
        <path d="M70 22 116 56 98 112H42L24 56 70 22Z" fill={`url(#${id}-purple)`} />
        <path d="M70 22 116 56 70 70 24 56 70 22Z" fill={`url(#${id}-lav)`} />
        <path d="M70 70 116 56 98 112 70 70Z" fill="#6951D8" opacity="0.55" />
        <path d="M70 70 24 56 42 112 70 70Z" fill="#FFFFFF" opacity="0.18" />

        {/* Inner light */}
        <circle cx="70" cy="66" r="13" fill={`url(#${id}-yellow)`} />
        <circle cx="66" cy="62" r="4" fill="#FFFFFF" opacity="0.9" />
      </motion.g>

      {/* Sparks */}
      {[
        { x: 26, y: 30, r: 4, d: 0 },
        { x: 116, y: 34, r: 3, d: 0.5 },
        { x: 112, y: 106, r: 4.5, d: 1 },
        { x: 24, y: 100, r: 3, d: 1.5 },
      ].map((s, i) => (
        <motion.circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#F5D98A"
          animate={{ scale: [0.6, 1, 0.6], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: s.d }}
        />
      ))}
    </svg>
  );
}
