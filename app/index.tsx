import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import Svg, { Path, Rect, Circle, Line } from "react-native-svg";
import { useGameStore } from "../src/stores/gameStore";
import { useDailyChallenge } from "../src/hooks/useDailyChallenge";
import { DailyBadge } from "../src/components/DailyBadge";
import { formatScore, formatHeight } from "../src/utils/format";
import { COLORS } from "../src/constants/colors";
import { loadStreak, type StreakData } from "../src/lib/streak";
import WelcomeBackModal, { checkWelcomeBack } from "../src/components/WelcomeBackModal";

// SVGアイコン群（絵文字禁止）
function CatStackSVG() {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80">
      {/* 下の猫 */}
      <Circle cx="40" cy="62" r="14" fill={COLORS.secondary} />
      <Circle cx="34" cy="56" r="3" fill="#1A1A2E" />
      <Circle cx="46" cy="56" r="3" fill="#1A1A2E" />
      <Path d="M28 50 L32 44 M52 50 L48 44" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" />
      {/* 中の猫 */}
      <Circle cx="40" cy="42" r="11" fill="#FFAA70" />
      <Circle cx="35" cy="37" r="2.5" fill="#1A1A2E" />
      <Circle cx="45" cy="37" r="2.5" fill="#1A1A2E" />
      <Path d="M30 32 L34 27 M50 32 L46 27" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" />
      {/* 上の猫 */}
      <Circle cx="40" cy="24" r="9" fill="#FFD7A0" />
      <Circle cx="35.5" cy="20" r="2" fill="#1A1A2E" />
      <Circle cx="44.5" cy="20" r="2" fill="#1A1A2E" />
      <Path d="M32 16 L35 12 M48 16 L45 12" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" />
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
      <Path d="M8 3H5a2 2 0 0 0-2 2v3c0 2.5 2 4.5 4.5 5A6 6 0 0 0 12 18a6 6 0 0 0 4.5-5C19 12.5 21 10.5 21 8V5a2 2 0 0 0-2-2h-3" stroke="#FFD93D" strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 18v3M8 21h8M8 3h8" stroke="#FFD93D" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function RulerIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="6" width="20" height="12" rx="2" stroke="#4A90D9" strokeWidth="2" />
      <Path d="M6 6v4M10 6v2M14 6v4M18 6v2" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export default function TitleScreen() {
  const router = useRouter();
  const stats = useGameStore((s) => s.stats);
  const initialized = useGameStore((s) => s.initialized);
  const { isCompleted } = useDailyChallenge();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [welcomeResult, setWelcomeResult] = useState<{ shouldShow: boolean; hoursAway: number; bonusCoins: number; message: string }>({ shouldShow: false, hoursAway: 0, bonusCoins: 0, message: '' });

  // Reanimated pulse animation
  const pulseScale = useSharedValue(1);
  const catTranslateY = useSharedValue(0);

  useEffect(() => {
    setStreakData(loadStreak("tsumineko"));
    checkWelcomeBack().then((r) => {
      if (r.shouldShow) {
        setWelcomeResult(r);
        setWelcomeVisible(true);
      }
    });
  }, []);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );

    catTranslateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const catBounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: catTranslateY.value }],
  }));

  if (!initialized) {
    return (
      <LinearGradient colors={['#0F0F1A', '#1A0A2E', '#2D1B4E']} style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0F0F1A', '#1A0A2E', '#2D1B4E']} style={styles.container}>
      <SafeAreaView style={styles.inner}>
        {/* Cat Tower Animation */}
        <Animated.View
          entering={FadeInDown.delay(0).duration(500)}
          style={[styles.towerContainer, catBounceStyle]}
          accessibilityLabel="積み重なった猫のタワー"
          accessibilityRole="image"
        >
          <CatStackSVG />
          <View style={styles.towerBase} />
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(80).duration(500)}
          style={styles.title}
        >
          つみネコ
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(160).duration(500)}
          style={styles.subtitle}
        >
          Stack Cats
        </Animated.Text>

        {/* Play Button */}
        <Animated.View
          entering={FadeInDown.delay(240).duration(500)}
          style={pulseStyle}
        >
          <Pressable
            onPress={() => router.push("/game")}
            accessibilityRole="button"
            accessibilityLabel="ゲームをプレイする"
            style={({ pressed }) => [
              styles.playButtonOuter,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
          >
            <LinearGradient
              colors={['#FF8C42', '#FF6B2B', '#E85520']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButton}
            >
              <Text style={styles.playButtonText}>▶ あそぶ</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Daily Challenge */}
        <Animated.View entering={FadeInDown.delay(320).duration(500)}>
          <Pressable
            onPress={() => router.push("/game?daily=true")}
            accessibilityRole="button"
            accessibilityLabel={isCompleted ? 'デイリーチャレンジ完了済み' : 'デイリーチャレンジを開く'}
            style={({ pressed }) => [
              styles.dailyButton,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
          >
            <View style={styles.buttonInner}>
              <CalendarIcon />
              <Text style={styles.dailyButtonText}>デイリー</Text>
            </View>
            <DailyBadge isCompleted={isCompleted} />
          </Pressable>
        </Animated.View>

        {/* Best Score */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.statsContainer}
        >
          <View style={styles.statsCard}>
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
          </View>
          {streakData !== null && streakData.count > 0 && (
            <View style={styles.streakBadge} accessibilityLabel={`${streakData.count}日連続プレイ中`}>
              <FireIcon />
              <Text style={styles.streakText}>
                {streakData.count}日連続プレイ中
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Footer Buttons */}
        <Animated.View
          entering={FadeInDown.delay(480).duration(500)}
          style={styles.footer}
        >
          <Pressable
            style={({ pressed }) => [
              styles.footerButton,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
            onPress={() => router.push("/collection")}
            accessibilityRole="button"
            accessibilityLabel="図鑑を開く"
          >
            <BookIcon color="#F1F5F9" />
            <Text style={styles.footerButtonText}>図鑑</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.footerButton,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
            onPress={() => router.push("/shop")}
            accessibilityRole="button"
            accessibilityLabel="ショップを開く"
          >
            <ShopIcon color="#F1F5F9" />
            <Text style={styles.footerButtonText}>ショップ</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.footerButton,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
            onPress={() => router.push("/settings")}
            accessibilityRole="button"
            accessibilityLabel="設定を開く"
          >
            <GearIcon color="#F1F5F9" />
            <Text style={styles.footerButtonText}>設定</Text>
          </Pressable>
        </Animated.View>
        <WelcomeBackModal
          visible={welcomeVisible}
          result={welcomeResult}
          onClose={() => setWelcomeVisible(false)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 24,
    color: '#F1F5F9',
    textAlign: 'center',
    marginTop: 100,
  },
  towerContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  towerBase: {
    width: 120,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 4,
    marginTop: 4,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: '#F1F5F9',
    letterSpacing: 8,
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(241,245,249,0.6)',
    marginBottom: 24,
    letterSpacing: 4,
  },
  playButtonOuter: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  playButton: {
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: 30,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  dailyButton: {
    backgroundColor: "rgba(79,195,247,0.15)",
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.3)",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 16,
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
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "bold",
  },
  statsContainer: {
    marginTop: 20,
    alignItems: "center",
    gap: 8,
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statsText: {
    fontSize: 16,
    color: '#F1F5F9',
  },
  streakBadge: {
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
    color: "#FFD93D",
  },
  footer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 40,
    gap: 16,
  },
  footerButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
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
    color: '#F1F5F9',
    fontWeight: "bold",
  },
});
