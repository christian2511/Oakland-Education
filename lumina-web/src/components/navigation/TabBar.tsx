import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { Compass, House, Settings, Store } from 'lucide-react';
import { Glass } from '@/components/ui';
import './TabBar.css';

const TABS = [
  { to: '/home', label: 'home', Icon: House },
  { to: '/progress', label: 'progress', Icon: Compass },
  { to: '/shop', label: 'shop', Icon: Store },
  { to: '/settings', label: 'settings', Icon: Settings },
];

/**
 * Floating navigation. The active destination grows a pill that slides between
 * tabs as a single shared element, so the selection moves rather than blinks.
 */
export function TabBar() {
  const { pathname } = useLocation();

  return (
    <nav className="lm-tabs" aria-label="main">
      <Glass weight="strong" radius="pill" className="lm-tabs__bar">
        {TABS.map(({ to, label, Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} className="lm-tabs__tab" aria-current={active ? 'page' : undefined}>
              {active && (
                <motion.span
                  className="lm-tabs__pill"
                  layoutId="tab-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="lm-tabs__content">
                <Icon size={21} strokeWidth={active ? 2.6 : 2.1} />
                <motion.span
                  className="lm-tabs__label"
                  initial={false}
                  animate={{
                    opacity: active ? 1 : 0,
                    width: active ? 'auto' : 0,
                    marginLeft: active ? 8 : 0,
                  }}
                  transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  {label}
                </motion.span>
              </span>
            </NavLink>
          );
        })}
      </Glass>
    </nav>
  );
}
