import { motion } from 'framer-motion';
import { springs } from '@/theme';
import './ProgressBar.css';

export interface ProgressBarProps {
  /** 0 – 1. */
  value: number;
  accent?: string;
  size?: 'sm' | 'md';
  label?: string;
}

export function ProgressBar({ value, accent, size = 'md', label }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div
      className={`lm-progress lm-progress--${size}`}
      style={accent ? ({ '--prog-accent': accent } as React.CSSProperties) : undefined}
      role="progressbar"
      aria-valuenow={Math.round(pct * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'progress'}
    >
      <motion.div
        className="lm-progress__fill"
        initial={false}
        animate={{ width: `${pct * 100}%` }}
        transition={springs.surface}
      />
    </div>
  );
}
