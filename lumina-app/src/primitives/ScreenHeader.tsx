import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { colors } from '../theme';
import { CircleButton } from './CircleButton';

export function ScreenHeader({
  onBack, center, end,
}: {
  onBack?: () => void;
  center?: ReactNode;
  end?: ReactNode;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
      {onBack ? (
        <CircleButton onPress={onBack} tone="glass" size="sm">
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </CircleButton>
      ) : (
        <View style={{ width: 44 }} />
      )}
      <View style={{ flex: 1, alignItems: 'center' }}>{center}</View>
      {end ?? <View style={{ width: 44 }} />}
    </View>
  );
}

export function CloseButton({ onPress, tone = 'glass', size = 'sm' }: { onPress: () => void; tone?: 'solid' | 'glass' | 'ghost'; size?: 'sm' | 'md' }) {
  return (
    <CircleButton onPress={onPress} tone={tone} size={size}>
      <Ionicons name="close" size={18} color={colors.text} />
    </CircleButton>
  );
}
