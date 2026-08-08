import Ionicons from '@expo/vector-icons/Ionicons';
import { MotiView } from 'moti';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, type } from '../theme';
import { Glass } from './Glass';

export type LuminaTab = 'home' | 'progress' | 'shop' | 'settings';

const TABS: Array<{ id: LuminaTab; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: 'home',     label: 'home',     icon: 'home' },
  { id: 'progress', label: 'progress', icon: 'compass' },
  { id: 'shop',     label: 'shop',     icon: 'storefront' },
  { id: 'settings', label: 'settings', icon: 'settings' },
];

export function TabBar({ active, onSelect }: { active: LuminaTab; onSelect: (t: LuminaTab) => void }) {
  return (
    <Glass strong radius={9999} style={{ paddingHorizontal: 8, paddingVertical: 8 }}>
      <View style={styles.row}>
        {TABS.map(t => (
          <Tab key={t.id} tab={t} active={active === t.id} onPress={() => onSelect(t.id)} />
        ))}
      </View>
    </Glass>
  );
}

function Tab({ tab, active, onPress }: { tab: (typeof TABS)[number]; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <MotiView
        animate={{ backgroundColor: active ? colors.primary : 'transparent' }}
        style={styles.tab}
      >
        <Ionicons name={tab.icon} size={22} color={active ? colors.white : colors.textSecondary} />
        <MotiView
          animate={{ width: active ? 84 : 0, marginLeft: active ? 6 : 0 }}
          style={{ overflow: 'hidden' }}
        >
          <Text
            numberOfLines={1}
            style={{ ...type.label, color: active ? colors.white : colors.textSecondary }}
          >
            {tab.label}
          </Text>
        </MotiView>
      </MotiView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tab: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.pill,
  },
});
