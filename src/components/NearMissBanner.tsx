/**
 * NearMissBanner - ニアミス演出コンポーネント（全ゲーム共通）
 * リザルト画面で「あとX点で自己ベスト！」を表示
 * - 差分1-5%: 「惜しい！あとほんのX点！」赤文字
 * - 差分6-20%: 「あとX点で自己ベスト！」オレンジ
 * - 差分21-50%: 「自己ベストの半分突破！」白
 * - 超えた: 「NEW RECORD!」金色+パーティクル
 *
 * Reanimated v4 スケールバウンスアニメーション付き
 */
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface NearMissBannerProps {
  score: number;
  highScore: number;
  /** 表示するまでの遅延ms（デフォルト300） */
  delay?: number;
}

interface BannerConfig {
  message: string;
  color: string;
  glowColor: string;
  isRecord: boolean;
}

/** ニアミスメッセージ4パターン（ランダム選択） */
const NEAR_MISS_PATTERNS = [
  'おしい！',
  'あと少し！',
  '惜しかった...',
  'ギリギリ！',
] as const;

function pickNearMissMessage(): string {
  return NEAR_MISS_PATTERNS[Math.floor(Math.random() * NEAR_MISS_PATTERNS.length)];
}

function getBannerConfig(score: number, highScore: number): BannerConfig | null {
  if (highScore <= 0) return null;

  if (score >= highScore) {
    return {
      message: 'NEW RECORD!',
      color: '#FFD93D',
      glowColor: 'rgba(255,217,61,0.5)',
      isRecord: true,
    };
  }

  const diff = highScore - score;
  const pct = (diff / highScore) * 100;

  if (pct <= 5) {
    return {
      message: `${pickNearMissMessage()} あとほんの${diff}点！`,
      color: '#FF6B6B',
      glowColor: 'rgba(230,57,70,0.4)',
      isRecord: false,
    };
  }
  if (pct <= 20) {
    return {
      message: `${pickNearMissMessage()} あと${diff}点で自己ベスト！`,
      color: '#FF9F43',
      glowColor: 'rgba(255,159,67,0.3)',
      isRecord: false,
    };
  }
  if (pct <= 50) {
    return {
      message: '自己ベストの半分突破！',
      color: '#FFFFFF',
      glowColor: 'rgba(255,255,255,0.2)',
      isRecord: false,
    };
  }

  return null; // 50%以上離れている場合は非表示
}

// パーティクル1個分
function Particle({ index, delay: d }: { index: number; delay: number }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    const angle = (index / 12) * Math.PI * 2;
    const radius = 40 + Math.random() * 30;

    opacity.value = withDelay(d, withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 600 }),
    ));
    translateX.value = withDelay(d, withTiming(Math.cos(angle) * radius, { duration: 800 }));
    translateY.value = withDelay(d, withTiming(Math.sin(angle) * radius - 20, { duration: 800 }));
    scale.value = withDelay(d, withSequence(
      withTiming(1.2, { duration: 300 }),
      withTiming(0, { duration: 500 }),
    ));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const colors = ['#FFD93D', '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F'];
  const color = colors[index % colors.length];

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

export default function NearMissBanner({ score, highScore, delay = 300 }: NearMissBannerProps) {
  const config = useMemo(() => getBannerConfig(score, highScore), [score, highScore]);
  const bannerScale = useSharedValue(0);
  const bannerOpacity = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (!config) return;

    bannerOpacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    bannerScale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.15, { damping: 6, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 }),
      ),
    );

    if (config.isRecord) {
      shimmer.value = withDelay(
        delay + 400,
        withRepeat(withTiming(1, { duration: 1500 }), -1, true),
      );
    }
  }, [config, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bannerScale.value }],
    opacity: bannerOpacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + shimmer.value * 0.4,
  }));

  if (!config) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {config.isRecord && (
        <Animated.View style={[styles.glow, { backgroundColor: config.glowColor }, shimmerStyle]} />
      )}
      <Text
        style={[
          styles.text,
          { color: config.color, textShadowColor: config.glowColor },
        ]}
        accessibilityRole="text"
        accessibilityLabel={config.message}
      >
        {config.message}
      </Text>
      {config.isRecord && (
        <View style={styles.particleContainer}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Particle key={i} index={i} delay={delay + 200 + i * 50} />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  text: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    letterSpacing: 1,
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
});
