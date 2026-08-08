import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Ambient, Button, Checkbox, Requirement, GooeyInput, Wordmark } from '@/components/ui';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { auth } from '@/services/auth';
import { useApp } from '@/store/AppState';
import { riseIn, stagger, transitions } from '@/theme';
import './SignUp.css';

const MIN_PASSWORD = 8;

interface Touched {
  name?: boolean;
  email?: boolean;
}

export function EmailSignUp() {
  const navigate = useNavigate();
  const { setUser } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState<Touched>({});
  const [phase, setPhase] = useState<'form' | 'creating'>('form');

  const checks = useMemo(
    () => ({
      length: password.length >= MIN_PASSWORD,
      match: password.length > 0 && password === confirm,
      name: name.trim().length > 0,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    }),
    [name, email, password, confirm],
  );

  const canSubmit = checks.length && checks.match && checks.name && checks.email && agreed;

  const submit = async () => {
    if (!canSubmit || phase === 'creating') return;
    setPhase('creating');
    const user = await auth.signUpWithEmail(name, email, password);
    setUser(user);
    navigate('/onboarding');
  };

  return (
    <div className="lm-screen lm-signup">
      <Ambient mood="lavender" animated={false} />
      <ScreenHeader onBack={() => navigate('/')} />

      <div className="lm-signup__scroll lm-scroll">
        <AnimatePresence mode="wait">
          {phase === 'form' ? (
            <motion.div
              key="form"
              className="lm-signup__body lm-content"
              variants={stagger(0.04, 0.06)}
              initial="initial"
              animate="animate"
              exit={{ opacity: 0, y: -20, filter: 'blur(6px)', transition: transitions.quick }}
            >
              <motion.div variants={riseIn} className="lm-signup__intro">
                <h1>sign up with email</h1>
                <p className="lm-lede">this keeps your progress safe across devices.</p>
              </motion.div>

              <motion.form
                variants={riseIn}
                className="lm-signup__form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
              >
                <GooeyInput
                  label="name"
                  placeholder="your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  error={touched.name && !checks.name ? 'we need something to call you' : undefined}
                  autoComplete="name"
                />

                <GooeyInput
                  label="email address"
                  type="email"
                  placeholder="you@school.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  error={touched.email && !checks.email ? 'that address does not look right' : undefined}
                  autoComplete="email"
                  inputMode="email"
                />

                <GooeyInput
                  label="password"
                  type="password"
                  placeholder="at least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />

                <GooeyInput
                  label="confirm password"
                  type="password"
                  placeholder="type it once more"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />

                {/* Requirements fill in as they are met — never an error while typing. */}
                <div className="lm-signup__checks">
                  <Requirement met={checks.length}>at least 8 characters</Requirement>
                  <Requirement met={checks.match}>passwords match</Requirement>
                </div>

                <div className="lm-signup__terms">
                  <Checkbox checked={agreed} onChange={setAgreed}>
                    I agree to the{' '}
                    <a href="/terms" onClick={(e) => e.preventDefault()}>
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" onClick={(e) => e.preventDefault()}>
                      Privacy Policy
                    </a>
                    .
                  </Checkbox>
                </div>

                <Button
                  type="submit"
                  full
                  disabled={!canSubmit}
                  trailing={<ArrowRight size={20} strokeWidth={2.6} />}
                >
                  create account
                </Button>
              </motion.form>
            </motion.div>
          ) : (
            /* The hand-off: form clears, the brand takes the screen, then
               onboarding arrives. Never an abrupt swap. */
            <motion.div
              key="creating"
              className="lm-signup__creating"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <Wordmark size="lg" withMark />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.45 }}
              >
                setting things up
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
