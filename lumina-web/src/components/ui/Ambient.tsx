import { motion } from 'framer-motion';
import './Ambient.css';

export type AmbientMood = 'warm' | 'lavender' | 'blue' | 'sunrise' | 'calm';

const MOODS: Record<AmbientMood, Array<{ c: string; x: string; y: string; s: number; o: number }>> = {
  warm: [
    { c: 'var(--lm-soft-lavender)', x: '-14%', y: '-10%', s: 460, o: 0.75 },
    { c: 'var(--lm-wash-yellow)', x: '72%', y: '4%', s: 380, o: 0.6 },
    { c: 'var(--lm-wash-blue)', x: '48%', y: '68%', s: 500, o: 0.5 },
  ],
  lavender: [
    { c: 'var(--lm-lavender)', x: '-18%', y: '-14%', s: 520, o: 0.4 },
    { c: 'var(--lm-soft-lavender)', x: '62%', y: '10%', s: 440, o: 0.8 },
    { c: 'var(--lm-wash-pink)', x: '20%', y: '72%', s: 420, o: 0.6 },
  ],
  blue: [
    { c: 'var(--lm-soft-blue)', x: '-12%', y: '2%', s: 460, o: 0.55 },
    { c: 'var(--lm-wash-lavender)', x: '66%', y: '-8%', s: 480, o: 0.8 },
    { c: 'var(--lm-wash-blue)', x: '38%', y: '70%', s: 520, o: 0.7 },
  ],
  sunrise: [
    { c: 'var(--lm-yellow)', x: '58%', y: '-16%', s: 500, o: 0.42 },
    { c: 'var(--lm-pink)', x: '-16%', y: '18%', s: 420, o: 0.34 },
    { c: 'var(--lm-soft-lavender)', x: '30%', y: '66%', s: 520, o: 0.7 },
  ],
  calm: [
    { c: 'var(--lm-wash-lavender)', x: '-10%', y: '-8%', s: 480, o: 0.9 },
    { c: 'var(--lm-wash-blue)', x: '68%', y: '52%', s: 460, o: 0.7 },
  ],
};

export interface AmbientProps {
  mood?: AmbientMood;
  /** Slow drift. Off by default on dense screens where it would distract. */
  animated?: boolean;
}

/**
 * Large soft colour fields behind a screen. This is what keeps Lumina off
 * plain white without turning any screen into a gradient poster.
 */
export function Ambient({ mood = 'warm', animated = true }: AmbientProps) {
  const blobs = MOODS[mood];

  return (
    <div className="lm-ambient" aria-hidden="true">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="lm-ambient-blob"
          style={{
            background: b.c,
            left: b.x,
            top: b.y,
            width: b.s,
            height: b.s,
            opacity: b.o,
          }}
          animate={
            animated
              ? {
                  x: [0, 26, -14, 0],
                  y: [0, -18, 20, 0],
                  scale: [1, 1.06, 0.97, 1],
                }
              : undefined
          }
          transition={
            animated
              ? { duration: 26 + i * 7, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }
              : undefined
          }
        />
      ))}
    </div>
  );
}
