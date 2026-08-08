import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import './CloseButton.css';

export interface CloseButtonProps {
  label?: string;
  onClose: () => void;
  tone?: 'glass' | 'solid';
  size?: 'sm' | 'md';
}

/** Time the spin gets to play before the screen actually goes. */
const SPIN_MS = 260;

/**
 * Dismiss control.
 *
 * The X turns a quarter-turn and the button squeezes inward before anything
 * closes, so the gesture completes on screen instead of the view vanishing
 * out from under the tap.
 */
export function CloseButton({ label = 'close', onClose, tone = 'glass', size = 'md' }: CloseButtonProps) {
  const [closing, setClosing] = useState(false);

  const handle = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, SPIN_MS);
  };

  return (
    <motion.button
      type="button"
      aria-label={label}
      className={`lm-close lm-close--${tone} lm-close--${size}`}
      onClick={handle}
      whileTap={{ scale: 0.88 }}
      animate={closing ? { scale: 0.72, opacity: 0.35 } : { scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 480, damping: 30 }}
    >
      <motion.span
        className="lm-close__glyph"
        animate={{ rotate: closing ? 90 : 0 }}
        transition={{ duration: SPIN_MS / 1000, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <X size={size === 'sm' ? 19 : 22} strokeWidth={2.7} />
      </motion.span>
    </motion.button>
  );
}
