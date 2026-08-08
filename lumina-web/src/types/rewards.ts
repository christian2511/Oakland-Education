import type { CollectiblePalette, CollectibleShape } from '@/components/illustrations';

export type ShopCategory = 'badges' | 'stickers' | 'themes' | 'rewards';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  cost: number;
  shape: CollectibleShape;
  palette: CollectiblePalette;
  /** Badges are earned by behaviour, not bought. */
  earnedOnly?: boolean;
  requirement?: string;
}

export interface Wallet {
  points: number;
  lifetimePoints: number;
  owned: string[];
}

export type PointReason =
  | 'lesson_complete'
  | 'independent_solve'
  | 'self_correction'
  | 'challenge'
  | 'practice'
  | 'diagnostic';

export interface PointEvent {
  reason: PointReason;
  amount: number;
  label: string;
}
