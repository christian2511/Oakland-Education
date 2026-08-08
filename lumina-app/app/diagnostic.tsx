import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Ambient } from '@/primitives/Ambient';
import { Content } from '@/primitives/Layout';
import { Button } from '@/primitives/Button';
import { LessonRunner } from '@/components/LessonRunner';
import { lessonById } from '@/data/lessons';
import { useApp } from '@/state/AppState';
import { colors, spacing, type } from '@/theme';

export default function Diagnostic() {
  const router = useRouter();
  const { recordLesson } = useApp();
  const [started, setStarted] = useState(false);
  const lesson = lessonById('diagnostic')!;

  if (started) {
    return (
      <LessonRunner
        lesson={lesson}
        diagnostic
        onExit={() => router.replace('/(tabs)/home')}
        onFinish={(r) => { recordLesson(r); router.replace('/(tabs)/home'); }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Ambient mood="blue" />
      <SafeAreaView style={{ flex: 1 }}>
        <Content style={{ flex: 1, paddingVertical: 24 }}>
        <View style={{ flex: 1, gap: 14, paddingTop: 40 }}>
          <Text style={{ ...type.h1, color: colors.text }}>let's see what you already know.</Text>
          <Text style={{ ...type.body, color: colors.textSecondary }}>
            four problems. work them out by hand, the way you normally would — Lumina is reading your steps, not marking you. getting one wrong here is useful.
          </Text>
          <Text style={{ ...type.body, color: colors.text }}>· write your working, not just the answer</Text>
          <Text style={{ ...type.body, color: colors.text }}>· take as long as you like</Text>
          <Text style={{ ...type.body, color: colors.text }}>· ask for a hint whenever you want one</Text>
        </View>
        <Button full onPress={() => setStarted(true)} trailing={<Ionicons name="arrow-forward" size={20} color={colors.white} />}>start</Button>
        <Pressable onPress={() => router.replace('/(tabs)/home')} style={{ paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ ...type.label, color: colors.textSecondary }}>skip for now</Text>
        </Pressable>
        </Content>
      </SafeAreaView>
    </View>
  );
}
