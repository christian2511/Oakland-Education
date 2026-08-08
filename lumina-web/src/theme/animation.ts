import type { Transition, Variants } from 'framer-motion';

/**
 * Motion vocabulary. Animation in Lumina communicates transition, selection,
 * progress, success, guidance and hierarchy — nothing bounces for decoration.
 */

export const duration = {
  micro: 0.18,
  quick: 0.28,
  normal: 0.36,
  slow: 0.6,
  cinematic: 0.9,
} as const;

/** Calm, slightly weighted ease. Used for most entrances. */
export const ease = [0.22, 0.61, 0.36, 1] as const;
/** Sharper ease for exits so screens clear out of the way quickly. */
export const easeOut = [0.4, 0, 0.2, 1] as const;

export const springs = {
  /** Selection, press feedback — settles fast with almost no overshoot. */
  tap: { type: 'spring', stiffness: 520, damping: 32, mass: 0.7 } as Transition,
  /** Elements arriving on screen. */
  enter: { type: 'spring', stiffness: 260, damping: 26, mass: 0.9 } as Transition,
  /** Larger surfaces: sheets, modals, reward moments. */
  surface: { type: 'spring', stiffness: 190, damping: 24, mass: 1 } as Transition,
} as const;

export const transitions = {
  micro: { duration: duration.micro, ease } as Transition,
  quick: { duration: duration.quick, ease } as Transition,
  normal: { duration: duration.normal, ease } as Transition,
  slow: { duration: duration.slow, ease } as Transition,
  cinematic: { duration: duration.cinematic, ease } as Transition,
} as const;

/** Standard screen transition used by the router. */
export const screenVariants: Variants = {
  initial: { opacity: 0, y: 18, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: duration.normal, ease } },
  exit: { opacity: 0, y: -12, filter: 'blur(4px)', transition: { duration: duration.quick, ease: easeOut } },
};

/** Container that reveals its children one after another. */
export const stagger = (delayChildren = 0.06, staggerChildren = 0.07): Variants => ({
  initial: {},
  animate: { transition: { delayChildren, staggerChildren } },
  exit: {},
});

/** Child of a `stagger` container. */
export const riseIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: springs.enter },
  exit: { opacity: 0, y: -8, transition: transitions.micro },
};
