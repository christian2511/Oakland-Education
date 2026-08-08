import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, HandHelping } from 'lucide-react';
import { Button, ProgressBar } from '@/components/ui';
import { CloseButton } from '@/components/ui/CloseButton';
import { Board } from '@/components/handwriting/Board';
import type { BoardHandle } from '@/components/handwriting/Board';
import { Expression } from '@/components/lesson/Expression';
import { TutorBubble } from '@/components/lesson/TutorBubble';
import { LessonComplete } from '@/components/rewards/LessonComplete';
import { recognition, tutor, MAX_HINT_LEVEL } from '@/services/ai';
import type { SimulationMode } from '@/services/ai';
import type { TutorResponse } from '@/types/ai';
import type { Stroke } from '@/types/handwriting';
import type { Lesson, LessonResult } from '@/types/lesson';
import { useApp } from '@/store/AppState';
import './Lesson.css';

export interface LessonRunnerProps {
  lesson: Lesson;
  variant?: 'lesson' | 'diagnostic';
  onExit: () => void;
  onFinish: (result: LessonResult) => void;
}

interface Tally {
  solved: number;
  selfCorrections: number;
  hintsUsed: number;
  misconceptions: string[];
}

const POINTS_PER_SOLVE = 10;
const POINTS_SELF_CORRECTION = 5;

/** How long the student has to stop writing before Lumina looks at the work. */
const READ_AFTER_IDLE_MS = 1500;
/** Beat between solving a problem and the next one arriving. */
const ADVANCE_DELAY_MS = 2100;

export function LessonRunner({ lesson, variant = 'lesson', onExit, onFinish }: LessonRunnerProps) {
  const { preferences } = useApp();
  const boardRef = useRef<BoardHandle>(null);
  const startedAt = useRef(Date.now());
  const idleTimer = useRef<number | null>(null);
  const advanceTimer = useRef<number | null>(null);
  /** Guards against a second read firing while one is in flight. */
  const reading = useRef(false);

  const [index, setIndex] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [attempt, setAttempt] = useState(1);
  const [hintLevel, setHintLevel] = useState(1);
  const [thinking, setThinking] = useState(false);
  const [response, setResponse] = useState<TutorResponse | null>(null);
  const [tally, setTally] = useState<Tally>({ solved: 0, selfCorrections: 0, hintsUsed: 0, misconceptions: [] });
  const [result, setResult] = useState<LessonResult | null>(null);

  const problem = lesson.problems[index];
  const solved = response?.status === 'correct';
  const isLast = index === lesson.problems.length - 1;

  const clearTimers = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    idleTimer.current = null;
    advanceTimer.current = null;
  };

  useEffect(() => clearTimers, []);

  /**
   * Reads the student's working and responds.
   *
   * This is the whole interaction: no submitting, no marking. Lumina watches,
   * and when the pen stops it says something — the way a tutor sitting next to
   * you would, rather than a checker waiting to be asked.
   */
  const read = useCallback(
    async (currentStrokes: Stroke[], level: number, attemptNumber: number) => {
      if (currentStrokes.length === 0 || reading.current) return;
      reading.current = true;
      setThinking(true);

      // Until real recognition lands, the mock plays a student who takes the
      // hint: the first look finds the slip, the next one finds it fixed.
      const mode: SimulationMode = preferences.demoAlwaysCorrect
        ? 'correct'
        : attemptNumber > 1
          ? 'correct'
          : 'misconception';

      const writtenSteps = await recognition.recognize(currentStrokes, problem, mode);
      const evaluated = await tutor.evaluate(
        {
          problemId: problem.id,
          expression: problem.expression,
          writtenSteps,
          hintLevel: level,
          attemptNumber,
          learningStyle: null,
        },
        problem,
      );

      setThinking(false);
      setResponse(evaluated);
      reading.current = false;

      if (evaluated.status === 'correct') {
        setTally((t) => ({
          ...t,
          solved: t.solved + 1,
          // Arriving at it after a wrong turn, without climbing the ladder, is
          // the behaviour Lumina most wants to reward.
          selfCorrections: t.selfCorrections + (attemptNumber > 1 && level <= 1 ? 1 : 0),
        }));
      } else {
        setAttempt((a) => a + 1);
        if (evaluated.misconception) {
          setTally((t) =>
            t.misconceptions.includes(evaluated.misconception!)
              ? t
              : { ...t, misconceptions: [...t.misconceptions, evaluated.misconception!] },
          );
        }
      }
    },
    [problem, preferences.demoAlwaysCorrect],
  );

  /** Every finished stroke restarts the clock; a pause is the cue to look. */
  const handleStrokeEnd = useCallback(() => {
    if (solved) return;
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      setStrokes((current) => {
        void read(current, hintLevel, attempt);
        return current;
      });
    }, READ_AFTER_IDLE_MS);
  }, [read, hintLevel, attempt, solved]);

  /* --- moving on ---------------------------------------------------------- */

  const finish = useCallback(() => {
    const finished: LessonResult = {
      lessonId: lesson.id,
      pointsEarned:
        lesson.points + tally.solved * POINTS_PER_SOLVE + tally.selfCorrections * POINTS_SELF_CORRECTION,
      problemsSolved: tally.solved,
      problemsTotal: lesson.problems.length,
      selfCorrections: tally.selfCorrections,
      hintsUsed: tally.hintsUsed,
      misconceptions: tally.misconceptions,
      durationMs: Date.now() - startedAt.current,
    };
    setResult(finished);
  }, [lesson, tally]);

  const advance = useCallback(() => {
    clearTimers();
    if (isLast) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
    setResponse(null);
    setAttempt(1);
    setHintLevel(1);
    boardRef.current?.clear();
  }, [isLast, finish]);

  // A solved problem rolls on by itself, so the student never has to press
  // anything to keep learning. The button below is there if they want it sooner.
  useEffect(() => {
    if (!solved) return;
    advanceTimer.current = window.setTimeout(advance, ADVANCE_DELAY_MS);
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, [solved, advance]);

  /* --- asking for help ----------------------------------------------------- */

  const askForHelp = async () => {
    if (thinking) return;
    const next = response ? Math.min(hintLevel + 1, MAX_HINT_LEVEL) : hintLevel;
    setHintLevel(next);
    setTally((t) => ({ ...t, hintsUsed: t.hintsUsed + 1 }));

    if (strokes.length === 0) {
      // Nothing written yet — open the door rather than diagnose thin air.
      setResponse({
        status: 'needs_review',
        skill: problem.skill,
        hintLevel: 1,
        hint: 'start by writing what you would do first. I will follow along.',
        confidence: 0.5,
      });
      return;
    }

    reading.current = false;
    await read(strokes, next, attempt);
  };

  if (result) {
    return <LessonComplete lesson={lesson} result={result} onContinue={() => onFinish(result)} />;
  }

  const progress = (index + (solved ? 1 : 0)) / lesson.problems.length;

  return (
    <div className="lm-screen lm-lesson">
      <Board
        ref={boardRef}
        guides={preferences.handwritingGuides}
        onStrokesChange={setStrokes}
        onStrokeEnd={handleStrokeEnd}
      />

      {/* --- floating chrome ------------------------------------------------ */}

      <motion.header
        className="lm-lesson__head"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        <CloseButton label="leave lesson" onClose={onExit} />

        <div className="lm-lesson__progress">
          <ProgressBar value={progress} size="sm" accent="var(--lm-primary)" label="lesson progress" />
        </div>

        <span className="lm-lesson__count">
          {index + 1} / {lesson.problems.length}
        </span>
      </motion.header>

      <div className="lm-lesson__problem-wrap">
        <AnimatePresence mode="wait">
          <motion.div
            key={problem.id}
            className="lm-lesson__problem"
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <div className="lm-lesson__problem-top">
              <p className="lm-lesson__instruction">
                {variant === 'diagnostic' && index === 0 ? 'show me how you would start' : problem.prompt}
              </p>
              <span className="lm-lesson__standard" title={problem.standard.description}>
                {problem.standard.code}
              </span>
            </div>
            <Expression expression={problem.expression} highlight={response?.highlight} size="md" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- Lumina ---------------------------------------------------------- */}

      <div className="lm-lesson__tutor">
        <TutorBubble
          response={response}
          thinking={thinking}
          onMoreHelp={askForHelp}
          canAskMore={hintLevel < MAX_HINT_LEVEL}
        />

        <AnimatePresence>
          {solved ? (
            <motion.div
              key="next"
              className="lm-lesson__advance"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            >
              <Button size="md" onClick={advance} trailing={<ArrowRight size={19} strokeWidth={2.6} />}>
                {isLast ? 'finish' : 'keep going'}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="stuck"
              className="lm-lesson__advance"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            >
              <Button
                size="md"
                variant="secondary"
                onClick={askForHelp}
                disabled={thinking}
                leading={<HandHelping size={19} strokeWidth={2.3} />}
              >
                I'm stuck
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
