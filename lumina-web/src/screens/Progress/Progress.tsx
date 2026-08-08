import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Ambient, ProgressRing } from '@/components/ui';
import { MISCONCEPTIONS } from '@/data/lessons';
import { useApp } from '@/store/AppState';
import { riseIn, stagger } from '@/theme';
import './Progress.css';

const SKILL_LABELS: Record<string, string> = {
  one_step_equations: 'one-step equations',
  two_step_equations: 'two-step equations',
  distribution: 'distribution',
  multi_step_equations: 'multi-step equations',
  variables_both_sides: 'variables on both sides',
};

export function Progress() {
  const navigate = useNavigate();
  const { stats, wallet, path } = useApp();

  const done = path.filter((n) => n.status === 'complete').length;
  const completion = path.length > 0 ? done / path.length : 0;

  const strengths = Object.entries(stats.strengths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const growth = Object.entries(stats.misconceptions).sort((a, b) => b[1] - a[1]);

  const independence =
    stats.selfCorrections + stats.hintsUsed > 0
      ? stats.selfCorrections / (stats.selfCorrections + stats.hintsUsed)
      : 0;

  return (
    <div className="lm-screen lm-prog">
      <Ambient mood="blue" animated={false} />

      <div className="lm-screen-scroll">
        <motion.div className="lm-prog__inner" variants={stagger(0.04, 0.07)} initial="initial" animate="animate">
          <motion.header variants={riseIn} className="lm-content">
            <h1>your progress</h1>
            <p className="lm-lede">not just what you got right — how you got there.</p>
          </motion.header>

          {/* --- the headline figure ---------------------------------------- */}
          <motion.section variants={riseIn} className="lm-content lm-prog__hero">
            <ProgressRing value={completion} size={132} thickness={11} accent="var(--lm-primary)">
              <div className="lm-prog__hero-centre">
                <span className="lm-prog__hero-value">{Math.round(completion * 100)}%</span>
                <span className="lm-prog__hero-label">of your path</span>
              </div>
            </ProgressRing>

            <div className="lm-prog__figures">
              <Figure value={stats.problemsSolved} label="problems solved" />
              <Figure value={stats.selfCorrections} label="caught yourself" accent />
              <Figure value={wallet.lifetimePoints} label="points earned" />
            </div>
          </motion.section>

          {/* --- independence ------------------------------------------------ */}
          <motion.section variants={riseIn} className="lm-content lm-prog__band">
            <div className="lm-prog__band-head">
              <h3>working it out alone</h3>
              <span>{Math.round(independence * 100)}%</span>
            </div>
            <div className="lm-prog__meter">
              <motion.span
                className="lm-prog__meter-fill"
                initial={{ width: 0 }}
                animate={{ width: `${independence * 100}%` }}
                transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1], delay: 0.2 }}
              />
            </div>
            <p className="lm-prog__band-note">
              of the mistakes you hit, this is the share you fixed before asking for help.
            </p>
          </motion.section>

          {/* --- strengths and growth ---------------------------------------- */}
          <motion.section variants={riseIn} className="lm-content lm-prog__lists">
            <div>
              <h3>solid ground</h3>
              {strengths.length > 0 ? (
                <ul className="lm-prog__list">
                  {strengths.map(([skill]) => (
                    <li key={skill} className="lm-prog__pill lm-prog__pill--good">
                      {SKILL_LABELS[skill] ?? skill.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="lm-prog__empty">finish a lesson without hints and it will show up here.</p>
              )}
            </div>

            <div>
              <h3>worth another look</h3>
              {growth.length > 0 ? (
                <ul className="lm-prog__list">
                  {growth.map(([id, count]) => (
                    <li key={id} className="lm-prog__pill lm-prog__pill--watch">
                      {MISCONCEPTIONS[id]?.label ?? id.replace(/_/g, ' ')}
                      <span>{count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="lm-prog__empty">nothing tripping you up yet.</p>
              )}
            </div>
          </motion.section>

          {/* --- teacher summary --------------------------------------------- */}
          <motion.section variants={riseIn} className="lm-content">
            <button type="button" className="lm-prog__teacher" onClick={() => navigate('/teacher')}>
              <span>
                <strong>summary for your teacher</strong>
                <em>what Lumina noticed, in one page</em>
              </span>
              <ArrowRight size={20} strokeWidth={2.6} />
            </button>
          </motion.section>

          <div className="lm-nav-space" />
        </motion.div>
      </div>
    </div>
  );
}

function Figure({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className={['lm-prog__figure', accent ? 'is-accent' : ''].filter(Boolean).join(' ')}>
      <span className="lm-prog__figure-value">{value}</span>
      <span className="lm-prog__figure-label">{label}</span>
    </div>
  );
}
