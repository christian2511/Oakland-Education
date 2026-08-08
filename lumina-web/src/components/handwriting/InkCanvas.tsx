import { useCallback, useEffect, useRef } from 'react';
import type { Point, Stroke, Tool } from '@/types/handwriting';
import './InkCanvas.css';

export interface InkCanvasProps {
  strokes: Stroke[];
  tool: Tool;
  color: string;
  penWidth?: number;
  eraserRadius?: number;
  onStrokeEnd: (stroke: Stroke) => void;
  onErase: (x: number, y: number, radius: number) => void;
  /** Faint ruled guides, matching the setting in appearance. */
  guides?: boolean;
}

const SMOOTHING = 0.42;

/**
 * The writing surface.
 *
 * Stroke geometry is drawn per-segment with a width that follows stylus
 * pressure, so ink thins and thickens the way it does on paper. Rendering is
 * split: committed strokes live on a static layer that is only repainted when
 * the stroke list changes, and the stroke in progress is drawn incrementally on
 * top. That keeps writing responsive on low-cost tablets, where repainting the
 * whole page on every pointermove is the thing that makes ink feel laggy.
 */
export function InkCanvas({
  strokes,
  tool,
  color,
  penWidth = 3.2,
  eraserRadius = 16,
  onStrokeEnd,
  onErase,
  guides = true,
}: InkCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);
  const current = useRef<Stroke | null>(null);
  const activePointer = useRef<number | null>(null);
  const dpr = useRef(1);
  /** Once a real stylus is seen, ignore touch so a resting palm cannot draw. */
  const penSeen = useRef(false);

  const sizeCanvas = useCallback(() => {
    const wrap = wrapRef.current;
    const base = baseRef.current;
    const live = liveRef.current;
    if (!wrap || !base || !live) return;

    const { width, height } = wrap.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2.5);
    dpr.current = ratio;

    [base, live].forEach((c) => {
      c.width = Math.round(width * ratio);
      c.height = Math.round(height * ratio);
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    });
  }, []);

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke, from = 0) => {
    const pts = stroke.points;
    if (pts.length < 2) {
      if (pts.length === 1) {
        // A tap still leaves a mark, as a pen would.
        ctx.beginPath();
        ctx.fillStyle = stroke.color;
        ctx.arc(pts[0].x, pts[0].y, (stroke.width * pts[0].p) / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    ctx.strokeStyle = stroke.color;
    const start = Math.max(1, from);

    for (let i = start; i < pts.length; i++) {
      const prev = pts[i - 1];
      const point = pts[i];
      // Pressure maps to width with a floor, so light strokes stay visible.
      ctx.lineWidth = stroke.width * (0.45 + point.p * 0.9);
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      // Quadratic through the midpoint smooths the polyline without lag.
      const mx = (prev.x + point.x) / 2;
      const my = (prev.y + point.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  }, []);

  const repaintBase = useCallback(() => {
    const base = baseRef.current;
    const ctx = base?.getContext('2d');
    if (!base || !ctx) return;
    ctx.clearRect(0, 0, base.width / dpr.current, base.height / dpr.current);
    strokes.forEach((s) => drawStroke(ctx, s));
  }, [strokes, drawStroke]);

  useEffect(() => {
    sizeCanvas();
    repaintBase();

    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(() => {
      sizeCanvas();
      repaintBase();
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [sizeCanvas, repaintBase]);

  useEffect(repaintBase, [repaintBase]);

  const toLocal = (e: React.PointerEvent): Point => {
    const rect = wrapRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      // Mouse and unsupported styluses report 0 or 0.5; treat both as medium.
      p: e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : 0.62,
    };
  };

  const shouldIgnore = (e: React.PointerEvent) =>
    penSeen.current && e.pointerType === 'touch';

  const handleDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'pen') penSeen.current = true;
    if (shouldIgnore(e) || activePointer.current !== null) return;

    activePointer.current = e.pointerId;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const point = toLocal(e);

    if (tool === 'eraser') {
      onErase(point.x, point.y, eraserRadius);
      return;
    }

    current.current = {
      id: `live-${Date.now()}`,
      tool: 'pen',
      color,
      width: penWidth,
      points: [point],
    };
  };

  const handleMove = (e: React.PointerEvent) => {
    if (activePointer.current !== e.pointerId) return;
    const point = toLocal(e);

    if (tool === 'eraser') {
      onErase(point.x, point.y, eraserRadius);
      return;
    }

    const stroke = current.current;
    if (!stroke) return;

    const last = stroke.points[stroke.points.length - 1];
    // Drop samples that are too close together — they add cost, not fidelity.
    if (Math.hypot(point.x - last.x, point.y - last.y) < 0.9) return;

    // Exponential smoothing removes the jitter cheap digitisers produce.
    const smoothed: Point = {
      x: last.x + (point.x - last.x) * (1 - SMOOTHING),
      y: last.y + (point.y - last.y) * (1 - SMOOTHING),
      p: last.p + (point.p - last.p) * 0.5,
    };

    const from = stroke.points.length;
    stroke.points.push(smoothed);

    const ctx = liveRef.current?.getContext('2d');
    if (ctx) drawStroke(ctx, stroke, from);
  };

  const endStroke = (e: React.PointerEvent) => {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;

    const stroke = current.current;
    current.current = null;

    const live = liveRef.current;
    const ctx = live?.getContext('2d');
    if (live && ctx) ctx.clearRect(0, 0, live.width / dpr.current, live.height / dpr.current);

    if (stroke && stroke.points.length > 0) onStrokeEnd(stroke);
  };

  return (
    <div
      ref={wrapRef}
      className="lm-ink"
      data-tool={tool}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
      onPointerLeave={endStroke}
      // Without this the browser scrolls the page instead of inking.
      style={{ touchAction: 'none' }}
      role="application"
      aria-label="handwriting workspace"
    >
      {guides && <div className="lm-ink__guides" aria-hidden="true" />}
      <canvas ref={baseRef} className="lm-ink__layer" />
      <canvas ref={liveRef} className="lm-ink__layer" />
    </div>
  );
}
