/**
 * ParticleEffect.tsx
 *
 * 着地時・コンボ時パーティクルエフェクト
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 *
 * 着地: 8-12粒、金色系、500-700ms
 * コンボx3: 16-20粒、4色、700-900ms
 * コンボx5+: 30-40粒、5色、1000-1500ms
 *
 * 各パーティクルは放射状に飛び散り -> 重力で落下 -> フェードアウト
 */

import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

// --- パーティクル設定 ---

interface ParticleConfig {
  count: number;
  colors: string[];
  minSize: number;
  maxSize: number;
  speed: number;       // 飛距離（px）
  spread: number;      // 放射角度（度）
  gravity: number;     // 重力加速度分のY追加offset
  lifetime: number;    // ms
}

const LANDING_CONFIG: ParticleConfig = {
  count: 10,
  colors: ["#FFD700", "#FFA500", "#FFFF00"],
  minSize: 4,
  maxSize: 8,
  speed: 60,
  spread: 360,
  gravity: 30,
  lifetime: 600,
};

const COMBO3_CONFIG: ParticleConfig = {
  count: 18,
  colors: ["#FFD93D", "#FF6B35", "#2DD4BF", "#FF85A2"],
  minSize: 5,
  maxSize: 10,
  speed: 80,
  spread: 360,
  gravity: 25,
  lifetime: 800,
};

const COMBO5_CONFIG: ParticleConfig = {
  count: 35,
  colors: ["#FF2E63", "#FFD93D", "#2DD4BF", "#6C5CE7", "#FF85A2"],
  minSize: 6,
  maxSize: 14,
  speed: 110,
  spread: 360,
  gravity: 20,
  lifetime: 1200,
};

export type ParticleType = "landing" | "combo3" | "combo5";

function getConfig(type: ParticleType): ParticleConfig {
  switch (type) {
    case "combo5":
      return COMBO5_CONFIG;
    case "combo3":
      return COMBO3_CONFIG;
    case "landing":
    default:
      return LANDING_CONFIG;
  }
}

// --- 単一パーティクル ---

interface SingleLandingParticleProps {
  index: number;
  total: number;
  trigger: number;
  originX: number;
  originY: number;
  color: string;
  size: number;
  config: ParticleConfig;
}

const SingleLandingParticle: React.FC<SingleLandingParticleProps> = ({
  index,
  total,
  trigger,
  originX,
  originY,
  color,
  size,
  config,
}) => {
  const x = useSharedValue(originX);
  const y = useSharedValue(originY);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) return;

    // 放射角度を均等分割 + ランダムオフセット
    const angleRad =
      ((config.spread / total) * index * Math.PI) / 180 +
      (Math.random() - 0.5) * 0.8;
    const dist = config.speed * (0.5 + Math.random() * 0.6);
    const dur = config.lifetime + Math.random() * 200;

    const targetX = originX + Math.cos(angleRad) * dist;
    // 重力: 最初は上に飛んで、targetYは重力分下がる
    const targetY =
      originY + Math.sin(angleRad) * dist * 0.6 + config.gravity;

    // リセット
    x.value = originX;
    y.value = originY;
    opacity.value = 1;
    scale.value = 0;

    // アニメーション開始
    scale.value = withSpring(1, { damping: 10, stiffness: 350 });
    x.value = withTiming(targetX, {
      duration: dur,
      easing: Easing.out(Easing.cubic),
    });
    // Y軸: 最初少し上に跳ね、その後重力で落下（2段階）
    y.value = withSequence(
      withTiming(originY - 15 - Math.random() * 20, {
        duration: dur * 0.3,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(targetY, {
        duration: dur * 0.7,
        easing: Easing.in(Easing.quad),
      }),
    );
    opacity.value = withDelay(
      dur * 0.4,
      withTiming(0, {
        duration: dur * 0.6,
        easing: Easing.in(Easing.quad),
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const half = size / 2;

  const style = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: x.value - half,
    top: y.value - half,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    width: size,
    height: size,
    borderRadius: half,
    backgroundColor: color,
  }));

  return <Animated.View style={style} />;
};

// --- メインコンポーネント ---

interface ParticleEffectProps {
  /** 発火トリガー（0以外に変更で発火） */
  trigger: number;
  /** 発火位置X */
  originX: number;
  /** 発火位置Y */
  originY: number;
  /** パーティクルタイプ */
  type: ParticleType;
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  trigger,
  originX,
  originY,
  type,
}) => {
  const config = getConfig(type);

  // サイズとカラーをメモ化
  const particles = useMemo(
    () =>
      Array.from({ length: config.count }, (_, i) => ({
        size:
          config.minSize +
          Math.random() * (config.maxSize - config.minSize),
        color: config.colors[i % config.colors.length],
      })),
    [config.count, config.minSize, config.maxSize, config.colors],
  );

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {particles.map((p, i) => (
        <SingleLandingParticle
          key={i}
          index={i}
          total={config.count}
          trigger={trigger}
          originX={originX}
          originY={originY}
          color={p.color}
          size={p.size}
          config={config}
        />
      ))}
    </View>
  );
};
