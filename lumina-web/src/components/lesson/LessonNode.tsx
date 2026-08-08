import { motion } from 'framer-motion';
import { Check, Flag, Lock, PenLine, Repeat2, Sparkles, Target } from 'lucide-react';
import { ProgressRing } from '@/components/ui';
import { accents } from '@/theme';
import type { NodeKind, PathNode } from '@/types/lesson';
import './LessonNode.css';

const ICONS: Record<NodeKind, typeof PenLine> = {
  lesson: PenLine,
  practice: Repeat2,
  review: Target,
  checkpoint: Flag,
  challenge: Sparkles,
  diagnostic: Sparkles,
};

export interface LessonNodeProps {
  node: PathNode;
  onSelect: (node: PathNode) => void;
}

/**
 * A stop on the path. Size and treatment carry the state, so a student can
 * read where they are from across the room: current is largest and lit,
 * complete keeps its ring, locked recedes.
 */
export function LessonNode({ node, onSelect }: LessonNodeProps) {
  const palette = accents[node.accent];
  const Icon = node.status === 'locked' ? Lock : ICONS[node.kind];
  const isCurrent = node.status === 'current';
  const isComplete = node.status === 'complete';
  const locked = node.status === 'locked';

  return (
    <div className={`lm-node lm-node--${node.status}`}>
      <motion.button
        type="button"
        className="lm-node__hit"
        style={
          {
            '--node-accent': palette.base,
            '--node-deep': palette.deep,
            '--node-wash': palette.wash,
          } as React.CSSProperties
        }
        onClick={() => !locked && onSelect(node)}
        disabled={locked}
        aria-label={`${node.title}${locked ? ', locked' : isComplete ? ', complete' : ''}`}
        whileTap={locked ? undefined : { scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 520, damping: 32 }}
      >
        {/* The current node breathes, so the eye lands on it first. */}
        {isCurrent && (
          <motion.span
            className="lm-node__pulse"
            animate={{ scale: [1, 1.28, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        )}

        <span className="lm-node__disc">
          <Icon size={isCurrent ? 28 : 24} strokeWidth={2.3} />
        </span>

        {isComplete && (
          <span className="lm-node__ring" aria-hidden="true">
            <ProgressRing
              value={1}
              size={isCurrent ? 92 : 82}
              thickness={4}
              accent={palette.deep}
              trackOpacity={0}
            />
          </span>
        )}

        {isComplete && (
          <motion.span
            className="lm-node__tick"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            aria-hidden="true"
          >
            <Check size={13} strokeWidth={3.6} />
          </motion.span>
        )}
      </motion.button>

      <div className="lm-node__label">
        <span className="lm-node__title">{node.title}</span>
        {!locked && !isComplete && <span className="lm-node__points">+{node.points} points</span>}
        {isComplete && <span className="lm-node__done">complete</span>}
      </div>
    </div>
  );
}
