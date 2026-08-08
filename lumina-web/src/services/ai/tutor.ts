import type { TutorRequest, TutorResponse } from '@/types/ai';
import type { Problem } from '@/types/lesson';
import { rungFor } from './hintLadder';

/**
 * The tutoring boundary.
 *
 * Everything the UI knows about the AI is this interface. Swapping the mock for
 * the real engine is a single binding change in `services/ai/index.ts`; no
 * screen or component needs to know which one is behind it.
 */
export interface TutorService {
  evaluate(request: TutorRequest, problem: Problem): Promise<TutorResponse>;
}

/* --- normalisation --------------------------------------------------------- */

/** Unify the several dashes a student's device might produce, drop whitespace. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/\s+/g, '')
    .replace(/·|×/g, '*');
}

function isAnswer(step: string, problem: Problem): boolean {
  const a = normalize(problem.answer);
  const s = normalize(step);
  if (s === a) return true;
  // "x = 8" also accepted written as bare "8" on the final line.
  const value = a.split('=')[1];
  return !!value && s === value;
}

/* --- misconception signatures ---------------------------------------------
   Each detector looks at the student's written work against the problem, so
   the engine can describe *how* they got there rather than only marking the
   final value. These are heuristics standing in for the real model.        */

type Detector = (steps: string[], problem: Problem) => number | null;

const DETECTORS: Record<string, Detector> = {
  /** a(x + b) written as ax + b — the outer factor never reached the second term. */
  partial_distribution: (steps, problem) => {
    const m = normalize(problem.expression).match(/^(-?\d+)\((\w)([+-]\d+)\)=(-?\d+)$/);
    if (!m) return null;
    const [, coef, variable, constant] = m;
    const partial = normalize(`${coef}${variable}${constant}`);
    return steps.some((s) => normalize(s).startsWith(partial)) ? 0.94 : null;
  },

  /** Right magnitude, wrong sign. */
  sign_error: (steps, problem) => {
    const answer = normalize(problem.answer);
    const value = answer.split('=')[1];
    if (!value) return null;
    const flipped = value.startsWith('-') ? value.slice(1) : `-${value}`;
    return steps.some((s) => {
      const n = normalize(s);
      return n === flipped || n.endsWith(`=${flipped}`);
    })
      ? 0.88
      : null;
  },

  /** Added where they should have subtracted (or multiplied instead of divided). */
  inverse_operation: (steps, problem) => {
    const m = normalize(problem.expression).match(/^(\w)([+-])(\d+)=(-?\d+)$/);
    if (!m) return null;
    const [, variable, op, b, c] = m;
    const wrong = op === '+' ? Number(c) + Number(b) : Number(c) - Number(b);
    return steps.some((s) => normalize(s) === `${variable}=${wrong}`) ? 0.9 : null;
  },

  /** 4x + 7 collapsed into 11x. */
  combine_unlike_terms: (steps, problem) => {
    const m = normalize(problem.expression).match(/^(\d+)(\w)([+-])(\d+)=/);
    if (!m) return null;
    const [, coef, variable, op, constant] = m;
    const merged = op === '+' ? Number(coef) + Number(constant) : Number(coef) - Number(constant);
    return steps.some((s) => normalize(s).startsWith(`${merged}${variable}=`)) ? 0.86 : null;
  },

  /** Divided by the coefficient before clearing the constant. */
  order_of_operations: (steps, problem) => {
    const m = normalize(problem.expression).match(/^(\d+)(\w)([+-])(\d+)=(-?\d+)$/);
    if (!m) return null;
    const [, coef, variable, op, constant, rhs] = m;
    const premature = Number(rhs) / Number(coef);
    const signature = `${variable}${op}${constant}=${premature}`;
    return steps.some((s) => normalize(s) === signature) ? 0.83 : null;
  },
};

const DETECTOR_ORDER = [
  'partial_distribution',
  'combine_unlike_terms',
  'order_of_operations',
  'inverse_operation',
  'sign_error',
];

function detect(steps: string[], problem: Problem): { id: string; confidence: number } | null {
  for (const id of DETECTOR_ORDER) {
    // Only run detectors the problem was actually built to surface, plus the
    // universally applicable sign check.
    if (!problem.targets.includes(id) && id !== 'sign_error') continue;
    const confidence = DETECTORS[id]?.(steps, problem) ?? null;
    if (confidence !== null) return { id, confidence };
  }
  return null;
}

/* --- mock implementation ---------------------------------------------------- */

const THINKING_MS = 620;

export const mockTutorService: TutorService = {
  async evaluate(request, problem) {
    // A brief pause so the interface can show Lumina reading the work rather
    // than snapping to a verdict.
    await new Promise((r) => setTimeout(r, THINKING_MS));

    const steps = request.writtenSteps.filter((s) => s.trim().length > 0);
    const last = steps[steps.length - 1] ?? '';

    if (steps.length > 0 && isAnswer(last, problem)) {
      return {
        status: 'correct',
        skill: problem.skill,
        hintLevel: 0,
        hint: 'that is it — and your steps got you there cleanly.',
        confidence: 0.97,
      };
    }

    const found = detect(steps, problem);
    const level = Math.max(1, request.hintLevel);
    const rung = rungFor(found?.id, level);

    if (!found) {
      // Nothing recognisable to diagnose: ask rather than assert.
      return {
        status: 'needs_review',
        skill: problem.skill,
        hintLevel: level,
        hint: rung.hint,
        highlight: rung.highlight,
        confidence: 0.41,
      };
    }

    return {
      status: 'incorrect',
      skill: problem.skill,
      misconception: found.id,
      hintLevel: level,
      hint: rung.hint,
      highlight: rung.highlight,
      confidence: found.confidence,
    };
  },
};
