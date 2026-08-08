import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Ambient, Button } from '@/components/ui';
import { RewardScene } from '@/components/illustrations';
import type { Lesson, LessonResult } from '@/types/lesson';
import './LessonComplete.css';

export interface LessonCompleteProps {
  lesson: Lesson;
  result: LessonResult;
  onContinue: () => void;
}

/**
 * The reward moment.
 *
 * One screen, about a second and a half, then straight back to learning — not
 * a chain of celebration screens. What it chooses to call out is deliberate:
 * mistakes the student caught themselves, ahead of raw completion.
 */
export function LessonComplete({ lesson, result, onContinue }: LessonCompleteProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="lm-screen lm-complete">
      <Ambient mood="lavender" />

      <div className="lm-complete__body">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        >
          <RewardScene size={150} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.42 }}
        >
          {lesson.kind === 'diagnostic' ? 'that tells us a lot' : 'lesson complete'}
        </motion.h1>

        <motion.div
          className="lm-complete__points"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 22 }}
        >
          <CountUp to={result.pointsEarned} />
          <span>points</span>
        </motion.div>

        <motion.div
          className="lm-complete__notes"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.4 }}
        >
          {result.selfCorrections > 0 && (
            <p className="lm-complete__note lm-complete__note--gold">
              you corrected {result.selfCorrections}{' '}
              {result.selfCorrections === 1 ? 'mistake' : 'mistakes'} yourself.
            </p>
          )}
          <p className="lm-complete__note">
            {result.problemsSolved} of {result.problemsTotal} solved
            {result.hintsUsed === 0 ? ' · no hints needed' : ` · ${result.hintsUsed} hints`}
          </p>
        </motion.div>
      </div>

      <motion.div
        className="lm-complete__foot"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        <Button full onClick={onContinue} disabled={!ready}>
          continue
        </Button>
      </motion.div>
    </div>
  );
}

/** Counts from zero on a spring, so the number arrives rather than ticks. */
function CountUp({ to }: { to: number }) {
  const value = useMotionValue(0);
  const spring = useSpring(value, { stiffness: 90, damping: 22 });
  const rounded = useTransform(spring, (v) => `+${Math.round(v)}`);

  useEffect(() => {
    const t = window.setTimeout(() => value.set(to), 420);
    return () => clearTimeout(t);
  }, [to, value]);

  return <motion.span className="lm-complete__number">{rounded}</motion.span>;
}
