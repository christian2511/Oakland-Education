import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useDerivedValue, withSpring } from 'react-native-reanimated';
import { colors } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  value: number;
  size?: number;
  thickness?: number;
  accent?: string;
  trackOpacity?: number;
  children?: ReactNode;
}

export function ProgressRing({
  value, size = 92, thickness = 8, accent = colors.primary, trackOpacity = 0.2, children,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  const animated = useDerivedValue(() => withSpring(clamped, { damping: 22, stiffness: 90 }), [clamped]);
  const props = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animated.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={accent} strokeOpacity={trackOpacity}
          strokeWidth={thickness} fill="none" />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={r}
          stroke={accent} strokeWidth={thickness} fill="none"
          strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={props}
        />
      </Svg>
      {children}
    </View>
  );
}
