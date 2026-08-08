import { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Ambient } from '@/primitives/Ambient';
import { Button } from '@/primitives/Button';
import { Collectible } from '@/primitives/Collectible';
import { Content, Rise } from '@/primitives/Layout';
import { Sheet } from '@/primitives/Sheet';
import { SHOP_ITEMS } from '@/data/shop';
import type { ShopItem } from '@/data/types';
import { useApp } from '@/state/AppState';
import { colors, elevation, fonts, radii, type } from '@/theme';

function badgeEarned(id: string, stats: { selfCorrections: number; hintFreeLessons: number; strengths: Record<string, number>; lessonsCompleted: number }): boolean {
  switch (id) {
    case 'badge-self-correct': return stats.selfCorrections >= 5;
    case 'badge-independent':  return stats.hintFreeLessons >= 1;
    case 'badge-distribution': return (stats.strengths['distribution'] ?? 0) > 0;
    case 'badge-checkpoint':   return stats.lessonsCompleted >= 5;
    default: return false;
  }
}

export default function Shop() {
  const { wallet, stats, purchase } = useApp();
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const { width } = useWindowDimensions();

  const owned = (item: ShopItem) => item.earnedOnly ? badgeEarned(item.id, stats) : wallet.owned.includes(item.id);
  const unlocked = SHOP_ITEMS.filter(owned).length;

  // Grid inside the 900dp wide content column, tiles ~170dp like the web.
  const contentW = Math.min(width, 900) - 44;
  const columns = Math.max(2, Math.floor(contentW / 180));
  const gap = 12;
  const tileW = (contentW - gap * (columns - 1)) / columns;

  return (
    <View style={{ flex: 1 }}>
      <Ambient mood="calm" animated={false} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingBottom: 140 }}>
          <Content wide>
            <Rise index={0}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <View>
                  <Text style={{ ...type.h1, color: colors.text }}>collection</Text>
                  <Text style={{ ...type.body, color: colors.textSecondary }}>{unlocked} of {SHOP_ITEMS.length} unlocked</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ ...type.h2, color: colors.deepPurple, fontFamily: fonts.extrabold }}>{wallet.points}</Text>
                  <Text style={{ ...type.caption, color: colors.textSecondary }}>points</Text>
                </View>
              </View>
            </Rise>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
              {SHOP_ITEMS.map((item, i) => (
                <ShopTile
                  key={item.id}
                  item={item}
                  index={i}
                  width={tileW}
                  owned={owned(item)}
                  affordable={wallet.points >= item.cost}
                  onPress={() => setSelected(item)}
                />
              ))}
            </View>
          </Content>
        </ScrollView>
      </SafeAreaView>

      <Sheet open={!!selected} onDismiss={() => setSelected(null)}>
        {selected && (
          <View style={{ alignItems: 'center', gap: 12, maxWidth: 480, alignSelf: 'center', width: '100%' }}>
            <Collectible shape={selected.shape} palette={selected.palette} size={120} />
            <Text style={{ ...type.h2, color: colors.text }}>{selected.name}</Text>
            <Text style={{ ...type.body, color: colors.textSecondary, textAlign: 'center' }}>{selected.description}</Text>
            {selected.earnedOnly && owned(selected) ? (
              <Button full variant="soft" onPress={() => setSelected(null)}>earned</Button>
            ) : selected.earnedOnly ? (
              <Button full variant="secondary" disabled>{selected.requirement} to unlock</Button>
            ) : wallet.owned.includes(selected.id) ? (
              <Button full variant="soft" onPress={() => setSelected(null)}>already yours</Button>
            ) : (
              <Button
                full
                disabled={wallet.points < selected.cost}
                onPress={() => { purchase(selected.id, selected.cost); setSelected(null); }}
              >
                {wallet.points < selected.cost ? `${selected.cost - wallet.points} more points needed` : `unlock for ${selected.cost}`}
              </Button>
            )}
          </View>
        )}
      </Sheet>
    </View>
  );
}

function ShopTile({ item, index, width, owned, affordable, onPress }: {
  item: ShopItem; index: number; width: number; owned: boolean; affordable: boolean; onPress: () => void;
}) {
  const locked = !!item.earnedOnly && !owned;
  return (
    <MotiView
      from={{ opacity: 0, translateY: 22, scale: 0.94 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 26, stiffness: 260, delay: 60 + index * 40 }}
      style={{ width }}
    >
      <Pressable
        onPress={onPress}
        style={[{
          backgroundColor: colors.white, borderRadius: radii.lg,
          paddingVertical: 16, paddingHorizontal: 10, gap: 8, alignItems: 'center',
          borderWidth: 1, borderColor: colors.line,
        }, elevation.e1]}
      >
        <MotiView
          from={{ translateY: 0 }}
          animate={locked ? { translateY: 0 } : { translateY: -5 }}
          transition={{ loop: !locked, type: 'timing', duration: 3400 + (index % 5) * 400, easing: Easing.inOut(Easing.ease), delay: index * 200 }}
        >
          <Collectible shape={item.shape} palette={item.palette} size={72} muted={locked} />
        </MotiView>
        <Text style={{ ...type.label, color: colors.text, textAlign: 'center' }} numberOfLines={1}>{item.name}</Text>
        {locked ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="lock-closed" size={11} color={colors.textTertiary} />
            <Text style={{ ...type.caption, color: colors.textTertiary }} numberOfLines={1}>{item.requirement}</Text>
          </View>
        ) : owned ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="checkmark" size={11} color={colors.success} />
            <Text style={{ ...type.caption, color: colors.success }}>{item.earnedOnly ? 'earned' : 'yours'}</Text>
          </View>
        ) : (
          <Text style={{ ...type.caption, color: affordable ? colors.deepPurple : colors.textTertiary }}>{item.cost} points</Text>
        )}
      </Pressable>
    </MotiView>
  );
}
