import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Lock, Sparkles } from 'lucide-react';
import { Ambient, Button } from '@/components/ui';
import { CloseButton } from '@/components/ui/CloseButton';
import { Collectible } from '@/components/illustrations';
import { SHOP_ITEMS } from '@/data/shop';
import { useApp } from '@/store/AppState';
import type { ShopItem } from '@/types/rewards';
import { riseIn, springs, stagger } from '@/theme';
import './Shop.css';

/** Which badges the student's own behaviour has unlocked. */
function badgeEarned(id: string, stats: ReturnType<typeof useApp>['stats']): boolean {
  switch (id) {
    case 'badge-self-correct':
      return stats.selfCorrections >= 5;
    case 'badge-independent':
      return stats.hintFreeLessons >= 1;
    case 'badge-distribution':
      return (stats.strengths['distribution'] ?? 0) > 0;
    case 'badge-checkpoint':
      return stats.lessonsCompleted >= 5;
    default:
      return false;
  }
}

/**
 * The collection — everything on one shelf.
 *
 * No categories to click through: a student should be able to see the whole
 * set at once, including the things they have not unlocked yet, because the
 * locked ones are half the motivation.
 */
export function Shop() {
  const { wallet, stats, purchase } = useApp();
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [justBought, setJustBought] = useState<string | null>(null);

  const owned = (item: ShopItem) =>
    item.earnedOnly ? badgeEarned(item.id, stats) : wallet.owned.includes(item.id);

  const unlockedCount = SHOP_ITEMS.filter(owned).length;

  const buy = (item: ShopItem) => {
    if (purchase(item.id, item.cost)) {
      setJustBought(item.id);
      window.setTimeout(() => setJustBought(null), 1200);
    }
    setSelected(null);
  };

  return (
    <div className="lm-screen lm-shop">
      <Ambient mood="calm" animated={false} />

      <div className="lm-screen-scroll">
        <motion.div className="lm-shop__inner" variants={stagger(0.04, 0.05)} initial="initial" animate="animate">
          <motion.header variants={riseIn} className="lm-content lm-shop__head">
            <div>
              <h1>collection</h1>
              <p className="lm-lede">
                {unlockedCount} of {SHOP_ITEMS.length} unlocked
              </p>
            </div>
            <motion.div
              className="lm-shop__wallet"
              // The wallet reacts when a purchase lands, so spending feels felt.
              animate={justBought ? { scale: [1, 1.12, 1], rotate: [0, -3, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <span className="lm-shop__wallet-value">{wallet.points}</span>
              <span className="lm-shop__wallet-label">points</span>
            </motion.div>
          </motion.header>

          <div className="lm-shop__grid lm-content-wide">
            {SHOP_ITEMS.map((item, i) => {
              const have = owned(item);
              const locked = item.earnedOnly && !have;
              const affordable = wallet.points >= item.cost;

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  className={['lm-shop__item', locked ? 'is-locked' : '', have ? 'is-owned' : '']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setSelected(item)}
                  initial={{ opacity: 0, y: 22, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ ...springs.enter, delay: 0.06 + i * 0.04 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {/* Each piece drifts on its own cycle so the shelf feels alive. */}
                  <motion.span
                    className="lm-shop__art"
                    animate={locked ? {} : { y: [0, -5, 0] }}
                    transition={{ duration: 3.4 + (i % 5) * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                  >
                    <Collectible shape={item.shape} palette={item.palette} size={92} muted={locked} />
                  </motion.span>

                  <span className="lm-shop__name">{item.name}</span>

                  <span
                    className={[
                      'lm-shop__cost',
                      have ? 'is-have' : '',
                      !have && !locked && !affordable ? 'is-short' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {locked ? (
                      <>
                        <Lock size={12} strokeWidth={2.8} />
                        {item.requirement}
                      </>
                    ) : have ? (
                      <>
                        <Check size={12} strokeWidth={3.2} />
                        {item.earnedOnly ? 'earned' : 'yours'}
                      </>
                    ) : (
                      `${item.cost} points`
                    )}
                  </span>

                  <AnimatePresence>
                    {justBought === item.id && (
                      <motion.span
                        className="lm-shop__burst"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1.6, opacity: [0, 0.8, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.9 }}
                        aria-hidden="true"
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          <div className="lm-nav-space" />
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="lm-shop__scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              className="lm-shop__detail"
              initial={{ y: 60, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.97 }}
              transition={springs.surface}
              role="dialog"
              aria-label={selected.name}
            >
              <div className="lm-shop__detail-close">
                <CloseButton label="close" tone="solid" size="sm" onClose={() => setSelected(null)} />
              </div>

              <motion.div
                animate={{ y: [0, -7, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Collectible shape={selected.shape} palette={selected.palette} size={132} />
              </motion.div>

              <h3>{selected.name}</h3>
              <p>{selected.description}</p>

              {selected.earnedOnly ? (
                owned(selected) ? (
                  <Button variant="soft" full leading={<Sparkles size={18} strokeWidth={2.4} />} onClick={() => setSelected(null)}>
                    earned
                  </Button>
                ) : (
                  <Button variant="secondary" full disabled>
                    {selected.requirement} to unlock
                  </Button>
                )
              ) : wallet.owned.includes(selected.id) ? (
                <Button variant="soft" full onClick={() => setSelected(null)}>
                  already yours
                </Button>
              ) : (
                <Button full disabled={wallet.points < selected.cost} onClick={() => buy(selected)}>
                  {wallet.points < selected.cost
                    ? `${selected.cost - wallet.points} more points needed`
                    : `unlock for ${selected.cost}`}
                </Button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
