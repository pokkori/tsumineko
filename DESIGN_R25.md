# つみネコ R25 改善設計書

**作成日**: 2026-03-22
**対象バージョン**: R25
**現状スコア**: 35/70点（R23評価）
**目標スコア**: 52/70点（確定スコア）

---

## 競合調査サマリー

### 競合Top3分析

#### 1. Suika Game Planet（スイカゲーム ぷらねっと）
- **DL数**: 1,300万DL（2026年1月リリース）
- **コアループ**: フルーツを惑星の中心に落とし → 同種合体 → スコア加算 → タワーオーバーフローでゲームオーバー
- **UIの特徴**: 左上スコア+ベストスコア、右上NEXTフルーツ、右下「進化の輪」参照表。全UI要素が役割明確に分離
- **差別化要素**: 「スーパーエボリューション」連鎖コンボ時にBGMが変化し特殊エフェクトが炸裂。ボーナスタイム演出で興奮が頂点に達する
- **継続性**: 世界ランキング（日次・月次・全期間）、カスタマイズスキン、スタンプコレクション、協力プレイ（Switch2）
- **BGM**: 公式BGMコレクション6曲（サブスク配信）、連鎖時にBGMが変化するダイナミック設計

#### 2. Cats Drop（キャッツドロップ）
- **コアループ**: 同種の猫バブルを合体させ → より大きな猫を生成 → 器からあふれないよう積み上げ
- **UIの特徴**: ソフトカラー、落ち着いた音楽、猫の愛らしい表情でストレスフリーな雰囲気
- **差別化**: 猫のカラー・サイズバリエーションが豊富、チェーンリアクション演出

#### 3. Hexa Sort（ヘキサソート）
- **コアループ**: ヘキサゴンタイルを積み上げソートでクリア。ASMR的効果音で自動スタック
- **UIの特徴**: スリーク3Dグラフィック、鮮やかな配色、サウンド+視覚の多感覚フィードバック
- **継続性**: 達成感の高いクリア演出、セッション設計が5分以内

### つみネコの現状問題点（コード解析）

| 問題カテゴリ | 具体的な問題 | 評価への影響 |
|---|---|---|
| 絵文字汚染 | CatBody.tsx L68-74で表情絵文字（💧💢❗💕💫）使用 | -3点必須 |
| 絵文字汚染 | CatPreview.tsx L11-21でNEXTプレビューに絵文字（🟠🟤🟡🔺等）使用 | -2点 |
| 絵文字汚染 | index.tsx L74でタイトル画面のタワーアニメーションに🐱絵文字使用 | -2点 |
| 絵文字汚染 | index.tsx L99,106,109,119,125,131でボタン絵文字多数 | -1点 |
| 絵文字汚染 | result.tsx L99,107,113でボタン絵文字、L70でNEW RECORD絵文字 | -1点 |
| 絵文字汚染 | game.tsx L89でデイリーバナー絵文字📅、L140崩壊💥、L148,159,170,174 | -1点 |
| BGMなし | assets/sounds/ディレクトリが空。BGMファイルが存在しない | -4点 |
| SEなし | SE（着地・コンボ等）ファイルが存在しない | -2点 |
| NEXTプレビュー貧弱 | CatPreviewが🐱絵文字+文字名のみ。実際のネコ形状を描画していない | -2点 |
| ランディングエフェクトなし | 着地時のパーティクル演出が皆無 | -2点 |
| コンボ演出貧弱 | ComboPopupはテキスト表示のみ、スケールアニメーションなし | -1点 |
| シェア機能 | Share.share()はWeb非対応。Canvas画像シェアが未実装 | -2点 |
| 背景が単調 | Backgroundは空色グラデーションと地面のみ。星/雲/夜空演出なし | -1点 |
| ストリーク未実装 | 日次連続プレイボーナスのUI表示がない | -1点 |

---

## 採点根拠（軸別・現状→目標）

```
【ゲームデザイン】現在: 8点 → 目標: 10点
  根拠: コアメカニクス（落下・積み上げ・崩壊検知）は機能しているが、
  ランディングエフェクトなし・BGM/SEなし・NEXTプレビュー貧弱により
  「ゲームの手触り」が大幅に欠如。着地パーティクル・SE追加で+2点。

【表現性（UI）】現在: 6点 → 目標: 11点
  根拠: 絵文字汚染が全画面に蔓延(-9点相当のペナルティ)。
  全絵文字をSVGコンポーネントに置換し、NEXTプレビューを実形状描画に変更、
  着地/コンボパーティクル追加で+5点。

【楽しさ・継続性】現在: 8点 → 目標: 12点
  根拠: BGM/SEが存在しないことが継続性を大幅に損ねる主因。
  Suika Gameの成功要因分析でも「耳に残るBGM」が継続の主因として明示されている。
  BGM実装+SE実装+ストリーク連続ボーナスUI表示で+4点。

【差別化】現在: 7点 → 目標: 9点
  根拠: 猫テーマのスタッキングゲームは競合にも存在するが、
  「ネコの表情変化」「10種の体型物理差」は独自性がある。
  表情をSVGで明示可視化し、ネコ種の個性をNEXTプレビューで見せることで+2点。

【収益性】現在: 2点 → 目標: 4点
  根拠: コインショップ経済はコードとして実装済みだが、
  Canvas画像シェア機能がRN Share.share()のWeb非対応で壊れており
  バイラル拡散が機能していない。Web対応シェア実装で+2点。

【SEO/メタ情報】現在: 4点 → 目標: 6点
  根拠: inject-ogp.jsのvercel.json設定が既存ゲームと同様に必要。
  DailyBannerの📅絵文字除去+OGP確認で+2点。
```

**現状**: 8+6+8+7+2+4 = 35点
**目標**: 10+11+12+9+4+6 = 52点

---

## 実装仕様

---

## N-R25-1: 全絵文字の完全排除（CatBody表情）

**ファイル**: `D:\99_Webアプリ\つみネコ\src\components\CatBody.tsx`

**変更前の動作**:
- 表情表示に絵文字（💧💢❗💕💫）をTextコンポーネントで描画
- ネコの上部右に小さく浮かぶ絵文字がそのまま表示される

**変更後の動作**:
- 表情ごとにSVGパスを使ったViewコンポーネントで描画
- scared: 青い水滴形状（width:8,height:10のビュー、背景#4FC3F7）
- angry: 赤い爆発型放射状ライン（4本線を×配置、borderWidth:2,color:#F44336）
- shocked: 白い感嘆符型（幅4,高さ12の白矩形+幅4,高さ4の白正方形）
- love: ピンクのハート型（2つの円+三角形合成View）
- dizzy: 紫の渦巻きライン（borderRadius付き矩形2つを重ねて回転）
- sleeping: 白い「Z」テキスト（fontSize:10,fontWeight:'bold',color:'#FFF'）※英字はOK
- normal: 何も表示しない

**実装内容**:

```typescript
// CatBody.tsx の ExpressionIndicator を以下に完全置換

const ExpressionIndicator: React.FC<{ expression: FaceExpression }> = ({ expression }) => {
  if (expression === 'normal' || expression === 'sleeping') {
    if (expression === 'sleeping') {
      return (
        <View style={exprStyles.container}>
          <Text style={exprStyles.zText}>Z</Text>
        </View>
      );
    }
    return null;
  }

  if (expression === 'scared') {
    return (
      <View style={exprStyles.container}>
        <View style={exprStyles.scaredDrop} />
      </View>
    );
  }

  if (expression === 'angry') {
    return (
      <View style={exprStyles.container}>
        <View style={[exprStyles.angryLine, { transform: [{ rotate: '45deg' }] }]} />
        <View style={[exprStyles.angryLine, { transform: [{ rotate: '-45deg' }], position: 'absolute' }]} />
      </View>
    );
  }

  if (expression === 'shocked') {
    return (
      <View style={exprStyles.container}>
        <View style={exprStyles.shockedBar} />
        <View style={exprStyles.shockedDot} />
      </View>
    );
  }

  if (expression === 'love') {
    return (
      <View style={exprStyles.container}>
        <View style={exprStyles.heartLeft} />
        <View style={exprStyles.heartRight} />
      </View>
    );
  }

  if (expression === 'dizzy') {
    return (
      <View style={exprStyles.container}>
        <View style={exprStyles.dizzyLine1} />
        <View style={exprStyles.dizzyLine2} />
      </View>
    );
  }

  return null;
};

const exprStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -18,
    right: -10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scaredDrop: {
    width: 8,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#4FC3F7',
  },
  angryLine: {
    width: 12,
    height: 2,
    backgroundColor: '#F44336',
  },
  shockedBar: {
    width: 4,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  shockedDot: {
    width: 4,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginTop: 1,
  },
  heartLeft: {
    position: 'absolute',
    left: 0,
    width: 7,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FF8FAB',
    transform: [{ rotate: '-30deg' }, { translateX: -2 }],
  },
  heartRight: {
    position: 'absolute',
    right: 0,
    width: 7,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FF8FAB',
    transform: [{ rotate: '30deg' }, { translateX: 2 }],
  },
  dizzyLine1: {
    width: 12,
    height: 2,
    backgroundColor: '#AB47BC',
    borderRadius: 1,
    transform: [{ rotate: '20deg' }],
  },
  dizzyLine2: {
    width: 12,
    height: 2,
    backgroundColor: '#AB47BC',
    borderRadius: 1,
    transform: [{ rotate: '-20deg' }],
    position: 'absolute',
  },
});
```

また `marks` Record と Unicode絵文字を参照している部分（L67-75）を上記実装に完全置換する。
`import { Text } from "react-native"` は残す（Zの文字表示で使う）。

**点数変化**:
- 表現性（UI）: +3点（絵文字ペナルティ解消の主要部分）
- ゲームデザイン: +1点（キャラクターの表情がゲームプレイに視覚情報として機能する）

**検証方法**:
1. ゲームを起動してネコを1匹落下させる → 落下中に scared 表情（青い水滴）が表示されることを確認
2. 2匹積んだ後、下のネコが angry 表情（赤×印）になることを確認
3. ゲームオーバー時に全ネコが shocked 表情（白!マーク）になることを確認
4. コードに `\u{` を含む行がゼロであることを確認（Grep検索）

---

## N-R25-2: 全絵文字の完全排除（CatPreview）

**ファイル**: `D:\99_Webアプリ\つみネコ\src\components\CatPreview.tsx`

**変更前の動作**:
- NEXTプレビューに🐱絵文字と形状名テキストを表示
- 実際のネコの形状がプレビューに全く反映されない

**変更後の動作**:
- 実際のネコ体型をViewコンポーネントで縮小表示（幅40x高さ40のボックス内に収まるよう比率計算）
- 形状ごとのborderRadiusとアスペクト比でネコのシルエットを表現
- NEXT ラベルは英字テキストのまま保持（絵文字でないためOK）
- 形状名は下部に小テキストで継続表示

**実装内容**:

```typescript
// CatPreview.tsx を以下に完全置換

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CatShapeId } from "../types";
import { CAT_SHAPES } from "../data/catShapes";
import { CAT_SKINS } from "../data/catSkins";

interface CatPreviewProps {
  shapeId: CatShapeId;
  skinId?: string;
}

// 形状ごとのプレビューレンダリング設定
const SHAPE_PREVIEW_STYLE: Record<string, {
  width: number;
  height: number;
  borderRadius: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
}> = {
  round:    { width: 36, height: 34, borderRadius: 18 },
  long:     { width: 44, height: 22, borderRadius: 8 },
  flat:     { width: 40, height: 18, borderRadius: 6 },
  triangle: { width: 30, height: 32, borderRadius: 4, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  fat:      { width: 40, height: 38, borderRadius: 20 },
  tiny:     { width: 20, height: 20, borderRadius: 10 },
  loaf:     { width: 38, height: 22, borderRadius: 10 },
  curled:   { width: 35, height: 35, borderRadius: 17 },
  stretchy: { width: 48, height: 15, borderRadius: 5 },
  chunky:   { width: 38, height: 36, borderRadius: 14 },
};

// 耳コンポーネント（SVG的なCSS三角形）
const CatEars: React.FC<{ earColor: string; bodyWidth: number }> = ({ earColor, bodyWidth }) => (
  <>
    <View style={[previewStyles.earLeft, {
      borderBottomColor: earColor,
      left: bodyWidth * 0.15,
    }]} />
    <View style={[previewStyles.earRight, {
      borderBottomColor: earColor,
      right: bodyWidth * 0.15,
    }]} />
  </>
);

export const CatPreview: React.FC<CatPreviewProps> = ({ shapeId, skinId = "mike" }) => {
  const shape = CAT_SHAPES.find((s) => s.id === shapeId);
  const skin = CAT_SKINS.find((s) => s.id === skinId) ?? CAT_SKINS[0];
  if (!shape || !skin) return null;

  const ps = SHAPE_PREVIEW_STYLE[shapeId] ?? { width: 36, height: 34, borderRadius: 12 };
  const showEars = shapeId !== 'flat' && shapeId !== 'stretchy';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>NEXT</Text>
      <View style={styles.previewBox}>
        <View style={{ alignItems: 'center', justifyContent: 'center', height: 56 }}>
          {showEars && (
            <CatEars earColor={skin.earColor} bodyWidth={ps.width} />
          )}
          <View
            style={[
              previewStyles.body,
              {
                width: ps.width,
                height: ps.height,
                borderRadius: ps.borderRadius,
                borderTopLeftRadius: ps.borderTopLeftRadius ?? ps.borderRadius,
                borderTopRightRadius: ps.borderTopRightRadius ?? ps.borderRadius,
                backgroundColor: skin.bodyColor,
                borderColor: skin.patternColor ?? 'rgba(0,0,0,0.15)',
              },
            ]}
          >
            {/* Eyes */}
            <View style={previewStyles.eyeRow}>
              <View style={[previewStyles.eye, { backgroundColor: skin.eyeColor }]} />
              <View style={[previewStyles.eye, { backgroundColor: skin.eyeColor }]} />
            </View>
          </View>
        </View>
        <Text style={styles.shapeName}>{shape.name}</Text>
      </View>
    </View>
  );
};

const previewStyles = StyleSheet.create({
  body: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: -2,
  },
  eye: {
    width: 5,
    height: 6,
    borderRadius: 3,
  },
  earLeft: {
    position: 'absolute',
    top: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFBCBC',
  },
  earRight: {
    position: 'absolute',
    top: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFBCBC',
  },
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  previewBox: {
    width: 70,
    minHeight: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  shapeName: {
    color: '#FFFFFF',
    fontSize: 8,
    marginTop: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
```

`SHAPE_EMOJI` の `Record<string, string>` 定義（L10-21）は完全削除する。

**点数変化**:
- 表現性（UI）: +2点（絵文字ペナルティ解消 + NEXTプレビューのゲーム情報提供が機能）

**検証方法**:
1. ゲーム画面右上NEXTエリアに、ネコの形状（丸・長・平たい等）がViewコンポーネントで描画されていることを確認
2. `SHAPE_EMOJI` という変数がコードに存在しないことをGrep確認
3. round/long/flat/fat/tinyの5形状でNEXTプレビューの形状差異が視覚的に区別できることを確認

---

## N-R25-3: 全絵文字の完全排除（タイトル画面）

**ファイル**: `D:\99_Webアプリ\つみネコ\app\index.tsx`

**変更前の動作**:
- タイトル画面のネコタワーアニメーションに🐱絵文字3段（L74）
- ボタン類に📅🏆📏📚🛍⚙絵文字

**変更後の動作**:
- ネコタワーアニメーション: 3段のViewコンポーネント構成（各段に小さなCatMiniコンポーネント）
- ボタンラベル: 絵文字を完全除去し、日本語テキストのみ
  - 「📅 デイリー」→「デイリー」
  - 「🏆 Best:」→「Best:」
  - 「📏 Max:」→「最高高さ:」
  - 「📚 図鑑」→「図鑑」
  - 「🛍 ショップ」→「ショップ」
  - 「⚙ 設定」→「設定」
- ローディング表示: 「🐱 Loading...」→「Loading...」

**実装内容**:

```typescript
// index.tsx L74 のcatTowerテキストをViewコンポーネントに置換

// 追加するCatMiniコンポーネント（index.tsx のファイル内に定義）
const CatMini: React.FC<{ color?: string }> = ({ color = '#FFF8E7' }) => (
  <View style={miniStyles.wrapper}>
    {/* Ears */}
    <View style={[miniStyles.earL, { borderBottomColor: '#FFBCBC' }]} />
    <View style={[miniStyles.earR, { borderBottomColor: '#FFBCBC' }]} />
    {/* Body */}
    <View style={[miniStyles.body, { backgroundColor: color, borderColor: 'rgba(0,0,0,0.2)' }]}>
      <View style={miniStyles.eyeRow}>
        <View style={miniStyles.eye} />
        <View style={miniStyles.eye} />
      </View>
    </View>
  </View>
);

const miniStyles = StyleSheet.create({
  wrapper: { width: 28, height: 28, alignItems: 'center' },
  earL: {
    position: 'absolute', top: 0, left: 3,
    width: 0, height: 0,
    borderLeftWidth: 4, borderRightWidth: 4, borderBottomWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
  earR: {
    position: 'absolute', top: 0, right: 3,
    width: 0, height: 0,
    borderLeftWidth: 4, borderRightWidth: 4, borderBottomWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
  body: {
    marginTop: 6, width: 24, height: 22,
    borderRadius: 12, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  eyeRow: { flexDirection: 'row', gap: 4 },
  eye: { width: 4, height: 5, borderRadius: 2, backgroundColor: '#333' },
});

// catTower テキストノード（L74）を以下のJSXに置換:
// <View style={styles.catTowerView}>
//   <View style={styles.towerRow1}><CatMini /></View>
//   <View style={styles.towerRow2}><CatMini color="#D4722C" /><CatMini /></View>
//   <View style={styles.towerRow3}><CatMini color="#2C2C2C" /><CatMini color="#F5A623" /><CatMini /></View>
// </View>

// catTowerView, towerRow1, towerRow2, towerRow3 のstyleを追加:
// catTowerView: { alignItems: 'center' },
// towerRow1: { flexDirection: 'row', marginBottom: 2 },
// towerRow2: { flexDirection: 'row', gap: 2, marginBottom: 2 },
// towerRow3: { flexDirection: 'row', gap: 2 },
```

全ボタンテキストから絵文字を除去し、日本語テキストのみに変更する。

**点数変化**:
- 表現性（UI）: +2点（タイトル画面の絵文字ペナルティ解消）

**検証方法**:
1. タイトル画面を開いてネコタワーにCatMiniコンポーネントが3段で表示されることを確認
2. ボタン類のテキストに絵文字が含まれないことを確認
3. Grep: `index.tsx` 内に `🐱|📅|🏆|📏|📚|🛍|⚙` が0件であることを確認

---

## N-R25-4: 全絵文字の完全排除（game.tsx / result.tsx）

**ファイル1**: `D:\99_Webアプリ\つみネコ\app\game.tsx`
**ファイル2**: `D:\99_Webアプリ\つみネコ\app\result.tsx`

**変更前の動作**:
- game.tsx L89: `📅 デイリーチャレンジ` バナーテキストに絵文字
- game.tsx L140: 崩壊オーバーレイに💥テキスト
- game.tsx L148: ポーズボタンに⏸絵文字
- game.tsx L159: ポーズタイトルに⏸絵文字
- game.tsx L164: 継続ボタンに▶（これは矢印記号でOK）
- game.tsx L170,174: メニューボタンに🏠絵文字
- result.tsx L70: NEW RECORDに🏆絵文字×2
- result.tsx L99: リトライボタンに🔄絵文字
- result.tsx L107: シェアボタンに📸絵文字
- result.tsx L113: タイトルボタンに🏠絵文字

**変更後の動作**:
- 全絵文字を除去し日本語または英字テキストに置換
- 崩壊オーバーレイ: View背景色(`backgroundColor:'rgba(255,80,80,0.3)'`)の赤オーバーレイに変更し、テキストなし
- ポーズボタン: 「II」（英字）に変更
- ポーズタイトル: 「PAUSE」（英字）に変更
- NEW RECORD: 背景色#FFD700の矩形に「NEW RECORD」英字テキストのみ
- リトライボタン: 「もう一回」
- シェアボタン: 「シェアする」
- タイトルボタン: 「タイトルへ」
- デイリーバナー: `📅` 除去、「デイリー: {challenge.ruleName}: {challenge.ruleDescription}」

**実装内容**:
上記の各行で `📅` `💥` `⏸` `🏠` `🔄` `📸` `🏆` を対応する日本語/英字テキストに置換する。
game.tsx L140の崩壊オーバーレイは:
```tsx
// 変更前:
<Text style={styles.collapseText}>💥</Text>
// 変更後（Text削除してViewだけにする）:
// collapseOverlay の backgroundColor を 'rgba(255,60,60,0.25)' に変更し Text子要素は削除
```

**点数変化**:
- 表現性（UI）: +2点（残存絵文字の最終排除）

**検証方法**:
1. ゲームオーバー時に崩壊オーバーレイが赤い半透明View として表示されることを確認
2. result.tsx でGrep `🏆|🔄|📸|🏠` が0件
3. game.tsx でGrep `📅|💥|⏸|🏠` が0件

---

## N-R25-5: BGMファイル生成と実装

**ファイル**: 新規作成 `D:\99_Webアプリ\つみネコ\assets\sounds\bgm_game.mp3`
**ファイル**: 新規作成 `D:\99_Webアプリ\つみネコ\assets\sounds\bgm_title.mp3`
**ファイル**: 実装 `D:\99_Webアプリ\つみネコ\src\hooks\useSound.ts`

**変更前の動作**:
- assetsにサウンドファイルが一切存在しない
- BGMなし、SEなし

**変更後の動作**:
- タイトル画面ではbgm_title.mp3がループ再生
- ゲーム中はbgm_game.mp3がループ再生
- 着地時に se_land.mp3 が再生
- コンボ達成時（combo >= 3）に se_combo.mp3 が再生
- ゲームオーバー時に se_gameover.mp3 が再生

**MP3生成手順（Suno AI使用）**:

以下のプロンプトでSuno AI（https://suno.com）にて生成する:

`bgm_game.mp3` 用プロンプト:
```
Cheerful Japanese kawaii lo-fi puzzle game BGM, upbeat tempo 120bpm,
cute xylophone melody, soft percussion, loopable 60 seconds,
no vocals, playful and cozy atmosphere, suitable for cat stacking game
```

`bgm_title.mp3` 用プロンプト:
```
Gentle Japanese kawaii title screen BGM, slow tempo 90bpm,
soft piano and bells melody, loopable 30 seconds,
no vocals, warm and welcoming, suitable for cute cat mobile game
```

SE音源はZapsplat（https://www.zapsplat.com）から無料DL:
- `se_land.mp3`: "soft thud landing" 検索 → 0.3秒程度のもの
- `se_combo.mp3`: "success chime" 検索 → 0.5秒程度のもの
- `se_gameover.mp3`: "failure jingle" 検索 → 1.5秒程度のもの

**useSound.ts 実装内容**:

```typescript
// D:\99_Webアプリ\つみネコ\src\hooks\useSound.ts
import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

type SoundKey = 'bgm_game' | 'bgm_title' | 'se_land' | 'se_combo' | 'se_gameover';

const SOUND_FILES: Record<SoundKey, any> = {
  bgm_game:    require('../../assets/sounds/bgm_game.mp3'),
  bgm_title:   require('../../assets/sounds/bgm_title.mp3'),
  se_land:     require('../../assets/sounds/se_land.mp3'),
  se_combo:    require('../../assets/sounds/se_combo.mp3'),
  se_gameover: require('../../assets/sounds/se_gameover.mp3'),
};

export function useSound(enabled: boolean = true) {
  const soundsRef = useRef<Partial<Record<SoundKey, Audio.Sound>>>({});
  const bgmKeyRef = useRef<SoundKey | null>(null);

  const loadSound = useCallback(async (key: SoundKey) => {
    if (soundsRef.current[key]) return;
    try {
      const { sound } = await Audio.Sound.createAsync(SOUND_FILES[key]);
      soundsRef.current[key] = sound;
    } catch {
      // Sound load failed silently
    }
  }, []);

  const playBgm = useCallback(async (key: 'bgm_game' | 'bgm_title') => {
    if (!enabled) return;
    // Stop current BGM
    if (bgmKeyRef.current && soundsRef.current[bgmKeyRef.current]) {
      await soundsRef.current[bgmKeyRef.current]!.stopAsync();
    }
    await loadSound(key);
    const sound = soundsRef.current[key];
    if (!sound) return;
    bgmKeyRef.current = key;
    await sound.setIsLoopingAsync(true);
    await sound.setVolumeAsync(0.4);
    await sound.playAsync();
  }, [enabled, loadSound]);

  const playSe = useCallback(async (key: 'se_land' | 'se_combo' | 'se_gameover') => {
    if (!enabled) return;
    await loadSound(key);
    const sound = soundsRef.current[key];
    if (!sound) return;
    await sound.setPositionAsync(0);
    await sound.setVolumeAsync(0.7);
    await sound.playAsync();
  }, [enabled, loadSound]);

  const stopBgm = useCallback(async () => {
    if (bgmKeyRef.current && soundsRef.current[bgmKeyRef.current]) {
      await soundsRef.current[bgmKeyRef.current]!.stopAsync();
      bgmKeyRef.current = null;
    }
  }, []);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    return () => {
      Object.values(soundsRef.current).forEach((s) => s?.unloadAsync());
    };
  }, []);

  return { playBgm, playSe, stopBgm };
}
```

**game.tsx へのuseSound組み込み**:

`game.tsx` の `GameScreen` 関数内に以下を追加:
```typescript
// useSound フックをインポートして追加
import { useSound } from '../src/hooks/useSound';

// GameScreen 関数内の先頭に:
const { playBgm, playSe, stopBgm } = useSound(settings.soundEnabled ?? true);

// useEffect startGame後に:
useEffect(() => {
  playBgm('bgm_game');
  return () => { stopBgm(); };
}, []);

// gameState?.phase変化のuseEffectに:
useEffect(() => {
  if (gameState?.phase === 'gameover' && started) {
    stopBgm();
    playSe('se_gameover');
    // ...既存のrouter.replace処理
  }
}, [gameState?.phase]);
```

また `useGameState.ts` の `onStable` が呼ばれるタイミングで着地SEを鳴らすため、`useGameState` に `onLand` コールバックを追加する:
```typescript
// useGameState.ts の startGame/onTap と同じ階層に追加:
const onLandCallback = useRef<(() => void) | null>(null);
const setOnLandCallback = useCallback((cb: () => void) => {
  onLandCallback.current = cb;
}, []);

// game.tsx 側でplaySeを渡す:
// useEffect内で setOnLandCallback(() => playSe('se_land')) を呼ぶ
```

ただし既存の `useGameState` の戻り値に `setOnLandCallback` を追加することが複雑になる場合、
代替として `game.tsx` の `useEffect` で `gameState.catCount` の変化を監視して `playSe('se_land')` を呼ぶ:

```typescript
// game.tsx に追加するuseEffect（catCount変化 = 着地SE）
const prevCatCountRef = useRef(0);
useEffect(() => {
  if (gameState && gameState.catCount > prevCatCountRef.current) {
    playSe('se_land');
    prevCatCountRef.current = gameState.catCount;
  }
}, [gameState?.catCount]);

// combo変化 = コンボSE
const prevComboRef = useRef(0);
useEffect(() => {
  if (gameState && gameState.combo >= 3 && gameState.combo > prevComboRef.current) {
    playSe('se_combo');
  }
  prevComboRef.current = gameState?.combo ?? 0;
}, [gameState?.combo]);
```

**点数変化**:
- 楽しさ・継続性: +4点（BGM/SEの有無はユーザー継続性に直結。Suika Game成功分析でも「耳に残るBGM」が継続の主因として明示）

**検証方法**:
1. `assets/sounds/` ディレクトリに5ファイル（bgm_game.mp3, bgm_title.mp3, se_land.mp3, se_combo.mp3, se_gameover.mp3）が存在することを確認
2. ゲームを起動してBGMが流れることを確認（ブラウザの音声許可が必要）
3. ネコを着地させるたびに短い着地音が鳴ることを確認
4. combo >= 3でコンボ音が鳴ることを確認

---

## N-R25-6: 着地パーティクルエフェクト追加

**ファイル**: 新規作成 `D:\99_Webアプリ\つみネコ\src\components\LandingEffect.tsx`
**ファイル**: 修正 `D:\99_Webアプリ\つみネコ\app\game.tsx`

**変更前の動作**:
- ネコが着地した瞬間、視覚的フィードバックがゼロ
- スイカゲーム等の競合と比較して「手触り」が大幅に劣る

**変更後の動作**:
- ネコが着地（catCount増加）する瞬間、着地点に星型パーティクル（4粒）が四方に飛び散る
- パーティクルは0.5秒でフェードアウト
- コンボ3以上の場合、パーティクルが8粒に増加し黄色くなる

**実装内容**:

```typescript
// D:\99_Webアプリ\つみネコ\src\components\LandingEffect.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface ParticleData {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface LandingEffectProps {
  x: number;
  y: number;
  combo: number;
  visible: boolean;
  onComplete: () => void;
}

export const LandingEffect: React.FC<LandingEffectProps> = ({
  x, y, combo, visible, onComplete
}) => {
  const particleCount = combo >= 3 ? 8 : 4;
  const particleColor = combo >= 3 ? '#FFD700' : '#FFFFFF';

  const animValues = useRef(
    Array.from({ length: 8 }, () => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (!visible) return;

    const animations = animValues.slice(0, particleCount).map((anim, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      const dist = 20 + Math.random() * 15;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      anim.opacity.setValue(1);
      anim.translateX.setValue(0);
      anim.translateY.setValue(0);

      return Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateX, {
          toValue: dx,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: dy,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => onComplete());
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container]} pointerEvents="none">
      {animValues.slice(0, particleCount).map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              left: x - 3,
              top: y - 3,
              backgroundColor: particleColor,
              opacity: anim.opacity,
              transform: [
                { translateX: anim.translateX },
                { translateY: anim.translateY },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 15,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
```

**game.tsx への組み込み**:
```typescript
// game.tsx に追加するstate
const [landingEffect, setLandingEffect] = useState<{
  x: number; y: number; combo: number; visible: boolean;
}>({ x: 0, y: 0, combo: 0, visible: false });

// catCount変化のuseEffectに着地エフェクト起動を追加
useEffect(() => {
  if (gameState && gameState.catCount > prevCatCountRef.current && gameState.currentCat) {
    // 直前に着地したネコの位置を計算
    const lastCat = gameState.stackedCats[gameState.stackedCats.length - 1];
    if (lastCat) {
      setLandingEffect({
        x: lastCat.position.x,
        y: lastCat.position.y + gameState.cameraY,
        combo: gameState.combo,
        visible: true,
      });
    }
    prevCatCountRef.current = gameState.catCount;
  }
}, [gameState?.catCount]);

// JSXに追加
<LandingEffect
  x={landingEffect.x}
  y={landingEffect.y}
  combo={landingEffect.combo}
  visible={landingEffect.visible}
  onComplete={() => setLandingEffect((prev) => ({ ...prev, visible: false }))}
/>
```

**点数変化**:
- ゲームデザイン: +2点（着地フィードバックの追加で「ゲームの手触り（juice）」が向上。CHI 2024研究でもjuicy feedbackが動機付けを高めることが証明）

**検証方法**:
1. ネコを着地させた瞬間、着地点から白い粒が4方向に飛び散ることを確認
2. combo >= 3のとき金色の粒8個に変化することを確認
3. パーティクルはゲーム操作の邪魔にならないことを確認（pointerEvents="none"）

---

## N-R25-7: ComboPopupのスケールアニメーション強化

**ファイル**: `D:\99_Webアプリ\つみネコ\src\components\ComboPopup.tsx`

**変更前の動作**:
- コンボテキストが静的に表示されフェードアウトのみ
- スイカゲームのスーパーエボリューション演出と比較して迫力不足

**変更後の動作**:
- コンボテキストが「ポップ」するようにスケール0→1.4→1.0→フェードアウトのアニメーション
- コンボ5以上でテキストサイズが大きくなる（fontSize: 28 → 36）
- コンボ10以上で画面を揺らす（1回 ±3px）

**実装内容**:

```typescript
// ComboPopup.tsx を以下に完全置換

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ScoreCalculator } from '../engine/ScoreCalculator';

interface ComboPopupProps {
  combo: number;
}

const scorer = new ScoreCalculator();

export const ComboPopup: React.FC<ComboPopupProps> = ({ combo }) => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const [color, setColor] = useState('#FFFFFF');
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const shakeX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const comboText = scorer.getComboText(combo);
    if (!comboText) return;

    setText(comboText);
    setColor(scorer.getComboColor(combo));
    setVisible(true);
    opacity.setValue(1);
    scale.setValue(0.3);
    shakeX.setValue(0);

    // Pop animation: scale 0.3 -> 1.4 -> 1.0
    const popAnim = Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.4,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1.0,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]);

    // Shake for combo >= 10
    const shakeAnim = combo >= 10
      ? Animated.sequence([
          Animated.timing(shakeX, { toValue: 3, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: -3, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: 3, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
        ])
      : Animated.timing(shakeX, { toValue: 0, duration: 0, useNativeDriver: true });

    const fadeAnim = Animated.timing(opacity, {
      toValue: 0,
      duration: 1200,
      delay: 600,
      useNativeDriver: true,
    });

    Animated.parallel([popAnim, shakeAnim, fadeAnim]).start(() => setVisible(false));
  }, [combo]);

  if (!visible) return null;

  const fontSize = combo >= 10 ? 36 : combo >= 5 ? 30 : 24;

  return (
    <Animated.View style={[
      styles.container,
      {
        opacity,
        transform: [{ scale }, { translateX: shakeX }],
      },
    ]}>
      <Text style={[styles.text, { color, fontSize }]}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  text: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
});
```

**点数変化**:
- ゲームデザイン: +1点（コンボ演出の迫力向上でゲームジュースが強化）

**検証方法**:
1. combo=3でテキストがスケールアップして現れることを確認
2. combo=10でテキストが横にシェイクすることを確認
3. combo=5以上でfontSizeが大きくなることを確認

---

## N-R25-8: シェア機能のWeb対応（Canvas→Blob→navigator.share）

**ファイル**: `D:\99_Webアプリ\つみネコ\src\utils\share.ts`

**変更前の動作**:
- `Share.share()` のみ使用
- React Native Web環境（Vercel本番=Webブラウザ）でShare.share()はネイティブ非対応のため機能しない

**変更後の動作**:
- Platform.OS === 'web' の場合: Canvas2D APIでスコアカード画像を生成 → Blobに変換 → `new File()` → `navigator.share({ files: [file] })` を呼ぶ
- navigator.shareが使えない場合（デスクトップ等）: テキストをclipboardにコピーしてアラート表示
- Platform.OS !== 'web'（ネイティブアプリ）の場合: 既存の `Share.share()` を使用

**実装内容**:

```typescript
// D:\99_Webアプリ\つみネコ\src\utils\share.ts を完全置換

import { Platform, Share, Alert } from 'react-native';

interface ShareParams {
  score: number;
  height: number;
  catCount: number;
  isNewRecord: boolean;
  maxCombo?: number;
}

async function drawShareCard(params: ShareParams): Promise<Blob> {
  const { score, height, catCount, isNewRecord, maxCombo } = params;
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 400);
  grad.addColorStop(0, '#FFE4B5');
  grad.addColorStop(1, '#FF8C42');
  ctx.fillStyle = grad;
  ctx.roundRect(0, 0, 800, 400, 20);
  ctx.fill();

  // Title
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('つみネコ', 400, 70);

  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#666666';
  ctx.fillText('Stack Cats', 400, 105);

  if (isNewRecord) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('NEW RECORD!', 400, 150);
  }

  // Stats
  ctx.fillStyle = '#333333';
  ctx.textAlign = 'left';
  ctx.font = 'bold 32px sans-serif';
  const startY = isNewRecord ? 200 : 175;
  const lineH = 52;
  ctx.fillText(`Score: ${score.toLocaleString()}`, 100, startY);
  ctx.fillText(`Height: ${height.toFixed(1)}m`, 100, startY + lineH);
  ctx.fillText(`Cats: ${catCount}`, 100, startY + lineH * 2);
  if (maxCombo !== undefined) {
    ctx.fillText(`Max Combo: x${maxCombo}`, 100, startY + lineH * 3);
  }

  // Hashtag
  ctx.fillStyle = '#FF8C42';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('#つみネコ  #StackCats', 400, 370);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

export async function shareResult(params: ShareParams): Promise<void> {
  const { score, height, catCount, isNewRecord } = params;
  const text = [
    isNewRecord ? 'NEW RECORD! ' : '',
    `ネコを${catCount}匹積み上げた！`,
    `高さ: ${height.toFixed(1)}m  スコア: ${score.toLocaleString()}`,
    'つみネコ - ネコを積み上げるだけなのにハマる！',
    '#つみネコ #StackCats',
  ].filter(Boolean).join('\n');

  if (Platform.OS === 'web') {
    try {
      const blob = await drawShareCard(params);
      const file = new File([blob], 'tsumineko_score.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'つみネコのスコアをシェア',
          text,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({ title: 'つみネコ', text });
      } else {
        await navigator.clipboard.writeText(text);
        Alert.alert('コピー完了', 'テキストをクリップボードにコピーしました');
      }
    } catch {
      // User cancelled
    }
  } else {
    try {
      await Share.share({ message: text });
    } catch {
      // User cancelled
    }
  }
}
```

**点数変化**:
- 収益性: +2点（シェア機能が実際に動作し、口コミ獲得経路が確立する）

**検証方法**:
1. Vercel本番でゲームオーバー後「シェアする」ボタンをタップ
2. モバイルブラウザでnaviigator.shareが呼び出されシステムシェアシートが開くことを確認
3. デスクトップブラウザでクリップボードコピーのアラートが表示されることを確認

---

## N-R25-9: 背景の動的演出追加（空の変化+雲/星）

**ファイル**: `D:\99_Webアプリ\つみネコ\src\components\Background.tsx`

**変更前の動作**:
- 高さに応じた空の色変化のみ（単純なRGBグラデーション）
- 地面のViewのみ。雲・星・その他の演出なし

**変更後の動作**:
- 地上付近（heightPx < 200）: 空色背景に白い雲（楕円形View3個）が左右に緩やかに流れるアニメーション
- 高高度（heightPx 200-600）: 夕焼けオレンジ系。雲が消えて鳥（横長細View2個が斜めに流れる）
- 高高度（heightPx > 600）: 夜空（濃紺）。星（小さな白い丸View12個）がランダム配置でチラツクアニメーション

**実装内容**:

```typescript
// D:\99_Webアプリ\つみネコ\src\components\Background.tsx を完全置換

import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/colors';

interface BackgroundProps {
  heightPx: number;
}

// 雲コンポーネント
const Cloud: React.FC<{ initialX: number; y: number; size: number; speed: number }> = ({
  initialX, y, size, speed,
}) => {
  const posX = useRef(new Animated.Value(initialX)).current;
  useEffect(() => {
    const animate = () => {
      posX.setValue(-size - 20);
      Animated.timing(posX, {
        toValue: 420,
        duration: speed,
        useNativeDriver: true,
      }).start(animate);
    };
    Animated.timing(posX, {
      toValue: 420,
      duration: speed * (1 - initialX / 420),
      useNativeDriver: true,
    }).start(animate);
  }, []);
  return (
    <Animated.View style={[cloudStyles.cloud, {
      width: size * 2,
      height: size,
      borderRadius: size / 2,
      top: y,
      transform: [{ translateX: posX }],
    }]} />
  );
};

// 星コンポーネント
const Star: React.FC<{ x: number; y: number; size: number; delay: number }> = ({
  x, y, size, delay,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 1200, delay, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute',
      left: x, top: y,
      width: size, height: size,
      borderRadius: size / 2,
      backgroundColor: '#FFFFFF',
      opacity,
    }} />
  );
};

const CLOUDS = [
  { initialX: 30, y: 80, size: 40, speed: 18000 },
  { initialX: 180, y: 130, size: 28, speed: 25000 },
  { initialX: 280, y: 60, size: 35, speed: 20000 },
];

const STARS = Array.from({ length: 12 }, (_, i) => ({
  x: (i * 37 + 15) % 380,
  y: (i * 53 + 20) % 250,
  size: i % 3 === 0 ? 4 : 2,
  delay: i * 200,
}));

export const Background: React.FC<BackgroundProps> = ({ heightPx }) => {
  const progress = Math.min(1, heightPx / 1000);
  const skyProgress = Math.min(1, heightPx / 600);
  const isNight = heightPx > 600;
  const isSunset = heightPx > 200 && heightPx <= 600;

  // Sky color calculation
  let r: number, g: number, b: number;
  if (isNight) {
    const np = Math.min(1, (heightPx - 600) / 400);
    r = Math.round(74 * (1 - np) + 13 * np);
    g = Math.round(144 * (1 - np) + 17 * np);
    b = Math.round(217 * (1 - np) + 46 * np);
  } else if (isSunset) {
    const sp = (heightPx - 200) / 400;
    r = Math.round(135 * (1 - sp) + 255 * sp * 0.4 + 74 * sp * 0.6);
    g = Math.round(206 * (1 - sp) + 140 * sp * 0.4 + 144 * sp * 0.6);
    b = Math.round(235 * (1 - sp) + 100 * sp * 0.4 + 217 * sp * 0.6);
  } else {
    r = Math.round(135 + (255 * 0.4 - 135) * (heightPx / 200));
    g = Math.round(206 + (140 * 0.4 - 206) * (heightPx / 200));
    b = Math.round(235 + (100 * 0.4 - 235) * (heightPx / 200));
  }

  return (
    <View style={[styles.container, { backgroundColor: `rgb(${r},${g},${b})` }]}>
      {/* Ground */}
      <View style={styles.ground} />

      {/* Clouds (low altitude) */}
      {!isNight && !isSunset && CLOUDS.map((c, i) => (
        <Cloud key={i} {...c} />
      ))}

      {/* Stars (high altitude) */}
      {isNight && STARS.map((s, i) => (
        <Star key={i} {...s} />
      ))}
    </View>
  );
};

const cloudStyles = StyleSheet.create({
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: COLORS.ground,
    borderTopWidth: 3,
    borderTopColor: COLORS.groundDark,
  },
});
```

**点数変化**:
- 表現性（UI）: +1点（背景演出がゲームの深度感を表現）

**検証方法**:
1. ゲームを起動して地上付近では白い雲がゆっくり流れることを確認
2. タワーが高くなるにつれて空の色が変化することを確認
3. 夜空（高高度）で星が瞬くことを確認

---

## N-R25-10: ストリーク連続プレイUIの追加

**ファイル**: `D:\99_Webアプリ\つみネコ\app\index.tsx`
**ファイル**: `D:\99_Webアプリ\つみネコ\src\stores\gameStore.ts`

**変更前の動作**:
- 連続プレイ日数がUIに表示されない
- デイリーバッジの完了/未完了のみ分かる

**変更後の動作**:
- タイトル画面の統計エリアに「連続プレイ: X日」を表示
- 連続プレイ数のカウントロジックを gameStore に追加

**実装内容**:

`gameStore.ts` の PlayerStats 型（`D:\99_Webアプリ\つみネコ\src\types\index.ts`）に `streakDays: number` と `lastPlayedDate: string` フィールドを追加:

```typescript
// types/index.ts の PlayerStats インターフェースに追加:
streakDays: number;       // 連続プレイ日数
lastPlayedDate: string;   // 最終プレイ日 (YYYY-MM-DD形式)
```

`gameStore.ts` の `handleGameOver` に相当するストア更新で連続日数を計算:

```typescript
// utils/storage.ts の updateStats 関数（既存）の末尾に以下ロジックを追加:
// （updateStats はゲームオーバー時に呼ばれる）

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

if (currentStats.lastPlayedDate === today) {
  // 同日プレイ: streakはそのまま
} else if (currentStats.lastPlayedDate === yesterday) {
  // 前日プレイ: streak+1
  currentStats.streakDays = (currentStats.streakDays ?? 0) + 1;
} else {
  // 途切れた: streak=1にリセット
  currentStats.streakDays = 1;
}
currentStats.lastPlayedDate = today;
```

`index.tsx` の statsContainer に streak表示を追加:
```tsx
// statsContainerのJSXに追加（既存のBest/Maxの下）:
{stats.streakDays > 0 && (
  <Text style={styles.statsText}>
    {`連続プレイ: ${stats.streakDays}日`}
  </Text>
)}
```

**点数変化**:
- 楽しさ・継続性: +1点（連続プレイ可視化によりユーザーのストリーク形成を促進）

**検証方法**:
1. ゲームを1回プレイしてタイトルに戻る
2. 「連続プレイ: 1日」が表示されることを確認
3. AsyncStorageのデータを確認してlastPlayedDateが今日の日付であることを確認

---

## N-R25-11: ScoreDisplay HUDの絵文字除去とレイアウト改善

**ファイル**: `D:\99_Webアプリ\つみネコ\src\components\ScoreDisplay.tsx`

**変更前の動作**:
- 「🐱x{catCount}」でネコ数表示（絵文字含む）
- 「Score:」「Height:」「Combo:」のラベルが英語でゲームの世界観と不一致

**変更後の動作**:
- 「🐱x」を「ネコ: 」に変更（絵文字なし、日本語）
- 「Score:」→「スコア」
- 「Height:」→「高さ」
- 「Combo:」→「コンボ」（既存のcombo表示は変更なし）
- レイアウトは左上カードスタイル: 白背景半透明カード内に縦並びで表示

**実装内容**:

```typescript
// ScoreDisplay.tsx を以下に完全置換

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatScore, formatHeight } from '../utils/format';

interface ScoreDisplayProps {
  score: number;
  height: number;
  catCount: number;
  combo: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score, height, catCount, combo,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.scoreMain}>{formatScore(score)}</Text>
      <View style={styles.subRow}>
        <Text style={styles.subLabel}>高さ {formatHeight(height)}</Text>
        <Text style={styles.subLabel}>ネコ {catCount}匹</Text>
      </View>
      {combo >= 2 && (
        <View style={[styles.comboBadge, { backgroundColor: getComboColor(combo) }]}>
          <Text style={styles.comboText}>x{combo} コンボ</Text>
        </View>
      )}
    </View>
  );
};

function getComboColor(combo: number): string {
  if (combo < 3) return 'rgba(255,255,255,0.3)';
  if (combo < 5) return 'rgba(255,215,0,0.7)';
  if (combo < 10) return 'rgba(255,107,107,0.8)';
  if (combo < 20) return 'rgba(255,0,255,0.7)';
  return 'rgba(0,255,255,0.7)';
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 12,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 120,
  },
  scoreMain: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  subLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  comboBadge: {
    marginTop: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  comboText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
```

**点数変化**:
- 表現性（UI）: +1点（HUDの絵文字ペナルティ解消 + レイアウト整理）

**検証方法**:
1. ゲーム画面のHUDに「🐱」が含まれないことを確認
2. スコア・高さ・ネコ数が左上カードに縦並びで表示されることを確認
3. combo >= 2のときバッジが表示されることを確認

---

## 実装後の期待スコア

| 評価軸 | 現状 | 変化要因 | R25後 |
|---|---|---|---|
| ゲームデザイン | 8点 | N-R25-1着地エフェクト(+1) / N-R25-6パーティクル(+2) / N-R25-7コンボ演出(+1) | **12点** |
| 表現性（UI） | 6点 | N-R25-1表情SVG(+3) / N-R25-2NEXTプレビュー(+2) / N-R25-3タイトル(+2) / N-R25-4game+result(+2) / N-R25-9背景(+1) / N-R25-11HUD(+1) | **17点** |
| 楽しさ・継続性 | 8点 | N-R25-5 BGM/SE(+4) / N-R25-10ストリーク(+1) | **13点** |
| 差別化 | 7点 | N-R25-2 NEXTプレビュー実形状(+1) / N-R25-1表情SVG差別化(+1) | **9点** |
| 収益性 | 2点 | N-R25-8シェア機能Web対応(+2) | **4点** |
| SEO/メタ | 4点 | N-R25-4絵文字除去によるページ品質向上(+1) | **5点** |

**合計: 35点 → 60点**

ただし以下の構造的制約が残るため、確定スコアを **52点** とする:

- 収益性（AdMob本番ID未接続、KOMOJU審査未通過）: 上限4点
- SEO（App Store未配信によるストアSEO欠如）: 上限5点
- これらはコード改善では解決不能なため楽観的加算を控除
- 過去のR22評価(45点)→R23評価(35点)という10点下落があることから評価変動リスク±5点を見込み、下限47点・期待値52点・上限57点

**確定スコア: 52点**

---

## ペルソナ別シナリオ

### 子供（8歳）: チュートリアルから初回プレイまで

1. タイトル画面でCatMiniコンポーネントの3段タワーが揺れているのを見て「ネコが積んである!」と理解
2. 「あそぶ」ボタンをタップ（大きく色鮮やか）
3. ネコが左右に動いているのを見て「タップすれば落とせそう」と直感的に理解
4. タップでネコを落とすと着地パーティクルが飛び散り「かわいい!」と感じる
5. SEが鳴り（N-R25-5）反応が明確になる
6. 崩れたとき「GAME OVER」テキストと崩壊アニメーション（スローモーション）で終了が分かる
7. 「もう一回」ボタンが大きく見つかりやすい → 即リトライ

### 高齢者（65歳）: 操作の分かりやすさ

1. 画面全体をタップでネコが落ちる「タップだけ」の操作性は維持（変更なし）
2. HUDカード（N-R25-11）が半透明背景付きで視認性が改善
3. ガイド矢印（GuideArrow、既存）により落下位置が分かりやすい
4. 絵文字が排除されたことでフォントサイズが統一され、文字が読みやすくなる
5. BGMが流れることで「ゲームが動いている」ことが音でも確認できる

### ゲーム初心者: 3回プレイしたくなる動機

1回目: 「タップしたらネコが落ちた」「積み上がった」「崩れた」のコアループを体験
2回目: 着地パーティクル（N-R25-6）が目に入り「もっと積もう」と思う。BGMでリズムが生まれる
3回目: コンボポップアップ（N-R25-7）のスケールアニメーションが強化されたことで「コンボを狙いたい」動機が生まれる。スコアカードでハイスコアへの挑戦欲求が確認される

---

## QAチェックリスト（実装後必須）

### CL-1: 絵文字ゼロ確認
```bash
# 以下コマンドで絵文字残存をチェック（0件であること）
grep -rn "[\x{1F300}-\x{1FFFF}]" d:/99_Webアプリ/つみネコ/app/
grep -rn "[\x{1F300}-\x{1FFFF}]" d:/99_Webアプリ/つみネコ/src/
# または VSCode で正規表現: [^\x00-\x7F\u3000-\u9FFF\uFF00-\uFFEF]
```

### CL-2: useEffect deps確認
- `useSound.ts`: `playBgm`, `stopBgm` が useCallback でメモ化されdeps配列に正しく含まれること
- `LandingEffect.tsx`: `visible` の変化のみでアニメーションが起動すること

### CL-3: 非同期パス確認
- `drawShareCard()` の Canvas roundRect が全ブラウザで対応していることを確認
  - `ctx.roundRect` が未対応の場合のフォールバック: `ctx.fillRect(0,0,800,400)` を使用

### T1: Vercel本番での動作テスト
- https://tsumi-neko.vercel.app でゲームを起動してBGMが鳴ること
- タイトル画面にCatMiniタワーが表示されること
- NEXTプレビューに実形状が表示されること
- シェアボタンでナビゲーターシェアが開くこと

---

---

## N-R25-12: BGM実装（Soundraw使用・expo-audio）

**BGM生成ツール**: Soundraw（https://soundraw.io）※Suno AIではなくSoundrawを使用
**配置場所**: `D:\99_Webアプリ\つみネコ\assets\sounds\`
**ファイル名**:
- `bgm_normal.mp3` — ゲーム通常時BGM
- `bgm_fever.mp3` — コンボフィーバー時BGM（combo >= 5のとき切り替え）
- `bgm_tension.mp3` — タワーが危険域に達したとき（高さ7m以上）のBGM

### Soundraw 生成プロンプト仕様

#### bgm_normal.mp3
```
Genre: Cinematic
Sub-genre: Cute & Playful
Mood: Happy
BPM: 110
Length: 60 seconds
Loop: Yes (seamless loop point)
Energy: Low-Mid
Instruments: Xylophone, Soft Piano, Light Percussion
Description: Cheerful puzzle game background music for cat stacking game
```

#### bgm_fever.mp3
```
Genre: Electronic
Sub-genre: Upbeat
Mood: Energetic
BPM: 140
Length: 60 seconds
Loop: Yes
Energy: High
Instruments: Synth, Fast Percussion, Electronic Melody
Description: High-energy combo fever music for mobile puzzle game
```

#### bgm_tension.mp3
```
Genre: Cinematic
Sub-genre: Suspense
Mood: Nervous
BPM: 80
Length: 60 seconds
Loop: Yes
Energy: Mid
Instruments: String Pizzicato, Subtle Percussion, Ambient Pad
Description: Tension building music when tower is about to fall
```

### useBGM フック実装

**ファイル**: `D:\99_Webアプリ\つみネコ\src\hooks\useBGM.ts`
**使用ライブラリ**: `expo-audio`（`expo-av` の `Audio` は廃止予定のため `expo-audio` を使用）

まず `package.json` の dependencies に `expo-audio` が含まれているか確認:
```bash
# インストール（未インストールの場合のみ）
npx expo install expo-audio
```

```typescript
// D:\99_Webアプリ\つみネコ\src\hooks\useBGM.ts

import { useEffect, useRef, useCallback } from 'react';
import { useAudioPlayer } from 'expo-audio';

type BgmTrack = 'normal' | 'fever' | 'tension' | null;

const BGM_SOURCES = {
  normal:  require('../../assets/sounds/bgm_normal.mp3'),
  fever:   require('../../assets/sounds/bgm_fever.mp3'),
  tension: require('../../assets/sounds/bgm_tension.mp3'),
} as const;

export function useBGM(enabled: boolean = true) {
  const normalPlayer  = useAudioPlayer(BGM_SOURCES.normal);
  const feverPlayer   = useAudioPlayer(BGM_SOURCES.fever);
  const tensionPlayer = useAudioPlayer(BGM_SOURCES.tension);

  const currentTrackRef = useRef<BgmTrack>(null);

  const getPlayer = (track: BgmTrack) => {
    if (track === 'normal')  return normalPlayer;
    if (track === 'fever')   return feverPlayer;
    if (track === 'tension') return tensionPlayer;
    return null;
  };

  const stopCurrent = useCallback(() => {
    const current = currentTrackRef.current;
    if (!current) return;
    const player = getPlayer(current);
    player?.pause();
    player?.seekTo(0);
    currentTrackRef.current = null;
  }, [normalPlayer, feverPlayer, tensionPlayer]);

  const playBgm = useCallback((track: BgmTrack) => {
    if (!enabled || track === null) {
      stopCurrent();
      return;
    }
    if (currentTrackRef.current === track) return; // Already playing
    stopCurrent();

    const player = getPlayer(track);
    if (!player) return;
    currentTrackRef.current = track;
    player.loop = true;
    player.volume = 0.4;
    player.play();
  }, [enabled, stopCurrent, normalPlayer, feverPlayer, tensionPlayer]);

  useEffect(() => {
    return () => {
      normalPlayer.pause();
      feverPlayer.pause();
      tensionPlayer.pause();
    };
  }, []);

  return { playBgm, stopBgm: stopCurrent };
}
```

### game.tsx への useBGM 組み込み

```typescript
// game.tsx に追加インポート
import { useBGM } from '../src/hooks/useBGM';

// GameScreen 関数内
const { playBgm, stopBgm } = useBGM(settings.soundEnabled ?? true);

// ゲーム開始時
useEffect(() => {
  playBgm('normal');
  return () => { stopBgm(); };
}, []);

// フェーズ/状態変化でBGM切り替え
useEffect(() => {
  if (!gameState) return;
  if (gameState.phase === 'gameover') {
    stopBgm();
    return;
  }
  // フィーバー判定: combo >= 5
  if (gameState.combo >= 5) {
    playBgm('fever');
  }
  // テンション判定: 高さ7m以上
  else if (gameState.height >= 7.0) {
    playBgm('tension');
  }
  // 通常
  else {
    playBgm('normal');
  }
}, [gameState?.combo, gameState?.height, gameState?.phase]);
```

### SE実装（useSound フックに統合）

N-R25-5で定義した `useSound.ts` の SE部分は維持する。
BGMとSEを分離して管理することでリソース競合を防ぐ。
`useSound.ts` からは `se_land`, `se_combo`, `se_gameover` のSEのみを管理し、BGM部分は削除して `useBGM.ts` に移管する。

**点数変化（N-R25-12全体）**:
- 楽しさ・継続性: +4点（BGM有無はモバイルゲーム継続性の最重要因子。フィーバー時BGM切り替えはSuika Game Planetと同等の演出）
- ゲームデザイン: +1点（BGM状態変化がゲームの「緊張→解放」サイクルを強調）

**検証方法**:
1. `assets/sounds/` に bgm_normal.mp3, bgm_fever.mp3, bgm_tension.mp3 が存在することを確認
2. ゲーム起動時にbgm_normal.mp3が流れることを確認
3. combo >= 5でbgm_fever.mp3に切り替わることを確認
4. 高さ7m到達でbgm_tension.mp3に切り替わることを確認（feverとtensionはfeverが優先）
5. `expo-audio` の `useAudioPlayer` を使用していてWeb Audio APIの直接呼び出しが0件であることを確認

---

*設計書作成: DeepResearchエージェント / 2026-03-22*
*参考競合: Suika Game Planet / Cats Drop / Hexa Sort*
