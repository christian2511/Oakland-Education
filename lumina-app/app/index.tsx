import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Ambient } from '@/primitives/Ambient';
import { Button } from '@/primitives/Button';
import { Wordmark } from '@/primitives/Wordmark';
import { useApp } from '@/state/AppState';
import { colors, spacing, type } from '@/theme';
import type { User } from '@/data/types';

export default function Welcome() {
  const router = useRouter();
  const { user, setUser } = useApp();
  const [revealed, setRevealed] = useState(0);
  const [showTagline, setShowTagline] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= 6; i++) {
      timers.push(setTimeout(() => setRevealed(i), 380 + i * 190));
    }
    const built = 380 + 6 * 190;
    timers.push(setTimeout(() => setShowTagline(true), built + 520));
    timers.push(setTimeout(() => setReady(true), built + 520 + 700));
    return () => timers.forEach(clearTimeout);
  }, []);

  // After every hook — an early return above a hook breaks the hook order.
  if (user?.onboardingComplete) return <Redirect href="/(tabs)/home" />;

  const startGoogle = () => {
    // Local mock — Google auth wiring lands with the backend contract.
    setUser(fakeUser('student', null, 'google'));
    router.push('/onboarding');
  };

  return (
    <View style={{ flex: 1 }}>
      <Ambient mood="sunrise" />
      <SafeAreaView style={{ flex: 1, paddingHorizontal: spacing.gutter, maxWidth: 560, width: '100%', alignSelf: 'center' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <MotiView animate={{ translateY: ready ? 0 : 40 }} transition={{ type: 'timing', duration: 600 }}>
            <Wordmark reveal={revealed} size="hero" />
            {showTagline && (
              <MotiView from={{ opacity: 0, translateY: 14 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 700 }}>
                <Text style={{ ...type.bodyLarge, color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
                  learn how you think.
                </Text>
              </MotiView>
            )}
          </MotiView>
        </View>

        {ready && (
          <MotiView
            from={{ opacity: 0, translateY: 22 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            style={{ gap: 14, paddingBottom: 32 }}
          >
            <Button variant="dark" full onPress={startGoogle} leading={<Ionicons name="logo-google" size={18} color={colors.white} />}>
              sign up with google
            </Button>
            <Button variant="primary" full onPress={() => router.push('/signup/email')} trailing={<Ionicons name="arrow-forward" size={20} color={colors.white} />}>
              sign up with email
            </Button>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.lineStrong }} />
              <Text style={{ ...type.caption, color: colors.textTertiary }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.lineStrong }} />
            </View>
            <Button variant="secondary" full onPress={() => router.push('/signup/guest')}>
              continue as guest
            </Button>
            <Pressable onPress={() => router.push('/mission')} style={{ alignSelf: 'center', paddingVertical: 12 }}>
              <Text style={{ ...type.label, color: colors.deepPurple }}>why we built Lumina</Text>
            </Pressable>
          </MotiView>
        )}
      </SafeAreaView>
    </View>
  );
}

function fakeUser(name: string, email: string | null, kind: User['accountKind']): User {
  return {
    id: String(Date.now()),
    name, email, accountKind: kind,
    createdAt: new Date().toISOString(),
    onboarding: { subject: null, grade: null, topic: null, honorsTrack: null, learningStyle: null },
    onboardingComplete: false,
    diagnosticComplete: false,
  };
}
