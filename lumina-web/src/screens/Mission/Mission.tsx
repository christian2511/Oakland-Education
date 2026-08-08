import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Ambient, Button, LuminaMark } from '@/components/ui';
import { CloseButton } from '@/components/ui/CloseButton';
import { WelcomeScene } from '@/components/illustrations';
import { riseIn, stagger } from '@/theme';
import './Mission.css';

/**
 * Why Lumina exists.
 *
 * Reachable from settings and from the welcome screen. The statement is set as
 * one large block of type — it is the most important copy in the product, and
 * it should not be dressed up as a marketing card.
 */
export function Mission() {
  const navigate = useNavigate();

  return (
    <div className="lm-screen lm-mission">
      <Ambient mood="sunrise" />

      <div className="lm-mission__top">
        <CloseButton label="go back" onClose={() => navigate(-1)} />
      </div>

      <div className="lm-screen-scroll">
        <motion.div
          className="lm-mission__inner lm-content"
          variants={stagger(0.06, 0.1)}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={riseIn} className="lm-mission__mark">
            <LuminaMark size={54} />
          </motion.div>

          <motion.p variants={riseIn} className="lm-mission__kicker">
            our mission
          </motion.p>

          <motion.h1 variants={riseIn} className="lm-mission__lead">
            Every child deserves to read and do math with confidence, no matter their background.
          </motion.h1>

          <motion.p variants={riseIn} className="lm-mission__body">
            We built Lumina to give kids one-on-one learning support which adapts to a student's learning style.
            This same kind of personalized attention used to be only something which tutoring could offer — and now
            it's available to every student for free.
          </motion.p>

          <motion.div variants={riseIn} className="lm-mission__scene">
            <WelcomeScene />
          </motion.div>

          {/* The local reason this matters, stated plainly. */}
          <motion.div variants={riseIn} className="lm-mission__stat">
            <span className="lm-mission__stat-figure">1 in 4</span>
            <p>
              Oakland Unified students met or exceeded California's math standard in 2024&ndash;25. In a classroom of
              30, that is roughly 8 students.
            </p>
          </motion.div>

          <motion.p variants={riseIn} className="lm-mission__closing">
            Lumina watches <em>how</em> a student solves a problem, not just whether they got it right — because the
            difference between those two things is where the learning actually happens.
          </motion.p>

          <motion.div variants={riseIn} className="lm-mission__cta">
            <Button full trailing={<ArrowRight size={20} strokeWidth={2.6} />} onClick={() => navigate(-1)}>
              back to learning
            </Button>
          </motion.div>

          <div className="lm-nav-space" />
        </motion.div>
      </div>
    </div>
  );
}
