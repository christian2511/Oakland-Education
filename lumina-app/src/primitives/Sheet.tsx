import { AnimatePresence, MotiView } from 'moti';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { colors, radii } from '../theme';

export interface SheetProps {
  open: boolean;
  onDismiss?: () => void;
  children: ReactNode;
}

export function Sheet({ open, onDismiss, children }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <View
          key="sheet"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
          pointerEvents="box-none"
        >
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.scrim }}
          >
            <Pressable style={{ flex: 1 }} onPress={onDismiss} />
          </MotiView>
          <MotiView
            from={{ translateY: 400 }}
            animate={{ translateY: 0 }}
            exit={{ translateY: 400 }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              backgroundColor: colors.white,
              borderTopLeftRadius: radii.hero, borderTopRightRadius: radii.hero,
              paddingHorizontal: 24, paddingVertical: 28,
              shadowColor: '#25232A', shadowOpacity: 0.24, shadowRadius: 44, shadowOffset: { width: 0, height: -20 },
              elevation: 24,
            }}
          >
            {children}
          </MotiView>
        </View>
      )}
    </AnimatePresence>
  );
}
