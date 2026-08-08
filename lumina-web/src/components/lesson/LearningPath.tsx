import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LessonNode } from './LessonNode';
import type { PathNode } from '@/types/lesson';
import './LearningPath.css';

export interface LearningPathProps {
  nodes: PathNode[];
  onSelect: (node: PathNode) => void;
}

const SPACING = 168;
const SPACING_WIDE = 196;
/* Enough headroom for the largest node (the current one) plus its glow, so the
   first stop never rides up into the section heading above it. */
const TOP_PAD = 82;
const BOTTOM_PAD = 72;

/**
 * The vertical journey.
 *
 * Nodes are placed along a slow sine so the route wanders rather than marching,
 * and the connector is a single smooth spline through their centres — not a
 * graph, not a grid, not a ladder of cards. The travelled portion is drawn in
 * colour and the rest recedes, so progress is legible at a glance.
 */
export function LearningPath({ nodes, onSelect }: LearningPathProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const wide = width >= 700;
  const spacing = wide ? SPACING_WIDE : SPACING;
  // Amplitude scales with the available width but never lets a label overhang.
  const amplitude = Math.min(width * 0.2, wide ? 132 : 74);
  const cx = width / 2;

  const points = nodes.map((_, i) => ({
    // A quarter-turn per node: centre, right, centre, left. The route weaves
    // evenly around the spine instead of drifting to one side.
    x: cx + Math.sin((i * Math.PI) / 2) * amplitude,
    y: TOP_PAD + i * spacing,
  }));

  const height = TOP_PAD + Math.max(0, nodes.length - 1) * spacing + BOTTOM_PAD;

  // The last completed node is where the coloured route stops.
  const travelled = nodes.reduce((acc, n, i) => (n.status === 'complete' ? i + 1 : acc), 0);

  return (
    <div className="lm-path" ref={wrapRef} style={{ height }}>
      {width > 0 && (
        <svg className="lm-path__svg" width={width} height={height} aria-hidden="true">
          <path d={spline(points)} className="lm-path__line lm-path__line--rest" />
          {travelled > 1 && (
            <motion.path
              d={spline(points.slice(0, travelled))}
              className="lm-path__line lm-path__line--done"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
            />
          )}
        </svg>
      )}

      {width > 0 &&
        nodes.map((node, i) => (
          /* The slot owns the centring transform; the inner element owns the
             entrance. Animating both on one element would let motion's
             transform overwrite translate(-50%, -50%) and knock every node off
             its point on the curve. */
          <div key={node.id} className="lm-path__slot" style={{ left: points[i].x, top: points[i].y }}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 26,
                // Nodes arrive down the path rather than all at once.
                delay: 0.08 + i * 0.055,
              }}
            >
              <LessonNode node={node} onSelect={onSelect} />
            </motion.div>
          </div>
        ))}
    </div>
  );
}

/**
 * Catmull-Rom through the node centres, converted to cubic beziers. Gives a
 * continuous curve that actually passes through every node, which a plain
 * quadratic chain does not.
 */
function spline(pts: Array<{ x: number; y: number }>): string {
  if (pts.length < 2) return '';
  const d: string[] = [`M ${pts[0].x} ${pts[0].y}`];

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
  }

  return d.join(' ');
}
