import { useCallback, useRef, useState } from 'react';
import type { Point, Stroke, Tool } from '@/types/handwriting';

let strokeSeq = 0;

export interface HandwritingState {
  strokes: Stroke[];
  tool: Tool;
  color: string;
  canUndo: boolean;
  canRedo: boolean;
  isEmpty: boolean;
}

/**
 * Stroke model for the workspace.
 *
 * Undo/redo operate on whole strokes, which is what a student expects from a
 * pen: one undo removes one mark, not an arbitrary slice of time. Erasing is
 * also stroke-level, so it is undoable like anything else.
 */
export function useHandwriting(initialColor: string) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(initialColor);
  const redoStack = useRef<Stroke[][]>([]);

  const pushHistory = useCallback((next: Stroke[]) => {
    redoStack.current = [];
    setStrokes(next);
  }, []);

  const beginStroke = useCallback(
    (point: Point, width: number): Stroke => ({
      id: `s${++strokeSeq}`,
      tool: 'pen',
      color,
      width,
      points: [point],
    }),
    [color],
  );

  const commitStroke = useCallback(
    (stroke: Stroke) => {
      if (stroke.points.length === 0) return;
      redoStack.current = [];
      setStrokes((prev) => [...prev, stroke]);
    },
    [],
  );

  /** Removes any stroke passing within `radius` of the point. */
  const eraseAt = useCallback((x: number, y: number, radius: number) => {
    setStrokes((prev) => {
      const next = prev.filter((s) => !strokeHitsPoint(s, x, y, radius));
      if (next.length !== prev.length) redoStack.current = [];
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      redoStack.current.push(prev);
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (next) setStrokes(next);
  }, []);

  const clear = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      redoStack.current.push(prev);
      return [];
    });
  }, []);

  return {
    strokes,
    setStrokes: pushHistory,
    tool,
    setTool,
    color,
    setColor,
    beginStroke,
    commitStroke,
    eraseAt,
    undo,
    redo,
    clear,
    canUndo: strokes.length > 0,
    canRedo: redoStack.current.length > 0,
    isEmpty: strokes.length === 0,
  };
}

function strokeHitsPoint(stroke: Stroke, x: number, y: number, radius: number): boolean {
  const r2 = radius * radius;
  const pts = stroke.points;
  for (let i = 0; i < pts.length; i++) {
    const dx = pts[i].x - x;
    const dy = pts[i].y - y;
    if (dx * dx + dy * dy <= r2) return true;
    // Also test the segment between samples, so fast strokes are not missed.
    if (i > 0 && distanceToSegment(x, y, pts[i - 1], pts[i]) <= radius) return true;
  }
  return false;
}

function distanceToSegment(px: number, py: number, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - a.x, py - a.y);
  let t = ((px - a.x) * dx + (py - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
}
