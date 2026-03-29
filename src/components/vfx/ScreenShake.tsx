/**
 * ScreenShake.tsx
 *
 * 画面シェイクエフェクト（共通VFXコンポーネント）
 * triggerが変更されるたびに減衰振動を発火する。
 *
 * light:  +-3px,  4回振動, 200ms
 * medium: +-6px,  6回振動, 300ms
 * heavy:  +-10px, 8回振動, 400ms
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type ShakeIntensity = 'light' | 'medium' | 'heavy';

interface ScreenShakeProps {
  intensity: ShakeIntensity;
  trigger: number;
  children: React.ReactNode;
}

interface ShakeConfig {
  amplitude: number;
  oscillations: number;
  durationMs: number;
}

const SHAKE_CONFIGS: Record<ShakeIntensity, ShakeConfig> = {
  light:  { amplitude: 3,  oscillations: 4, durationMs: 200 },
  medium: { amplitude: 6,  oscillations: 6, durationMs: 300 },
  heavy:  { amplitude: 10, oscillations: 8, durationMs: 400 },
};

const EASING = Easing.out(Easing.quad);

/**
 * 減衰振動シーケンスを構築する。
 * 各振動ごとに振幅が指数関数的に減衰し、最後に0に戻る。
 */
function buildShakeSequence(config: ShakeConfig) {
  const { amplitude, oscillations, durationMs } = config;
  const stepDuration = Math.round(durationMs / (oscillations + 1));
  const steps: ReturnType<typeof withTiming>[] = [];

  for (let i = 0; i < oscillations; i++) {
    // 指数減衰: 各ステップで振幅が約60%に縮小
    const decay = Math.pow(0.6, i);
    const direction = i % 2 === 0 ? 1 : -1;
    const target = amplitude * decay * direction;

    steps.push(
      withTiming(target, { duration: stepDuration, easing: EASING }),
    );
  }

  // 最終位置を0に戻す
  steps.push(
    withTiming(0, { duration: stepDuration, easing: EASING }),
  );

  return steps;
}

export const ScreenShake: React.FC<ScreenShakeProps> = ({
  intensity,
  trigger,
  children,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) return;

    const config = SHAKE_CONFIGS[intensity];
    const xSteps = buildShakeSequence(config);
    const ySteps = buildShakeSequence({
      ...config,
      amplitude: config.amplitude * 0.6, // Y軸は控えめ
    });

    translateX.value = withSequence(...xSteps) as number;
    translateY.value = withSequence(...ySteps) as number;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
};
