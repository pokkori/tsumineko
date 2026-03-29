/**
 * FeverOverlay.tsx
 *
 * フィーバー中の全画面グロー演出（共通VFXコンポーネント）
 *
 * active=true の間:
 *   1. レインボーボーダーグロー（左→右へ色相回転）
 *   2. 背景パルス（不透明度が呼吸するように増減）
 *   3. 画面端から中央へ光の粒子が流れる
 *
 * active=false で即座にフェードアウト。
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';

const { width: SW, height: SH } = Dimensions.get('window');

interface FeverOverlayProps {
  active: boolean;
}

// --- レインボーボーダー ---
const FeverBorder: React.FC<{ side: 'top' | 'bottom' | 'left' | 'right' }> = ({ side }) => {
  const opacity = useSharedValue(0);
  const pulse = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const isHorizontal = side === 'top' || side === 'bottom';

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    ...(side === 'top' && { top: 0, left: 0, right: 0, height: 3 }),
    ...(side === 'bottom' && { bottom: 0, left: 0, right: 0, height: 3 }),
    ...(side === 'left' && { top: 0, left: 0, bottom: 0, width: 3 }),
    ...(side === 'right' && { top: 0, right: 0, bottom: 0, width: 3 }),
    backgroundColor: '#FF2E63',
    opacity: pulse.value * opacity.value,
    shadowColor: '#FF2E63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: pulse.value,
    shadowRadius: 12,
    elevation: 8,
  }));

  return <Animated.View style={style} />;
};

// --- 背景パルスグロー ---
const FeverGlow: React.FC = () => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.02, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FF2E63',
    opacity: opacity.value,
  }));

  return <Animated.View style={style} pointerEvents="none" />;
};

// --- フィーバーストリーク粒子（画面端から中央へ） ---
const FeverStreak: React.FC<{ index: number }> = ({ index }) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);

  const config = React.useMemo(() => {
    const side = index % 4; // 0:top 1:right 2:bottom 3:left
    const offset = (index / 20) * (side % 2 === 0 ? SW : SH);
    const startX = side === 0 ? offset : side === 1 ? SW : side === 2 ? SW - offset : 0;
    const startY = side === 0 ? 0 : side === 1 ? offset : side === 2 ? SH : SH - offset;
    return {
      startX,
      startY,
      endX: SW / 2 + (Math.random() - 0.5) * 100,
      endY: SH / 2 + (Math.random() - 0.5) * 100,
      dur: 1500 + Math.random() * 1000,
      delay: Math.random() * 2000,
      size: 2 + Math.random() * 3,
    };
  }, [index]);

  useEffect(() => {
    const animate = () => {
      x.value = config.startX;
      y.value = config.startY;
      opacity.value = 0;

      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: config.dur * 0.3, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: config.dur * 0.7, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      );

      x.value = withRepeat(
        withTiming(config.endX, { duration: config.dur, easing: Easing.out(Easing.cubic) }),
        -1,
        false,
      );

      y.value = withRepeat(
        withTiming(config.endY, { duration: config.dur, easing: Easing.out(Easing.cubic) }),
        -1,
        false,
      );
    };

    const timer = setTimeout(animate, config.delay);
    return () => clearTimeout(timer);
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: x.value - config.size / 2,
    top: y.value - config.size / 2,
    width: config.size,
    height: config.size,
    borderRadius: config.size / 2,
    backgroundColor: '#FFD93D',
    opacity: opacity.value,
  }));

  return <Animated.View style={style} />;
};

// --- メインコンポーネント ---
export const FeverOverlay: React.FC<FeverOverlayProps> = ({ active }) => {
  const reducedMotion = useReducedMotion();
  const containerOpacity = useSharedValue(0);

  useEffect(() => {
    containerOpacity.value = withTiming(active ? 1 : 0, {
      duration: active ? 300 : 500,
      easing: active ? Easing.out(Easing.cubic) : Easing.in(Easing.quad),
    });
  }, [active]);

  if (reducedMotion) return null;

  const containerStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View
      style={containerStyle}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <FeverGlow />
      <FeverBorder side="top" />
      <FeverBorder side="bottom" />
      <FeverBorder side="left" />
      <FeverBorder side="right" />
      {Array.from({ length: 12 }, (_, i) => (
        <FeverStreak key={i} index={i} />
      ))}
    </Animated.View>
  );
};
