import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Ambient, Button, Sheet } from '@/components/ui';
import { LEARNING_STYLES, gradeLabel } from '@/data/curriculum';
import { useApp } from '@/store/AppState';
import { riseIn, springs, stagger } from '@/theme';
import './Settings.css';

export function Settings() {
  const navigate = useNavigate();
  const { user, preferences, updatePreferences, reset } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);

  const o = user?.onboarding;
  const style = LEARNING_STYLES.find((s) => s.id === o?.learningStyle)?.label ?? 'not set';

  return (
    <div className="lm-screen lm-set">
      <Ambient mood="calm" animated={false} />

      <div className="lm-screen-scroll">
        <motion.div
          className="lm-set__inner lm-content"
          variants={stagger(0.04, 0.06)}
          initial="initial"
          animate="animate"
        >
          <motion.header variants={riseIn} className="lm-set__head">
            <span className="lm-set__avatar">{(user?.name ?? '?').charAt(0).toUpperCase()}</span>
            <div>
              <h1>{user?.name ?? 'you'}</h1>
              <p>
                {user?.accountKind === 'guest'
                  ? 'guest — progress is on this device only'
                  : (user?.email ?? 'signed in')}
              </p>
            </div>
          </motion.header>

          {user?.accountKind === 'guest' && (
            <motion.div variants={riseIn} className="lm-set__upgrade">
              <div>
                <strong>keep your progress</strong>
                <span>make a free account and it follows you to any device.</span>
              </div>
              <Button size="sm" onClick={() => navigate('/signup/email')}>
                create account
              </Button>
            </motion.div>
          )}

          <Section title="learning" variants={riseIn}>
            <Row label="subject" value={o?.subject ?? 'not set'} onClick={() => navigate('/onboarding')} />
            <Row
              label="grade"
              value={o?.grade !== null && o?.grade !== undefined ? gradeLabel(o.grade) : 'not set'}
              onClick={() => navigate('/onboarding')}
            />
            <Row label="topic" value={o?.topic ?? 'not set'} onClick={() => navigate('/onboarding')} />
            {o?.honorsTrack && <Row label="track" value={o.honorsTrack} />}
            <Row label="how you learn" value={style} onClick={() => navigate('/onboarding')} />
          </Section>

          <Section title="appearance" variants={riseIn}>
            <Toggle
              label="reduce motion"
              caption="fewer transitions and no drifting background."
              checked={preferences.reducedMotion}
              onChange={(v) => updatePreferences({ reducedMotion: v })}
            />
            <Toggle
              label="writing guides"
              caption="faint ruled lines on the workspace."
              checked={preferences.handwritingGuides}
              onChange={(v) => updatePreferences({ handwritingGuides: v })}
            />
          </Section>

          <Section title="app" variants={riseIn}>
            <Toggle
              label="notifications"
              caption="a nudge when it has been a while."
              checked={preferences.notifications}
              onChange={(v) => updatePreferences({ notifications: v })}
            />
            <Toggle
              label="sound"
              caption="quiet feedback on success."
              checked={preferences.soundEffects}
              onChange={(v) => updatePreferences({ soundEffects: v })}
            />
            <Row label="summary for your teacher" onClick={() => navigate('/teacher')} />
            <Row label="our mission" onClick={() => navigate('/mission')} />
            <Row label="privacy policy" />
            <Row label="terms of service" />
            <Row label="about Lumina" value="1.0" />
          </Section>

          <Section title="demo" variants={riseIn}>
            <Toggle
              label="always read as solved"
              caption="handwriting recognition is mocked for now — turn this on to walk the clean path without the detour."
              checked={preferences.demoAlwaysCorrect}
              onChange={(v) => updatePreferences({ demoAlwaysCorrect: v })}
            />
          </Section>

          <motion.div variants={riseIn} className="lm-set__danger">
            <button type="button" onClick={() => setConfirmReset(true)}>
              reset everything
            </button>
          </motion.div>

          <div className="lm-nav-space" />
        </motion.div>
      </div>

      <Sheet open={confirmReset} onDismiss={() => setConfirmReset(false)} labelledBy="reset-title">
        <h3 id="reset-title">reset everything?</h3>
        <p className="lm-set__confirm">
          this clears your account, your path and every point you have earned on this device. it cannot be undone.
        </p>
        <div className="lm-set__confirm-actions">
          <Button
            full
            onClick={() => {
              reset();
              navigate('/');
            }}
          >
            yes, reset
          </Button>
          <Button variant="ghost" full onClick={() => setConfirmReset(false)}>
            cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function Section({
  title,
  children,
  variants,
}: {
  title: string;
  children: React.ReactNode;
  variants: typeof riseIn;
}) {
  return (
    <motion.section variants={variants} className="lm-set__section">
      <h2>{title}</h2>
      <div className="lm-set__group">{children}</div>
    </motion.section>
  );
}

function Row({ label, value, onClick }: { label: string; value?: string; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} className="lm-set__row" onClick={onClick}>
      <span className="lm-set__row-label">{label}</span>
      {value && <span className="lm-set__row-value">{value}</span>}
      {onClick && <ChevronRight size={18} strokeWidth={2.4} className="lm-set__row-chev" />}
    </Tag>
  );
}

function Toggle({
  label,
  caption,
  checked,
  onChange,
}: {
  label: string;
  caption: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="lm-set__row lm-set__row--toggle">
      <span className="lm-set__row-text">
        <span className="lm-set__row-label">{label}</span>
        <span className="lm-set__row-caption">{caption}</span>
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={['lm-switch', checked ? 'is-on' : ''].filter(Boolean).join(' ')}
        onClick={() => onChange(!checked)}
      >
        <motion.span className="lm-switch__knob" layout transition={springs.tap} />
      </button>
    </div>
  );
}
