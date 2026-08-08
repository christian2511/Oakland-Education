import { AnimatePresence, MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MISCONCEPTIONS } from '@/data/lessons';
import { LuminaOrb } from '@/primitives/LuminaOrb';
import type { TutorResponse } from '@/data/types';
import { colors, elevation, fonts, radii, type } from '@/theme';

export const MAX_HINT_LEVEL = 5;

export function TutorBubble({
  response, thinking, onMoreHelp, canAskMore = true,
}: {
  response: TutorResponse | null;
  thinking: boolean;
  onMoreHelp?: () => void;
  canAskMore?: boolean;
}) {
  const visible = thinking || !!response;
  const correct = response?.status === 'correct';
  const tentative = !!response && response.confidence < 0.55;

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 0, translateY: 22, scale: 0.96 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          exit={{ opacity: 0, translateY: 14, scale: 0.97 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          style={[{
            maxWidth: 480,
            backgroundColor: colors.glassBgStrong,
            borderColor: colors.glassBorder, borderWidth: 1,
            borderRadius: radii.hero,
            padding: 14,
            flexDirection: 'row', alignItems: 'flex-start', gap: 12,
          }, elevation.e3]}
        >
          <LuminaOrb state={thinking ? 'thinking' : correct ? 'correct' : 'speaking'} size={40} />
          <View style={{ flex: 1 }}>
            {thinking ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ ...type.body, color: colors.textSecondary }}>reading your working</Text>
                <Dots />
              </View>
            ) : response && (
              <>
                {response.misconception && !correct && (
                  <Text style={{ ...type.caption, color: colors.deepPurple, marginBottom: 4 }}>
                    {tentative ? 'this might be about ' : 'this looks like '}
                    <Text style={{ fontFamily: fonts.bold }}>{MISCONCEPTIONS[response.misconception]?.label ?? response.misconception}</Text>
                  </Text>
                )}
                <Text style={{ ...type.body, color: colors.text }}>{response.hint}</Text>
                {!correct && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }}>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {Array.from({ length: MAX_HINT_LEVEL }).map((_, i) => (
                        <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i < response.hintLevel ? colors.primary : colors.lineStrong }} />
                      ))}
                    </View>
                    {onMoreHelp && canAskMore && (
                      <Pressable onPress={onMoreHelp} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.softLavender, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill }}>
                        <Ionicons name="help-circle-outline" size={14} color={colors.deepPurple} />
                        <Text style={{ ...type.caption, color: colors.deepPurple }}>more help</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        </MotiView>
      )}
    </AnimatePresence>
  );
}

function Dots() {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <MotiView
          key={i}
          from={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{ loop: true, type: 'timing', duration: 900, delay: i * 150, easing: Easing.inOut(Easing.ease) }}
          style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }}
        />
      ))}
    </View>
  );
}
