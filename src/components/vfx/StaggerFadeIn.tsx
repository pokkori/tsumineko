/**
 * StaggerFadeIn.tsx
 *
 * staggerフェードインコンテナ（共通VFXコンポーネント）
 * 子要素を指定間隔でフェードイン+スライドインさせる。
 *
 * 用途:
 *   タイトル画面 - ロゴ、ボタン群を順番に表示
 *   リザルト画面 - スコア、ランク、ボタンを順番に表示（120ms間隔推奨）
 *
 * easingにEasing.out + back(1.4)を使用し、オーバーシュート感のあるバウンスを実現。
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

/**
 * Easing.back(overshoot) を手動実装。
 * back(1.4) は要素が目標位置を少し超えてから戻る「バウンス感」を生む。
 */
const backEasing = (overshoot: number = 1.4) => {
  return Easing.bezier(0.34, 1.56, 0.64, 1);
};

interface StaggerFadeInItemProps {
  index: number;
  staggerDelay: number;
  trigger: number;
  direction: 'up' | 'down' | 'left' | 'right';
  slideDistance: number;
  duration: number;
  children: React.ReactNode;
}

const StaggerFadeInItem: React.FC<StaggerFadeInItemProps> = ({
  index,
  staggerDelay,
  trigger,
  direction,
  slideDistance,
  duration,
  children,
}) => {
  const opacity    = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    const initX = direction === 'left' ? -slideDistance : direction === 'right' ? slideDistance : 0;
    const initY = direction === 'up' ? slideDistance : direction === 'down' ? -slideDistance : 0;

    opacity.value    = 0;
    translateX.value = initX;
    translateY.value = initY;

    const delay = index * staggerDelay;
    // back easing: オーバーシュート感のあるバウンス
    const easing = backEasing(1.4);

    opacity.value = withDelay(delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
    );
    translateX.value = withDelay(delay,
      withTiming(0, { duration, easing }),
    );
    translateY.value = withDelay(delay,
      withTiming(0, { duration, easing }),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const style = useAnimatedStyle(() => ({
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

interface StaggerFadeInProps {
  /** 発火トリガー。0以外に変更で発火。 */
  trigger?: number;
  /** stagger間隔（ms）。デフォルト 120（リザルト画面推奨値） */
  staggerDelay?: number;
  /** スライド方向。デフォルト 'up' */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** スライド距離（px）。デフォルト 30 */
  slideDistance?: number;
  /** アニメーション時間（ms）。デフォルト 500 */
  duration?: number;
  children: React.ReactNode;
}

export const StaggerFadeIn: React.FC<StaggerFadeInProps> = ({
  trigger = 1,
  staggerDelay = 120,
  direction = 'up',
  slideDistance = 30,
  duration = 500,
  children,
}) => {
  const childArray = React.Children.toArray(children);

  return (
    <>
      {childArray.map((child, index) => (
        <StaggerFadeInItem
          key={index}
          index={index}
          staggerDelay={staggerDelay}
          trigger={trigger}
          direction={direction}
          slideDistance={slideDistance}
          duration={duration}
        >
          {child}
        </StaggerFadeInItem>
      ))}
    </>
  );
};
