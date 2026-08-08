import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Welcome } from '@/screens/Welcome/Welcome';
import { EmailSignUp } from '@/screens/SignUp/EmailSignUp';
import { GuestName } from '@/screens/SignUp/GuestName';
import { Onboarding } from '@/screens/Onboarding/Onboarding';
import { Home } from '@/screens/Home/Home';
import { Diagnostic } from '@/screens/Diagnostic/Diagnostic';
import { Lesson } from '@/screens/Lesson/Lesson';
import { Progress } from '@/screens/Progress/Progress';
import { Shop } from '@/screens/Shop/Shop';
import { Settings } from '@/screens/Settings/Settings';
import { TeacherSummary } from '@/screens/TeacherSummary/TeacherSummary';
import { Mission } from '@/screens/Mission/Mission';
import { TabBar } from '@/components/navigation/TabBar';
import { GooeyFilter } from '@/components/ui';
import { useApp } from '@/store/AppState';
import { screenVariants } from '@/theme';

/** Destinations that carry the floating navigation. */
const TABBED = ['/home', '/progress', '/shop', '/settings'];

export function App() {
  const location = useLocation();
  const { user } = useApp();

  const showTabs = TABBED.some((p) => location.pathname.startsWith(p));

  return (
    <div className="lm-app">
      {/* One shared SVG goo filter for every GooeyInput on the page. */}
      <GooeyFilter />

      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <Screen>
                {/* Someone who has already been through onboarding lands on home. */}
                {user?.onboardingComplete ? <Navigate to="/home" replace /> : <Welcome />}
              </Screen>
            }
          />
          <Route path="/signup/email" element={<Screen><EmailSignUp /></Screen>} />
          <Route path="/signup/guest" element={<Screen><GuestName /></Screen>} />

          <Route path="/onboarding" element={<Screen><Guard user={user}><Onboarding /></Guard></Screen>} />
          <Route path="/home" element={<Screen><Guard user={user}><Home /></Guard></Screen>} />
          <Route path="/diagnostic" element={<Screen><Guard user={user}><Diagnostic /></Guard></Screen>} />
          <Route path="/lesson/:lessonId" element={<Screen><Guard user={user}><Lesson /></Guard></Screen>} />
          <Route path="/progress" element={<Screen><Guard user={user}><Progress /></Guard></Screen>} />
          <Route path="/shop" element={<Screen><Guard user={user}><Shop /></Guard></Screen>} />
          <Route path="/settings" element={<Screen><Guard user={user}><Settings /></Guard></Screen>} />
          <Route path="/teacher" element={<Screen><Guard user={user}><TeacherSummary /></Guard></Screen>} />
          <Route path="/mission" element={<Screen><Mission /></Screen>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {showTabs && <TabBar />}
    </div>
  );
}

/** Wraps each route so screens cross-fade instead of cutting. */
function Screen({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={screenVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

function Guard({ user, children }: { user: unknown; children: ReactNode }) {
  return user ? <>{children}</> : <Navigate to="/" replace />;
}
