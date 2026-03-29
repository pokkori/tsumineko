/**
 * TransitionWrapper.tsx
 *
 * 画面遷移アニメーション（共通VFXコンポーネント）
 *
 * 各画面のルートを包むと、マウント時にスライド+フェードインする。
 * 方向・速度はpropsで制御。
 *
 * 遷移パターン:
 *   タイトル→ゲーム:  fadeSlideUp   300ms
 *   ゲーム→リザルト:   fadeSlideLeft  400ms
 *   リザルト→タイトル: fadeSlideDown  300ms
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type TransitionDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface TransitionWrapperProps {
  /** スライド方向。'up' = 下から上にスライドイン。デフォルト 'up' */
  direction?: TransitionDirection;
  /** アニメーション時間（ms）。デフォルト 350 */
  duration?: number;
  /** スライド距離（px）。デフォルト 40 */
  distance?: number;
  /** 遅延（ms）。デフォルト 0 */
  delay?: number;
  children: React.ReactNode;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  direction = 'up',
  duration = 350,
  distance = 40,
  delay = 0,
  children,
}) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // 初期位置を設定
    switch (direction) {
      case 'up':
        translateY.value = distance;
        break;
      case 'down':
        translateY.value = -distance;
        break;
      case 'left':
        translateX.value = distance;
        break;
      case 'right':
        translateX.value = -distance;
        break;
      case 'none':
        break;
    }

    // back easing: 目標を少し超えてから戻る
    const easing = Easing.bezier(0.34, 1.56, 0.64, 1);
    const opacityEasing = Easing.out(Easing.cubic);

    const startAnimation = () => {
      opacity.value = withTiming(1, { duration, easing: opacityEasing });
      translateX.value = withTiming(0, { duration, easing });
      translateY.value = withTiming(0, { duration, easing });
    };

    if (delay > 0) {
      const timer = setTimeout(startAnimation, delay);
      return () => clearTimeout(timer);
    } else {
      startAnimation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={style}>
      {children}
    </Animated.View>
  );
};
