import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Ambient } from '@/primitives/Ambient';
import { Content } from '@/primitives/Layout';
import { Button } from '@/primitives/Button';
import { GooeyInput } from '@/primitives/GooeyInput';
import { Requirement, Checkbox } from '@/primitives/Requirement';
import { ScreenHeader } from '@/primitives/ScreenHeader';
import { Wordmark } from '@/primitives/Wordmark';
import { useApp } from '@/state/AppState';
import { colors, spacing, type } from '@/theme';
import type { User } from '@/data/types';

export default function EmailSignUp() {
  const router = useRouter();
  const { setUser } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [creating, setCreating] = useState(false);

  const checks = useMemo(() => ({
    length: password.length >= 8,
    match: password.length > 0 && password === confirm,
    name: name.trim().length > 0,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
  }), [name, email, password, confirm]);

  const canSubmit = checks.length && checks.match && checks.name && checks.email && agreed && !creating;

  const submit = () => {
    if (!canSubmit) return;
    setCreating(true);
    setTimeout(() => {
      const u: User = {
        id: String(Date.now()),
        name: name.trim(),
        email: email.trim(),
        accountKind: 'email',
        createdAt: new Date().toISOString(),
        onboarding: { subject: null, grade: null, topic: null, honorsTrack: null, learningStyle: null },
        onboardingComplete: false, diagnosticComplete: false,
      };
      setUser(u);
      router.replace('/onboarding');
    }, 1300);
  };

  return (
    <View style={{ flex: 1 }}>
      <Ambient mood="lavender" animated={false} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenHeader onBack={() => router.back()} />
        <AnimatePresence>
          {!creating ? (
            <MotiView
              key="form"
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -20 }}
              style={{ flex: 1 }}
            >
              <ScrollView contentContainerStyle={{ paddingVertical: 12, paddingBottom: 60 }}>
                <Content style={{ gap: 14 }}>
                <Text style={{ ...type.h1, color: colors.text }}>sign up with email</Text>
                <Text style={{ ...type.body, color: colors.textSecondary }}>this keeps your progress safe across devices.</Text>

                <GooeyInput
                  label="name" placeholder="your name"
                  value={name} onChangeText={(v) => { setName(v); setNameTouched(true); }}
                  autoComplete="name" autoCapitalize="words"
                  error={nameTouched && !checks.name ? 'we need something to call you' : undefined}
                />
                <GooeyInput
                  label="email address" placeholder="you@school.org"
                  value={email} onChangeText={(v) => { setEmail(v); setEmailTouched(true); }}
                  keyboardType="email-address" autoComplete="email" autoCapitalize="none"
                  error={emailTouched && !checks.email ? 'that address does not look right' : undefined}
                />
                <GooeyInput
                  label="password" placeholder="at least 8 characters"
                  value={password} onChangeText={setPassword}
                  secureTextEntry autoComplete="password-new"
                />
                <GooeyInput
                  label="confirm password" placeholder="type it once more"
                  value={confirm} onChangeText={setConfirm}
                  secureTextEntry autoComplete="password-new"
                />

                <View style={{ gap: 6, marginTop: 4 }}>
                  <Requirement met={checks.length}>at least 8 characters</Requirement>
                  <Requirement met={checks.match}>passwords match</Requirement>
                </View>

                <Checkbox checked={agreed} onChange={setAgreed}>
                  <Text style={{ ...type.body, color: colors.textSecondary }}>
                    I agree to the Terms of Service and Privacy Policy.
                  </Text>
                </Checkbox>

                <Button
                  full disabled={!canSubmit} onPress={submit}
                  trailing={<Ionicons name="arrow-forward" size={20} color={colors.white} />}
                >
                  create account
                </Button>
                </Content>
              </ScrollView>
            </MotiView>
          ) : (
            <MotiView
              key="creating"
              from={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Wordmark size="lg" withMark />
              <Text style={{ ...type.body, color: colors.textSecondary, marginTop: 16 }}>setting things up</Text>
            </MotiView>
          )}
        </AnimatePresence>
      </SafeAreaView>
    </View>
  );
}
