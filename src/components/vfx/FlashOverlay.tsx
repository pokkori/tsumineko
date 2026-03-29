/**
 * FlashOverlay.tsx
 *
 * 全画面フラッシュエフェクト（共通VFXコンポーネント）
 * triggerが変更されるたびに opacity 0 -> 0.5 -> 0 のフラッシュを発火する。
 *
 * 用途:
 *   white (#FFFFFF) : フィーバー発動 / 150ms
 *   red   (#FF6B6B) : ダメージ / 100ms
 *   gold  (#FFD93D) : 新記録 / 200ms
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type FlashColor = 'white' | 'red' | 'gold';

interface FlashOverlayProps {
  color?: FlashColor;
  trigger: number;
  /** フラッシュの減衰時間（ms）。デフォルト 150ms。 */
  duration?: number;
  /** フラッシュのピーク不透明度。デフォルト 0.5。 */
  peakOpacity?: number;
}

const COLOR_MAP: Record<FlashColor, string> = {
  white: '#FFFFFF',
  red:   '#FF6B6B',
  gold:  '#FFD93D',
};

const EASING_FADE = Easing.out(Easing.quad);

export const FlashOverlay: React.FC<FlashOverlayProps> = ({
  color = 'white',
  trigger,
  duration = 150,
  peakOpacity = 0.5,
}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) return;

    // 急速に不透明度を上げ、ゆっくり減衰
    opacity.value = withSequence(
      withTiming(peakOpacity, {
        duration: Math.round(duration * 0.2),
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(0, {
        duration: Math.round(duration * 0.8),
        easing: EASING_FADE,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const hexColor = COLOR_MAP[color];

  const animatedStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: hexColor,
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
};
