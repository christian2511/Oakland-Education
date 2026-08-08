import type { AccountKind, User } from '@/types/user';

/**
 * Authentication boundary.
 *
 * Mocked for now. The shape is deliberately the same for guests and registered
 * users, so `upgradeGuest` is the whole of the account-conversion path when a
 * real provider is wired in.
 */
export interface AuthService {
  signUpWithEmail(name: string, email: string, password: string): Promise<User>;
  signUpWithGoogle(): Promise<User>;
  continueAsGuest(name: string): Promise<User>;
  upgradeGuest(user: User, email: string, kind: Exclude<AccountKind, 'guest'>): Promise<User>;
}

function baseUser(name: string, email: string | null, accountKind: AccountKind): User {
  return {
    id: `u_${Math.random().toString(36).slice(2, 10)}`,
    name: name.trim(),
    email,
    accountKind,
    createdAt: new Date().toISOString(),
    onboarding: {
      subject: null,
      grade: null,
      topic: null,
      honorsTrack: null,
      learningStyle: null,
    },
    onboardingComplete: false,
    diagnosticComplete: false,
  };
}

const NETWORK_MS = 700;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockAuthService: AuthService = {
  async signUpWithEmail(name, email) {
    await wait(NETWORK_MS);
    return baseUser(name, email, 'email');
  },

  async signUpWithGoogle() {
    await wait(NETWORK_MS);
    // A real provider returns the profile; the mock stands in with a placeholder.
    return baseUser('Alex', 'alex@example.com', 'google');
  },

  async continueAsGuest(name) {
    await wait(320);
    return baseUser(name, null, 'guest');
  },

  async upgradeGuest(user, email, kind) {
    await wait(NETWORK_MS);
    return { ...user, email, accountKind: kind };
  },
};

export const auth: AuthService = mockAuthService;
