import { Slot, useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabBar, type LuminaTab } from '@/primitives/TabBar';

export default function TabsLayout() {
  const segments = useSegments();
  const router = useRouter();
  const active = (segments[segments.length - 1] ?? 'home') as LuminaTab;

  return (
    <View style={{ flex: 1 }}>
      {/* Cross-fade + rise on tab change, mirroring the web's screenVariants. */}
      <MotiView
        key={active}
        from={{ opacity: 0, translateY: 18 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
        style={{ flex: 1 }}
      >
        <Slot />
      </MotiView>
      <SafeAreaView edges={['bottom']} pointerEvents="box-none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' }}>
        <View style={{ paddingBottom: 8 }}>
          <TabBar
            active={active}
            onSelect={(t) => router.replace(`/(tabs)/${t}` as any)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
