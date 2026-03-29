/**
 * ScoreCountUp.tsx
 *
 * スコアカウントアップ演出（共通VFXコンポーネント）
 * リザルト画面でスコアが0から最終値まで数値カウントアップする。
 *
 * 仕様:
 *   - 0 -> targetValue を duration(ms) かけてカウントアップ
 *   - 最後の20%で減速（イージング）
 *   - 完了時にバウンス（scale 1 -> 1.15 -> 1）
 *   - onComplete コールバック
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useAnimatedProps,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { TextInput, StyleSheet, TextStyle } from 'react-native';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface ScoreCountUpProps {
  /** 目標スコア */
  targetValue: number;
  /** 発火トリガー（0以外に変更で発火） */
  trigger: number;
  /** カウントアップ時間（ms）。デフォルト 1500 */
  duration?: number;
  /** フォーマット関数。デフォルト: カンマ区切り */
  format?: (value: number) => string;
  /** 完了時コールバック */
  onComplete?: () => void;
  /** テキストスタイル */
  textStyle?: TextStyle;
  /** プレフィックス（"Score: " 等） */
  prefix?: string;
  /** サフィックス（" pts" 等） */
  suffix?: string;
}

const defaultFormat = (v: number) => Math.round(v).toLocaleString();

export const ScoreCountUp: React.FC<ScoreCountUpProps> = ({
  targetValue,
  trigger,
  duration = 1500,
  format = defaultFormat,
  onComplete,
  textStyle,
  prefix = '',
  suffix = '',
}) => {
  const progress = useSharedValue(0);
  const scale    = useSharedValue(1);

  useEffect(() => {
    if (trigger === 0) return;

    progress.value = 0;
    scale.value    = 1;

    progress.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    }, (finished) => {
      if (finished) {
        // 完了時バウンス
        scale.value = withSequence(
          withSpring(1.15, { damping: 6, stiffness: 300 }),
          withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }),
        );
        if (onComplete) {
          runOnJS(onComplete)();
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const animatedProps = useAnimatedProps(() => {
    const currentValue = progress.value * targetValue;
    return {
      text: `${prefix}${Math.round(progress.value * targetValue)}${suffix}`,
    } as any;
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <AnimatedTextInput
        editable={false}
        underlineColorAndroid="transparent"
        animatedProps={animatedProps}
        style={[styles.text, textStyle]}
        accessibilityRole="text"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFD93D',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
