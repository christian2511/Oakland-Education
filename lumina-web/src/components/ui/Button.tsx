import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { springs } from '@/theme';
import './Button.css';

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

/** Motion owns the animation props, so the base is its button type, not React's. */
export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  /** Stretches to the width of its container — the usual choice for a page CTA. */
  full?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Overrides the accent for contextual CTAs (a lesson node, a subject). */
  accent?: string;
  children: ReactNode;
}

/**
 * The primary control of the app: large, rounded, unmistakably tappable.
 * Press feedback compresses both the surface and its shadow so the button
 * reads as a physical object being pushed rather than a rectangle changing
 * colour.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'lg', full, leading, trailing, accent, children, className, disabled, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={disabled}
      className={['lm-btn', `lm-btn--${variant}`, `lm-btn--${size}`, full ? 'lm-btn--full' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={accent ? ({ '--btn-accent': accent } as React.CSSProperties) : undefined}
      whileTap={disabled ? undefined : { scale: 0.972 }}
      transition={springs.tap}
      {...rest}
    >
      {leading && <span className="lm-btn__affix">{leading}</span>}
      <span className="lm-btn__label">{children}</span>
      {trailing && <span className="lm-btn__affix">{trailing}</span>}
    </motion.button>
  );
});
