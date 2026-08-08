import { motion } from 'framer-motion';
import './LuminaOrb.css';

export type OrbState = 'idle' | 'thinking' | 'speaking' | 'correct' | 'attention';

export interface LuminaOrbProps {
  state?: OrbState;
  size?: number;
}

const STATE_ACCENT: Record<OrbState, { core: string; halo: string }> = {
  idle: { core: 'var(--lm-lavender)', halo: 'var(--lm-soft-lavender)' },
  thinking: { core: 'var(--lm-blue)', halo: 'var(--lm-soft-blue)' },
  speaking: { core: 'var(--lm-primary)', halo: 'var(--lm-soft-lavender)' },
  correct: { core: 'var(--lm-success)', halo: 'var(--lm-green)' },
  attention: { core: 'var(--lm-warning)', halo: 'var(--lm-yellow)' },
};

/**
 * Lumina's AI, drawn as light rather than as a face.
 *
 * Deliberately not a robot and not a chat avatar: a soft luminous core with a
 * slow orbiting ring. It should read as understanding and guidance — the
 * student's work stays the hero of every screen it appears on.
 */
export function LuminaOrb({ state = 'idle', size = 44 }: LuminaOrbProps) {
  const accent = STATE_ACCENT[state];
  const thinking = state === 'thinking';

  return (
    <div
      className="lm-orb"
      style={
        {
          width: size,
          height: size,
          '--orb-core': accent.core,
          '--orb-halo': accent.halo,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {/* Outer breathing halo */}
      <motion.span
        className="lm-orb__halo"
        animate={{
          scale: thinking ? [1, 1.16, 1] : [1, 1.07, 1],
          opacity: thinking ? [0.5, 0.22, 0.5] : [0.42, 0.26, 0.42],
        }}
        transition={{ duration: thinking ? 1.5 : 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbiting ring — the sense of an intelligence at work */}
      <motion.span
        className="lm-orb__ring"
        animate={{ rotate: 360 }}
        transition={{ duration: thinking ? 2.6 : 9, repeat: Infinity, ease: 'linear' }}
      />

      {/* Luminous core with an off-centre highlight for depth */}
      <motion.span
        className="lm-orb__core"
        animate={{ scale: thinking ? [1, 0.9, 1] : [1, 1.04, 1] }}
        transition={{ duration: thinking ? 1.5 : 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="lm-orb__spec" />
    </div>
  );
}
