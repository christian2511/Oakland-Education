import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Ambient } from '@/primitives/Ambient';
import { Content } from '@/primitives/Layout';
import { Button } from '@/primitives/Button';
import { GooeyInput } from '@/primitives/GooeyInput';
import { ScreenHeader } from '@/primitives/ScreenHeader';
import { useApp } from '@/state/AppState';
import { colors, spacing, type } from '@/theme';
import type { User } from '@/data/types';

export default function GuestName() {
  const router = useRouter();
  const { setUser } = useApp();
  const [name, setName] = useState('');
  const valid = name.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    const u: User = {
      id: String(Date.now()),
      name: name.trim(), email: null, accountKind: 'guest',
      createdAt: new Date().toISOString(),
      onboarding: { subject: null, grade: null, topic: null, honorsTrack: null, learningStyle: null },
      onboardingComplete: false, diagnosticComplete: false,
    };
    setUser(u);
    router.replace('/onboarding');
  };

  return (
    <View style={{ flex: 1 }}>
      <Ambient mood="lavender" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenHeader onBack={() => router.back()} />
        <Content style={{ gap: 16, paddingVertical: 24 }}>
          <Text style={{ ...type.h1, color: colors.text }}>what's your name?</Text>
          <Text style={{ ...type.body, color: colors.textSecondary }}>just so Lumina knows who it's working with.</Text>
          <GooeyInput label="your name" placeholder="type your name" value={name} onChangeText={setName} autoCapitalize="words" autoFocus />
          <Button full disabled={!valid} onPress={submit} trailing={<Ionicons name="arrow-forward" size={20} color={colors.white} />}>continue</Button>
          <Text style={{ ...type.caption, color: colors.textTertiary, marginTop: 8 }}>
            you can turn this into a full account any time from settings.
          </Text>
        </Content>
      </SafeAreaView>
    </View>
  );
}
