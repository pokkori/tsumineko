/**
 * ComboCounter.tsx
 *
 * 段階的に派手になるコンボカウンター（共通VFXコンポーネント）
 *
 * combo数値に応じて自動で演出が変化:
 *   x1-x2:  白 fontSize24 / 小パルス
 *   x3-x4:  黄金 fontSize28 / 中パルス + シャドウグロー
 *   x5-x9:  橙 fontSize32 / 大パルス + 強グロー + 揺れ
 *   x10+:   赤金 fontSize40 / 巨大パルス + レインボーグロー + 激揺れ
 *
 * comboが変わるたびにバウンスアニメーション発火。
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { getComboStage, ComboStage } from './ParticleSystem';

interface ComboCounterProps {
  combo: number;
  /** 表示位置調整用スタイル */
  style?: object;
}

interface StageVisual {
  color: string;
  fontSize: number;
  glowColor: string;
  glowRadius: number;
  bounceScale: number;
  shakeAmplitude: number;
}

const STAGE_VISUALS: Record<ComboStage, StageVisual> = {
  1: {
    color: '#FFFFFF',
    fontSize: 24,
    glowColor: 'transparent',
    glowRadius: 0,
    bounceScale: 1.15,
    shakeAmplitude: 0,
  },
  2: {
    color: '#FFD93D',
    fontSize: 28,
    glowColor: '#FFD93D',
    glowRadius: 8,
    bounceScale: 1.25,
    shakeAmplitude: 1,
  },
  3: {
    color: '#FF6B35',
    fontSize: 32,
    glowColor: '#FF6B35',
    glowRadius: 14,
    bounceScale: 1.35,
    shakeAmplitude: 2,
  },
  4: {
    color: '#FF2E63',
    fontSize: 40,
    glowColor: '#FF2E63',
    glowRadius: 20,
    bounceScale: 1.5,
    shakeAmplitude: 3,
  },
};

const DEFAULT_VISUAL: StageVisual = {
  color: '#FFFFFF',
  fontSize: 20,
  glowColor: 'transparent',
  glowRadius: 0,
  bounceScale: 1.1,
  shakeAmplitude: 0,
};

export const ComboCounter: React.FC<ComboCounterProps> = ({ combo, style }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowPulse = useSharedValue(0);

  const stage = getComboStage(combo);
  const visual = stage ? STAGE_VISUALS[stage] : DEFAULT_VISUAL;

  useEffect(() => {
    if (combo <= 0) {
      scale.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) });
      return;
    }

    // バウンス
    scale.value = withSequence(
      withSpring(visual.bounceScale, { damping: 5, stiffness: 400 }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }),
    );

    // 揺れ（Stage3以上）
    if (visual.shakeAmplitude > 0) {
      rotation.value = withSequence(
        withTiming(visual.shakeAmplitude, { duration: 40, easing: Easing.out(Easing.quad) }),
        withTiming(-visual.shakeAmplitude, { duration: 40, easing: Easing.out(Easing.quad) }),
        withTiming(visual.shakeAmplitude * 0.5, { duration: 40, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 40, easing: Easing.out(Easing.quad) }),
      );
    } else {
      rotation.value = 0;
    }

    // グロー脈動（Stage2以上）
    if (visual.glowRadius > 0) {
      glowPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      glowPulse.value = 0;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combo]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    textShadowColor: visual.glowColor,
    textShadowRadius: visual.glowRadius * glowPulse.value,
  }));

  if (combo <= 0) return null;

  return (
    <Animated.Text
      style={[
        styles.text,
        {
          color: visual.color,
          fontSize: visual.fontSize,
          textShadowColor: visual.glowColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: visual.glowRadius,
        },
        style,
        animatedStyle,
      ]}
      accessibilityLabel={`${combo}コンボ`}
      accessibilityRole="text"
    >
      {combo}x
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
