import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { TutorHighlight } from '@/types/ai';
import './Expression.css';

export interface ExpressionProps {
  expression: string;
  highlight?: TutorHighlight;
  size?: 'md' | 'lg';
}

interface Segment {
  text: string;
  marked: boolean;
}

/**
 * The problem, rendered large — and the surface the tutor points at.
 *
 * Rather than telling a student what is wrong, Lumina draws attention to the
 * part of the expression they overlooked. Highlight targets are resolved here
 * so the rest of the app never has to think about expression structure.
 */
export function Expression({ expression, highlight, size = 'lg' }: ExpressionProps) {
  const segments = useMemo(() => segment(expression, highlight), [expression, highlight]);

  return (
    <p className={`lm-expr lm-expr--${size}`}>
      {segments.map((seg, i) =>
        seg.marked ? (
          <span key={i} className="lm-expr__mark">
            <AnimatePresence>
              <motion.span
                className="lm-expr__mark-bg"
                initial={{ opacity: 0, scaleX: 0.7 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.34, ease: [0.22, 0.61, 0.36, 1] }}
                aria-hidden="true"
              />
            </AnimatePresence>
            <span className="lm-expr__mark-text">{seg.text}</span>
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  );
}

function segment(expression: string, highlight?: TutorHighlight): Segment[] {
  if (!highlight) return [{ text: expression, marked: false }];

  const range = resolveRange(expression, highlight.target);
  if (!range) return [{ text: expression, marked: false }];

  const [start, end] = range;
  return [
    { text: expression.slice(0, start), marked: false },
    { text: expression.slice(start, end), marked: true },
    { text: expression.slice(end), marked: false },
  ].filter((s) => s.text.length > 0);
}

/** Maps a semantic target from the tutor onto character offsets. */
function resolveRange(expression: string, target: string): [number, number] | null {
  switch (target) {
    case 'parentheses': {
      const open = expression.indexOf('(');
      const close = expression.indexOf(')', open);
      return open >= 0 && close > open ? [open, close + 1] : null;
    }

    case 'coefficient': {
      // The factor sitting immediately before a parenthesis, else the leading one.
      const m = expression.match(/(-?\d+)\s*\(/) ?? expression.match(/^\s*(-?\d+)/);
      if (!m || m.index === undefined) return null;
      const start = expression.indexOf(m[1], m.index);
      return [start, start + m[1].length];
    }

    case 'sign': {
      const m = expression.match(/[−–—-]\s*\d/);
      return m?.index !== undefined ? [m.index, m.index + 1] : null;
    }

    case 'operator': {
      const m = expression.match(/\s([+−–—*/-])\s/);
      return m?.index !== undefined ? [m.index + 1, m.index + 2] : null;
    }

    case 'denominator': {
      const m = expression.match(/\/\s*(\d+)/);
      return m?.index !== undefined ? [m.index, m.index + m[0].length] : null;
    }

    case 'terms':
    case 'lhs': {
      const eq = expression.indexOf('=');
      return eq > 0 ? [0, eq] : null;
    }

    case 'rhs': {
      const eq = expression.indexOf('=');
      return eq >= 0 ? [eq + 1, expression.length] : null;
    }

    case 'equation':
      return [0, expression.length];

    default:
      return null;
  }
}
