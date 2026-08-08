import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Ambient } from '@/primitives/Ambient';
import { Button } from '@/primitives/Button';
import { Content, Rise } from '@/primitives/Layout';
import { Sheet } from '@/primitives/Sheet';
import { LEARNING_STYLES, gradeLabel } from '@/data/curriculum';
import { useApp } from '@/state/AppState';
import { colors, elevation, fonts, radii, type } from '@/theme';

export default function Settings() {
  const router = useRouter();
  const { user, preferences, updatePreferences, reset } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const o = user?.onboarding;
  const style = LEARNING_STYLES.find((s) => s.id === o?.learningStyle)?.label ?? 'not set';

  return (
    <View style={{ flex: 1 }}>
      <Ambient mood="calm" animated={false} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingBottom: 140 }}>
          <Content style={{ gap: 20 }}>
          <Rise index={0}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.softLavender, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ ...type.h2, color: colors.deepPurple, fontFamily: fonts.extrabold }}>{(user?.name ?? '?').charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={{ ...type.h2, color: colors.text }}>{user?.name ?? 'you'}</Text>
              <Text style={{ ...type.caption, color: colors.textSecondary }}>
                {user?.accountKind === 'guest' ? 'guest — progress is on this device only' : user?.email ?? 'signed in'}
              </Text>
            </View>
          </View>
          </Rise>

          {user?.accountKind === 'guest' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.softLavender, padding: 16, borderRadius: radii.lg }}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...type.label, color: colors.deepPurple, fontFamily: fonts.extrabold }}>keep your progress</Text>
                <Text style={{ ...type.caption, color: colors.textSecondary }}>make a free account and it follows you to any device.</Text>
              </View>
              <Button size="sm" onPress={() => router.push('/signup/email')}>create account</Button>
            </View>
          )}

          <Rise index={1}>
          <Section title="learning">
            <Row label="subject" value={o?.subject ?? 'not set'} onPress={() => router.push('/onboarding')} />
            <Row label="grade" value={o?.grade !== null && o?.grade !== undefined ? gradeLabel(o.grade) : 'not set'} onPress={() => router.push('/onboarding')} />
            <Row label="topic" value={o?.topic ?? 'not set'} onPress={() => router.push('/onboarding')} />
            {o?.honorsTrack && <Row label="track" value={o.honorsTrack} />}
            <Row label="how you learn" value={style} onPress={() => router.push('/onboarding')} />
          </Section>
          </Rise>

          <Rise index={2}>
          <Section title="appearance">
            <Toggle label="reduce motion" caption="fewer transitions and no drifting background." checked={preferences.reducedMotion} onChange={(v) => updatePreferences({ reducedMotion: v })} />
            <Toggle label="writing guides" caption="faint ruled lines on the workspace." checked={preferences.handwritingGuides} onChange={(v) => updatePreferences({ handwritingGuides: v })} />
          </Section>
          </Rise>

          <Rise index={3}>
          <Section title="app">
            <Toggle label="notifications" caption="a nudge when it has been a while." checked={preferences.notifications} onChange={(v) => updatePreferences({ notifications: v })} />
            <Toggle label="sound" caption="quiet feedback on success." checked={preferences.soundEffects} onChange={(v) => updatePreferences({ soundEffects: v })} />
            <Row label="summary for your teacher" onPress={() => router.push('/teacher')} />
            <Row label="our mission" onPress={() => router.push('/mission')} />
            <Row label="about Lumina" value="1.0" />
          </Section>
          </Rise>

          <Rise index={4}>
          <Section title="demo">
            <Toggle label="always read as solved" caption="handwriting recognition is mocked for now — turn this on to walk the clean path." checked={preferences.demoAlwaysCorrect} onChange={(v) => updatePreferences({ demoAlwaysCorrect: v })} />
          </Section>
          </Rise>

          <Rise index={5}>
          <Pressable onPress={() => setConfirmReset(true)} style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={{ ...type.label, color: colors.error, fontFamily: fonts.extrabold }}>reset everything</Text>
          </Pressable>
          </Rise>
          </Content>
        </ScrollView>
      </SafeAreaView>

      <Sheet open={confirmReset} onDismiss={() => setConfirmReset(false)}>
        <View style={{ gap: 12 }}>
          <Text style={{ ...type.h2, color: colors.text }}>reset everything?</Text>
          <Text style={{ ...type.body, color: colors.textSecondary }}>
            this clears your account, your path and every point you have earned on this device. it cannot be undone.
          </Text>
          <Button full onPress={() => { setConfirmReset(false); reset(); router.replace('/'); }}>yes, reset</Button>
          <Button full variant="ghost" onPress={() => setConfirmReset(false)}>cancel</Button>
        </View>
      </Sheet>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ ...type.caption, color: colors.textSecondary }}>{title}</Text>
      <View style={[{ backgroundColor: colors.white, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line }, elevation.e1]}>
        {children}
      </View>
    </View>
  );
}

function Row({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 }}
    >
      <Text style={{ ...type.body, color: colors.text }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {value && <Text style={{ ...type.body, color: colors.textSecondary }}>{value}</Text>}
        {onPress && <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />}
      </View>
    </Pressable>
  );
}

function Toggle({ label, caption, checked, onChange }: { label: string; caption: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!checked)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ ...type.body, color: colors.text }}>{label}</Text>
        <Text style={{ ...type.caption, color: colors.textSecondary }}>{caption}</Text>
      </View>
      <MotiView
        animate={{ backgroundColor: checked ? colors.primary : colors.lineStrong }}
        style={{ width: 48, height: 28, borderRadius: 14, padding: 2 }}
      >
        <MotiView
          animate={{ translateX: checked ? 20 : 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 520 }}
          style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white }}
        />
      </MotiView>
    </Pressable>
  );
}
