import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, UIManager, View, findNodeHandle, requireNativeComponent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatePresence, MotiView } from 'moti';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '@/primitives/Button';
import { CircleButton } from '@/primitives/CircleButton';
import { CloseButton } from '@/primitives/ScreenHeader';
import { Glass } from '@/primitives/Glass';
import { ProgressBar } from '@/primitives/ProgressBar';
import { Sheet } from '@/primitives/Sheet';
import { TutorBubble, MAX_HINT_LEVEL } from './TutorBubble';
import { LessonComplete } from './LessonComplete';
import { colors, fonts, radii, spacing, type } from '@/theme';
import type { Lesson, LessonResult, TutorResponse } from '@/data/types';
import { useApp } from '@/state/AppState';

type Tool = 'pen' | 'marker' | 'highlighter' | 'eraser';
type Paper = 'blank' | 'ruled' | 'grid' | 'dot';

// Curated Noteshelf-inspired ink palette. Charcoal is the default nib.
const INK_PALETTE = [
  '#2C2836', // charcoal
  '#2E4E8F', // ink blue
  '#B23A48', // marker red
  '#2E7D5B', // forest
  '#8757A6', // plum
  '#D9843E', // ochre
] as const;

const PAPERS: { id: Paper; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'ruled', label: 'ruled', icon: 'reorder-four-outline' },
  { id: 'grid', label: 'grid', icon: 'grid-outline' },
  { id: 'dot', label: 'dot', icon: 'ellipsis-horizontal-outline' },
  { id: 'blank', label: 'blank', icon: 'square-outline' },
];

const SIZE_FOR: Record<Tool, number> = { pen: 3.2, marker: 4.4, highlighter: 6, eraser: 3.2 };
const TOOL_ICON: Record<Tool, keyof typeof Ionicons.glyphMap> = {
  pen: 'pencil',
  marker: 'create',
  highlighter: 'color-wand',
  eraser: 'backspace-outline',
};

/**
 * Native handwriting board — implemented in Kotlin with androidx.ink.
 * The component ID is registered by the LuminaBoardViewManager on the Android
 * side. If the native module is missing, requireNativeComponent throws — no
 * fallback (per the user's ask).
 */
interface LuminaBoardProps {
  guides: boolean;
  tool: 'pen' | 'marker' | 'highlighter' | 'eraser';
  paper?: 'blank' | 'ruled' | 'grid' | 'dot';
  penColor?: string;
  penSize?: number;
  eraserSize?: number;
  onStrokeEnd?: () => void;
  onStrokeCountChange?: (e: { nativeEvent: { count: number; canUndo: boolean; canRedo: boolean } }) => void;
  style?: any;
}

// requireNativeComponent registers the view globally; calling it again on a
// Fast Refresh re-evaluation throws "two views with the same name". Cache the
// first registration on globalThis. This is a re-registration guard, not a
// fallback — a missing native module still throws.
const luminaBoardCache = globalThis as unknown as { __LuminaBoardView?: ReturnType<typeof requireNativeComponent<LuminaBoardProps>> };
const LuminaBoard = (luminaBoardCache.__LuminaBoardView ??= requireNativeComponent<LuminaBoardProps>('LuminaBoardView'));

/** Fire a native command ("clear" | "undo" | "redo") at the board instance. */
function boardCommand(ref: React.Component | null, command: 'clear' | 'undo' | 'redo') {
  const node = findNodeHandle(ref);
  if (node == null) return;
  UIManager.dispatchViewManagerCommand(node, command, []);
}

interface Tally {
  solved: number;
  selfCorrections: number;
  hintsUsed: number;
  misconceptions: string[];
}

const READ_AFTER_IDLE_MS = 1500;
const ADVANCE_DELAY_MS = 2100;
const POINTS_PER_SOLVE = 10;
const POINTS_SELF_CORRECTION = 5;

export function LessonRunner({
  lesson, diagnostic = false, onExit, onFinish,
}: {
  lesson: Lesson;
  diagnostic?: boolean;
  onExit: () => void;
  onFinish: (result: LessonResult) => void;
}) {
  const { preferences } = useApp();
  const startedAt = useRef(Date.now());
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardRef = useRef<React.Component | null>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [penColor, setPenColor] = useState<string>(INK_PALETTE[0]);
  const [paper, setPaper] = useState<Paper>('ruled');
  const [paperSheetOpen, setPaperSheetOpen] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [hintLevel, setHintLevel] = useState(1);
  const [thinking, setThinking] = useState(false);
  const [response, setResponse] = useState<TutorResponse | null>(null);
  const [tally, setTally] = useState<Tally>({ solved: 0, selfCorrections: 0, hintsUsed: 0, misconceptions: [] });
  const [result, setResult] = useState<LessonResult | null>(null);

  const problem = lesson.problems[index];
  const solved = response?.status === 'correct';
  const isLast = index === lesson.problems.length - 1;

  const clearTimers = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    idleTimer.current = null; advanceTimer.current = null;
  };
  useEffect(() => clearTimers, []);

  const evaluate = useCallback(async (hint: number, att: number) => {
    setThinking(true);
    await new Promise((r) => setTimeout(r, 700));
    const forceCorrect = preferences.demoAlwaysCorrect || att > 1;
    const ev: TutorResponse = forceCorrect
      ? { status: 'correct', skill: problem.skill, hintLevel: hint, hint: "that's it — clean working.", confidence: 0.92 }
      : {
          status: 'incorrect', skill: problem.skill, misconception: problem.targets[0],
          hintLevel: hint,
          hint: [
            'look again at how you handled that step. what does the operation on both sides need to be?',
            'the number outside the parentheses touches every term inside, not just the first.',
            'rewrite the left side after distributing, then compare it to the right.',
            'try: multiply, then combine like terms before undoing anything.',
            'finish with the inverse operation to isolate the variable.',
          ][Math.max(0, Math.min(4, hint - 1))],
          confidence: 0.7,
        };
    setThinking(false);
    setResponse(ev);
    if (ev.status === 'correct') {
      setTally((t) => ({
        ...t, solved: t.solved + 1,
        selfCorrections: t.selfCorrections + (att > 1 && hint <= 1 ? 1 : 0),
      }));
    } else {
      setAttempt((a) => a + 1);
      if (ev.misconception && !tally.misconceptions.includes(ev.misconception)) {
        setTally((t) => ({ ...t, misconceptions: [...t.misconceptions, ev.misconception!] }));
      }
    }
  }, [problem, preferences.demoAlwaysCorrect, tally.misconceptions]);

  const scheduleRead = useCallback(() => {
    if (solved) return;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => { void evaluate(hintLevel, attempt); }, READ_AFTER_IDLE_MS);
  }, [solved, evaluate, hintLevel, attempt]);

  const finish = useCallback(() => {
    setResult({
      lessonId: lesson.id,
      pointsEarned: lesson.points + tally.solved * POINTS_PER_SOLVE + tally.selfCorrections * POINTS_SELF_CORRECTION,
      problemsSolved: tally.solved,
      problemsTotal: lesson.problems.length,
      selfCorrections: tally.selfCorrections,
      hintsUsed: tally.hintsUsed,
      misconceptions: tally.misconceptions,
      durationMs: Date.now() - startedAt.current,
    });
  }, [lesson, tally]);

  const advance = useCallback(() => {
    clearTimers();
    if (isLast) { finish(); return; }
    setIndex((i) => i + 1);
    setResponse(null); setAttempt(1); setHintLevel(1);
    boardCommand(boardRef.current, 'clear');
  }, [isLast, finish]);

  useEffect(() => {
    if (!solved) return;
    advanceTimer.current = setTimeout(advance, ADVANCE_DELAY_MS);
    return () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); };
  }, [solved, advance]);

  const askForHelp = () => {
    if (thinking) return;
    const next = response ? Math.min(hintLevel + 1, MAX_HINT_LEVEL) : hintLevel;
    setHintLevel(next);
    setTally((t) => ({ ...t, hintsUsed: t.hintsUsed + 1 }));
    if (strokeCount === 0) {
      setResponse({ status: 'needs_review', skill: problem.skill, hintLevel: 1, hint: 'start by writing what you would do first. I will follow along.', confidence: 0.5 });
      return;
    }
    void evaluate(next, attempt);
  };

  if (result) return <LessonComplete lesson={lesson} result={result} onContinue={() => onFinish(result)} />;

  const progress = (index + (solved ? 1 : 0)) / lesson.problems.length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundWarm }}>
      <LuminaBoard
        ref={(r: React.Component | null) => { boardRef.current = r; }}
        style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        guides={preferences.handwritingGuides}
        tool={tool}
        paper={paper}
        penColor={penColor}
        penSize={SIZE_FOR[tool]}
        onStrokeEnd={scheduleRead}
        onStrokeCountChange={(e) => {
          setStrokeCount(e.nativeEvent.count);
          setCanUndo(e.nativeEvent.canUndo);
          setCanRedo(e.nativeEvent.canRedo);
        }}
      />

      <SafeAreaView style={{ flex: 1 }} pointerEvents="box-none">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
          <CloseButton onPress={onExit} />
          <View style={{ flex: 1 }}><ProgressBar value={progress} size="sm" /></View>
          <Glass radius={9999} intensity={30}>
            <Pressable onPress={() => setPaperSheetOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Ionicons name={PAPERS.find((p) => p.id === paper)!.icon} size={16} color={colors.text} />
              <Text style={{ ...type.caption, color: colors.text }}>{paper}</Text>
            </Pressable>
          </Glass>
          <Glass radius={9999} intensity={30}>
            <Text style={{ ...type.caption, color: colors.text, paddingHorizontal: 14, paddingVertical: 8 }}>
              {index + 1} / {lesson.problems.length}
            </Text>
          </Glass>
        </View>

        <AnimatePresence>
          <MotiView
            key={problem.id}
            from={{ opacity: 0, translateY: -14 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -18 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={{ alignSelf: 'center', margin: 16, backgroundColor: colors.glassBgStrong, borderColor: colors.glassBorder, borderWidth: 1, borderRadius: radii.hero, padding: 16, alignItems: 'center', gap: 8 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ ...type.body, color: colors.textSecondary }}>
                {diagnostic && index === 0 ? 'show me how you would start' : problem.prompt}
              </Text>
              <View style={{ backgroundColor: colors.softLavender, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill }}>
                <Text style={{ ...type.caption, color: colors.deepPurple }}>{problem.standard.code}</Text>
              </View>
            </View>
            <Text style={{ ...type.h1, color: colors.text, fontFamily: fonts.extrabold }}>{problem.expression}</Text>
          </MotiView>
        </AnimatePresence>

        <View style={{ flex: 1 }} pointerEvents="box-none" />

        <View style={{ position: 'absolute', right: 12, top: '22%', gap: 10, alignItems: 'flex-end' }}>
          <Glass radius={radii.hero} intensity={30}>
            <View style={{ paddingVertical: 10, paddingHorizontal: 8, gap: 6, alignItems: 'center' }}>
              <CircleButton size="sm" tone="glass" active={tool === 'pen'} accent={penColor} onPress={() => setTool('pen')}>
                <Ionicons name={TOOL_ICON.pen} size={18} color={colors.text} />
              </CircleButton>
              <CircleButton size="sm" tone="glass" active={tool === 'marker'} accent={penColor} onPress={() => setTool('marker')}>
                <Ionicons name={TOOL_ICON.marker} size={18} color={colors.text} />
              </CircleButton>
              <CircleButton size="sm" tone="glass" active={tool === 'highlighter'} accent={colors.yellow} onPress={() => setTool('highlighter')}>
                <Ionicons name={TOOL_ICON.highlighter} size={18} color={colors.text} />
              </CircleButton>
              <CircleButton size="sm" tone="glass" active={tool === 'eraser'} accent={colors.blue} onPress={() => setTool('eraser')}>
                <Ionicons name={TOOL_ICON.eraser} size={18} color={colors.text} />
              </CircleButton>
              <View style={{ width: 24, height: 1, backgroundColor: colors.lineStrong, marginVertical: 2 }} />
              <CircleButton size="sm" tone="glass" disabled={!canUndo} onPress={() => boardCommand(boardRef.current, 'undo')}>
                <Ionicons name="arrow-undo" size={18} color={colors.text} />
              </CircleButton>
              <CircleButton size="sm" tone="glass" disabled={!canRedo} onPress={() => boardCommand(boardRef.current, 'redo')}>
                <Ionicons name="arrow-redo" size={18} color={colors.text} />
              </CircleButton>
              <CircleButton size="sm" tone="glass" disabled={strokeCount === 0} onPress={() => boardCommand(boardRef.current, 'clear')}>
                <Ionicons name="trash-outline" size={18} color={colors.text} />
              </CircleButton>
            </View>
          </Glass>

          <AnimatePresence>
            {tool !== 'eraser' && (
              <MotiView
                key="palette"
                from={{ opacity: 0, translateX: 12 }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: 12 }}
                transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              >
                <Glass radius={radii.hero} intensity={30}>
                  <View style={{ paddingVertical: 10, paddingHorizontal: 8, gap: 8, alignItems: 'center' }}>
                    {INK_PALETTE.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => setPenColor(c)}
                        hitSlop={4}
                        style={{
                          width: 26, height: 26, borderRadius: 13,
                          backgroundColor: c,
                          borderWidth: penColor === c ? 2.5 : 1,
                          borderColor: penColor === c ? colors.white : 'rgba(0,0,0,0.15)',
                        }}
                      />
                    ))}
                  </View>
                </Glass>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 24, gap: 12, alignItems: 'center' }}>
          <TutorBubble response={response} thinking={thinking} onMoreHelp={askForHelp} canAskMore={hintLevel < MAX_HINT_LEVEL} />
          {solved ? (
            <Button size="md" onPress={advance} trailing={<Ionicons name="arrow-forward" size={18} color={colors.white} />}>
              {isLast ? 'finish' : 'keep going'}
            </Button>
          ) : (
            <Button size="md" variant="secondary" disabled={thinking} onPress={askForHelp}
              leading={<Ionicons name="hand-left" size={18} color={colors.text} />}>I'm stuck</Button>
          )}
        </View>
      </SafeAreaView>

      <Sheet open={paperSheetOpen} onDismiss={() => setPaperSheetOpen(false)}>
        <Text style={{ ...type.h3, color: colors.text, marginBottom: 16 }}>paper</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {PAPERS.map((p) => {
            const active = paper === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => { setPaper(p.id); setPaperSheetOpen(false); }}
                style={{
                  flexBasis: '47%', flexGrow: 1,
                  paddingVertical: 18, paddingHorizontal: 16,
                  borderRadius: radii.lg,
                  borderWidth: 1.5,
                  borderColor: active ? colors.primary : colors.line,
                  backgroundColor: active ? colors.softLavender : colors.backgroundWarm,
                  alignItems: 'center', gap: 8,
                }}
              >
                <Ionicons name={p.icon} size={26} color={active ? colors.deepPurple : colors.text} />
                <Text style={{ ...type.label, color: active ? colors.deepPurple : colors.text }}>{p.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}
