import { MotiView } from 'moti';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { Text, View } from 'react-native';
import { colors, fonts, springs } from '../theme';

export function LuminaMark({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id="body" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#B9A5FF" />
          <Stop offset="0.55" stopColor="#8B6FF0" />
          <Stop offset="1" stopColor="#6951D8" />
        </LinearGradient>
        <RadialGradient id="core" cx="0.38" cy="0.32" r="0.72">
          <Stop stopColor="#FFFFFF" />
          <Stop offset="0.5" stopColor="#F5D98A" />
          <Stop offset="1" stopColor="#F5B6D2" />
        </RadialGradient>
      </Defs>
      <Path d="M24 2c12.15 0 22 9.85 22 22 0 12.15-9.85 22-22 22S2 36.15 2 24C2 11.85 11.85 2 24 2Z" fill="url(#body)" />
      <Path d="M24 2c12.15 0 22 9.85 22 22 0 12.15-9.85 22-22 22S2 36.15 2 24C2 11.85 11.85 2 24 2Z" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.4} />
      <Circle cx={24} cy={24} r={10.5} fill="url(#core)" />
      <Path d="M24 13.5a10.5 10.5 0 0 1 0 21 14 14 0 0 0 0-21Z" fill="rgba(105,81,216,0.28)" />
      <Circle cx={20.5} cy={20.5} r={3} fill="rgba(255,255,255,0.9)" />
    </Svg>
  );
}

export type WordmarkSize = 'md' | 'lg' | 'hero';

export interface WordmarkProps {
  /** How many characters revealed so far. Omit to show all six. */
  reveal?: number;
  size?: WordmarkSize;
  withMark?: boolean;
}

const WORD = 'lumina';

export function Wordmark({ reveal, size = 'lg', withMark = false }: WordmarkProps) {
  const shown = reveal === undefined ? WORD.length : reveal;
  const fontSize = size === 'hero' ? 84 : size === 'lg' ? 52 : 32;
  const markSize = size === 'hero' ? 56 : size === 'lg' ? 40 : 30;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {withMark && <LuminaMark size={markSize} />}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        {WORD.split('').map((ch, i) => (
          <MotiView
            key={i}
            from={{ opacity: 0, translateY: 20, scale: 0.85 }}
            animate={{
              opacity: i < shown ? 1 : 0,
              translateY: i < shown ? 0 : 20,
              scale: i < shown ? 1 : 0.85,
            }}
            transition={springs.enter as any}
          >
            <Text style={{ fontSize, fontFamily: fonts.extrabold, letterSpacing: -2, color: colors.text }}>
              {ch}
            </Text>
          </MotiView>
        ))}
      </View>
    </View>
  );
}
