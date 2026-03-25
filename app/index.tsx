import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Rect, Circle, Line } from "react-native-svg";
import { useGameStore } from "../src/stores/gameStore";
import { useDailyChallenge } from "../src/hooks/useDailyChallenge";
import { DailyBadge } from "../src/components/DailyBadge";
import { formatScore, formatHeight } from "../src/utils/format";
import { COLORS } from "../src/constants/colors";
import { loadStreak, type StreakData } from "../src/lib/streak";

// SVGアイコン群（絵文字禁止）
function CatStackSVG() {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80">
      {/* 下の猫 */}
      <Circle cx="40" cy="62" r="14" fill={COLORS.secondary} />
      <Circle cx="34" cy="56" r="3" fill={COLORS.text} />
      <Circle cx="46" cy="56" r="3" fill={COLORS.text} />
      <Path d="M28 50 L32 44 M52 50 L48 44" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
      {/* 中の猫 */}
      <Circle cx="40" cy="42" r="11" fill="#FFAA70" />
      <Circle cx="35" cy="37" r="2.5" fill={COLORS.text} />
      <Circle cx="45" cy="37" r="2.5" fill={COLORS.text} />
      <Path d="M30 32 L34 27 M50 32 L46 27" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
      {/* 上の猫 */}
      <Circle cx="40" cy="24" r="9" fill="#FFD7A0" />
      <Circle cx="35.5" cy="20" r="2" fill={COLORS.text} />
      <Circle cx="44.5" cy="20" r="2" fill={COLORS.text} />
      <Path d="M32 16 L35 12 M48 16 L45 12" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function CalendarIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#FFFFFF" strokeWidth="2" />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function BookIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

function ShopIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function GearIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
      <Path
        d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function FireIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c0 0-6 6-6 12a6 6 0 0 0 12 0c0-3-2-5-3-7-1 2-1.5 3-1.5 3S12 8 12 2z"
        fill="#FF6B00" stroke="#FF6B00" strokeWidth="1" />
    </Svg>
  );
}

function TrophyIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M8 3H5a2 2 0 0 0-2 2v3c0 2.5 2 4.5 4.5 5A6 6 0 0 0 12 18a6 6 0 0 0 4.5-5C19 12.5 21 10.5 21 8V5a2 2 0 0 0-2-2h-3" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 18v3M8 21h8M8 3h8" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function RulerIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="6" width="20" height="12" rx="2" stroke={COLORS.skyHigh} strokeWidth="2" />
      <Path d="M6 6v4M10 6v2M14 6v4M18 6v2" stroke={COLORS.skyHigh} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export default function TitleScreen() {
  const router = useRouter();
  const stats = useGameStore((s) => s.stats);
  const initialized = useGameStore((s) => s.initialized);
  const { isCompleted } = useDailyChallenge();
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const catBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setStreakData(loadStreak("tsumineko"));
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(catBounce, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(catBounce, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!initialized) {
    return (
      <View style={[styles.container, styles.loading]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Cat Tower Animation */}
      <Animated.View
        style={[styles.towerContainer, { transform: [{ translateY: catBounce }] }]}
        accessibilityLabel="積み重なった猫のタワー"
        accessibilityRole="image"
      >
        <CatStackSVG />
        <View style={styles.towerBase} />
      </Animated.View>

      {/* Title */}
      <Text style={styles.title}>つみネコ</Text>
      <Text style={styles.subtitle}>Stack Cats</Text>

      {/* Play Button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push("/game")}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="ゲームをプレイする"
        >
          <Text style={styles.playButtonText}>▶ あそぶ</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Daily Challenge */}
      <TouchableOpacity
        style={styles.dailyButton}
        onPress={() => router.push("/game?daily=true")}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isCompleted ? 'デイリーチャレンジ完了済み' : 'デイリーチャレンジを開く'}
      >
        <View style={styles.buttonInner}>
          <CalendarIcon />
          <Text style={styles.dailyButtonText}>デイリー</Text>
        </View>
        <DailyBadge isCompleted={isCompleted} />
      </TouchableOpacity>

      {/* Best Score */}
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <TrophyIcon />
          <Text style={styles.statsText} accessibilityLabel={`ベストスコア ${formatScore(stats.bestScore)}`}>
            Best: {formatScore(stats.bestScore)}
          </Text>
        </View>
        <View style={styles.statRow}>
          <RulerIcon />
          <Text style={styles.statsText} accessibilityLabel={`最大の高さ ${formatHeight(stats.bestHeight)}`}>
            Max: {formatHeight(stats.bestHeight)}
          </Text>
        </View>
        {streakData !== null && streakData.count > 0 && (
          <View style={styles.streakBadge} accessibilityLabel={`${streakData.count}日連続プレイ中`}>
            <FireIcon />
            <Text style={styles.streakText}>
              {streakData.count}日連続プレイ中
            </Text>
          </View>
        )}
      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.push("/collection")}
          accessibilityRole="button"
          accessibilityLabel="図鑑を開く"
        >
          <BookIcon color={COLORS.text} />
          <Text style={styles.footerButtonText}>図鑑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.push("/shop")}
          accessibilityRole="button"
          accessibilityLabel="ショップを開く"
        >
          <ShopIcon color={COLORS.text} />
          <Text style={styles.footerButtonText}>ショップ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.push("/settings")}
          accessibilityRole="button"
          accessibilityLabel="設定を開く"
        >
          <GearIcon color={COLORS.text} />
          <Text style={styles.footerButtonText}>設定</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loading: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 24,
    color: COLORS.text,
  },
  towerContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  towerBase: {
    width: 120,
    height: 8,
    backgroundColor: COLORS.ground,
    borderRadius: 4,
    marginTop: 4,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.text,
    letterSpacing: 8,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    color: COLORS.textLight,
    marginBottom: 24,
    letterSpacing: 4,
  },
  playButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    minHeight: 56,
    justifyContent: "center",
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  dailyButton: {
    backgroundColor: "#4FC3F7",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 52,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dailyButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  statsContainer: {
    marginTop: 20,
    alignItems: "center",
    gap: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statsText: {
    fontSize: 16,
    color: COLORS.text,
  },
  streakBadge: {
    marginTop: 8,
    backgroundColor: "rgba(255, 140, 0, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 140, 0, 0.4)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  streakText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E65100",
  },
  footer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 40,
    gap: 16,
  },
  footerButton: {
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
  },
  footerButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "bold",
  },
});
