import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ambient } from '@/primitives/Ambient';
import { Content } from '@/primitives/Layout';
import { ScreenHeader } from '@/primitives/ScreenHeader';
import { MISCONCEPTIONS } from '@/data/lessons';
import { gradeLabel } from '@/data/curriculum';
import { useApp } from '@/state/AppState';
import { colors, elevation, fonts, radii, spacing, type } from '@/theme';

const SKILL_LABELS: Record<string, string> = {
  one_step_equations: 'one-step equations',
  two_step_equations: 'two-step equations',
  distribution: 'distribution',
  multi_step_equations: 'multi-step equations',
  variables_both_sides: 'variables on both sides',
};

export default function TeacherSummary() {
  const router = useRouter();
  const { user, stats, path } = useApp();
  const strengths = Object.entries(stats.strengths).sort((a, b) => b[1] - a[1])
    .map(([s]) => SKILL_LABELS[s] ?? s.replace(/_/g, ' '));
  const misconceptions = Object.entries(stats.misconceptions).sort((a, b) => b[1] - a[1]);
  const attempted = stats.selfCorrections + stats.hintsUsed;
  const suggestion = misconceptions.length > 0
    ? `Review ${MISCONCEPTIONS[misconceptions[0][0]]?.label ?? misconceptions[0][0]} before moving on to multi-step equations.`
    : stats.lessonsCompleted === 0
      ? 'No working observed yet. The diagnostic will produce a first read.'
      : 'No recurring misconception so far. Ready to move on.';

  return (
    <View style={{ flex: 1 }}>
      <Ambient mood="calm" animated={false} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenHeader onBack={() => router.back()} />
        <ScrollView contentContainerStyle={{ paddingVertical: 12, paddingBottom: 60 }}>
          <Content style={{ gap: 16 }}>
          <View style={{ gap: 4 }}>
            <Text style={{ ...type.caption, color: colors.deepPurple }}>teacher summary</Text>
            <Text style={{ ...type.h1, color: colors.text }}>{user?.name ?? 'student'}</Text>
            <Text style={{ ...type.body, color: colors.textSecondary }}>
              {user?.onboarding.grade !== null && user?.onboarding.grade !== undefined ? gradeLabel(user.onboarding.grade) : 'grade not set'}
              {user?.onboarding.topic ? ` · ${user.onboarding.topic}` : ''} · {stats.lessonsCompleted} lessons completed
            </Text>
          </View>
          <Block title="strengths">
            {strengths.length === 0
              ? <Text style={{ ...type.body, color: colors.textSecondary }}>not enough clean work yet to call anything a strength.</Text>
              : strengths.map((s) => <Text key={s} style={{ ...type.body, color: colors.text }}>· {s}</Text>)}
          </Block>
          <Block title="misconceptions">
            {misconceptions.length === 0
              ? <Text style={{ ...type.body, color: colors.textSecondary }}>none observed.</Text>
              : misconceptions.map(([id, count]) => (
                <View key={id} style={{ gap: 2 }}>
                  <Text style={{ ...type.body, color: colors.text, fontFamily: fonts.bold }}>{MISCONCEPTIONS[id]?.label ?? id.replace(/_/g, ' ')}</Text>
                  <Text style={{ ...type.caption, color: colors.textSecondary }}>{MISCONCEPTIONS[id]?.description ?? ''}</Text>
                  <Text style={{ ...type.caption, color: colors.warning }}>observed {count} {count === 1 ? 'time' : 'times'}</Text>
                </View>
              ))}
          </Block>
          <Block title="learning behaviour">
            <Text style={{ ...type.body, color: colors.text }}>corrected {stats.selfCorrections} of {attempted} mistakes independently</Text>
            <Text style={{ ...type.body, color: colors.text }}>requested {stats.hintsUsed} hints</Text>
            <Text style={{ ...type.body, color: colors.text }}>completed {stats.lessonsCompleted} of {path.length} path stages</Text>
            <Text style={{ ...type.body, color: colors.text }}>solved {stats.problemsSolved} problems</Text>
          </Block>
          <Block title="suggested practice">
            <Text style={{ ...type.body, color: colors.text }}>{suggestion}</Text>
          </Block>
          </Content>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={[{ backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, gap: 8, borderWidth: 1, borderColor: colors.line }, elevation.e1]}>
      <Text style={{ ...type.caption, color: colors.textSecondary }}>{title}</Text>
      {children}
    </View>
  );
}
