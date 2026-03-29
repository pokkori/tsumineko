import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/stores/gameStore";
import { CAT_SKINS } from "../src/data/catSkins";
import { SHOP_ITEMS } from "../src/data/shopItems";
import { formatCoins } from "../src/utils/format";
import { COLORS } from "../src/constants/colors";
import { CatPreviewMini } from "../src/components/CatPreviewMini";
import { SkinId } from "../src/types";

const SKIN_PRICES: Record<string, number> = {
  scottish: 500,
  siamese: 500,
  munchkin: 800,
  bengal: 800,
  ragdoll: 1200,
};

export default function ShopScreen() {
  const router = useRouter();
  const wallet = useGameStore((s) => s.wallet);
  const unlockedSkins = useGameStore((s) => s.unlockedSkins);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const unlockSkin = useGameStore((s) => s.unlockSkin);

  const buyableSkins = CAT_SKINS.filter(
    (s) => !s.isDefault && SKIN_PRICES[s.id] !== undefined
  );

  const handleBuySkin = async (skinId: string, price: number) => {
    if (unlockedSkins.includes(skinId as any)) {
      Alert.alert("購入済み", "このスキンは既に所持しています");
      return;
    }
    if (wallet.coins < price) {
      Alert.alert("コイン不足", `あと${price - wallet.coins}コイン必要です`);
      return;
    }
    const success = await spendCoins(price);
    if (success) {
      await unlockSkin(skinId as any);
      Alert.alert("購入完了!", `${CAT_SKINS.find((s) => s.id === skinId)?.name}を獲得しました！`);
    }
  };

  return (
    <LinearGradient colors={['#0F0F1A', '#1A0A2E', '#2D1B4E']} style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.header}>
          <Pressable onPress={() => router.back()} accessibilityLabel="戻る" accessibilityRole="button">
            <Text style={styles.backButton}>← 戻る</Text>
          </Pressable>
          <Text style={styles.headerTitle}>ショップ</Text>
          <Text style={styles.coins}>{formatCoins(wallet.coins)} コイン</Text>
        </Animated.View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Animated.Text entering={FadeInDown.delay(80).duration(400)} style={styles.sectionTitle}>スキン</Animated.Text>

          {buyableSkins.map((skin, idx) => {
            const owned = unlockedSkins.includes(skin.id);
            const price = SKIN_PRICES[skin.id] || 0;
            return (
              <Animated.View
                key={skin.id}
                entering={FadeInDown.delay(160 + idx * 80).duration(400)}
                style={styles.shopCard}
              >
                <View style={styles.shopCardHeader}>
                  <CatPreviewMini skinId={skin.id as SkinId} size={52} locked={false} />
                  <View style={styles.shopCardInfo}>
                    <Text style={styles.shopCardName}>{skin.name}</Text>
                    <Text style={styles.shopCardDesc}>{skin.description}</Text>
                  </View>
                </View>
                {owned ? (
                  <View style={styles.ownedBadge}>
                    <Text style={styles.ownedText}>所持済み</Text>
                  </View>
                ) : (
                  <Pressable
                    style={({ pressed }) => [styles.buyButton, pressed && { opacity: 0.8 }]}
                    onPress={() => handleBuySkin(skin.id, price)}
                    accessibilityLabel={`${skin.name}を${price}コインで購入`}
                    accessibilityRole="button"
                  >
                    <LinearGradient
                      colors={['#FF8C42', '#E85520']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buyButtonInner}
                    >
                      <Text style={styles.buyButtonText}>{price} コイン で購入</Text>
                    </LinearGradient>
                  </Pressable>
                )}
              </Animated.View>
            );
          })}

          <Animated.Text entering={FadeInDown.delay(500).duration(400)} style={styles.sectionTitle}>課金アイテム</Animated.Text>

          {SHOP_ITEMS.map((item, idx) => (
            <Animated.View
              key={item.productId}
              entering={FadeInDown.delay(580 + idx * 80).duration(400)}
              style={styles.shopCard}
            >
              <View style={styles.shopCardInfo}>
                <Text style={styles.shopCardName}>{item.name}</Text>
                <Text style={styles.shopCardDesc}>{item.description}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.iapButton, pressed && { opacity: 0.8 }]}
                onPress={() => Alert.alert("課金機能", "ストアリリース後に有効になります")}
                accessibilityLabel={`${item.name} ¥${item.priceJPY}`}
                accessibilityRole="button"
              >
                <Text style={styles.buyButtonText}>¥{item.priceJPY}</Text>
              </Pressable>
            </Animated.View>
          ))}

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
  coins: { fontSize: 16, fontWeight: "bold", color: "#FFD93D" },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  sectionTitle: {
    fontSize: 20, fontWeight: "bold", color: "#F1F5F9",
    marginTop: 20, marginBottom: 12,
    textShadowColor: 'rgba(255,140,66,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  shopCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 16,
    marginBottom: 12,
  },
  shopCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  shopCardInfo: { flex: 1 },
  shopCardName: { fontSize: 18, fontWeight: "bold", color: "#F1F5F9" },
  shopCardDesc: { fontSize: 13, color: "rgba(241,245,249,0.6)", marginTop: 2 },
  buyButton: { borderRadius: 20, overflow: 'hidden' },
  buyButtonInner: {
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  iapButton: {
    backgroundColor: "rgba(76,175,80,0.2)",
    borderWidth: 1,
    borderColor: "rgba(76,175,80,0.4)",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 12,
  },
  buyButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  ownedBadge: {
    backgroundColor: "rgba(76,175,80,0.1)",
    borderWidth: 1,
    borderColor: "rgba(76,175,80,0.3)",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  ownedText: { color: "#4CAF50", fontSize: 14, fontWeight: "bold" },
});
