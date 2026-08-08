import type { ReactNode } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, elevation, radii } from '../theme';

export interface GlassProps {
  strong?: boolean;
  radius?: number;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * Floating glass surface. Reserved for nav, tool bars, tutor bubbles, floating
 * headers — never the canvas or ordinary cards. Uses expo-blur where possible;
 * outer border and shadow live on the wrapping View so blur clips cleanly.
 */
export function Glass({ strong, radius = radii.pill, intensity = 40, style, children }: GlassProps) {
  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.glassBorder,
          backgroundColor: strong ? colors.glassBgStrong : colors.glassBg,
        },
        elevation.e3,
        style,
      ]}
    >
      <BlurView intensity={intensity} tint="light" style={{ borderRadius: radius }}>
        {children}
      </BlurView>
    </View>
  );
}
