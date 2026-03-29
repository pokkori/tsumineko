import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/stores/gameStore";
import { CAT_SHAPES } from "../src/data/catShapes";
import { CAT_SKINS } from "../src/data/catSkins";
import { ACHIEVEMENTS } from "../src/data/achievements";
import { COLORS } from "../src/constants/colors";
import { CatPreviewMini } from "../src/components/CatPreviewMini";
import { IconSvg, NekoIconName } from "../src/components/IconSvg";

export default function CollectionScreen() {
  const router = useRouter();
  const achievements = useGameStore((s) => s.achievements);
  const unlockedSkins = useGameStore((s) => s.unlockedSkins);

  const shapesUsedCount = achievements.shapesUsed.length;
  const unlockedCount = achievements.unlockedIds.length;

  return (
    <LinearGradient colors={['#0F0F1A', '#1A0A2E', '#2D1B4E']} style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.header}>
          <Pressable onPress={() => router.back()} accessibilityLabel="戻る" accessibilityRole="button">
            <Text style={styles.backButton}>← 戻る</Text>
          </Pressable>
          <Text style={styles.headerTitle}>ネコ図鑑</Text>
          <View style={{ width: 60 }} />
        </Animated.View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Shape Collection */}
          <Animated.Text entering={FadeInDown.delay(80).duration(400)} style={styles.sectionTitle}>形状コレクション</Animated.Text>
          <Text style={styles.sectionSubtitle}>
            収集率: {shapesUsedCount}/{CAT_SHAPES.length}
          </Text>

          <View style={styles.grid}>
            {CAT_SHAPES.map((shape, idx) => {
              const unlocked = achievements.shapesUsed.includes(shape.id);
              return (
                <Animated.View
                  key={shape.id}
                  entering={FadeInDown.delay(160 + idx * 40).duration(300)}
                  style={[styles.card, !unlocked && styles.cardLocked]}
                >
                  <View style={[styles.cardIconCircle, { backgroundColor: unlocked ? '#FFD93D' : 'rgba(255,255,255,0.1)' }]} />
                  <Text style={styles.cardName}>
                    {unlocked ? shape.name : "???"}
                  </Text>
                  <Text style={[styles.cardStatus, { color: unlocked ? '#4CAF50' : 'rgba(241,245,249,0.4)' }]}>
                    {unlocked ? "解放" : "未解放"}
                  </Text>
                </Animated.View>
              );
            })}
          </View>

          {/* Skin Collection */}
          <Animated.Text entering={FadeInDown.delay(400).duration(400)} style={styles.sectionTitle}>スキンコレクション</Animated.Text>
          <Text style={styles.sectionSubtitle}>
            解放率: {unlockedSkins.length}/{CAT_SKINS.length}
          </Text>

          <View style={styles.grid}>
            {CAT_SKINS.map((skin, idx) => {
              const unlocked = unlockedSkins.includes(skin.id);
              return (
                <Animated.View
                  key={skin.id}
                  entering={FadeInDown.delay(480 + idx * 40).duration(300)}
                  style={[styles.card, !unlocked && styles.cardLocked]}
                >
                  <CatPreviewMini skinId={skin.id} size={40} locked={!unlocked} />
                  <Text style={styles.cardName}>
                    {unlocked ? skin.name : "???"}
                  </Text>
                  <Text style={[styles.cardStatus, { color: unlocked ? '#4CAF50' : 'rgba(241,245,249,0.4)' }]}>
                    {unlocked ? "解放" : "未解放"}
                  </Text>
                </Animated.View>
              );
            })}
          </View>

          {/* Achievements */}
          <Animated.Text entering={FadeInDown.delay(600).duration(400)} style={styles.sectionTitle}>実績</Animated.Text>
          <Text style={styles.sectionSubtitle}>
            解放率: {unlockedCount}/{ACHIEVEMENTS.length}
          </Text>

          {ACHIEVEMENTS.map((achievement, idx) => {
            const unlocked = achievements.unlockedIds.includes(achievement.id);
            const hidden = achievement.isSecret && !unlocked;

            return (
              <Animated.View
                key={achievement.id}
                entering={FadeInDown.delay(680 + idx * 60).duration(300)}
                style={[styles.achievementRow, !unlocked && styles.achievementLocked]}
              >
                <View style={styles.achievementIcon}>
                  {hidden ? (
                    <Text style={{ color: "rgba(241,245,249,0.4)", fontSize: 20 }}>?</Text>
                  ) : (
                    <IconSvg name={achievement.icon as NekoIconName} size={28} color={unlocked ? "#FFD700" : "rgba(241,245,249,0.3)"} />
                  )}
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>
                    {hidden ? "???" : achievement.name}
                  </Text>
                  <Text style={styles.achievementDesc}>
                    {hidden ? "隠し実績" : achievement.description}
                  </Text>
                </View>
                <Text style={[styles.achievementStatus, { color: unlocked ? '#4CAF50' : 'rgba(241,245,249,0.4)' }]}>
                  {unlocked ? "解放" : "未解放"}
                </Text>
              </Animated.View>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  backButton: { fontSize: 16, color: COLORS.secondary, fontWeight: "bold" },
  headerTitle: {
    fontSize: 20, fontWeight: "bold", color: "#F1F5F9",
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  sectionTitle: {
    fontSize: 20, fontWeight: "bold", color: "#F1F5F9",
    marginTop: 20, marginBottom: 4,
    textShadowColor: 'rgba(255,140,66,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "rgba(241,245,249,0.5)",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  card: {
    width: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 12,
    alignItems: "center",
  },
  cardLocked: {
    opacity: 0.5,
  },
  cardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 11,
    color: "#F1F5F9",
    textAlign: "center",
  },
  cardStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 12,
    marginBottom: 8,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F1F5F9",
  },
  achievementDesc: {
    fontSize: 12,
    color: "rgba(241,245,249,0.5)",
    marginTop: 2,
  },
  achievementStatus: {
    fontSize: 16,
    marginLeft: 8,
  },
});
