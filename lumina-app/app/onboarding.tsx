import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Ambient } from '@/primitives/Ambient';
import { Content } from '@/primitives/Layout';
import { Button } from '@/primitives/Button';
import { OptionControl } from '@/primitives/OptionControl';
import { ProgressBar } from '@/primitives/ProgressBar';
import { ScreenHeader } from '@/primitives/ScreenHeader';
import { Sheet } from '@/primitives/Sheet';
import { SUBJECTS, LEARNING_STYLES, gradeLabel, honorsFor, topicsFor } from '@/data/curriculum';
import type { LearningStyleId, SubjectId } from '@/data/types';
import { useApp } from '@/state/AppState';
import { colors, spacing, type } from '@/theme';

type Step = 'intro' | 'subject' | 'grade' | 'topic' | 'style' | 'finishing';
const FLOW: Step[] = ['intro', 'subject', 'grade', 'topic', 'style'];

export default function Onboarding() {
  const router = useRouter();
  const { user, updateOnboarding, completeOnboarding } = useApp();
  const [step, setStep] = useState<Step>('intro');
  const [honorsOpen, setHonorsOpen] = useState(false);

  const selection = user?.onboarding;
  const subject = selection?.subject ?? null;
  const grade = selection?.grade ?? null;
  const topic = selection?.topic ?? null;
  const hasGrade = subject !== null && grade !== null;

  const topics = useMemo(() => (hasGrade ? topicsFor(subject!, grade!) : []), [hasGrade, subject, grade]);
  const honors = useMemo(() => (hasGrade ? honorsFor(subject!, grade!, topic) : null), [hasGrade, subject, grade, topic]);

  const index = FLOW.indexOf(step);
  const progress = step === 'finishing' ? 1 : Math.max(0, index) / (FLOW.length - 1);

  const advance = (from: Step) => {
    const i = FLOW.indexOf(from);
    setStep(FLOW[Math.min(i + 1, FLOW.length - 1)]);
  };
  const goBack = () => { const i = FLOW.indexOf(step); if (i > 0) setStep(FLOW[i - 1]); };

  const chooseSubject = (id: SubjectId) => { updateOnboarding({ subject: id, grade: null, topic: null, honorsTrack: null }); setTimeout(() => advance('subject'), 260); };
  const chooseGrade = (g: number) => { updateOnboarding({ grade: g, topic: null, honorsTrack: null }); setTimeout(() => advance('grade'), 260); };
  const chooseTopic = (t: string) => {
    updateOnboarding({ topic: t });
    const track = hasGrade ? honorsFor(subject!, grade!, t) : null;
    setTimeout(() => { if (track) setHonorsOpen(true); else advance('topic'); }, 260);
  };
  const resolveHonors = (take: boolean) => {
    updateOnboarding({ honorsTrack: take && honors ? honors.honorsName : null });
    setHonorsOpen(false);
    setTimeout(() => advance('topic'), 220);
  };
  const chooseStyle = (id: LearningStyleId) => {
    updateOnboarding({ learningStyle: id });
    setTimeout(() => {
      setStep('finishing');
      setTimeout(() => { completeOnboarding(); router.replace('/(tabs)/home'); }, 1750);
    }, 420);
  };

  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <View style={{ flex: 1 }}>
      <Ambient mood={subject === 'english' ? 'sunrise' : 'lavender'} animated={step === 'intro'} />
      <SafeAreaView style={{ flex: 1 }}>
        {step !== 'intro' && step !== 'finishing' && (
          <ScreenHeader
            onBack={index > 1 ? goBack : undefined}
            center={<View style={{ width: 180 }}><ProgressBar value={progress} size="sm" /></View>}
          />
        )}
        <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingBottom: 60 }}>
          <Content style={{ gap: 14 }}>
          {step === 'intro' && (
            <View style={{ gap: 14, paddingTop: 40 }}>
              <Text style={{ ...type.h1, color: colors.text }}>welcome, {firstName}</Text>
              <Text style={{ ...type.body, color: colors.textSecondary }}>
                let's personalize Lumina for you. four quick questions, then we'll see what you already know.
              </Text>
              <Button full onPress={() => setStep('subject')} trailing={<Ionicons name="arrow-forward" size={20} color={colors.white} />}>let's go</Button>
            </View>
          )}
          {step === 'subject' && (
            <View style={{ gap: 12 }}>
              <Text style={{ ...type.h1, color: colors.text }}>what do you want to learn?</Text>
              <Text style={{ ...type.body, color: colors.textSecondary }}>you can add the other one later.</Text>
              {SUBJECTS.map(s => (
                <OptionControl
                  key={s.id}
                  selected={subject === s.id}
                  onSelect={() => chooseSubject(s.id)}
                  title={s.label}
                  caption={s.caption}
                  accent={s.id === 'math' ? colors.lavender : colors.pink}
                  visual={<Ionicons name={s.id === 'math' ? 'calculator' : 'book'} size={22} color={colors.text} />}
                />
              ))}
            </View>
          )}
          {step === 'grade' && subject && (
            <View style={{ gap: 12 }}>
              <Text style={{ ...type.h1, color: colors.text }}>{subject === 'math' ? 'what grade are you working at?' : 'what level are you working at?'}</Text>
              <Text style={{ ...type.body, color: colors.textSecondary }}>pick where you are now, not where you're meant to be.</Text>
              {SUBJECTS.find(s => s.id === subject)!.grades.map(g => (
                <OptionControl
                  key={g}
                  layout="pill"
                  selected={grade === g}
                  onSelect={() => chooseGrade(g)}
                  title={gradeLabel(g)}
                  accent={subject === 'math' ? colors.lavender : colors.pink}
                />
              ))}
            </View>
          )}
          {step === 'topic' && (
            <View style={{ gap: 12 }}>
              <Text style={{ ...type.h1, color: colors.text }}>what are you working on?</Text>
              <Text style={{ ...type.body, color: colors.textSecondary }}>these are the {grade !== null ? gradeLabel(grade!) : ''} topics.</Text>
              {topics.map(t => (
                <OptionControl
                  key={t.id}
                  selected={topic === t.id}
                  onSelect={() => chooseTopic(t.id)}
                  title={t.label}
                  caption={t.caption}
                  accent={subject === 'math' ? colors.lavender : colors.pink}
                  visual={<Ionicons name="layers" size={22} color={colors.text} />}
                />
              ))}
            </View>
          )}
          {step === 'style' && (
            <View style={{ gap: 12 }}>
              <Text style={{ ...type.h1, color: colors.text }}>how do you learn best?</Text>
              <Text style={{ ...type.body, color: colors.textSecondary }}>this shapes how Lumina explains things to you.</Text>
              {LEARNING_STYLES.map(s => (
                <OptionControl
                  key={s.id}
                  selected={selection?.learningStyle === s.id}
                  onSelect={() => chooseStyle(s.id)}
                  title={s.label}
                  caption={s.caption}
                  accent={colors.blue}
                  visual={<Ionicons name="compass" size={22} color={colors.text} />}
                />
              ))}
            </View>
          )}
          {step === 'finishing' && (
            <View style={{ paddingTop: 60, alignItems: 'center', gap: 20 }}>
              <Text style={{ ...type.h1, color: colors.text }}>your path is ready</Text>
              <View style={{ alignSelf: 'stretch' }}><ProgressBar value={1} /></View>
            </View>
          )}
          </Content>
        </ScrollView>
      </SafeAreaView>

      <Sheet open={honorsOpen} onDismiss={() => setHonorsOpen(false)}>
        <View style={{ gap: 12 }}>
          <Text style={{ ...type.caption, color: colors.deepPurple }}>available at your school</Text>
          <Text style={{ ...type.h2, color: colors.text }}>take honors?</Text>
          <Text style={{ ...type.h3, color: colors.primary }}>{honors?.honorsName}</Text>
          <Text style={{ ...type.body, color: colors.textSecondary }}>{honors?.description}</Text>
          <Button full onPress={() => resolveHonors(true)}>yes, continue</Button>
          <Button full variant="ghost" onPress={() => resolveHonors(false)}>not now</Button>
        </View>
      </Sheet>
    </View>
  );
}
