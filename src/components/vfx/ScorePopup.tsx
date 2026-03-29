/**
 * ScorePopup.tsx
 *
 * スコア加算ポップアップ（共通VFXコンポーネント）
 * triggerが変更されるたびに "+100" のようなテキストが浮き上がってフェードアウトする。
 *
 * - 上方向に60px移動しながらフェードアウト
 * - スケール: 0 -> 1.2 -> 1 -> 0.8（バウンス感）
 * - 寿命: 800ms
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface ScorePopupProps {
  /** 表示テキスト（例: "+100", "COMBO x5!"） */
  text: string;
  /** 発火トリガー（0以外に変更で発火） */
  trigger: number;
  /** 表示位置X */
  x: number;
  /** 表示位置Y */
  y: number;
  /** テキスト色。デフォルト #FFD93D（ゴールド） */
  color?: string;
  /** フォントサイズ。デフォルト 24 */
  fontSize?: number;
  /** アニメーション時間（ms）。デフォルト 800 */
  duration?: number;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({
  text,
  trigger,
  x,
  y,
  color = '#FFD93D',
  fontSize = 24,
  duration = 800,
}) => {
  const translateY = useSharedValue(0);
  const opacity    = useSharedValue(0);
  const scale      = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) return;

    translateY.value = 0;
    opacity.value    = 1;
    scale.value      = 0;

    // バウンス感のあるスケール
    scale.value = withSequence(
      withSpring(1.3, { damping: 6, stiffness: 400 }),
      withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
    );

    // 上方向に浮き上がり
    translateY.value = withTiming(-60, {
      duration,
      easing: Easing.out(Easing.cubic),
    });

    // フェードアウト（後半で消える）
    opacity.value = withTiming(0, {
      duration,
      easing: Easing.in(Easing.quad),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: x - 50,
    top: y - 15,
    width: 100,
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.Text
      style={[
        animatedStyle,
        {
          color,
          fontSize,
          fontWeight: '900',
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.6)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        },
      ]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {text}
    </Animated.Text>
  );
};
