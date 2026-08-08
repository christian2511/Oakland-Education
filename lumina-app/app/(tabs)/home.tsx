import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Ambient } from '@/primitives/Ambient';
import { Button } from '@/primitives/Button';
import { CircleButton } from '@/primitives/CircleButton';
import { Content, Rise } from '@/primitives/Layout';
import { LearningPath } from '@/components/LearningPath';
import { LuminaOrb } from '@/primitives/LuminaOrb';
import { useApp } from '@/state/AppState';
import { colors, elevation, fonts, radii, spacing, type } from '@/theme';
import type { PathNode } from '@/data/types';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'good morning';
  if (h < 18) return 'good afternoon';
  return 'good evening';
}

export default function Home() {
  const router = useRouter();
  const { user, path, wallet, stats } = useApp();
  const [width, setWidth] = useState(0);
  const firstName = user?.name.split(' ')[0] ?? 'there';
  const subject = user?.onboarding.subject ?? 'math';
  const current = path.find((n) => n.status === 'current');
  const done = path.filter((n) => n.status === 'complete').length;

  const openNode = (n: PathNode) => {
    if (n.id === 'diagnostic') router.push('/diagnostic');
    else router.push(`/lesson/${n.id}` as any);
  };

  return (
    <View style={{ flex: 1 }}>
      <Ambient mood="warm" animated={false} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingBottom: 140 }}>
          <Content style={{ gap: 20 }}>
            <Rise index={0}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ ...type.body, color: colors.textSecondary }}>{greeting()}, {firstName}</Text>
                  <Text style={{ ...type.h1, color: colors.text }}>
                    {current ? (current.id === 'diagnostic' ? "let's see where you're starting." : `ready for a little ${subject}?`) : 'you have cleared the whole path.'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.washYellow, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.pill }}>
                    <Ionicons name="flame" size={16} color={colors.warning} />
                    <Text style={{ ...type.label, color: colors.text }}>{stats.streakDays}</Text>
                  </View>
                  <CircleButton onPress={() => router.replace('/(tabs)/settings')} size="sm">
                    <Text style={{ ...type.label, color: colors.deepPurple, fontFamily: fonts.extrabold }}>{firstName.charAt(0).toUpperCase()}</Text>
                  </CircleButton>
                </View>
              </View>
            </Rise>

            {current && (
              <Rise index={1}>
                <Pressable onPress={() => openNode(current)}>
                  <View style={[{
                    backgroundColor: colors.white, borderRadius: radii.hero, padding: 22,
                    borderWidth: 1, borderColor: colors.line, gap: 14,
                  }, elevation.e3]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <LuminaOrb state="idle" size={40} />
                      <View>
                        <Text style={{ ...type.caption, color: colors.deepPurple }}>next up</Text>
                        <Text style={{ ...type.h2, color: colors.text }}>{current.title}</Text>
                      </View>
                    </View>
                    <Text style={{ ...type.body, color: colors.textSecondary }}>{current.subtitle}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Chip>{current.problems.length} problems</Chip>
                      <Chip>+{current.points} points</Chip>
                      <View style={{ flex: 1 }} />
                      <Button size="md" onPress={() => openNode(current)} trailing={<Ionicons name="arrow-forward" size={18} color={colors.white} />}>start</Button>
                    </View>
                  </View>
                </Pressable>
              </Rise>
            )}

            <Rise index={2}>
              <View style={{ gap: 8 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Text style={{ ...type.h3, color: colors.text }}>your path</Text>
                  <Text style={{ ...type.caption, color: colors.textSecondary }}>
                    {done} of {path.length} done · {wallet.points} points
                  </Text>
                </View>
                {width > 0 && <LearningPath nodes={path} onSelect={openNode} width={width} />}
              </View>
            </Rise>
          </Content>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.washLavender, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill }}>
      <Text style={{ ...type.caption, color: colors.deepPurple }}>{children}</Text>
    </View>
  );
}
