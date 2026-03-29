import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function TermsScreen() {
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0A0E27', padding: 16 }}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ marginBottom: 16, minHeight: 44, justifyContent: 'center' }}
        accessibilityRole="button"
        accessibilityLabel="前の画面に戻る"
      >
        <Text style={{ color: '#2DD4BF', fontSize: 16 }}>&lt;- 戻る</Text>
      </TouchableOpacity>
      <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        利用規約
      </Text>
      <Text style={{ color: '#CCC', fontSize: 14, lineHeight: 22 }}>
        第1条（適用）{'\n'}
        本規約は、本アプリ「つみネコ」の利用に関する条件を定めるものです。{'\n\n'}
        第2条（禁止事項）{'\n'}
        不正アクセス、逆コンパイル、商業目的の無断転用を禁止します。{'\n\n'}
        第3条（免責事項）{'\n'}
        本アプリの利用により生じた損害について、開発者は一切の責任を負いません。{'\n\n'}
        第4条（変更）{'\n'}
        本規約は予告なく変更することがあります。{'\n\n'}
        第5条（準拠法）{'\n'}
        本規約は日本法に準拠します。{'\n\n'}
        第6条（仮想通貨の有効期限）{'\n'}
        本アプリ内で取得したコイン・ジェム等の仮想通貨は、取得日から180日間有効です。有効期限を過ぎた仮想通貨は自動的に失効し、返金はいたしません。{'\n\n'}
        第7条（未成年者の利用）{'\n'}
        未成年者が本アプリを利用する場合は、保護者の同意を得た上でご利用ください。未成年者による課金は、保護者の同意があるものとみなします。15歳以下の月額課金上限は5,000円、16〜17歳は10,000円を推奨します。
      </Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
