import type { AccentName } from '../theme';

export type SubjectId = 'math' | 'english';
export type AccountKind = 'guest' | 'email' | 'google';
export type LearningStyleId =
  | 'examples' | 'stepwise' | 'attempt-first' | 'explanations' | 'visual' | 'repetition' | 'mixed';

export interface OnboardingSelection {
  subject: SubjectId | null;
  grade: number | null;
  topic: string | null;
  honorsTrack: string | null;
  learningStyle: LearningStyleId | null;
}

export interface User {
  id: string;
  name: string;
  email: string | null;
  accountKind: AccountKind;
  createdAt: string;
  onboarding: OnboardingSelection;
  onboardingComplete: boolean;
  diagnosticComplete: boolean;
}

export interface Preferences {
  reducedMotion: boolean;
  soundEffects: boolean;
  notifications: boolean;
  handwritingGuides: boolean;
  demoAlwaysCorrect: boolean;
}

export interface Wallet {
  points: number;
  lifetimePoints: number;
  owned: string[];
}

export interface Standard {
  code: string;
  domain: string;
  description: string;
}

export interface Problem {
  id: string;
  standard: Standard;
  prompt: string;
  expression: string;
  skill: string;
  answer: string;
  steps: string[];
  targets: string[];
}

export type NodeKind = 'lesson' | 'practice' | 'review' | 'checkpoint' | 'challenge' | 'diagnostic';
export type NodeStatus = 'locked' | 'available' | 'current' | 'complete';

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  kind: NodeKind;
  accent: AccentName;
  points: number;
  problems: Problem[];
}

export interface PathNode extends Lesson {
  status: NodeStatus;
  progress: number;
}

export interface LessonResult {
  lessonId: string;
  pointsEarned: number;
  problemsSolved: number;
  problemsTotal: number;
  selfCorrections: number;
  hintsUsed: number;
  misconceptions: string[];
  durationMs: number;
}

export interface MisconceptionInfo {
  id: string;
  label: string;
  description: string;
}

export type TutorStatus = 'correct' | 'incorrect' | 'needs_review';

export interface TutorResponse {
  status: TutorStatus;
  skill: string;
  misconception?: string;
  hintLevel: number;
  hint: string;
  confidence: number;
}

export interface LearningStats {
  lessonsCompleted: number;
  problemsSolved: number;
  selfCorrections: number;
  hintsUsed: number;
  hintFreeLessons: number;
  misconceptions: Record<string, number>;
  strengths: Record<string, number>;
  streakDays: number;
}

/** Shop */

export type ShopCategory = 'badges' | 'stickers' | 'themes' | 'rewards';
export type CollectiblePalette = 'yellow' | 'blue' | 'purple' | 'lavender' | 'pink' | 'green' | 'orange';
export type CollectibleShape =
  | 'star' | 'rocket' | 'lightning' | 'trophy' | 'planet' | 'cloud' | 'sprout'
  | 'heart' | 'moon' | 'flame' | 'gem' | 'crown' | 'medal' | 'shield';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  cost: number;
  shape: CollectibleShape;
  palette: CollectiblePalette;
  earnedOnly?: boolean;
  requirement?: string;
}
