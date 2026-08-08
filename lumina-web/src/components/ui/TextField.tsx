import { forwardRef, useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { transitions } from '@/theme';
import './TextField.css';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  hint?: string;
  /** Shown only after the field is left — never scolds mid-typing. */
  error?: string;
}

/**
 * Large rounded input with a soft ground and an accent border that animates in
 * on focus. Errors are surfaced by the caller on blur, not on every keystroke.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, className, type = 'text', ...rest },
  ref,
) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && revealed ? 'text' : type;

  return (
    <div className={['lm-field', error ? 'is-error' : '', className ?? ''].filter(Boolean).join(' ')}>
      <label className="lm-field__label" htmlFor={id}>
        {label}
      </label>

      <div className="lm-field__shell">
        <input
          ref={ref}
          id={id}
          type={resolvedType}
          className="lm-field__input"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            className="lm-field__reveal"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'hide password' : 'show password'}
          >
            {revealed ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
          </button>
        )}
      </div>

      {hint && !error && (
        <p className="lm-field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            className="lm-field__error"
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
