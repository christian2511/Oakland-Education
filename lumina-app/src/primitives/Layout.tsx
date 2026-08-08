import { MotiView } from 'moti';
import type { ReactNode } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { spacing } from '../theme';

/**
 * Web's `.lm-content`: content column capped at 720dp and centered, so tablet
 * layouts read as a page rather than stretched edge-to-edge.
 */
export function Content({ children, wide, style }: { children: ReactNode; wide?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          width: '100%',
          maxWidth: wide ? 900 : 720,
          alignSelf: 'center',
          paddingHorizontal: spacing.gutter,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * Web's `riseIn` inside a `stagger` container: fade + rise with a per-index
 * delay, so sections arrive one after another instead of popping in as a block.
 */
export function Rise({ index = 0, children, style }: { index?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 26, stiffness: 260, delay: 60 + index * 70 }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
