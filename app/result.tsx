import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { Linking } from "react-native";
import { formatScore, formatHeight } from "../src/utils/format";
import { shareResult } from "../src/utils/share";
import { COLORS } from "../src/constants/colors";
import { useGameStore } from "../src/stores/gameStore";
import { useRewardedAd } from "../src/hooks/useRewardedAd";
import NearMissBanner from "../src/components/NearMissBanner";

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    score: string;
    height: string;
    catCount: string;
    maxCombo: string;
    isNewRecord: string;
    isDaily: string;
  }>();

  const score = parseInt(params.score || "0", 10);
  const height = parseFloat(params.height || "0");
  const catCount = parseInt(params.catCount || "0", 10);
  const maxCombo = parseInt(params.maxCombo || "0", 10);
  const isNewRecord = params.isNewRecord === "true";
  const isDaily = params.isDaily === "true";
  const bestScore = useGameStore((s) => s.stats.bestScore);
  const { showAd } = useRewardedAd();

  // Count-up animation
  const [displayScore, setDisplayScore] = useState(0);
  const contentScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 500 });
    contentScale.value = withSpring(1, { damping: 6 });

    // Score count-up
    const duration = 1500;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.floor(score * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const handleShare = () => {
    shareResult({ score, height, catCount, isNewRecord });
  };

  const handleShareX = () => {
    const text = encodeURIComponent(
      `つみネコで${formatScore(score)}点！${catCount}匹積み上げた！${isNewRecord ? " NEW RECORD!" : ""}\n#つみネコ #カジュアルゲーム`
    );
    Linking.openURL(`https://twitter.com/intent/tweet?text=${text}`);
  };

  const handleAdContinue = () => {
    showAd(() => {
      router.replace("/game");
    });
  };

  return (
    <LinearGradient colors={['#0F0F1A', '#1A0A2E', '#2D1B4E']} style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <Animated.View style={[styles.content, contentStyle]}>
          <Animated.Text
            entering={FadeInDown.delay(0).duration(500)}
            style={styles.gameOverText}
          >
            GAME OVER
          </Animated.Text>

          {isNewRecord && (
            <Animated.View
              entering={FadeInDown.delay(80).duration(500)}
              style={styles.newRecordBanner}
            >
              <Text style={styles.newRecordText}>NEW RECORD!</Text>
            </Animated.View>
          )}

          {/* Score Card */}
          <Animated.View
            entering={FadeInDown.delay(160).duration(500)}
            style={styles.scoreCard}
          >
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={styles.scoreValue}>{formatScore(displayScore)}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Height</Text>
              <Text style={styles.scoreValue}>{formatHeight(height)}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Cats</Text>
              <Text style={styles.scoreValue}>{catCount}匹</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Combo</Text>
              <Text style={styles.scoreValue}>x{maxCombo}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).duration(500)}>
            <NearMissBanner score={score} highScore={bestScore} />
          </Animated.View>

          {/* Buttons */}
          <Animated.View entering={FadeInDown.delay(320).duration(500)} style={{ width: '80%' }}>
            <Pressable
              style={({ pressed }) => [
                styles.retryButtonOuter,
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
              onPress={() => router.replace("/game")}
              accessibilityLabel="リトライ"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['#FF8C42', '#FF6B2B', '#E85520']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.retryButton}
              >
                <Text style={styles.buttonText}>もう一回</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={{ width: '80%' }}>
            <Pressable
              style={({ pressed }) => [
                styles.shareButton,
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
              onPress={handleShare}
              accessibilityLabel="シェアする"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>シェアする</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(480).duration(500)}>
            <Pressable
              style={styles.homeButton}
              onPress={() => router.replace("/")}
              accessibilityLabel="ホームに戻る"
              accessibilityRole="button"
            >
              <Text style={styles.homeButtonText}>タイトルに戻る</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
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
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  gameOverText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#F1F5F9",
    letterSpacing: 4,
    marginBottom: 16,
    textShadowColor: 'rgba(255,140,66,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  newRecordBanner: {
    backgroundColor: "rgba(255,215,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.4)",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  newRecordText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD93D",
    textShadowColor: '#FFD93D',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  scoreCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 24,
    width: "90%",
    marginBottom: 24,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  scoreLabel: {
    fontSize: 18,
    color: "rgba(241,245,249,0.7)",
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#F1F5F9",
  },
  retryButtonOuter: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  shareButton: {
    backgroundColor: "rgba(79,195,247,0.15)",
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.3)",
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  homeButton: {
    marginTop: 12,
  },
  homeButtonText: {
    color: "rgba(241,245,249,0.6)",
    fontSize: 16,
  },
});
