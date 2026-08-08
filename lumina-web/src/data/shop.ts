import type { ShopItem } from '@/types/rewards';

/**
 * The collection.
 *
 * One shelf, not four tabs. Earned badges come first because they are the
 * point — they are unlocked by behaviour Lumina actually observes (catching
 * your own mistakes, finishing without hints) rather than bought — and the
 * rest follows in rising cost.
 */
export const SHOP_ITEMS: ShopItem[] = [
  // --- earned through how you work ---
  {
    id: 'badge-self-correct',
    name: 'second look',
    description: 'for catching and fixing five of your own mistakes without asking for help.',
    category: 'badges',
    cost: 0,
    shape: 'star',
    palette: 'yellow',
    earnedOnly: true,
    requirement: '5 self-corrections',
  },
  {
    id: 'badge-independent',
    name: 'flying solo',
    description: 'for finishing a whole lesson without a single hint.',
    category: 'badges',
    cost: 0,
    shape: 'rocket',
    palette: 'blue',
    earnedOnly: true,
    requirement: 'a hint-free lesson',
  },
  {
    id: 'badge-distribution',
    name: 'the distributor',
    description: 'for clearing every distribution problem on the path.',
    category: 'badges',
    cost: 0,
    shape: 'lightning',
    palette: 'purple',
    earnedOnly: true,
    requirement: 'finish distribution',
  },
  {
    id: 'badge-checkpoint',
    name: 'checkpoint champion',
    description: 'for getting through your first checkpoint.',
    category: 'badges',
    cost: 0,
    shape: 'trophy',
    palette: 'yellow',
    earnedOnly: true,
    requirement: 'pass a checkpoint',
  },

  // --- stickers ---
  {
    id: 'sticker-planet',
    name: 'ringo',
    description: 'a little planet with a very big ring.',
    category: 'stickers',
    cost: 40,
    shape: 'planet',
    palette: 'blue',
  },
  {
    id: 'sticker-cloud',
    name: 'nimbus',
    description: 'a cheerful cloud for the top of your work.',
    category: 'stickers',
    cost: 40,
    shape: 'cloud',
    palette: 'lav',
  },
  {
    id: 'sticker-sprout',
    name: 'sprout',
    description: 'something small that is definitely growing.',
    category: 'stickers',
    cost: 45,
    shape: 'sprout',
    palette: 'green',
  },
  {
    id: 'sticker-heart',
    name: 'big heart',
    description: 'for the days you kept going anyway.',
    category: 'stickers',
    cost: 45,
    shape: 'heart',
    palette: 'pink',
  },
  {
    id: 'sticker-moon',
    name: 'crescent',
    description: 'a sleepy moon for late-night homework.',
    category: 'stickers',
    cost: 55,
    shape: 'moon',
    palette: 'lav',
  },
  {
    id: 'sticker-flame',
    name: 'spark',
    description: 'earn it, then keep the streak alive.',
    category: 'stickers',
    cost: 60,
    shape: 'flame',
    palette: 'orange',
  },

  // --- themes ---
  {
    id: 'theme-dusk',
    name: 'dusk',
    description: 'a deeper lavender across the whole app.',
    category: 'themes',
    cost: 120,
    shape: 'gem',
    palette: 'purple',
  },
  {
    id: 'theme-tide',
    name: 'tide',
    description: 'cool blues and a paler paper.',
    category: 'themes',
    cost: 120,
    shape: 'gem',
    palette: 'blue',
  },
  {
    id: 'theme-ember',
    name: 'ember',
    description: 'warm light and softer contrast.',
    category: 'themes',
    cost: 150,
    shape: 'gem',
    palette: 'orange',
  },

  // --- study rewards ---
  {
    id: 'reward-pen',
    name: 'ink set',
    description: 'three more pen colours on the board.',
    category: 'rewards',
    cost: 90,
    shape: 'crown',
    palette: 'pink',
  },
  {
    id: 'reward-break',
    name: 'a longer break',
    description: 'ten extra minutes between lessons.',
    category: 'rewards',
    cost: 100,
    shape: 'medal',
    palette: 'green',
  },
  {
    id: 'reward-pick',
    name: 'pick your path',
    description: 'choose the next lesson yourself instead of following the path.',
    category: 'rewards',
    cost: 130,
    shape: 'shield',
    palette: 'lav',
  },
];
