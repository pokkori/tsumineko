import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/stores/gameStore";
import { resetAllData } from "../src/utils/storage";
import { COLORS } from "../src/constants/colors";
import { CAT_SKINS } from "../src/data/catSkins";

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const unlockedSkins = useGameStore((s) => s.unlockedSkins);
  const initialize = useGameStore((s) => s.initialize);

  const handleReset = () => {
    Alert.alert(
      "データリセット",
      "全てのスコア、実績、コインがリセットされます。よろしいですか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "リセット",
          style: "destructive",
          onPress: async () => {
            await resetAllData();
            await initialize();
            Alert.alert("完了", "データをリセットしました");
          },
        },
      ]
    );
  };

  const skinScale = useSharedValue(1);

  const cycleSkin = () => {
    const currentIndex = unlockedSkins.indexOf(settings.selectedSkinId);
    const nextIndex = (currentIndex + 1) % unlockedSkins.length;
    updateSettings({ selectedSkinId: unlockedSkins[nextIndex] });

    skinScale.value = withSpring(0.9, { damping: 8, stiffness: 400 }, () => {
      skinScale.value = withSpring(1.05, { damping: 8, stiffness: 400 }, () => {
        skinScale.value = withSpring(1.0, { damping: 8, stiffness: 300 });
      });
    });
  };

  const skinAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: skinScale.value }],
  }));

  const currentSkin = CAT_SKINS.find((s) => s.id === settings.selectedSkinId);

  return (
    <LinearGradient colors={['#0F0F1A', '#1A0A2E', '#2D1B4E']} style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.header}>
          <Pressable onPress={() => router.back()}
            accessibilityLabel="戻る"
            accessibilityRole="button"
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.backButton}>← 戻る</Text>
          </Pressable>
          <Text style={styles.headerTitle}>設定</Text>
          <View style={{ width: 60 }} />
        </Animated.View>

        <View style={styles.content}>
          {/* Skin Selection */}
          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>使用スキン</Text>
              <Pressable
                style={styles.skinSelector}
                onPress={cycleSkin}
                accessibilityRole="button"
                accessibilityLabel="スキンを変更する"
              >
                <Animated.View
                  style={[
                    styles.skinCircle,
                    { backgroundColor: currentSkin?.bodyColor || "#FFF" },
                    skinAnimStyle,
                  ]}
                />
                <Text style={styles.skinName}>{currentSkin?.name || "三毛猫"}</Text>
                <Text style={styles.changeText}>変更 →</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Volume Controls */}
          <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.card}>
            <Text style={styles.sectionTitle}>サウンド</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>
                BGM音量: {Math.round(settings.bgmVolume * 100)}%
              </Text>
              <View style={styles.volumeRow}>
                <Pressable
                  style={styles.volumeButton}
                  onPress={() => updateSettings({ bgmVolume: Math.max(0, settings.bgmVolume - 0.1) })}
                  accessibilityLabel="BGM音量を下げる"
                  accessibilityRole="button"
                >
                  <Text style={styles.volumeButtonText}>-</Text>
                </Pressable>
                <View style={styles.volumeBar}>
                  <View style={[styles.volumeFill, { width: `${settings.bgmVolume * 100}%` }]} />
                </View>
                <Pressable
                  style={styles.volumeButton}
                  onPress={() => updateSettings({ bgmVolume: Math.min(1, settings.bgmVolume + 0.1) })}
                  accessibilityLabel="BGM音量を上げる"
                  accessibilityRole="button"
                >
                  <Text style={styles.volumeButtonText}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>
                SE音量: {Math.round(settings.seVolume * 100)}%
              </Text>
              <View style={styles.volumeRow}>
                <Pressable
                  style={styles.volumeButton}
                  onPress={() => updateSettings({ seVolume: Math.max(0, settings.seVolume - 0.1) })}
                  accessibilityLabel="SE音量を下げる"
                  accessibilityRole="button"
                >
                  <Text style={styles.volumeButtonText}>-</Text>
                </Pressable>
                <View style={styles.volumeBar}>
                  <View style={[styles.volumeFill, { width: `${settings.seVolume * 100}%` }]} />
                </View>
                <Pressable
                  style={styles.volumeButton}
                  onPress={() => updateSettings({ seVolume: Math.min(1, settings.seVolume + 0.1) })}
                  accessibilityLabel="SE音量を上げる"
                  accessibilityRole="button"
                >
                  <Text style={styles.volumeButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Toggles */}
          <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.card}>
            <Text style={styles.sectionTitle}>操作</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>バイブレーション</Text>
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={(v) => updateSettings({ hapticsEnabled: v })}
                trackColor={{ false: "rgba(255,255,255,0.15)", true: COLORS.secondary }}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>落下ガイド表示</Text>
              <Switch
                value={settings.showGuide}
                onValueChange={(v) => updateSettings({ showGuide: v })}
                trackColor={{ false: "rgba(255,255,255,0.15)", true: COLORS.secondary }}
              />
            </View>
          </Animated.View>

          {/* Reset */}
          <Animated.View entering={FadeInDown.delay(320).duration(400)} style={styles.card}>
            <Pressable
              style={({ pressed }) => [styles.resetButton, pressed && { opacity: 0.8 }]}
              onPress={handleReset}
              accessibilityLabel="スコアリセット"
              accessibilityRole="button"
            >
              <Text style={styles.resetButtonText}>スコアリセット</Text>
            </Pressable>
          </Animated.View>

          {/* Legal */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.card}>
            <Pressable
              onPress={() => router.push("/legal")}
              accessibilityRole="button"
              accessibilityLabel="特定商取引法に基づく表記を見る"
              style={styles.legalRow}
            >
              <Text style={styles.infoLink}>特定商取引法</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/legal/privacy")}
              accessibilityRole="button"
              accessibilityLabel="プライバシーポリシーを見る"
              style={styles.legalRow}
            >
              <Text style={styles.infoLink}>プライバシーポリシー</Text>
            </Pressable>
            <Text style={styles.versionText}>バージョン 1.0.0</Text>
          </Animated.View>
        </View>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  backButton: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F1F5F9",
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(241,245,249,0.5)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  settingLabel: {
    fontSize: 16,
    color: "#F1F5F9",
    flex: 1,
  },
  skinSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  skinCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  skinName: {
    fontSize: 14,
    color: "#F1F5F9",
    fontWeight: "bold",
  },
  changeText: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  volumeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  volumeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,140,66,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  volumeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  volumeBar: {
    width: 80,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  volumeFill: {
    height: "100%",
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
  },
  resetButton: {
    backgroundColor: "rgba(244,67,54,0.2)",
    borderWidth: 1,
    borderColor: "rgba(244,67,54,0.4)",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "bold",
  },
  legalRow: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 8,
  },
  infoLink: {
    color: COLORS.secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  versionText: {
    fontSize: 12,
    color: "rgba(241,245,249,0.4)",
    marginTop: 8,
  },
});
