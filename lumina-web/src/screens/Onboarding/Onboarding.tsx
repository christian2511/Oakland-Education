import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass, Layers, Sigma } from 'lucide-react';
import { Ambient, Button, OptionControl, ProgressBar, Sheet } from '@/components/ui';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { WelcomeScene } from '@/components/illustrations';
import { LEARNING_STYLES, SUBJECTS, gradeLabel, honorsFor, topicsFor } from '@/data/curriculum';
import { useApp } from '@/store/AppState';
import type { LearningStyleId, SubjectId } from '@/types/user';
import { colors, riseIn, springs, stagger, transitions } from '@/theme';
import './Onboarding.css';

type Step = 'intro' | 'subject' | 'grade' | 'topic' | 'style' | 'finishing';

const FLOW: Step[] = ['intro', 'subject', 'grade', 'topic', 'style'];

export function Onboarding() {
  const navigate = useNavigate();
  const { user, updateOnboarding, completeOnboarding } = useApp();

  const [step, setStep] = useState<Step>('intro');
  const [honorsOpen, setHonorsOpen] = useState(false);

  const selection = user?.onboarding;
  const subject = selection?.subject ?? null;
  const grade = selection?.grade ?? null;
  const topic = selection?.topic ?? null;

  // Kindergarten is grade 0, so these guards test for null rather than truthiness.
  const hasGrade = subject !== null && grade !== null;

  const topics = useMemo(
    () => (hasGrade ? topicsFor(subject!, grade!) : []),
    [hasGrade, subject, grade],
  );

  const honors = useMemo(
    () => (hasGrade ? honorsFor(subject!, grade!, topic) : null),
    [hasGrade, subject, grade, topic],
  );

  const index = FLOW.indexOf(step);
  const progress = step === 'finishing' ? 1 : Math.max(0, index) / (FLOW.length - 1);

  const goBack = () => {
    const i = FLOW.indexOf(step);
    if (i <= 0) return;
    setStep(FLOW[i - 1]);
  };

  const advance = (from: Step) => {
    const i = FLOW.indexOf(from);
    setStep(FLOW[Math.min(i + 1, FLOW.length - 1)]);
  };

  const chooseSubject = (id: SubjectId) => {
    updateOnboarding({ subject: id, grade: null, topic: null, honorsTrack: null });
    window.setTimeout(() => advance('subject'), 260);
  };

  const chooseGrade = (g: number) => {
    updateOnboarding({ grade: g, topic: null, honorsTrack: null });
    window.setTimeout(() => advance('grade'), 260);
  };

  const chooseTopic = (t: string) => {
    updateOnboarding({ topic: t });
    // Honors is offered only where a real course exists for this combination.
    const track = hasGrade ? honorsFor(subject!, grade!, t) : null;
    window.setTimeout(() => {
      if (track) setHonorsOpen(true);
      else advance('topic');
    }, 260);
  };

  const resolveHonors = (take: boolean) => {
    updateOnboarding({ honorsTrack: take && honors ? honors.honorsName : null });
    setHonorsOpen(false);
    window.setTimeout(() => advance('topic'), 220);
  };

  const chooseStyle = (id: LearningStyleId) => {
    updateOnboarding({ learningStyle: id });
    window.setTimeout(() => {
      setStep('finishing');
      window.setTimeout(() => {
        completeOnboarding();
        navigate('/home');
      }, 1750);
    }, 420);
  };

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="lm-screen lm-onb">
      <Ambient mood={subject === 'english' ? 'sunrise' : 'lavender'} animated={step === 'intro'} />

      {step !== 'intro' && step !== 'finishing' && (
        <ScreenHeader
          onBack={index > 1 ? goBack : undefined}
          centre={
            <div className="lm-onb__progress">
              <ProgressBar value={progress} size="sm" label="onboarding progress" />
            </div>
          }
        />
      )}

      <div className="lm-onb__scroll lm-scroll">
        <AnimatePresence mode="wait">
          {/* --- intro ------------------------------------------------------ */}
          {step === 'intro' && (
            <motion.div key="intro" className="lm-onb__intro lm-content" {...stepMotion}>
              <motion.div variants={riseIn} className="lm-onb__scene">
                <WelcomeScene />
              </motion.div>
              <motion.h1 variants={riseIn}>welcome, {firstName}</motion.h1>
              <motion.p variants={riseIn} className="lm-lede">
                let's personalize Lumina for you. four quick questions, then we'll see what you already know.
              </motion.p>
              <motion.div variants={riseIn} className="lm-onb__intro-cta">
                <Button full trailing={<ArrowRight size={20} strokeWidth={2.6} />} onClick={() => setStep('subject')}>
                  let's go
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* --- subject ---------------------------------------------------- */}
          {step === 'subject' && (
            <motion.div key="subject" className="lm-onb__step lm-content" {...stepMotion}>
              <Question title="what do you want to learn?" caption="you can add the other one later." />
              <motion.div variants={riseIn} className="lm-onb__options" role="radiogroup" aria-label="subject">
                {SUBJECTS.map((s) => (
                  <OptionControl
                    key={s.id}
                    title={s.label}
                    caption={s.caption}
                    selected={subject === s.id}
                    onSelect={() => chooseSubject(s.id)}
                    accent={s.id === 'math' ? colors.lavender : colors.pink}
                    visual={s.id === 'math' ? <Sigma size={26} strokeWidth={2.2} /> : <BookOpen size={26} strokeWidth={2.2} />}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* --- grade ------------------------------------------------------ */}
          {step === 'grade' && subject && (
            <motion.div key="grade" className="lm-onb__step lm-content" {...stepMotion}>
              <Question
                title={subject === 'math' ? 'what grade are you working at?' : 'what level are you working at?'}
                caption="pick where you are now, not where you're meant to be."
              />
              <motion.div variants={riseIn} className="lm-onb__grid" role="radiogroup" aria-label="grade">
                {SUBJECTS.find((s) => s.id === subject)!.grades.map((g) => (
                  <OptionControl
                    key={g}
                    layout="pill"
                    title={gradeLabel(g)}
                    selected={grade === g}
                    onSelect={() => chooseGrade(g)}
                    accent={subject === 'math' ? colors.lavender : colors.pink}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* --- topic ------------------------------------------------------ */}
          {step === 'topic' && (
            <motion.div key="topic" className="lm-onb__step lm-content" {...stepMotion}>
              <Question
                title="what are you working on?"
                caption={`these are the ${grade !== null ? gradeLabel(grade) : ''} topics.`}
              />
              <motion.div variants={riseIn} className="lm-onb__options" role="radiogroup" aria-label="topic">
                {topics.map((t) => (
                  <OptionControl
                    key={t.id}
                    title={t.label}
                    caption={t.caption}
                    selected={topic === t.id}
                    onSelect={() => chooseTopic(t.id)}
                    accent={subject === 'math' ? colors.lavender : colors.pink}
                    visual={<Layers size={22} strokeWidth={2.2} />}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* --- learning style --------------------------------------------- */}
          {step === 'style' && (
            <motion.div key="style" className="lm-onb__step lm-content" {...stepMotion}>
              <Question title="how do you learn best?" caption="this shapes how Lumina explains things to you." />
              <motion.div variants={riseIn} className="lm-onb__options" role="radiogroup" aria-label="learning style">
                {LEARNING_STYLES.map((s) => (
                  <OptionControl
                    key={s.id}
                    title={s.label}
                    caption={s.caption}
                    selected={selection?.learningStyle === s.id}
                    onSelect={() => chooseStyle(s.id)}
                    accent={colors.blue}
                    visual={<Compass size={22} strokeWidth={2.2} />}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* --- completion -------------------------------------------------- */}
          {step === 'finishing' && (
            <motion.div
              key="finishing"
              className="lm-onb__finish"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: 'blur(8px)' }}
              transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <motion.div
                className="lm-onb__finish-ring"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springs.surface}
              />
              <motion.h2
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.45 }}
              >
                your path is ready
              </motion.h2>
              <motion.div className="lm-onb__finish-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <ProgressBar value={1} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- honors ------------------------------------------------------- */}
      <Sheet open={honorsOpen} labelledBy="honors-title">
        <div className="lm-onb__honors">
          <span className="lm-onb__honors-tag">available at your school</span>
          <h3 id="honors-title">take honors?</h3>
          <p className="lm-onb__honors-name">{honors?.honorsName}</p>
          <p className="lm-onb__honors-desc">{honors?.description}</p>
          <div className="lm-onb__honors-actions">
            <Button full onClick={() => resolveHonors(true)}>
              yes, continue
            </Button>
            <Button variant="ghost" full onClick={() => resolveHonors(false)}>
              not now
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function Question({ title, caption }: { title: string; caption: string }) {
  return (
    <motion.div variants={riseIn} className="lm-onb__question">
      <h1>{title}</h1>
      <p className="lm-lede">{caption}</p>
    </motion.div>
  );
}

const stepMotion = {
  variants: stagger(0.04, 0.055),
  initial: 'initial' as const,
  animate: 'animate' as const,
  exit: { opacity: 0, y: -18, filter: 'blur(6px)', transition: transitions.quick },
};
