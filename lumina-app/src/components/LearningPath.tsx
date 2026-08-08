import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import Svg, { Path as SvgPath, Circle } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { PathNode, NodeKind } from '@/data/types';
import { accents, colors, fonts, type } from '@/theme';

const SPACING = 168;
const TOP_PAD = 82;
const BOTTOM_PAD = 72;

const ICON: Record<NodeKind, keyof typeof Ionicons.glyphMap> = {
  lesson: 'create',
  practice: 'repeat',
  review: 'locate',
  checkpoint: 'flag',
  challenge: 'sparkles',
  diagnostic: 'sparkles',
};

/**
 * The vertical journey. Nodes wander along a slow sine; the connector is a
 * Catmull-Rom spline through their centres. Travelled portion in colour,
 * the rest a fine dotted line that recedes.
 */
export function LearningPath({ nodes, onSelect, width }: { nodes: PathNode[]; onSelect: (n: PathNode) => void; width: number }) {
  const height = TOP_PAD + Math.max(0, nodes.length - 1) * SPACING + BOTTOM_PAD;
  const amplitude = Math.min(width * 0.2, 96);
  const cx = width / 2;

  const points = useMemo(() => nodes.map((_, i) => ({
    x: cx + Math.sin((i * Math.PI) / 2) * amplitude,
    y: TOP_PAD + i * SPACING,
  })), [nodes.length, width]);

  const travelled = nodes.reduce((acc, n, i) => (n.status === 'complete' ? i + 1 : acc), 0);
  const dAll = spline(points);
  const dDone = travelled > 1 ? spline(points.slice(0, travelled)) : '';

  return (
    <View style={{ height, width }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        {/* Fine dotted rest-of-route: tiny round dots, wide spacing. */}
        <SvgPath
          d={dAll}
          stroke={colors.lineStrong}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="0.1 14"
          fill="none"
        />
        {dDone ? (
          <SvgPath d={dDone} stroke={colors.primary} strokeWidth={5} strokeLinecap="round" fill="none" />
        ) : null}
      </Svg>
      {nodes.map((node, i) => (
        <View
          key={node.id}
          style={{
            position: 'absolute',
            left: points[i].x - 70,
            top: points[i].y - 46,
            width: 140,
            alignItems: 'center',
          }}
        >
          <LessonNode node={node} onSelect={onSelect} index={i} />
        </View>
      ))}
    </View>
  );
}

function LessonNode({ node, onSelect, index }: { node: PathNode; onSelect: (n: PathNode) => void; index: number }) {
  const palette = accents[node.accent];
  const locked = node.status === 'locked';
  const isCurrent = node.status === 'current';
  const isComplete = node.status === 'complete';
  const d = isCurrent ? 84 : 68;

  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Pressable disabled={locked} onPress={() => onSelect(node)} hitSlop={8}>
        <View style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center' }}>
          {/* Breathing pulse — the eye lands on the current node first. */}
          {isCurrent && (
            <MotiView
              from={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.28, opacity: 0 }}
              transition={{ loop: true, type: 'timing', duration: 2600, easing: Easing.inOut(Easing.ease) }}
              style={{
                position: 'absolute',
                width: d, height: d, borderRadius: d / 2,
                backgroundColor: palette.base,
              }}
            />
          )}

          {/* Completion ring */}
          {isComplete && (
            <Svg width={82} height={82} style={{ position: 'absolute' }}>
              <Circle cx={41} cy={41} r={38} stroke={palette.deep} strokeWidth={4} fill="none" />
            </Svg>
          )}

          <MotiView
            from={{ opacity: 0, scale: 0.9, translateY: 12 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260, delay: 80 + index * 55 }}
            style={{
              width: d,
              height: d,
              borderRadius: d / 2,
              backgroundColor: locked ? '#ECEAE4' : palette.base,
              alignItems: 'center',
              justifyContent: 'center',
              // Locked recedes: no shadow. Others get the soft lift.
              ...(locked
                ? {}
                : {
                    shadowColor: palette.deep,
                    shadowOpacity: 0.35,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 8,
                  }),
            }}
          >
            <Ionicons
              name={locked ? 'lock-closed' : ICON[node.kind]}
              size={locked ? 20 : isCurrent ? 30 : 25}
              color={locked ? colors.textTertiary : colors.white}
            />
            {isComplete && (
              <View style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 24, height: 24, borderRadius: 12,
                backgroundColor: palette.deep,
                borderWidth: 2, borderColor: colors.white,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name="checkmark" size={13} color={colors.white} />
              </View>
            )}
          </MotiView>
        </View>
      </Pressable>

      <Text style={{ ...type.label, fontFamily: fonts.bold, color: locked ? colors.textTertiary : colors.text, textAlign: 'center' }}>
        {node.title}
      </Text>
      {!locked && !isComplete && (
        <Text style={{ ...type.caption, color: colors.textSecondary }}>+{node.points} points</Text>
      )}
      {isComplete && (
        <Text style={{ ...type.caption, color: palette.deep }}>complete</Text>
      )}
    </View>
  );
}

function spline(pts: Array<{ x: number; y: number }>): string {
  if (pts.length < 2) return '';
  const parts = [`M ${pts[0].x} ${pts[0].y}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    parts.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
  }
  return parts.join(' ');
}
