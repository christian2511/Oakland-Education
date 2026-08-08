import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import Animated, { useAnimatedProps, useDerivedValue, withSpring } from 'react-native-reanimated';
import { Ambient } from '@/primitives/Ambient';
import { Button } from '@/primitives/Button';
import { LuminaOrb } from '@/primitives/LuminaOrb';
import { colors, fonts, spacing, type } from '@/theme';
import type { Lesson, LessonResult } from '@/data/types';
import { TextInput } from 'react-native';

const AnimatedText = Animated.createAnimatedComponent(TextInput);

export function LessonComplete({ lesson, result, onContinue }: { lesson: Lesson; result: LessonResult; onContinue: () => void }) {
  const [ready, setReady] = useState(false);
  const [target, setTarget] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setTarget(result.pointsEarned), 420);
    const t2 = setTimeout(() => setReady(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [result.pointsEarned]);

  const spring = useDerivedValue(() => withSpring(target, { damping: 22, stiffness: 90 }), [target]);
  const props = useAnimatedProps(() => ({ text: `+${Math.round(spring.value)}` } as any));

  return (
    <View style={{ flex: 1 }}>
      <Ambient mood="lavender" />
      <SafeAreaView style={{ flex: 1, paddingHorizontal: spacing.gutter }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <MotiView
            from={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
            style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: colors.softLavender, alignItems: 'center', justifyContent: 'center' }}
          >
            <LuminaOrb state="correct" size={100} />
          </MotiView>
          <Text style={{ ...type.h1, color: colors.text, textAlign: 'center' }}>
            {lesson.kind === 'diagnostic' ? 'that tells us a lot' : 'lesson complete'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
            <AnimatedText
              editable={false}
              underlineColorAndroid="transparent"
              style={{ ...type.display, color: colors.deepPurple, fontFamily: fonts.extrabold, padding: 0 }}
              animatedProps={props}
              defaultValue="+0"
            />
            <Text style={{ ...type.body, color: colors.textSecondary, paddingBottom: 14 }}>points</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 6 }}>
            {result.selfCorrections > 0 && (
              <Text style={{ ...type.body, color: colors.warning, fontFamily: fonts.semibold, textAlign: 'center' }}>
                you corrected {result.selfCorrections} {result.selfCorrections === 1 ? 'mistake' : 'mistakes'} yourself.
              </Text>
            )}
            <Text style={{ ...type.body, color: colors.textSecondary, textAlign: 'center' }}>
              {result.problemsSolved} of {result.problemsTotal} solved
              {result.hintsUsed === 0 ? ' · no hints needed' : ` · ${result.hintsUsed} hints`}
            </Text>
          </View>
        </View>
        <View style={{ paddingBottom: 24 }}>
          {ready && <Button full onPress={onContinue}>continue</Button>}
        </View>
      </SafeAreaView>
    </View>
  );
}
