import { MotiView } from 'moti';
import { StyleSheet, View } from 'react-native';
import { colors, radii, springs } from '../theme';

export interface ProgressBarProps {
  value: number;
  accent?: string;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, accent = colors.primary, size = 'md' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const h = size === 'sm' ? 6 : 10;
  return (
    <View style={[styles.track, { height: h, backgroundColor: colors.line }]}>
      <MotiView
        from={{ width: '0%' }}
        animate={{ width: `${clamped * 100}%` as any }}
        transition={springs.surface as any}
        style={{ height: h, backgroundColor: accent, borderRadius: radii.pill }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', borderRadius: radii.pill, overflow: 'hidden' },
});
