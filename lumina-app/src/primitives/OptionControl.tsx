import { MotiPressable } from 'moti/interactions';
import { MotiView } from 'moti';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, elevation, radii, springs, type } from '../theme';

export interface OptionControlProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  caption?: string;
  visual?: ReactNode;
  accent?: string;
  layout?: 'row' | 'pill';
}

export function OptionControl({
  selected, onSelect, title, caption, visual, accent = colors.lavender, layout = 'row',
}: OptionControlProps) {
  return (
    <MotiPressable
      onPress={onSelect}
      animate={({ pressed }) => {
        'worklet';
        return {
          scale: pressed ? 0.978 : 1,
          translateY: selected ? -2 : 0,
        };
      }}
      transition={springs.tap as any}
      style={styles.wrap as any}
    >
      <MotiView
        animate={{
          backgroundColor: selected ? withAlpha(accent, 0.14) : colors.white,
          borderColor: selected ? accent : 'transparent',
        }}
        style={[styles.card, layout === 'pill' && styles.pillCard, elevation.e2]}
      >
        {visual ? <View style={[styles.visual, { backgroundColor: withAlpha(accent, 0.18) }]}>{visual}</View> : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
        <View style={[styles.dot, { backgroundColor: selected ? accent : colors.line, borderColor: selected ? accent : colors.lineStrong }]}>
          {selected ? <View style={styles.check} /> : null}
        </View>
      </MotiView>
    </MotiPressable>
  );
}

function withAlpha(hex: string, a: number) {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },
  card: {
    borderRadius: radii.lg,
    borderWidth: 2,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pillCard: { paddingVertical: 14 },
  visual: {
    width: 46, height: 46, borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { ...type.h3, color: colors.text },
  caption: { ...type.body, color: colors.textSecondary },
  dot: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  check: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.white },
});
