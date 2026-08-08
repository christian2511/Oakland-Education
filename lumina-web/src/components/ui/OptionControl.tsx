import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { springs, transitions } from '@/theme';
import './OptionControl.css';

export interface OptionControlProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  caption?: string;
  /** An illustration or icon carried in a soft rounded holder on the left. */
  visual?: ReactNode;
  accent?: string;
  /** `pill` is the compact form used for long grade/topic lists. */
  layout?: 'row' | 'pill';
}

/**
 * The selection primitive for onboarding. A large floating rounded control —
 * not a square tile — that lifts and warms as it becomes selected.
 */
export function OptionControl({
  selected,
  onSelect,
  title,
  caption,
  visual,
  accent,
  layout = 'row',
}: OptionControlProps) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={['lm-option', `lm-option--${layout}`, selected ? 'is-selected' : ''].filter(Boolean).join(' ')}
      style={accent ? ({ '--opt-accent': accent } as React.CSSProperties) : undefined}
      whileTap={{ scale: 0.978 }}
      animate={{ y: selected ? -2 : 0 }}
      transition={springs.tap}
    >
      {visual && <span className="lm-option__visual">{visual}</span>}

      <span className="lm-option__body">
        <span className="lm-option__title">{title}</span>
        {caption && <span className="lm-option__caption">{caption}</span>}
      </span>

      <span className="lm-option__indicator" aria-hidden="true">
        <AnimatePresence initial={false}>
          {selected && (
            <motion.span
              className="lm-option__indicator-fill"
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.2, opacity: 0 }}
              transition={springs.tap}
            >
              <Check size={15} strokeWidth={3.4} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {/* Selection glow lives on its own layer so it can fade independently. */}
      <AnimatePresence>
        {selected && (
          <motion.span
            className="lm-option__glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.quick}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
