import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Ambient, Button, Wordmark } from '@/components/ui';
import { GoogleGlyph } from './GoogleGlyph';
import { auth } from '@/services/auth';
import { useApp } from '@/store/AppState';
import { duration, ease, springs } from '@/theme';
import './Welcome.css';

/** Configurable — the tagline is copy, not structure. */
const TAGLINE = 'learn how you think.';

const WORD_LENGTH = 6;
const LETTER_MS = 190;
const HOLD_MS = 520;

type Phase = 'building' | 'tagline' | 'ready';

/**
 * First launch.
 *
 * The screen starts almost empty and the wordmark assembles a letter at a time
 * — each letter fading and settling into its final position rather than being
 * typed out behind a cursor. Only once the name has landed does the app ask
 * anything of the student.
 */
export function Welcome() {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [revealed, setRevealed] = useState(0);
  const [phase, setPhase] = useState<Phase>('building');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timers: number[] = [];

    for (let i = 1; i <= WORD_LENGTH; i++) {
      timers.push(window.setTimeout(() => setRevealed(i), 380 + i * LETTER_MS));
    }
    const built = 380 + WORD_LENGTH * LETTER_MS;
    timers.push(window.setTimeout(() => setPhase('tagline'), built + HOLD_MS));
    timers.push(window.setTimeout(() => setPhase('ready'), built + HOLD_MS + 700));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleGoogle = async () => {
    setBusy(true);
    const user = await auth.signUpWithGoogle();
    setUser(user);
    navigate('/onboarding');
  };

  return (
    <div className="lm-screen lm-welcome">
      <Ambient mood="sunrise" />

      <div className="lm-welcome__body">
        <motion.div
          className="lm-welcome__mark"
          // The whole mark drifts up as the buttons arrive, so the composition
          // rebalances instead of the buttons simply appearing beneath it.
          animate={{ y: phase === 'ready' ? 0 : 40 }}
          transition={{ duration: duration.slow, ease }}
        >
          <Wordmark reveal={revealed} size="hero" />

          <AnimatePresence>
            {phase !== 'building' && (
              <motion.p
                className="lm-welcome__tagline"
                initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, ease }}
              >
                {TAGLINE}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {phase === 'ready' && (
          <motion.div
            className="lm-welcome__actions"
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.075, delayChildren: 0.1 } } }}
          >
            <motion.div variants={riseUp}>
              <Button variant="dark" full leading={<GoogleGlyph />} onClick={handleGoogle} disabled={busy}>
                sign up with google
              </Button>
            </motion.div>

            <motion.div variants={riseUp}>
              <Button variant="primary" full trailing={<ArrowRight size={20} strokeWidth={2.6} />} onClick={() => navigate('/signup/email')}>
                sign up with email
              </Button>
            </motion.div>

            <motion.div variants={riseUp} className="lm-welcome__or">
              <span className="lm-welcome__rule" />
              <span>or</span>
              <span className="lm-welcome__rule" />
            </motion.div>

            <motion.div variants={riseUp}>
              <Button variant="secondary" full onClick={() => navigate('/signup/guest')}>
                continue as guest
              </Button>
            </motion.div>

            <motion.p variants={riseUp} className="lm-welcome__signin">
              already have an account?{' '}
              <button type="button" onClick={() => navigate('/signup/email')}>
                sign in
              </button>
            </motion.p>

            <motion.p variants={riseUp} className="lm-welcome__mission">
              <button type="button" onClick={() => navigate('/mission')}>
                why we built Lumina
              </button>
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const riseUp = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0, transition: springs.enter },
};
