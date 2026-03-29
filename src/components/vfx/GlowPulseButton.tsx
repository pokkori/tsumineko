/**
 * GlowPulseButton.tsx
 *
 * グロー付パルスボタン（共通VFXコンポーネント）
 * ボタンがゆっくり脈動しながら光る演出。タイトル画面の「START」ボタン等。
 *
 * 仕様:
 *   - スケール: 1.0 -> 1.03 -> 1.0 を2秒周期で繰り返し
 *   - シャドウ: グロー色でshadow radius脈動
 *   - 不透明度: 0.9 -> 1.0 を脈動
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlowPulseButtonProps {
  /** ボタンテキスト */
  label: string;
  /** 押下時コールバック */
  onPress: () => void;
  /** グロー色。デフォルト '#2DD4BF' */
  glowColor?: string;
  /** ボタン背景色。デフォルト グラデーション風の固定色 */
  backgroundColor?: string;
  /** テキスト色。デフォルト '#FFFFFF' */
  textColor?: string;
  /** フォントサイズ。デフォルト 20 */
  fontSize?: number;
  /** パルス周期（ms）。デフォルト 2000 */
  pulseDuration?: number;
  /** 追加スタイル */
  style?: ViewStyle;
  /** アクセシビリティラベル */
  accessibilityLabel?: string;
}

export const GlowPulseButton: React.FC<GlowPulseButtonProps> = ({
  label,
  onPress,
  glowColor = '#2DD4BF',
  backgroundColor = '#1A1A2E',
  textColor = '#FFFFFF',
  fontSize = 20,
  pulseDuration = 2000,
  style,
  accessibilityLabel,
}) => {
  const scale      = useSharedValue(1);
  const glowRadius = useSharedValue(8);
  const opacity    = useSharedValue(0.9);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    const half = pulseDuration / 2;
    const easing = Easing.inOut(Easing.ease);

    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: half, easing }),
        withTiming(1.0,  { duration: half, easing }),
      ),
      -1, true,
    );

    glowRadius.value = withRepeat(
      withSequence(
        withTiming(16, { duration: half, easing }),
        withTiming(8,  { duration: half, easing }),
      ),
      -1, true,
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: half, easing }),
        withTiming(0.9, { duration: half, easing }),
      ),
      -1, true,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePressIn = () => {
    pressScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pressScale.value },
    ],
    opacity: opacity.value,
    shadowRadius: glowRadius.value,
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor: glowColor,
          shadowColor: glowColor,
        },
        style,
        animatedStyle,
      ]}
    >
      <Animated.Text style={[styles.text, { color: textColor, fontSize }]}>
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 160,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    elevation: 8,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 1,
  },
});
