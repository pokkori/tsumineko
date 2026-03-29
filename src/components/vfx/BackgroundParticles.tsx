/**
 * BackgroundParticles.tsx
 *
 * 背景浮遊パーティクル（共通VFXコンポーネント）
 * タイトル画面やメニュー画面で常時表示するアンビエントパーティクル。
 *
 * 仕様:
 *   - 20個の光の粒がゆっくり浮遊
 *   - 不透明度: 0.1-0.4 でパルス
 *   - サイズ: 3-8px
 *   - 移動: ゆっくりランダムドリフト
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface FloatingDotProps {
  index: number;
  color: string;
}

const FloatingDot: React.FC<FloatingDotProps> = ({ index, color }) => {
  const config = useMemo(() => ({
    startX: Math.random() * SCREEN_W,
    startY: Math.random() * SCREEN_H,
    size:   3 + Math.random() * 5,
    driftX: (Math.random() - 0.5) * 60,
    driftY: (Math.random() - 0.5) * 60,
    dur:    3000 + Math.random() * 4000,
    delay:  Math.random() * 2000,
    minOp:  0.1 + Math.random() * 0.1,
    maxOp:  0.25 + Math.random() * 0.15,
  }), [index]);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity    = useSharedValue(config.minOp);
  const scale      = useSharedValue(0.8);

  // 初回マウント時にアニメーション開始
  React.useEffect(() => {
    // ドリフト
    translateX.value = withDelay(config.delay,
      withRepeat(
        withSequence(
          withTiming(config.driftX, { duration: config.dur, easing: Easing.inOut(Easing.ease) }),
          withTiming(-config.driftX * 0.7, { duration: config.dur * 0.8, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, true,
      ),
    );

    translateY.value = withDelay(config.delay,
      withRepeat(
        withSequence(
          withTiming(config.driftY, { duration: config.dur * 1.1, easing: Easing.inOut(Easing.ease) }),
          withTiming(-config.driftY * 0.6, { duration: config.dur * 0.9, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, true,
      ),
    );

    // 不透明度パルス
    opacity.value = withDelay(config.delay,
      withRepeat(
        withSequence(
          withTiming(config.maxOp, { duration: config.dur * 0.6, easing: Easing.inOut(Easing.ease) }),
          withTiming(config.minOp, { duration: config.dur * 0.6, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, true,
      ),
    );

    // スケールパルス
    scale.value = withDelay(config.delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: config.dur * 0.7, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: config.dur * 0.7, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, true,
      ),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const half = config.size / 2;

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: config.startX - half,
    top:  config.startY - half,
    width: config.size,
    height: config.size,
    borderRadius: half,
    backgroundColor: color,
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return <Animated.View style={style} />;
};

interface BackgroundParticlesProps {
  /** パーティクル数。デフォルト 20 */
  count?: number;
  /** パーティクル色。デフォルト '#FFFFFF' */
  color?: string;
}

export const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({
  count = 20,
  color = '#FFFFFF',
}) => {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {Array.from({ length: count }, (_, i) => (
        <FloatingDot key={i} index={i} color={color} />
      ))}
    </View>
  );
};
