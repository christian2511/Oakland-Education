import type { Problem } from '@/types/lesson';
import type { Stroke } from '@/types/handwriting';

/**
 * Handwriting recognition boundary.
 *
 * Real recognition runs on the device/engine side. The UI only ever needs
 * ordered lines of text back, so that is the whole contract.
 */
export interface RecognitionService {
  recognize(strokes: Stroke[], problem: Problem, hint?: SimulationMode): Promise<string[]>;
}

/** Which kind of student work the mock should produce. */
export type SimulationMode = 'misconception' | 'correct' | 'unclear';

/**
 * Builds a plausible piece of written work for a problem.
 *
 * Derived from the problem's own targets so the mistake it produces is exactly
 * the one the problem was written to surface — the same signal the real
 * detectors look for.
 */
export function simulateStudentWork(problem: Problem, mode: SimulationMode): string[] {
  if (mode === 'correct') {
    return [problem.expression, ...problem.steps];
  }

  if (mode === 'unclear') {
    return [problem.expression, '...'];
  }

  const expr = problem.expression.replace(/[−–—]/g, '-').replace(/\s+/g, '');
  const target = problem.targets[0];

  // a(x + b) = c  →  ax + b = c
  const dist = expr.match(/^(-?\d+)\((\w)([+-]\d+)\)=(-?\d+)$/);
  if (target === 'partial_distribution' && dist) {
    const [, coef, variable, constant, rhs] = dist;
    return [problem.expression, `${coef}${variable} ${constant[0]} ${constant.slice(1)} = ${rhs}`];
  }

  // ax + b = c  →  (a+b)x = c
  const twoStep = expr.match(/^(\d+)(\w)([+-])(\d+)=(-?\d+)$/);
  if (target === 'combine_unlike_terms' && twoStep) {
    const [, coef, variable, op, constant, rhs] = twoStep;
    const merged = op === '+' ? Number(coef) + Number(constant) : Number(coef) - Number(constant);
    return [problem.expression, `${merged}${variable} = ${rhs}`];
  }

  // ax + b = c  →  x + b = c/a
  if (target === 'order_of_operations' && twoStep) {
    const [, coef, variable, op, constant, rhs] = twoStep;
    return [problem.expression, `${variable} ${op} ${constant} = ${Number(rhs) / Number(coef)}`];
  }

  // x + b = c  →  x = c + b
  const oneStep = expr.match(/^(\w)([+-])(\d+)=(-?\d+)$/);
  if (target === 'inverse_operation' && oneStep) {
    const [, variable, op, b, c] = oneStep;
    const wrong = op === '+' ? Number(c) + Number(b) : Number(c) - Number(b);
    return [problem.expression, `${variable} = ${wrong}`];
  }

  // Everything else: right magnitude, wrong sign.
  const answer = problem.answer.replace(/[−–—]/g, '-');
  const [lhs, value] = answer.split('=').map((s) => s.trim());
  const flipped = value?.startsWith('-') ? value.slice(1) : `-${value}`;
  return [problem.expression, `${lhs} = ${flipped}`];
}

const RECOGNITION_MS = 340;

export const mockRecognitionService: RecognitionService = {
  async recognize(strokes, problem, hint = 'misconception') {
    await new Promise((r) => setTimeout(r, RECOGNITION_MS));
    // A blank canvas recognises as nothing, exactly as real recognition would.
    if (strokes.length === 0) return [];
    return simulateStudentWork(problem, hint);
  },
};
