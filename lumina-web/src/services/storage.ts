const PREFIX = 'lumina:';

/**
 * Thin persistence wrapper. Everything is best-effort — a tablet in private
 * mode or with a full quota should degrade to an in-memory session, never
 * throw in the middle of a lesson.
 */
export const storage = {
  read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  write<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage unavailable — session continues without persistence */
    }
  },

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* nothing to do */
    }
  },
};
