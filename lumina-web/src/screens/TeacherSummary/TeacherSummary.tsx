import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Ambient } from '@/components/ui';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { gradeLabel } from '@/data/curriculum';
import { MISCONCEPTIONS } from '@/data/lessons';
import { useApp } from '@/store/AppState';
import { riseIn, stagger } from '@/theme';
import './TeacherSummary.css';

const SKILL_LABELS: Record<string, string> = {
  one_step_equations: 'one-step equations',
  two_step_equations: 'two-step equations',
  distribution: 'distribution',
  multi_step_equations: 'multi-step equations',
  variables_both_sides: 'variables on both sides',
};

/**
 * One page a teacher can read in under a minute.
 *
 * The value here is not the score — it is the reasoning behind it, which no
 * teacher can watch across thirty students at once.
 */
export function TeacherSummary() {
  const navigate = useNavigate();
  const { user, stats, path } = useApp();

  const strengths = Object.entries(stats.strengths)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => SKILL_LABELS[skill] ?? skill.replace(/_/g, ' '));

  const misconceptions = Object.entries(stats.misconceptions).sort((a, b) => b[1] - a[1]);

  const attempted = stats.selfCorrections + stats.hintsUsed;
  const grade = user?.onboarding.grade;
  const topic = user?.onboarding.topic;

  const suggestion =
    misconceptions.length > 0
      ? `Review ${MISCONCEPTIONS[misconceptions[0][0]]?.label ?? misconceptions[0][0]} before moving on to multi-step equations.`
      : stats.lessonsCompleted === 0
        ? 'No working observed yet. The diagnostic will produce a first read.'
        : 'No recurring misconception so far. Ready to move on.';

  return (
    <div className="lm-screen lm-teach">
      <Ambient mood="calm" animated={false} />
      <ScreenHeader onBack={() => navigate(-1)} />

      <div className="lm-screen-scroll">
        <motion.div
          className="lm-teach__inner lm-content"
          variants={stagger(0.04, 0.07)}
          initial="initial"
          animate="animate"
        >
          <motion.header variants={riseIn} className="lm-teach__head">
            <span className="lm-teach__kicker">teacher summary</span>
            <h1>{user?.name ?? 'student'}</h1>
            <p className="lm-teach__meta">
              {grade !== null && grade !== undefined ? gradeLabel(grade) : 'grade not set'}
              {topic ? ` · ${topic}` : ''} · {stats.lessonsCompleted} lessons completed
            </p>
          </motion.header>

          <motion.section variants={riseIn} className="lm-teach__block">
            <h2>strengths</h2>
            {strengths.length > 0 ? (
              <ul>
                {strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="lm-teach__none">not enough clean work yet to call anything a strength.</p>
            )}
          </motion.section>

          <motion.section variants={riseIn} className="lm-teach__block lm-teach__block--watch">
            <h2>misconceptions</h2>
            {misconceptions.length > 0 ? (
              <ul className="lm-teach__detail">
                {misconceptions.map(([id, count]) => (
                  <li key={id}>
                    <strong>{MISCONCEPTIONS[id]?.label ?? id.replace(/_/g, ' ')}</strong>
                    <span>{MISCONCEPTIONS[id]?.description ?? ''}</span>
                    <em>
                      observed {count} {count === 1 ? 'time' : 'times'}
                    </em>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="lm-teach__none">none observed.</p>
            )}
          </motion.section>

          <motion.section variants={riseIn} className="lm-teach__block">
            <h2>learning behaviour</h2>
            <ul>
              <li>
                corrected {stats.selfCorrections} of {attempted} mistakes independently
              </li>
              <li>requested {stats.hintsUsed} hints</li>
              <li>
                completed {stats.lessonsCompleted} of {path.length} path stages
              </li>
              <li>solved {stats.problemsSolved} problems</li>
            </ul>
          </motion.section>

          <motion.section variants={riseIn} className="lm-teach__suggest">
            <h2>suggested practice</h2>
            <p>{suggestion}</p>
          </motion.section>

          <div className="lm-nav-space" />
        </motion.div>
      </div>
    </div>
  );
}
