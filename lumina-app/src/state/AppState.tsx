import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  LearningStats,
  LessonResult,
  OnboardingSelection,
  PathNode,
  Preferences,
  User,
  Wallet,
} from '../data/types';
import { LESSONS } from '../data/lessons';

interface LessonProgress {
  progress: number;
  completedAt?: string;
}

interface AppSnapshot {
  user: User | null;
  wallet: Wallet;
  preferences: Preferences;
  lessons: Record<string, LessonProgress>;
  stats: LearningStats;
}

const DEFAULT: AppSnapshot = {
  user: null,
  wallet: { points: 0, lifetimePoints: 0, owned: [] },
  preferences: {
    reducedMotion: false,
    soundEffects: true,
    notifications: true,
    handwritingGuides: true,
    demoAlwaysCorrect: false,
  },
  lessons: {},
  stats: {
    lessonsCompleted: 0,
    problemsSolved: 0,
    selfCorrections: 0,
    hintsUsed: 0,
    hintFreeLessons: 0,
    misconceptions: {},
    strengths: {},
    streakDays: 1,
  },
};

interface AppContextValue extends AppSnapshot {
  path: PathNode[];
  setUser: (user: User | null) => void;
  updateOnboarding: (patch: Partial<OnboardingSelection>) => void;
  completeOnboarding: () => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
  recordLesson: (result: LessonResult) => void;
  purchase: (itemId: string, cost: number) => boolean;
  reset: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppSnapshot>(DEFAULT);

  const setUser = useCallback((user: User | null) => {
    setState((s) => ({ ...s, user }));
  }, []);

  const updateOnboarding = useCallback((patch: Partial<OnboardingSelection>) => {
    setState((s) =>
      s.user ? { ...s, user: { ...s.user, onboarding: { ...s.user.onboarding, ...patch } } } : s,
    );
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, onboardingComplete: true } } : s));
  }, []);

  const updatePreferences = useCallback((patch: Partial<Preferences>) => {
    setState((s) => ({ ...s, preferences: { ...s.preferences, ...patch } }));
  }, []);

  const recordLesson = useCallback((result: LessonResult) => {
    setState((s) => {
      const misconceptions = { ...s.stats.misconceptions };
      result.misconceptions.forEach((m) => {
        misconceptions[m] = (misconceptions[m] ?? 0) + 1;
      });
      const lesson = LESSONS.find((l) => l.id === result.lessonId);
      const strengths = { ...s.stats.strengths };
      if (lesson && result.hintsUsed === 0) {
        lesson.problems.forEach((p) => {
          strengths[p.skill] = (strengths[p.skill] ?? 0) + 1;
        });
      }
      const alreadyDone = !!s.lessons[result.lessonId]?.completedAt;
      return {
        ...s,
        user:
          s.user && result.lessonId === 'diagnostic' ? { ...s.user, diagnosticComplete: true } : s.user,
        wallet: {
          ...s.wallet,
          points: s.wallet.points + result.pointsEarned,
          lifetimePoints: s.wallet.lifetimePoints + result.pointsEarned,
        },
        lessons: {
          ...s.lessons,
          [result.lessonId]: { progress: 1, completedAt: new Date().toISOString() },
        },
        stats: {
          ...s.stats,
          lessonsCompleted: s.stats.lessonsCompleted + (alreadyDone ? 0 : 1),
          problemsSolved: s.stats.problemsSolved + result.problemsSolved,
          selfCorrections: s.stats.selfCorrections + result.selfCorrections,
          hintsUsed: s.stats.hintsUsed + result.hintsUsed,
          hintFreeLessons: s.stats.hintFreeLessons + (result.hintsUsed === 0 ? 1 : 0),
          misconceptions,
          strengths,
        },
      };
    });
  }, []);

  const purchase = useCallback((itemId: string, cost: number) => {
    let ok = false;
    setState((s) => {
      if (s.wallet.points < cost || s.wallet.owned.includes(itemId)) return s;
      ok = true;
      return {
        ...s,
        wallet: { ...s.wallet, points: s.wallet.points - cost, owned: [...s.wallet.owned, itemId] },
      };
    });
    return ok;
  }, []);

  const reset = useCallback(() => setState(DEFAULT), []);

  const path = useMemo<PathNode[]>(() => {
    let foundCurrent = false;
    return LESSONS.map((lesson) => {
      const record = state.lessons[lesson.id];
      const complete = !!record?.completedAt;
      let status: PathNode['status'];
      if (complete) status = 'complete';
      else if (!foundCurrent) { status = 'current'; foundCurrent = true; }
      else status = 'locked';
      return { ...lesson, status, progress: complete ? 1 : (record?.progress ?? 0) };
    });
  }, [state.lessons]);

  const value = useMemo<AppContextValue>(() => ({
    ...state,
    path,
    setUser,
    updateOnboarding,
    completeOnboarding,
    updatePreferences,
    recordLesson,
    purchase,
    reset,
  }), [state, path, setUser, updateOnboarding, completeOnboarding, updatePreferences, recordLesson, purchase, reset]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
