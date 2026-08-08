export type SubjectId = 'math' | 'english';

export type AccountKind = 'guest' | 'email' | 'google';

export type LearningStyleId =
  | 'examples'
  | 'stepwise'
  | 'attempt-first'
  | 'explanations'
  | 'visual'
  | 'repetition'
  | 'mixed';

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
  /**
   * Guests get the whole product. The shape is identical to a registered user
   * so upgrading later is a field change, not a migration.
   */
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
  /**
   * Demo aid while recognition is mocked: makes Lumina read every attempt as
   * already solved, so the clean path can be walked without the detour.
   */
  demoAlwaysCorrect: boolean;
}
