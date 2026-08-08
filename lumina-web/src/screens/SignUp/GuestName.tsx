import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Ambient, Button, GooeyInput } from '@/components/ui';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { auth } from '@/services/auth';
import { useApp } from '@/store/AppState';
import { riseIn, stagger } from '@/theme';
import './SignUp.css';

/**
 * Guests get a name and then the whole product. Nothing is withheld — the
 * account state is a field on the user, so upgrading later loses nothing.
 */
export function GuestName() {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const valid = name.trim().length >= 1;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    const user = await auth.continueAsGuest(name);
    setUser(user);
    navigate('/onboarding');
  };

  return (
    <div className="lm-screen lm-signup">
      <Ambient mood="lavender" />
      <ScreenHeader onBack={() => navigate('/')} />

      <motion.div
        className="lm-signup__body lm-content"
        variants={stagger(0.05, 0.08)}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={riseIn} className="lm-signup__intro">
          <h1>what's your name?</h1>
          <p className="lm-lede">just so Lumina knows who it's working with.</p>
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
            label="your name"
            placeholder="type your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="given-name"
            autoFocus
            enterKeyHint="go"
          />

          <Button
            type="submit"
            full
            disabled={!valid || busy}
            trailing={<ArrowRight size={20} strokeWidth={2.6} />}
          >
            continue
          </Button>
        </motion.form>

        <motion.p variants={riseIn} className="lm-signup__foot">
          you can turn this into a full account any time from settings.
        </motion.p>
      </motion.div>
    </div>
  );
}
