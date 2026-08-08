import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Ambient } from '@/primitives/Ambient';
import { Content, Rise } from '@/primitives/Layout';
import { ProgressRing } from '@/primitives/ProgressRing';
import { MISCONCEPTIONS } from '@/data/lessons';
import { useApp } from '@/state/AppState';
import { colors, elevation, fonts, radii, type } from '@/theme';

const SKILL_LABELS: Record<string, string> = {
  one_step_equations: 'one-step equations',
  two_step_equations: 'two-step equations',
  distribution: 'distribution',
  multi_step_equations: 'multi-step equations',
  variables_both_sides: 'variables on both sides',
};

export default function Progress() {
  const router = useRouter();
  const { stats, wallet, path } = useApp();
  const done = path.filter((n) => n.status === 'complete').length;
  const completion = path.length > 0 ? done / path.length : 0;
  const strengths = Object.entries(stats.strengths).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const growth = Object.entries(stats.misconceptions).sort((a, b) => b[1] - a[1]);
  const attempted = stats.selfCorrections + stats.hintsUsed;
  const independence = attempted > 0 ? stats.selfCorrections / attempted : 0;

  return (
    <View style={{ flex: 1 }}>
      <Ambient mood="blue" animated={false} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingBottom: 140 }}>
          <Content style={{ gap: 20 }}>
            <Rise index={0}>
              <View style={{ gap: 4 }}>
                <Text style={{ ...type.h1, color: colors.text }}>your progress</Text>
                <Text style={{ ...type.body, color: colors.textSecondary }}>not just what you got right — how you got there.</Text>
              </View>
            </Rise>

            <Rise index={1}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <ProgressRing value={completion} size={132} thickness={11}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ ...type.h2, color: colors.text, fontFamily: fonts.extrabold }}>{Math.round(completion * 100)}%</Text>
                    <Text style={{ ...type.caption, color: colors.textSecondary }}>of your path</Text>
                  </View>
                </ProgressRing>
                <View style={{ flex: 1, gap: 10 }}>
                  <Figure value={stats.problemsSolved} label="problems solved" />
                  <Figure value={stats.selfCorrections} label="caught yourself" accent />
                  <Figure value={wallet.lifetimePoints} label="points earned" />
                </View>
              </View>
            </Rise>

            <Rise index={2}>
              <View style={[{ backgroundColor: colors.white, borderRadius: radii.lg, padding: 18, borderWidth: 1, borderColor: colors.line, gap: 10 }, elevation.e1]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ ...type.h3, color: colors.text }}>working it out alone</Text>
                  <Text style={{ ...type.h3, color: colors.deepPurple }}>{Math.round(independence * 100)}%</Text>
                </View>
                <View style={{ height: 12, backgroundColor: colors.line, borderRadius: radii.pill, overflow: 'hidden' }}>
                  <MotiView
                    from={{ width: '0%' }}
                    animate={{ width: `${independence * 100}%` as any }}
                    transition={{ type: 'timing', duration: 900 }}
                    style={{ height: 12, backgroundColor: colors.primary }}
                  />
                </View>
                <Text style={{ ...type.caption, color: colors.textSecondary }}>
                  of the mistakes you hit, this is the share you fixed before asking for help.
                </Text>
              </View>
            </Rise>

            <Rise index={3}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={{ ...type.h3, color: colors.text }}>solid ground</Text>
                  {strengths.length === 0 ? (
                    <Text style={{ ...type.caption, color: colors.textSecondary }}>finish a lesson without hints and it will show up here.</Text>
                  ) : (
                    strengths.map(([skill]) => (
                      <Pill key={skill} bg={colors.washGreen} fg={colors.success}>{SKILL_LABELS[skill] ?? skill.replace(/_/g, ' ')}</Pill>
                    ))
                  )}
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={{ ...type.h3, color: colors.text }}>worth another look</Text>
                  {growth.length === 0 ? (
                    <Text style={{ ...type.caption, color: colors.textSecondary }}>nothing tripping you up yet.</Text>
                  ) : (
                    growth.map(([id, count]) => (
                      <View key={id} style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, backgroundColor: colors.washYellow, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill }}>
                        <Text style={{ ...type.caption, color: colors.warning }}>{MISCONCEPTIONS[id]?.label ?? id.replace(/_/g, ' ')}</Text>
                        <View style={{ backgroundColor: colors.warning, paddingHorizontal: 6, borderRadius: radii.pill }}>
                          <Text style={{ ...type.caption, color: colors.white }}>{count}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </Rise>

            <Rise index={4}>
              <Pressable
                onPress={() => router.push('/teacher')}
                style={{ backgroundColor: colors.softLavender, borderRadius: radii.lg, padding: 18, flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ ...type.h3, color: colors.deepPurple }}>summary for your teacher</Text>
                  <Text style={{ ...type.caption, color: colors.textSecondary }}>what Lumina noticed, in one page</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={colors.deepPurple} />
              </Pressable>
            </Rise>
          </Content>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Figure({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <View>
      <Text style={{ ...type.h2, color: accent ? colors.deepPurple : colors.text, fontFamily: fonts.extrabold }}>{value}</Text>
      <Text style={{ ...type.caption, color: colors.textSecondary }}>{label}</Text>
    </View>
  );
}
function Pill({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: bg, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill }}>
      <Text style={{ ...type.caption, color: fg }}>{children}</Text>
    </View>
  );
}
