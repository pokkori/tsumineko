import React from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/colors';

export default function LegalScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} accessibilityLabel="特定商取引法に基づく表記">
        <Pressable
          style={styles.back}
          onPress={() => router.back()}
          accessibilityLabel="戻る"
          accessibilityRole="button"
        >
          <Text style={styles.backText}>← 戻る</Text>
        </Pressable>
        <Text style={styles.title} accessibilityRole="header">特定商取引法に基づく表記</Text>
        <View style={styles.table}>
          {[
            ['販売事業者', '個人運営'],
            ['所在地', '請求があれば遅滞なく開示します'],
            ['メール', 'support@tsumineko.app'],
            ['サービス名', 'つみネコ'],
            ['価格', '無料（基本機能）/ ゲーム内コイン購入あり'],
            ['支払方法', 'App Store / Google Play の決済に準じます'],
            ['サービス提供時期', '購入・決済完了後、直ちにご利用いただけます'],
            ['返品・解約', 'デジタルコンテンツの性質上、返品は原則不可です'],
          ].map(([k, v]) => (
            <View key={k} style={styles.row}>
              <Text style={styles.key}>{k}</Text>
              <Text style={styles.val}>{v}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20 },
  back: { marginBottom: 16, minHeight: 44, justifyContent: 'center' },
  backText: { color: COLORS.secondary, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  table: { gap: 12 },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },
  key: { color: COLORS.textLight, width: 130, fontSize: 13 },
  val: { color: COLORS.text, flex: 1, fontSize: 13, lineHeight: 20 },
});
