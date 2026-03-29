/**
 * ParticleSystem.tsx
 *
 * コンボ段階別パーティクル演出（共通VFXコンポーネント）
 * triggerKeyが変更されるたびにパーティクルを放射する。
 *
 * コンボ4段階:
 *   Stage1 (x1-x2):  10個 / #FFFFFF / fontSize24
 *   Stage2 (x3-x4):  20個 / #FFD93D / fontSize28 / "GOOD!" / shake 2px
 *   Stage3 (x5-x9):  30個 / #FF6B35 / fontSize32 / "GREAT!!" / shake 4px / flash
 *   Stage4 (x10+):   40個 / #FF2E63+レインボー / fontSize40 / "FEVER!!!" / shake 6px / flash / slowMotion
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';

export type ComboStage = 1 | 2 | 3 | 4;

interface StageConfig {
  count: number;
  colors: string[];
  sizeMin: number;
  sizeMax: number;
  distance: number;
  duration: number;
  label: string | null;
  labelColor: string;
  labelFontSize: number;
  shakeAmplitude: number;
  flash: boolean;
}

const STAGE_CONFIG: Record<ComboStage, StageConfig> = {
  1: {
    count: 10, colors: ['#FFFFFF', '#E0E0E0'],
    sizeMin: 3, sizeMax: 6, distance: 70, duration: 500,
    label: null, labelColor: '#FFFFFF', labelFontSize: 24,
    shakeAmplitude: 0, flash: false,
  },
  2: {
    count: 20, colors: ['#FFD93D', '#FFC107'],
    sizeMin: 4, sizeMax: 8, distance: 90, duration: 600,
    label: 'GOOD!', labelColor: '#FFD93D', labelFontSize: 28,
    shakeAmplitude: 2, flash: false,
  },
  3: {
    count: 30, colors: ['#FF6B35', '#FFD93D', '#FF4444'],
    sizeMin: 5, sizeMax: 10, distance: 110, duration: 700,
    label: 'GREAT!!', labelColor: '#FF6B35', labelFontSize: 32,
    shakeAmplitude: 4, flash: true,
  },
  4: {
    count: 40, colors: ['#FF2E63', '#FFD93D', '#2DD4BF', '#6C5CE7', '#FF85A2'],
    sizeMin: 6, sizeMax: 14, distance: 140, duration: 900,
    label: 'FEVER!!!', labelColor: '#FF2E63', labelFontSize: 40,
    shakeAmplitude: 6, flash: true,
  },
};

/** combo数値から対応するComboStageを返す（非該当ならnull） */
export function getComboStage(combo: number): ComboStage | null {
  if (combo >= 10) return 4;
  if (combo >= 5)  return 3;
  if (combo >= 3)  return 2;
  if (combo >= 1)  return 1;
  return null;
}

/** ComboStageの設定情報を取得 */
export function getComboConfig(stage: ComboStage) {
  return STAGE_CONFIG[stage];
}

// --- 単一パーティクル ---
interface SingleParticleProps {
  index: number;
  total: number;
  triggerKey: number;
  originX: number;
  originY: number;
  color: string;
  size: number;
  distance: number;
  duration: number;
}

const SingleParticle: React.FC<SingleParticleProps> = ({
  index,
  total,
  triggerKey,
  originX,
  originY,
  color,
  size,
  distance,
  duration,
}) => {
  const x        = useSharedValue(originX);
  const y        = useSharedValue(originY);
  const opacity  = useSharedValue(0);
  const scale    = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (triggerKey === 0) return;

    const angle    = (Math.PI * 2 * index) / total + (Math.random() - 0.5) * 0.5;
    const dist     = distance * (0.6 + Math.random() * 0.6);
    const targetX  = originX + Math.cos(angle) * dist;
    const targetY  = originY + Math.sin(angle) * dist - 20;
    const dur      = duration + Math.random() * 200;

    x.value        = originX;
    y.value        = originY;
    opacity.value  = 1;
    scale.value    = 0;
    rotation.value = 0;

    scale.value    = withSpring(1, { damping: 8, stiffness: 300 });
    x.value        = withTiming(targetX, { duration: dur, easing: Easing.out(Easing.cubic) });
    y.value        = withTiming(targetY, { duration: dur, easing: Easing.out(Easing.cubic) });
    opacity.value  = withTiming(0, { duration: dur, easing: Easing.in(Easing.quad) });
    rotation.value = withTiming(360 * (Math.random() > 0.5 ? 1 : -1), {
      duration: dur,
      easing: Easing.out(Easing.quad),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  const half = size / 2;

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: x.value - half,
    top:  y.value - half,
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    width: size,
    height: size,
    borderRadius: half,
    backgroundColor: color,
  }));

  return <Animated.View style={style} />;
};

// --- コンボラベル ---
interface ComboLabelProps {
  triggerKey: number;
  originX: number;
  originY: number;
  label: string;
  color: string;
  fontSize: number;
}

const ComboLabel: React.FC<ComboLabelProps> = ({
  triggerKey,
  originX,
  originY,
  label,
  color,
  fontSize,
}) => {
  const translateY = useSharedValue(0);
  const opacity    = useSharedValue(0);
  const scale      = useSharedValue(0);

  useEffect(() => {
    if (triggerKey === 0) return;

    translateY.value = 0;
    opacity.value    = 1;
    scale.value      = 0;

    scale.value = withSequence(
      withSpring(1.4, { damping: 5, stiffness: 400 }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }),
    );
    translateY.value = withTiming(-70, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(0, {
      duration: 900,
      easing: Easing.in(Easing.quad),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: originX - 60,
    top: originY - 30,
    width: 120,
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.Text
      style={[style, {
        color,
        fontSize,
        fontWeight: '900',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 4,
      }]}
      pointerEvents="none"
    >
      {label}
    </Animated.Text>
  );
};

// --- フィーバーフラッシュ ---
const FeverFlash: React.FC<{ triggerKey: number }> = ({ triggerKey }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (triggerKey === 0) return;
    opacity.value = withSequence(
      withTiming(0.5, { duration: 60, easing: Easing.out(Easing.quad) }),
      withTiming(0,   { duration: 400, easing: Easing.out(Easing.cubic) }),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  const style = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D4AF37',
    opacity: opacity.value,
  }));

  return <Animated.View style={style} pointerEvents="none" />;
};

// --- メインコンポーネント ---
interface Props {
  triggerKey: number;
  originX: number;
  originY: number;
  /** getComboStage() の戻り値を渡す */
  stage: ComboStage | null;
}

export const ParticleSystem: React.FC<Props> = ({
  triggerKey,
  originX,
  originY,
  stage,
}) => {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  if (!stage) return null;

  const config = STAGE_CONFIG[stage];
  const showFlash = config.flash;

  // サイズをメモ化（レンダー間で安定させる）
  const sizes = useMemo(
    () => Array.from({ length: config.count }, () =>
      config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin),
    ),
    [config.count, config.sizeMin, config.sizeMax],
  );

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {showFlash && <FeverFlash triggerKey={triggerKey} />}
      {config.label && (
        <ComboLabel
          triggerKey={triggerKey}
          originX={originX}
          originY={originY}
          label={config.label}
          color={config.labelColor}
          fontSize={config.labelFontSize}
        />
      )}
      {Array.from({ length: config.count }, (_, i) => (
        <SingleParticle
          key={i}
          index={i}
          total={config.count}
          triggerKey={triggerKey}
          originX={originX}
          originY={originY}
          color={config.colors[i % config.colors.length]}
          size={sizes[i]}
          distance={config.distance}
          duration={config.duration}
        />
      ))}
    </View>
  );
};
