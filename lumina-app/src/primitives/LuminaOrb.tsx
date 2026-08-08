import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

export type OrbState = 'idle' | 'thinking' | 'speaking' | 'correct' | 'attention';

const ACCENT: Record<OrbState, { core: string; halo: string }> = {
  idle:      { core: colors.lavender, halo: colors.softLavender },
  thinking:  { core: colors.blue,     halo: colors.softBlue },
  speaking:  { core: colors.primary,  halo: colors.softLavender },
  correct:   { core: colors.success,  halo: colors.green },
  attention: { core: colors.warning,  halo: colors.yellow },
};

/** Lumina's AI, drawn as light rather than a face. */
export function LuminaOrb({ state = 'idle', size = 44 }: { state?: OrbState; size?: number }) {
  const accent = ACCENT[state];
  const thinking = state === 'thinking';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Halo */}
      <MotiView
        from={{ scale: 1, opacity: 0.4 }}
        animate={{ scale: thinking ? 1.16 : 1.07, opacity: thinking ? 0.22 : 0.32 }}
        transition={{ loop: true, type: 'timing', duration: thinking ? 1500 : 3400, easing: Easing.inOut(Easing.ease) }}
        style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: accent.halo }}
      />
      {/* Orbiting ring */}
      <MotiView
        from={{ rotate: '0deg' }}
        animate={{ rotate: '360deg' }}
        transition={{ loop: true, type: 'timing', duration: thinking ? 2600 : 9000, easing: Easing.linear }}
        style={{ position: 'absolute', width: size, height: size }}
      >
        <View style={{
          width: size, height: size, borderRadius: size / 2,
          borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.55)',
        }} />
        <View style={{
          position: 'absolute', width: size * 0.10, height: size * 0.10, borderRadius: size * 0.05,
          backgroundColor: accent.core, top: size * 0.45, right: 0,
          shadowColor: accent.core, shadowOpacity: 0.6, shadowRadius: 6,
        }} />
      </MotiView>
      {/* Core */}
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: thinking ? 0.92 : 1.04 }}
        transition={{ loop: true, type: 'timing', duration: thinking ? 1500 : 3400, easing: Easing.inOut(Easing.ease) }}
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 60 60">
          <Defs>
            <RadialGradient id="core" cx="0.34" cy="0.28" r="0.7">
              <Stop stopColor="#FFFFFF" />
              <Stop offset="1" stopColor={accent.core} />
            </RadialGradient>
          </Defs>
          <Circle cx={30} cy={30} r={28} fill="url(#core)" />
          <Circle cx={22} cy={20} r={3.6} fill="rgba(255,255,255,0.9)" />
        </Svg>
      </MotiView>
    </View>
  );
}
