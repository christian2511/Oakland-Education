export interface Point {
  x: number;
  y: number;
  /** 0 – 1. Stylus pressure where the device reports it, a constant otherwise. */
  p: number;
}

export type Tool = 'pen' | 'eraser';

export interface Stroke {
  id: string;
  tool: Tool;
  color: string;
  /** Base width in CSS pixels, before pressure. */
  width: number;
  points: Point[];
}
