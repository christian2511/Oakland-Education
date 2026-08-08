import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { springs } from '@/theme';
import './Requirement.css';

export interface RequirementProps {
  met: boolean;
  children: string;
}

/**
 * A live validation row. Reads as a quiet checklist filling in, not as an error
 * list — the ring only becomes a tick once the rule is satisfied.
 */
export function Requirement({ met, children }: RequirementProps) {
  return (
    <div className={['lm-req', met ? 'is-met' : ''].filter(Boolean).join(' ')}>
      <span className="lm-req__mark">
        <AnimatePresence initial={false} mode="wait">
          {met ? (
            <motion.span
              key="tick"
              className="lm-req__tick"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={springs.tap}
            >
              <Check size={13} strokeWidth={3.5} />
            </motion.span>
          ) : (
            <motion.span
              key="ring"
              className="lm-req__ring"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={springs.tap}
            />
          )}
        </AnimatePresence>
      </span>
      <motion.span className="lm-req__text" initial={false} animate={{ x: met ? 1 : 0 }} transition={springs.tap}>
        {children}
      </motion.span>
    </div>
  );
}
