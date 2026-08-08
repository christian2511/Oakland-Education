import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

export type AmbientMood = 'warm' | 'lavender' | 'blue' | 'sunrise' | 'calm';

const MOODS: Record<AmbientMood, Array<{ c: string; x: string; y: string; s: number; o: number }>> = {
  warm: [
    { c: colors.softLavender, x: '-14%', y: '-10%', s: 460, o: 0.75 },
    { c: colors.washYellow,   x: '72%',  y: '4%',   s: 380, o: 0.60 },
    { c: colors.washBlue,     x: '48%',  y: '68%',  s: 500, o: 0.50 },
  ],
  lavender: [
    { c: colors.lavender,      x: '-18%', y: '-14%', s: 520, o: 0.40 },
    { c: colors.softLavender,  x: '62%',  y: '10%',  s: 440, o: 0.80 },
    { c: colors.washPink,      x: '20%',  y: '72%',  s: 420, o: 0.60 },
  ],
  blue: [
    { c: colors.softBlue,     x: '-12%', y: '2%',   s: 460, o: 0.55 },
    { c: colors.washLavender, x: '66%',  y: '-8%',  s: 480, o: 0.80 },
    { c: colors.washBlue,     x: '38%',  y: '70%',  s: 520, o: 0.70 },
  ],
  sunrise: [
    { c: colors.yellow,       x: '58%',  y: '-16%', s: 500, o: 0.42 },
    { c: colors.pink,         x: '-16%', y: '18%',  s: 420, o: 0.34 },
    { c: colors.softLavender, x: '30%',  y: '66%',  s: 520, o: 0.70 },
  ],
  calm: [
    { c: colors.washLavender, x: '-10%', y: '-8%',  s: 480, o: 0.90 },
    { c: colors.washBlue,     x: '68%',  y: '52%',  s: 460, o: 0.70 },
  ],
};

export interface AmbientProps {
  mood?: AmbientMood;
  animated?: boolean;
}

/** Large soft color fields behind a screen. Keeps every screen off plain white. */
export function Ambient({ mood = 'warm', animated = true }: AmbientProps) {
  const blobs = MOODS[mood];
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.background }}
    >
      {blobs.map((b, i) => (
        <MotiView
          key={i}
          from={{ translateX: 0, translateY: 0, scale: 1 }}
          animate={animated ? { translateX: 26, translateY: -18, scale: 1.06 } : undefined}
          transition={{ loop: true, type: 'timing', duration: 26000 + i * 7000, easing: Easing.inOut(Easing.ease), delay: i * 1500 }}
          style={{
            position: 'absolute',
            left: b.x as `${number}%`,
            top: b.y as `${number}%`,
            width: b.s, height: b.s,
            opacity: b.o,
          }}
        >
          <Svg width={b.s} height={b.s}>
            <Defs>
              <RadialGradient id={`ambient-${mood}-${i}`} cx="0.5" cy="0.5" r="0.5">
                <Stop offset="0" stopColor={b.c} stopOpacity="1" />
                <Stop offset="1" stopColor={b.c} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={b.s / 2} cy={b.s / 2} r={b.s / 2} fill={`url(#ambient-${mood}-${i})`} />
          </Svg>
        </MotiView>
      ))}
    </View>
  );
}
