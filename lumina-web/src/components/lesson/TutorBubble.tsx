import { AnimatePresence, motion } from 'framer-motion';
import { Check, HelpCircle } from 'lucide-react';
import { LuminaOrb } from '@/components/ui';
import { MISCONCEPTIONS } from '@/data/lessons';
import { MAX_HINT_LEVEL } from '@/services/ai';
import type { TutorResponse } from '@/types/ai';
import './TutorBubble.css';

export interface TutorBubbleProps {
  response: TutorResponse | null;
  thinking: boolean;
  onMoreHelp?: () => void;
  canAskMore?: boolean;
}

/**
 * Lumina speaking.
 *
 * Contextual and temporary — it appears against the student's work when there
 * is something to say and leaves when there is not. There is no persistent
 * chat panel, no conversation history, and no place to type at it: the
 * student's response is always the next attempt in their own handwriting.
 */
export function TutorBubble({ response, thinking, onMoreHelp, canAskMore = true }: TutorBubbleProps) {
  const visible = thinking || !!response;
  const correct = response?.status === 'correct';
  // Below this the engine is guessing; the copy softens to a question.
  const tentative = !!response && response.confidence < 0.55;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={['lm-tutor', correct ? 'is-correct' : ''].filter(Boolean).join(' ')}
          initial={{ opacity: 0, y: 22, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.97, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          role="status"
          aria-live="polite"
        >
          <LuminaOrb state={thinking ? 'thinking' : correct ? 'correct' : 'speaking'} size={38} />

          <div className="lm-tutor__body">
            {thinking ? (
              <p className="lm-tutor__thinking">
                reading your working
                <span className="lm-tutor__dots">
                  <i />
                  <i />
                  <i />
                </span>
              </p>
            ) : (
              response && (
                <>
                  {/* Name the misconception, not the student. */}
                  {response.misconception && !correct && (
                    <p className="lm-tutor__tag">
                      {tentative ? 'this might be about' : 'this looks like'}{' '}
                      <strong>{MISCONCEPTIONS[response.misconception]?.label ?? response.misconception}</strong>
                    </p>
                  )}
                  <p className="lm-tutor__hint">{response.hint}</p>

                  {!correct && (
                    <div className="lm-tutor__foot">
                      <span className="lm-tutor__ladder" aria-label={`hint ${response.hintLevel} of ${MAX_HINT_LEVEL}`}>
                        {Array.from({ length: MAX_HINT_LEVEL }, (_, i) => (
                          <span key={i} className={i < response.hintLevel ? 'is-lit' : ''} />
                        ))}
                      </span>

                      {onMoreHelp && canAskMore && (
                        <button type="button" className="lm-tutor__more" onClick={onMoreHelp}>
                          <HelpCircle size={15} strokeWidth={2.4} />
                          more help
                        </button>
                      )}
                    </div>
                  )}
                </>
              )
            )}
          </div>

          {/* Its own presence scope: the tick appears when the verdict flips to
              correct, which happens while this bubble is already on screen. */}
          <AnimatePresence>
            {correct && (
              <motion.span
                key="check"
                className="lm-tutor__check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22, delay: 0.1 }}
              >
                <Check size={16} strokeWidth={3.4} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
