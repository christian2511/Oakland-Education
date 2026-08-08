import Ionicons from '@expo/vector-icons/Ionicons';
import { MotiView } from 'moti';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, radii, type } from '../theme';

export function Requirement({ met, children }: { met: boolean; children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <MotiView
        animate={{ backgroundColor: met ? colors.success : 'transparent', borderColor: met ? colors.success : colors.lineStrong }}
        style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' }}
      >
        {met ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}
      </MotiView>
      <Text style={{ ...type.body, color: met ? colors.success : colors.textTertiary }}>{children}</Text>
    </View>
  );
}

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingVertical: 8, paddingHorizontal: 6, borderRadius: radii.sm,
      }}
    >
      <MotiView
        animate={{ backgroundColor: checked ? colors.primary : colors.white, borderColor: checked ? colors.primary : colors.lineStrong }}
        style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' }}
      >
        {checked ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
      </MotiView>
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  );
}
