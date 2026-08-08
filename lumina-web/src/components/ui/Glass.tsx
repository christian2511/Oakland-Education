import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Glass.css';

export interface GlassProps extends HTMLAttributes<HTMLDivElement> {
  /** `strong` for surfaces that carry text, `light` for transient overlays. */
  weight?: 'light' | 'strong';
  radius?: 'md' | 'lg' | 'xl' | 'hero' | 'pill';
  children: ReactNode;
}

/**
 * A floating layer above the app — navigation, tool bars, hint bubbles,
 * transient overlays.
 *
 * Deliberately not the default container. Glass everywhere flattens the
 * hierarchy it is supposed to create, and it never goes over the handwriting
 * canvas.
 */
export const Glass = forwardRef<HTMLDivElement, GlassProps>(function Glass(
  { weight = 'strong', radius = 'xl', children, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={['lm-glass', `lm-glass--${weight}`, `lm-glass--r-${radius}`, className ?? ''].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
});
