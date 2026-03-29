/**
 * Confetti.tsx
 *
 * 紙吹雪エフェクト（共通VFXコンポーネント）
 * triggerが変更されるたびに画面上部から紙吹雪が降り注ぐ。
 *
 * 用途:
 *   ゲームクリア / 新記録 / リザルト画面
 *   粒数: 40-60個 / 色: レインボー5色 / 寿命: 1500ms
 *   花火3連（0ms, 300ms, 600ms遅延）
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const RAINBOW_COLORS = ['#FF6B6B', '#FFD93D', '#2DD4BF', '#6C5CE7', '#FF85A2'];

interface ConfettiPieceProps {
  index: number;
  trigger: number;
  delay: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ index, trigger, delay }) => {
  const x        = useSharedValue(0);
  const y        = useSharedValue(-20);
  const opacity  = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scaleX   = useSharedValue(1);

  // ランダム初期値を一度だけ計算
  const config = useMemo(() => ({
    startX:  Math.random() * SCREEN_W,
    endX:    Math.random() * SCREEN_W,
    color:   RAINBOW_COLORS[index % RAINBOW_COLORS.length],
    width:   6 + Math.random() * 6,
    height:  4 + Math.random() * 4,
    dur:     1200 + Math.random() * 600,
    wobble:  (Math.random() - 0.5) * 100,
  }), [index]);

  useEffect(() => {
    if (trigger === 0) return;

    x.value        = config.startX;
    y.value        = -20;
    opacity.value  = 0;
    rotation.value = 0;
    scaleX.value   = 1;

    // フェードイン
    opacity.value = withDelay(delay,
      withSequence(
        withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) }),
        withDelay(config.dur - 400,
          withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) }),
        ),
      ),
    );

    // 落下
    y.value = withDelay(delay,
      withTiming(SCREEN_H + 20, {
        duration: config.dur,
        easing: Easing.in(Easing.quad),
      }),
    );

    // 横揺れ
    x.value = withDelay(delay,
      withTiming(config.endX + config.wobble, {
        duration: config.dur,
        easing: Easing.inOut(Easing.ease),
      }),
    );

    // 回転
    rotation.value = withDelay(delay,
      withTiming(360 * (Math.random() > 0.5 ? 2 : -2), {
        duration: config.dur,
        easing: Easing.out(Easing.quad),
      }),
    );

    // フリップ効果
    scaleX.value = withDelay(delay,
      withSequence(
        withTiming(-1, { duration: config.dur / 4, easing: Easing.inOut(Easing.ease) }),
        withTiming(1,  { duration: config.dur / 4, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: config.dur / 4, easing: Easing.inOut(Easing.ease) }),
        withTiming(1,  { duration: config.dur / 4, easing: Easing.inOut(Easing.ease) }),
      ),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: x.value,
    top: y.value,
    width: config.width,
    height: config.height,
    backgroundColor: config.color,
    borderRadius: 1,
    opacity: opacity.value,
    transform: [
      { rotate: `${rotation.value}deg` },
      { scaleX: scaleX.value },
    ],
  }));

  return <Animated.View style={style} />;
};

interface ConfettiProps {
  /** 発火トリガー（0以外に変更で発火） */
  trigger: number;
  /** 紙吹雪の数。デフォルト 50 */
  count?: number;
  /** 花火3連モード（0ms, 300ms, 600msで3波）。デフォルト true */
  burst3?: boolean;
}

export const Confetti: React.FC<ConfettiProps> = ({
  trigger,
  count = 50,
  burst3 = true,
}) => {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  const piecesPerWave = burst3 ? Math.ceil(count / 3) : count;
  const waves = burst3 ? 3 : 1;
  const delays = [0, 300, 600];

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {Array.from({ length: waves }, (_, wave) =>
        Array.from({ length: piecesPerWave }, (_, i) => (
          <ConfettiPiece
            key={`w${wave}_${i}`}
            index={wave * piecesPerWave + i}
            trigger={trigger}
            delay={delays[wave] || 0}
          />
        )),
      )}
    </View>
  );
};
