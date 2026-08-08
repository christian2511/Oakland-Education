import { MotiPressable } from 'moti/interactions';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, elevation, springs } from '../theme';

export type CircleButtonTone = 'solid' | 'glass' | 'ghost';
export type CircleButtonSize = 'sm' | 'md';

export interface CircleButtonProps {
  onPress?: () => void;
  tone?: CircleButtonTone;
  size?: CircleButtonSize;
  active?: boolean;
  disabled?: boolean;
  accent?: string;
  children: ReactNode;
}

export function CircleButton({
  onPress, tone = 'solid', size = 'md', active, disabled, accent, children,
}: CircleButtonProps) {
  const d = size === 'sm' ? 44 : 52;
  const bg = disabled
    ? colors.line
    : active
      ? withAlpha(accent ?? colors.primary, 0.14)
      : tone === 'glass'
        ? colors.glassBgStrong
        : tone === 'solid'
          ? colors.white
          : 'transparent';
  const border = active
    ? (accent ?? colors.primary)
    : tone === 'solid'
      ? colors.lineStrong
      : tone === 'glass'
        ? colors.glassBorder
        : 'transparent';

  return (
    <MotiPressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      animate={({ pressed }) => {
        'worklet';
        return { scale: pressed ? 0.92 : 1 };
      }}
      transition={springs.tap as any}
      style={[
        {
          width: d, height: d, borderRadius: d / 2,
          backgroundColor: bg, borderWidth: 1.5, borderColor: border,
          alignItems: 'center', justifyContent: 'center',
        },
        !disabled && elevation.e2,
      ]}
    >
      <View>{children}</View>
    </MotiPressable>
  );
}

/** Very small helper — we don't need a full color lib for one call. */
function withAlpha(hex: string, alpha: number): string {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const _s = StyleSheet.create({}); // keeps StyleSheet import used if needed later
