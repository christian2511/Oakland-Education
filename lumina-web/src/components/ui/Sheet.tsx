import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { springs, transitions } from '@/theme';
import './Sheet.css';

export interface SheetProps {
  open: boolean;
  onDismiss?: () => void;
  children: ReactNode;
  labelledBy?: string;
}

/** Centred rounded modal. Rises and settles rather than snapping into place. */
export function Sheet({ open, onDismiss, children, labelledBy }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="lm-sheet-layer">
          <motion.div
            className="lm-sheet__scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.quick}
            onClick={onDismiss}
          />
          <motion.div
            className="lm-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96, transition: transitions.quick }}
            transition={springs.surface}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
