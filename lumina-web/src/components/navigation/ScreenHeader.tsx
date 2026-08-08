import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { CircleButton } from '@/components/ui';
import './ScreenHeader.css';

export interface ScreenHeaderProps {
  onBack?: () => void;
  /** Centre slot — progress, a lesson counter, a title. */
  centre?: ReactNode;
  trailing?: ReactNode;
  backLabel?: string;
}

/** Floating circular back button with an optional centre and trailing slot. */
export function ScreenHeader({ onBack, centre, trailing, backLabel = 'go back' }: ScreenHeaderProps) {
  return (
    <header className="lm-sheader">
      <div className="lm-sheader__side">
        {onBack && (
          <CircleButton label={backLabel} tone="glass" onClick={onBack}>
            <ChevronLeft size={22} strokeWidth={2.6} />
          </CircleButton>
        )}
      </div>

      {centre && <div className="lm-sheader__centre">{centre}</div>}

      <div className="lm-sheader__side lm-sheader__side--end">{trailing}</div>
    </header>
  );
}
