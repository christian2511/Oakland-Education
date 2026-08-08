import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { springs } from '@/theme';
import './Checkbox.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  id?: string;
}

/** Custom-drawn checkbox — the native control has no place in this design. */
export function Checkbox({ checked, onChange, children, id }: CheckboxProps) {
  return (
    <div className="lm-check">
      <button
        type="button"
        id={id}
        role="checkbox"
        aria-checked={checked}
        className={['lm-check__box', checked ? 'is-checked' : ''].filter(Boolean).join(' ')}
        onClick={() => onChange(!checked)}
      >
        <motion.span
          className="lm-check__fill"
          initial={false}
          animate={{ scale: checked ? 1 : 0.2, opacity: checked ? 1 : 0 }}
          transition={springs.tap}
        />
        <svg className="lm-check__tick" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <motion.path
            d="M6 12.5 10.2 16.7 18 8.4"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
          />
        </svg>
      </button>
      <div className="lm-check__label">{children}</div>
    </div>
  );
}
