import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Ambient, Button } from '@/components/ui';
import { DiagnosticScene } from '@/components/illustrations';
import { LessonRunner } from '@/screens/Lesson/LessonRunner';
import { lessonById } from '@/data/lessons';
import { useApp } from '@/store/AppState';
import { riseIn, stagger } from '@/theme';
import './Diagnostic.css';

/**
 * The first thing after onboarding.
 *
 * Framed as guided practice rather than a test: Lumina is watching the working,
 * not scoring the student, and the copy says so plainly before anything starts.
 */
export function Diagnostic() {
  const navigate = useNavigate();
  const { recordLesson } = useApp();
  const [started, setStarted] = useState(false);

  const lesson = lessonById('diagnostic');
  if (!lesson) return <Navigate to="/home" replace />;

  if (started) {
    return (
      <LessonRunner
        lesson={lesson}
        variant="diagnostic"
        onExit={() => navigate('/home')}
        onFinish={(result) => {
          recordLesson(result);
          navigate('/home');
        }}
      />
    );
  }

  return (
    <div className="lm-screen lm-diag">
      <Ambient mood="blue" />

      <motion.div
        className="lm-diag__body lm-content"
        variants={stagger(0.06, 0.09)}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={riseIn} className="lm-diag__scene">
          <DiagnosticScene />
        </motion.div>

        <motion.h1 variants={riseIn}>let's see what you already know.</motion.h1>

        <motion.p variants={riseIn} className="lm-lede">
          four problems. work them out by hand, the way you normally would — Lumina is reading your steps, not
          marking you. getting one wrong here is useful.
        </motion.p>

        <motion.ul variants={riseIn} className="lm-diag__points">
          <li>write your working, not just the answer</li>
          <li>take as long as you like</li>
          <li>ask for a hint whenever you want one</li>
        </motion.ul>

        <motion.div variants={riseIn} className="lm-diag__cta">
          <Button full trailing={<ArrowRight size={20} strokeWidth={2.6} />} onClick={() => setStarted(true)}>
            start
          </Button>
          <button type="button" className="lm-diag__skip" onClick={() => navigate('/home')}>
            skip for now
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
