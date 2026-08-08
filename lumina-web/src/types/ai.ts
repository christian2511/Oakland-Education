/**
 * The contract between the UI and the tutoring engine.
 *
 * The engine is developed separately. Everything the interface needs to render
 * feedback arrives in one structured response — no component parses free text,
 * and no component decides pedagogy for itself.
 */

export type TutorStatus = 'correct' | 'incorrect' | 'needs_review';

export interface TutorHighlight {
  /** e.g. "region" | "token" | "step". */
  type: string;
  /** What to draw attention to, e.g. "parentheses", "coefficient". */
  target: string;
}

export interface TutorResponse {
  status: TutorStatus;
  skill: string;
  /** Stable id for the misconception, e.g. "partial_distribution". */
  misconception?: string;
  /** 1 – 5, ascending the hint ladder. */
  hintLevel: number;
  hint: string;
  highlight?: TutorHighlight;
  /** 0 – 1. Low confidence should soften how assertively the UI presents a hint. */
  confidence: number;
}

/** What the UI sends the engine when a student submits an attempt. */
export interface TutorRequest {
  problemId: string;
  expression: string;
  /** Recognised text of the student's written work, ordered by line. */
  writtenSteps: string[];
  /** Rising each time the student asks for more help on the same attempt. */
  hintLevel: number;
  attemptNumber: number;
  learningStyle?: string | null;
}

/** Human-readable copy for a misconception, used by the teacher summary. */
export interface MisconceptionInfo {
  id: string;
  label: string;
  description: string;
}
