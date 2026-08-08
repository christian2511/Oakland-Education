import { MotiPressable } from 'moti/interactions';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, elevation, fonts, radii, springs } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  disabled?: boolean;
  accent?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}

/**
 * The primary control of the app. Primary/dark are lit from above and shaded
 * below (vertical gradient) so the pill reads as a moulded object, matching
 * the web's `.lm-btn--primary`.
 */
export function Button({
  onPress, variant = 'primary', size = 'lg', full, disabled, accent, leading, trailing, children,
}: ButtonProps) {
  const dims = SIZE[size];
  const base = accent ?? colors.primary;
  const paint = paintFor(variant, base, !!disabled);

  const inner = (
    <View style={[styles.row, { minHeight: dims.h, paddingHorizontal: dims.px }]}>
      {leading}
      <Text style={[styles.label, { color: paint.fg, fontSize: dims.fs }]}>{children}</Text>
      {trailing}
    </View>
  );

  return (
    <MotiPressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      animate={({ pressed }) => {
        'worklet';
        return { scale: pressed ? 0.972 : 1 };
      }}
      transition={springs.tap as any}
      style={[
        styles.base,
        paint.border ? { borderWidth: 2, borderColor: paint.border } : null,
        full && { alignSelf: 'stretch' },
        !disabled && variant !== 'ghost' && elevation.e2,
      ]}
    >
      {paint.gradient ? (
        <LinearGradient colors={paint.gradient as [string, string]} style={{ borderRadius: radii.pill }}>
          {inner}
        </LinearGradient>
      ) : (
        <View style={{ borderRadius: radii.pill, backgroundColor: paint.bg }}>{inner}</View>
      )}
    </MotiPressable>
  );
}

const SIZE = {
  sm: { h: 42, px: 18, fs: 15 },
  md: { h: 52, px: 24, fs: 16 },
  lg: { h: 60, px: 32, fs: 17 },
} as const;

interface Paint {
  gradient?: [string, string];
  bg?: string;
  fg: string;
  border?: string;
}

function paintFor(variant: ButtonVariant, accent: string, disabled: boolean): Paint {
  if (disabled) return { bg: 'rgba(37,35,42,0.08)', fg: colors.textTertiary };
  switch (variant) {
    case 'primary':
      return { gradient: [accent, darken(accent, 0.22)], fg: colors.white };
    case 'soft':
      return { bg: colors.softLavender, fg: colors.deepPurple };
    case 'secondary':
      return { bg: colors.white, fg: colors.text, border: colors.lineStrong };
    case 'ghost':
      return { bg: 'rgba(37,35,42,0.05)', fg: colors.text };
    case 'dark':
      return { gradient: [colors.text, '#1B1920'], fg: colors.white };
  }
}

/** Blend toward the web's #2F2560 shadow tone, like color-mix in Button.css. */
function darken(hex: string, t: number): string {
  const h = hex.replace('#', '');
  const target = { r: 0x2f, g: 0x25, b: 0x60 };
  const r = Math.round(parseInt(h.substring(0, 2), 16) * (1 - t) + target.r * t);
  const g = Math.round(parseInt(h.substring(2, 4), 16) * (1 - t) + target.g * t);
  const b = Math.round(parseInt(h.substring(4, 6), 16) * (1 - t) + target.b * t);
  return `rgb(${r}, ${g}, ${b})`;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontFamily: fonts.bold,
    letterSpacing: -0.24,
  },
});
