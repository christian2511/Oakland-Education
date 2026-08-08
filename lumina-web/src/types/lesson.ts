import type { AccentName } from '@/theme';

export type NodeKind = 'lesson' | 'practice' | 'review' | 'checkpoint' | 'challenge' | 'diagnostic';

export type NodeStatus = 'locked' | 'available' | 'current' | 'complete';

/**
 * A California Common Core State Standard (CA CCSSM) reference. Every problem
 * is anchored to one, so a teacher can see exactly which standard a student's
 * working speaks to.
 */
export interface Standard {
  /** e.g. "7.EE.B.4a". */
  code: string;
  /** The domain the code sits in, e.g. "Expressions & Equations". */
  domain: string;
  /** Plain-language statement of what the standard asks for. */
  description: string;
}

export interface Problem {
  id: string;
  standard: Standard;
  /** The instruction line, e.g. "solve for x". */
  prompt: string;
  /** The expression itself, rendered large. */
  expression: string;
  skill: string;
  answer: string;
  /** Worked steps, used by the tutor to describe the route rather than the answer. */
  steps: string[];
  /** Misconception ids this problem is designed to surface. */
  targets: string[];
}

export interface Lesson {
  id: string;
  title: string;
  /** One line under the node on the path. */
  subtitle: string;
  kind: NodeKind;
  accent: AccentName;
  points: number;
  problems: Problem[];
}

export interface PathNode extends Lesson {
  status: NodeStatus;
  /** 0 – 1, drives the completion ring. */
  progress: number;
}

export interface LessonResult {
  lessonId: string;
  pointsEarned: number;
  problemsSolved: number;
  problemsTotal: number;
  selfCorrections: number;
  hintsUsed: number;
  /** Misconception ids observed during the lesson. */
  misconceptions: string[];
  durationMs: number;
}
