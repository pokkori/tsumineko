/**
 * HitStop.tsx
 *
 * ヒットストップ（フリーズフレーム）エフェクト（共通VFXコンポーネント）
 * triggerが変更されるたびに children 全体を一瞬パンプさせる。
 *
 * 用途:
 *   80ms  : 通常ヒット / スコア加算
 *   120ms : クリティカル / コンボ達成
 *   150ms : ボス撃破 / ゲームクリア
 *
 * scale 1.0 -> 1.02 -> 1.0 のわずかな膨張で「時間が止まった」感覚を演出。
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface HitStopProps {
  /** フリーズの持続時間（ms）。デフォルト 80ms。 */
  duration?: number;
  /** パンプのスケール倍率。デフォルト 1.02。 */
  pumpScale?: number;
  trigger: number;
  children: React.ReactNode;
}

const EASING_IN = Easing.out(Easing.cubic);
const EASING_OUT = Easing.out(Easing.quad);

export const HitStop: React.FC<HitStopProps> = ({
  duration = 80,
  pumpScale = 1.02,
  trigger,
  children,
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (trigger === 0) return;

    // 急速にスケールアップ -> duration分ホールド -> ゆっくり戻す
    const rampUp = Math.min(30, Math.round(duration * 0.2));
    const hold = Math.max(0, duration - rampUp);
    const rampDown = Math.round(duration * 0.6);

    scale.value = withSequence(
      // 急速に膨張
      withTiming(pumpScale, {
        duration: rampUp,
        easing: EASING_IN,
      }),
      // ホールド（微膨張を維持）
      withDelay(
        hold,
        // ゆっくり元に戻す
        withTiming(1, {
          duration: rampDown,
          easing: EASING_OUT,
        }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
};
