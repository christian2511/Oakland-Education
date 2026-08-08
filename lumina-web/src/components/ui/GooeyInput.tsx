import { forwardRef, useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { transitions } from '@/theme';
import './GooeyInput.css';

export interface GooeyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
}

/**
 * Text input with a gooey focus treatment.
 *
 * Two soft blobs sit behind the field and are merged by an SVG goo filter — a
 * blur pushed through a high-contrast alpha ramp, which fuses overlapping
 * shapes into one liquid mass. On focus the blobs swell and drift apart, so
 * the surface appears to stretch around the text rather than simply lighting
 * up a border.
 */
export const GooeyInput = forwardRef<HTMLInputElement, GooeyInputProps>(function GooeyInput(
  { label, hint, error, className, type = 'text', onFocus, onBlur, ...rest },
  ref,
) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === 'password';
  const resolvedType = isPassword && revealed ? 'text' : type;

  return (
    <div className={['lm-gooey', error ? 'is-error' : '', className ?? ''].filter(Boolean).join(' ')}>
      {label && (
        <label className="lm-gooey__label" htmlFor={id}>
          {label}
        </label>
      )}

      <div className="lm-gooey__shell">
        {/* The goo layer. Filtered, so the blobs read as one fluid body. */}
        <div className="lm-gooey__goo" aria-hidden="true">
          <motion.span
            className="lm-gooey__blob lm-gooey__blob--a"
            animate={
              focused
                ? { scale: 1.06, x: '-6%', opacity: 1 }
                : { scale: 0.9, x: '0%', opacity: 0.9 }
            }
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          />
          <motion.span
            className="lm-gooey__blob lm-gooey__blob--b"
            animate={
              focused
                ? { scale: 1.08, x: '6%', opacity: 1 }
                : { scale: 0.9, x: '0%', opacity: 0.9 }
            }
            transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.04 }}
          />
          <span className="lm-gooey__body" />
        </div>

        <input
          ref={ref}
          id={id}
          type={resolvedType}
          className="lm-gooey__input"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />

        {isPassword && (
          <motion.button
            type="button"
            className="lm-gooey__reveal"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'hide password' : 'show password'}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 480, damping: 30 }}
          >
            <motion.span
              key={revealed ? 'off' : 'on'}
              initial={{ rotate: -35, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            >
              {revealed ? <EyeOff size={20} strokeWidth={2.2} /> : <Eye size={20} strokeWidth={2.2} />}
            </motion.span>
          </motion.button>
        )}
      </div>

      {hint && !error && (
        <p className="lm-gooey__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            className="lm-gooey__error"
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={transitions.micro}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

/**
 * The goo filter itself. Mounted once, near the root — every GooeyInput on the
 * page references it by id.
 */
export function GooeyFilter() {
  return (
    <svg className="lm-goo-filter" aria-hidden="true" focusable="false">
      <defs>
        <filter id="lm-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
          {/* Steepening alpha turns the blurred edges back into a hard, fused
              silhouette — this is what makes separate blobs read as one. */}
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  );
}
