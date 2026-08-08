import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface ProgressRingProps {
  /** 0 – 1. */
  value: number;
  size?: number;
  thickness?: number;
  accent?: string;
  trackOpacity?: number;
  children?: ReactNode;
}

/** Circular progress used on lesson nodes and the progress screen. */
export function ProgressRing({
  value,
  size = 72,
  thickness = 6,
  accent = 'var(--lm-primary)',
  trackOpacity = 0.14,
  children,
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(1, value));
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          opacity={trackOpacity}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        />
      </svg>
      {children && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
