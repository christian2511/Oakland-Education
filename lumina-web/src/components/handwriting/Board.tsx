import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { Eraser, PenLine, Redo2, Trash2, Undo2 } from 'lucide-react';
import { CircleButton } from '@/components/ui';
import { useHandwriting } from '@/hooks/useHandwriting';
import { InkCanvas } from './InkCanvas';
import type { Stroke } from '@/types/handwriting';
import './Board.css';

export interface BoardHandle {
  clear: () => void;
}

export interface BoardProps {
  guides?: boolean;
  onStrokesChange?: (strokes: Stroke[]) => void;
  /** Called the moment a stroke is finished — drives the tutor's idle timer. */
  onStrokeEnd?: () => void;
}

const INK = '#2C2836';

/**
 * The board: the whole screen is writing surface.
 *
 * There is no sheet and no bounded card — a student can start anywhere and
 * keep going. Everything else in the lesson floats above this in the corners,
 * so the working always has the full area of whatever device it is on, in
 * either orientation.
 */
export const Board = forwardRef<BoardHandle, BoardProps>(function Board(
  { guides = true, onStrokesChange, onStrokeEnd },
  ref,
) {
  const ink = useHandwriting(INK);

  useImperativeHandle(ref, () => ({ clear: ink.clear }), [ink.clear]);

  useEffect(() => {
    onStrokesChange?.(ink.strokes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ink.strokes]);

  return (
    <>
      <div className="lm-board">
        <InkCanvas
          strokes={ink.strokes}
          tool={ink.tool}
          color={ink.color}
          guides={guides}
          onStrokeEnd={(s) => {
            ink.commitStroke(s);
            onStrokeEnd?.();
          }}
          onErase={ink.eraseAt}
        />
      </div>

      <motion.div
        className="lm-board__tools"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 26 }}
      >
        <CircleButton
          label="pen"
          tone="glass"
          size="sm"
          active={ink.tool === 'pen'}
          accent="var(--lm-primary)"
          onClick={() => ink.setTool('pen')}
        >
          <PenLine size={19} strokeWidth={2.3} />
        </CircleButton>

        <CircleButton
          label="eraser"
          tone="glass"
          size="sm"
          active={ink.tool === 'eraser'}
          accent="var(--lm-blue)"
          onClick={() => ink.setTool('eraser')}
        >
          <Eraser size={19} strokeWidth={2.3} />
        </CircleButton>

        <span className="lm-board__divider" aria-hidden="true" />

        <CircleButton label="undo" tone="glass" size="sm" disabled={!ink.canUndo} onClick={ink.undo}>
          <Undo2 size={19} strokeWidth={2.3} />
        </CircleButton>

        <CircleButton label="redo" tone="glass" size="sm" disabled={!ink.canRedo} onClick={ink.redo}>
          <Redo2 size={19} strokeWidth={2.3} />
        </CircleButton>

        <CircleButton label="clear the board" tone="glass" size="sm" disabled={ink.isEmpty} onClick={ink.clear}>
          <Trash2 size={19} strokeWidth={2.3} />
        </CircleButton>
      </motion.div>
    </>
  );
});
