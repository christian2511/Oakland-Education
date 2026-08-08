import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { Ambient, Button, CircleButton, LuminaOrb } from '@/components/ui';
import { LearningPath } from '@/components/lesson/LearningPath';
import { useApp } from '@/store/AppState';
import type { PathNode } from '@/types/lesson';
import { riseIn, stagger } from '@/theme';
import './Home.css';

function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'good morning';
  if (h < 18) return 'good afternoon';
  return 'good evening';
}

/**
 * Home.
 *
 * An open composition: a greeting, one thing to do next, then the path
 * flowing away down the screen. No tile grid — the journey is the interface.
 */
export function Home() {
  const navigate = useNavigate();
  const { user, path, wallet, stats } = useApp();

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const subject = user?.onboarding.subject ?? 'math';
  const current = path.find((n) => n.status === 'current');
  const done = path.filter((n) => n.status === 'complete').length;

  const openNode = (node: PathNode) => {
    navigate(node.id === 'diagnostic' ? '/diagnostic' : `/lesson/${node.id}`);
  };

  return (
    <div className="lm-screen lm-home">
      <Ambient mood="warm" animated={false} />

      <div className="lm-screen-scroll">
        <motion.div className="lm-home__inner" variants={stagger(0.04, 0.07)} initial="initial" animate="animate">
          {/* --- greeting ------------------------------------------------- */}
          <motion.header variants={riseIn} className="lm-home__top lm-content">
            <div className="lm-home__greet">
              <p className="lm-home__hello">
                {greeting()}, <span>{firstName}</span>
              </p>
              <h1>
                {current
                  ? current.id === 'diagnostic'
                    ? "let's see where you're starting."
                    : `ready for a little ${subject}?`
                  : 'you have cleared the whole path.'}
              </h1>
            </div>

            <div className="lm-home__meta">
              <span className="lm-home__streak">
                <Flame size={16} strokeWidth={2.5} />
                {stats.streakDays}
              </span>
              <CircleButton label="your profile" tone="solid" onClick={() => navigate('/settings')}>
                <span className="lm-home__avatar">{firstName.charAt(0).toUpperCase()}</span>
              </CircleButton>
            </div>
          </motion.header>

          {/* --- the one thing to do next --------------------------------- */}
          {current && (
            <motion.section variants={riseIn} className="lm-content">
              <div className="lm-home__next" onClick={() => openNode(current)} role="presentation">
                <div className="lm-home__next-glow" aria-hidden="true" />

                <div className="lm-home__next-head">
                  <LuminaOrb state="idle" size={40} />
                  <div>
                    <p className="lm-home__next-kicker">next up</p>
                    <h2 className="lm-home__next-title">{current.title}</h2>
                  </div>
                </div>

                <p className="lm-home__next-sub">{current.subtitle}</p>

                <div className="lm-home__next-foot">
                  <span className="lm-home__chip">{current.problems.length} problems</span>
                  <span className="lm-home__chip">+{current.points} points</span>
                  <Button
                    size="md"
                    trailing={<ArrowRight size={19} strokeWidth={2.6} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openNode(current);
                    }}
                  >
                    start
                  </Button>
                </div>
              </div>
            </motion.section>
          )}

          {/* --- the journey ----------------------------------------------- */}
          <motion.section variants={riseIn} className="lm-home__journey">
            <div className="lm-content lm-home__journey-head">
              <h3>your path</h3>
              <span className="lm-home__journey-count">
                {done} of {path.length} done · {wallet.points} points
              </span>
            </div>

            <div className="lm-home__path lm-content-wide">
              <LearningPath nodes={path} onSelect={openNode} />
            </div>
          </motion.section>

          <div className="lm-nav-space" />
        </motion.div>
      </div>
    </div>
  );
}
