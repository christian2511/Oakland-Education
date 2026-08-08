import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { springs } from '@/theme';
import './CircleButton.css';

type Tone = 'glass' | 'solid' | 'soft' | 'accent' | 'plain';
type Size = 'sm' | 'md' | 'lg';

export interface CircleButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  /** Required — the control is icon-only, so it carries no visible text. */
  label: string;
  tone?: Tone;
  size?: Size;
  accent?: string;
  active?: boolean;
  children: ReactNode;
}

/**
 * Circular icon control: back, settings, undo, eraser, profile, notifications.
 * These carry a lot of the app's tactility, so they always get real depth.
 */
export const CircleButton = forwardRef<HTMLButtonElement, CircleButtonProps>(function CircleButton(
  { label, tone = 'glass', size = 'md', accent, active, children, className, disabled, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={[
        'lm-circle',
        `lm-circle--${tone}`,
        `lm-circle--${size}`,
        active ? 'is-active' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={accent ? ({ '--circle-accent': accent } as React.CSSProperties) : undefined}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={springs.tap}
      {...rest}
    >
      {children}
    </motion.button>
  );
});
