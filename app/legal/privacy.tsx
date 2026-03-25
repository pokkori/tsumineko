import React from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/colors';

const SECTIONS = [
  {
    title: '収集する情報',
    body: '本アプリはゲームスコア・プレイ履歴・スキン設定をデバイス内にのみ保存します。氏名・メールアドレス等の個人情報は収集しません。',
  },
  {
    title: '第三者サービス',
    body: 'AdMob（Google）による広告配信を行う場合があります。各サービスのプライバシーポリシーに従って情報が処理されます。',
  },
  {
    title: 'データの保管',
    body: 'スコアやコインデータはお使いのデバイスのローカルストレージに保存されます。アプリを削除すると全データが消去されます。',
  },
  {
    title: 'お問い合わせ',
    body: 'プライバシーに関するご質問は support@tsumineko.app までお送りください。',
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} accessibilityLabel="プライバシーポリシー">
        <Pressable
          style={styles.back}
          onPress={() => router.back()}
          accessibilityLabel="戻る"
          accessibilityRole="button"
        >
          <Text style={styles.backText}>← 戻る</Text>
        </Pressable>
        <Text style={styles.title} accessibilityRole="header">プライバシーポリシー</Text>
        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
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
  section: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 14,
  },
  sectionTitle: { color: COLORS.textLight, fontSize: 12, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5 },
  sectionBody: { color: COLORS.text, fontSize: 13, lineHeight: 22 },
});
