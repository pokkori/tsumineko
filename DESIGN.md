# つみネコ (Stack Cats) 詳細設計書 v1.0

## 目次
1. [プロジェクト構成](#1-プロジェクト構成)
2. [package.json](#2-packagejson)
3. [app.config.ts / eas.json](#3-appconfigts--easjson)
4. [TypeScript型定義](#4-typescript型定義)
5. [画面設計](#5-画面設計)
6. [物理エンジン仕様](#6-物理エンジン仕様)
7. [ネコ形状データ](#7-ネコ形状データ)
8. [ネコ表情システム](#8-ネコ表情システム)
9. [スコアシステム](#9-スコアシステム)
10. [収益化設計](#10-収益化設計)
11. [シェア機能](#11-シェア機能)
12. [サウンド設計](#12-サウンド設計)
13. [ハプティクス](#13-ハプティクス)
14. [AsyncStorageキー設計](#14-asyncstorageキー設計)
15. [ネコスキン](#15-ネコスキン)
16. [デイリーチャレンジ](#16-デイリーチャレンジ)
17. [実績システム](#17-実績システム)

---

## 1. プロジェクト構成

```
tsumi-neko/
├── app/                          # expo-router画面
│   ├── _layout.tsx               # ルートレイアウト（フォント読み込み・プロバイダー）
│   ├── index.tsx                 # タイトル画面
│   ├── game.tsx                  # ゲーム画面（メインループ）
│   ├── result.tsx                # リザルト画面
│   ├── collection.tsx            # コレクション画面（ネコ図鑑）
│   ├── shop.tsx                  # ショップ画面（スキン購入）
│   └── settings.tsx              # 設定画面
├── src/
│   ├── components/
│   │   ├── CatBody.tsx           # 1匹のネコ描画コンポーネント（Skia）
│   │   ├── CatFace.tsx           # ネコ表情描画コンポーネント（Skia）
│   │   ├── CatPreview.tsx        # 次のネコプレビュー
│   │   ├── Tower.tsx             # タワー全体描画（Skia Canvas）
│   │   ├── ScoreDisplay.tsx      # スコア・高さ表示HUD
│   │   ├── ComboPopup.tsx        # コンボ表示ポップアップ
│   │   ├── GuideArrow.tsx        # 落下位置ガイド矢印
│   │   ├── Background.tsx        # 背景描画（高さに応じて変化）
│   │   ├── CollapseSlow.tsx      # 崩壊スローモーション演出
│   │   ├── DailyBadge.tsx        # デイリーチャレンジバッジ
│   │   ├── AchievementToast.tsx  # 実績解除トースト通知
│   │   ├── AdBanner.tsx          # AdMobバナー広告ラッパー
│   │   └── RewardAdButton.tsx    # リワード広告ボタン
│   ├── engine/
│   │   ├── PhysicsWorld.ts       # Matter.js世界の初期化・更新
│   │   ├── CatSpawner.ts        # ネコ生成ロジック（形状選択・物理ボディ作成）
│   │   ├── CollapseDetector.ts   # 崩壊判定ロジック
│   │   ├── ScoreCalculator.ts    # スコア計算ロジック
│   │   └── GameLoop.ts          # ゲームループ制御（状態マシン）
│   ├── data/
│   │   ├── catShapes.ts          # 全ネコ形状データ（SVGパス+物理ボディ定義）
│   │   ├── catSkins.ts           # 全スキンデータ
│   │   ├── catFaces.ts           # 表情パターンデータ
│   │   ├── achievements.ts       # 実績定義
│   │   ├── dailyChallenges.ts    # デイリーチャレンジ定義
│   │   └── shopItems.ts         # ショップ商品定義
│   ├── hooks/
│   │   ├── usePhysics.ts         # 物理エンジンフック
│   │   ├── useGameState.ts       # ゲーム状態管理フック
│   │   ├── useStorage.ts         # AsyncStorage CRUD フック
│   │   ├── useSound.ts           # サウンド再生フック
│   │   ├── useHaptics.ts         # ハプティクスフック
│   │   ├── useAds.ts             # 広告制御フック
│   │   └── useDailyChallenge.ts  # デイリーチャレンジフック
│   ├── stores/
│   │   └── gameStore.ts          # Zustand ゲーム状態ストア
│   ├── types/
│   │   └── index.ts              # 全型定義
│   ├── utils/
│   │   ├── storage.ts            # AsyncStorageラッパー
│   │   ├── share.ts              # シェア機能ユーティリティ
│   │   ├── random.ts             # シード付き乱数生成
│   │   └── format.ts             # スコアフォーマット等
│   └── constants/
│       ├── physics.ts            # 物理定数
│       ├── layout.ts             # レイアウト定数（画面サイズ等）
│       ├── colors.ts             # カラーパレット
│       └── ads.ts                # 広告ユニットID
├── assets/
│   ├── fonts/
│   │   └── NotoSansJP-Bold.ttf   # 日本語フォント
│   ├── sounds/
│   │   ├── bgm_main.mp3          # メインBGM（ループ・60秒）
│   │   ├── bgm_title.mp3         # タイトルBGM（ループ・30秒）
│   │   ├── se_land_soft.mp3      # 着地SE（軽い）
│   │   ├── se_land_heavy.mp3     # 着地SE（重い）
│   │   ├── se_collapse.mp3       # 崩壊SE
│   │   ├── se_combo.mp3          # コンボSE
│   │   ├── se_meow.mp3           # ネコ鳴き声SE
│   │   ├── se_newrecord.mp3      # 新記録SE
│   │   ├── se_tap.mp3            # タップSE
│   │   └── se_unlock.mp3         # アンロックSE
│   └── images/
│       ├── icon.png               # アプリアイコン（1024x1024）
│       ├── splash.png             # スプラッシュ画面（1284x2778）
│       ├── adaptive-icon.png      # Android適応アイコン
│       └── og-template.png        # OGP画像テンプレート（1200x630）
├── app.config.ts                  # Expo設定
├── eas.json                       # EASビルド設定
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
└── DESIGN.md                      # 本ファイル
```

---

## 2. package.json

```json
{
  "name": "tsumi-neko",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "build:preview": "eas build --profile preview",
    "build:production": "eas build --profile production",
    "submit:ios": "eas submit --platform ios",
    "submit:android": "eas submit --platform android",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "expo": "~53.0.0",
    "expo-router": "~4.0.0",
    "expo-status-bar": "~2.0.0",
    "expo-haptics": "~14.0.0",
    "expo-av": "~15.0.0",
    "expo-sharing": "~13.0.0",
    "expo-file-system": "~18.0.0",
    "expo-font": "~13.0.0",
    "expo-splash-screen": "~0.29.0",
    "expo-screen-orientation": "~8.0.0",
    "react": "18.3.1",
    "react-native": "0.76.6",
    "react-native-screens": "~4.4.0",
    "react-native-safe-area-context": "~4.14.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-reanimated": "~3.16.0",
    "@shopify/react-native-skia": "1.8.0",
    "matter-js": "0.20.0",
    "@react-native-async-storage/async-storage": "2.1.0",
    "zustand": "5.0.0",
    "react-native-google-mobile-ads": "14.6.0",
    "react-native-iap": "12.15.0",
    "date-fns": "4.1.0"
  },
  "devDependencies": {
    "@types/react": "~18.3.0",
    "@types/matter-js": "0.19.7",
    "typescript": "~5.6.0",
    "@typescript-eslint/eslint-plugin": "~8.0.0",
    "@typescript-eslint/parser": "~8.0.0",
    "eslint": "~9.0.0"
  },
  "private": true
}
```

---

## 3. app.config.ts / eas.json

### app.config.ts

```typescript
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: "つみネコ",
  slug: "tsumi-neko",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "tsumineko",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "cover",
    backgroundColor: "#FFE4B5",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.pokkori.tsumineko",
    buildNumber: "1",
    config: {
      googleMobileAdsAppId: "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#FFE4B5",
    },
    package: "com.pokkori.tsumineko",
    versionCode: 1,
    config: {
      googleMobileAdsAppId: "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
    },
  },
  plugins: [
    "expo-router",
    "expo-font",
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
        iosAppId: "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
      },
    ],
    [
      "expo-screen-orientation",
      {
        initialOrientation: "PORTRAIT",
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    },
  },
});
```

### eas.json

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "pokkori@example.com",
        "ascAppId": "0000000000",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services.json",
        "track": "production"
      }
    }
  }
}
```

---

## 4. TypeScript型定義

```typescript
// src/types/index.ts

// ==========================================
// ネコ形状
// ==========================================

/** ネコの基本形状ID */
export type CatShapeId =
  | "round"       // まんまる
  | "long"        // 長い（香箱座り）
  | "flat"        // 平たい（伸び）
  | "triangle"    // 三角（座り）
  | "fat"         // 太った
  | "tiny"        // ちっちゃい
  | "loaf"        // 食パン型
  | "curled"      // 丸まり
  | "stretchy"    // 伸び伸び
  | "chunky";     // ずんぐり

/** 物理ボディの頂点座標（Matter.jsのVertices） */
export interface PhysicsVertex {
  x: number;
  y: number;
}

/** ネコ形状データ */
export interface CatShape {
  id: CatShapeId;
  name: string;                    // 表示名（日本語）
  svgPath: string;                 // Skia描画用SVGパス
  physicsVertices: PhysicsVertex[]; // Matter.jsコンベックスハル頂点
  width: number;                   // 論理幅（px）
  height: number;                  // 論理高さ（px）
  mass: number;                    // 質量（kg）0.5〜3.0
  friction: number;                // 摩擦係数 0.3〜0.9
  restitution: number;             // 反発係数 0.0〜0.3
  centerOfMass: PhysicsVertex;     // 重心オフセット
  rarity: "common" | "uncommon" | "rare";
  spawnWeight: number;             // 出現確率ウェイト（合計100）
}

// ==========================================
// ネコ表情
// ==========================================

export type FaceExpression =
  | "normal"     // 通常（にっこり）
  | "scared"     // 怯え（落下中）
  | "sleeping"   // 寝てる（着地後安定）
  | "angry"      // 怒り（他のネコが上に乗った）
  | "shocked"    // 驚き（崩壊開始時）
  | "love"       // ハート目（コンボ時）
  | "dizzy";     // 目が回る（崩壊で落ちた後）

export interface FaceData {
  expression: FaceExpression;
  leftEye: string;    // SVGパス
  rightEye: string;   // SVGパス
  mouth: string;      // SVGパス
  extras?: string;     // 追加装飾SVGパス（汗、ハート等）
}

// ==========================================
// ネコスキン
// ==========================================

export type SkinId =
  // 初期スキン（5種）
  | "mike"          // 三毛猫
  | "kuro"          // 黒猫
  | "shiro"         // 白猫
  | "tora"          // トラ猫
  | "hachiware"     // ハチワレ
  // アンロックスキン（10種）
  | "scottish"      // スコティッシュフォールド
  | "persian"       // ペルシャ
  | "siamese"       // シャム
  | "russian_blue"  // ロシアンブルー
  | "munchkin"      // マンチカン
  | "sphynx"        // スフィンクス
  | "bengal"        // ベンガル
  | "ragdoll"       // ラグドール
  | "abyssinian"    // アビシニアン
  | "neko_samurai";  // ネコ侍（特別スキン）

export interface CatSkin {
  id: SkinId;
  name: string;                    // 表示名
  description: string;             // 説明文
  bodyColor: string;               // メインカラー（HEX）
  patternColor: string | null;     // 模様カラー（HEX）null=無地
  patternSvg: string | null;       // 模様SVGパス null=無地
  earColor: string;                // 耳の内側カラー
  noseColor: string;               // 鼻カラー
  eyeColor: string;                // 瞳カラー
  tailSvg: string;                 // しっぽSVGパス
  unlockCondition: UnlockCondition;
  isDefault: boolean;              // 初期解放済みか
}

export interface UnlockCondition {
  type: "default" | "score" | "count" | "achievement" | "iap" | "daily";
  /** type=score: 必要スコア, type=count: 必要積み上げ数, type=daily: 必要ログイン日数 */
  value: number;
  /** type=achievement: 実績ID */
  achievementId?: AchievementId;
}

// ==========================================
// ゲーム状態
// ==========================================

export type GamePhase =
  | "idle"         // ネコ配置待ち（左右移動中）
  | "dropping"     // 落下中
  | "settling"     // 着地判定中（物理安定待ち）
  | "stable"       // 安定した（スコア加算→次のネコ生成）
  | "collapsing"   // 崩壊中（スローモーション）
  | "gameover";    // ゲームオーバー

export interface ActiveCat {
  bodyId: number;              // Matter.jsボディID
  shapeId: CatShapeId;
  skinId: SkinId;
  expression: FaceExpression;
  position: { x: number; y: number };
  angle: number;
  isStacked: boolean;          // タワーに組み込まれたか
}

export interface GameState {
  phase: GamePhase;
  score: number;
  height: number;              // タワー高さ（メートル表示用）
  heightPx: number;            // タワー高さ（ピクセル）
  combo: number;               // 連続成功回数
  maxCombo: number;
  catCount: number;            // 積み上げたネコ数
  currentCat: ActiveCat | null;
  nextShapeId: CatShapeId;
  stackedCats: ActiveCat[];
  fallenCats: ActiveCat[];     // 落ちたネコ（崩壊演出用）
  cameraY: number;             // カメラスクロール位置
  isNewRecord: boolean;
  dailyChallengeId: string | null;
  activeSkinId: SkinId;
}

// ==========================================
// スコア・記録
// ==========================================

export interface ScoreRecord {
  score: number;
  height: number;
  catCount: number;
  maxCombo: number;
  date: string;                // ISO 8601
  skinId: SkinId;
  dailyChallengeId: string | null;
}

export interface PlayerStats {
  totalGames: number;
  totalCatsStacked: number;
  totalHeight: number;         // 累計高さ（メートル）
  bestScore: number;
  bestHeight: number;
  bestCombo: number;
  bestCatCount: number;
  currentStreak: number;       // 連続プレイ日数
  maxStreak: number;
  lastPlayDate: string;        // ISO 8601 日付のみ "2026-03-20"
  firstPlayDate: string;
}

// ==========================================
// ショップ・IAP
// ==========================================

export type IAPProductId =
  | "remove_ads"               // 広告削除 ¥480
  | "coin_pack_small"          // コイン500枚 ¥160
  | "coin_pack_medium"         // コイン1500枚 ¥400
  | "coin_pack_large"          // コイン5000枚 ¥1,000
  | "neko_samurai_skin";       // ネコ侍スキン ¥320

export interface ShopItem {
  productId: IAPProductId;
  name: string;
  description: string;
  priceJPY: number;            // 日本円表示価格
  type: "consumable" | "non_consumable";
  coinAmount?: number;         // type=consumableの場合のコイン付与数
}

export interface WalletState {
  coins: number;               // ゲーム内通貨
  adsRemoved: boolean;
  purchasedSkins: SkinId[];
}

// ==========================================
// デイリーチャレンジ
// ==========================================

export type ChallengeRule =
  | "heavy_cats"       // 全ネコ質量2倍
  | "bouncy_cats"      // 反発係数0.5（跳ねる）
  | "tiny_only"        // ちっちゃいネコだけ
  | "fat_only"         // 太ったネコだけ
  | "no_guide"         // ガイド矢印なし
  | "speed_up"         // 落下速度2倍
  | "low_gravity"      // 重力0.5倍
  | "high_friction"    // 摩擦係数2倍（くっつきやすい）
  | "random_wind"      // ランダム横風
  | "mirror";          // 操作左右反転

export interface DailyChallenge {
  id: string;                   // "2026-03-20" 形式
  rule: ChallengeRule;
  ruleName: string;             // 表示名
  ruleDescription: string;      // ルール説明
  targetScore: number;          // 目標スコア
  rewardCoins: number;          // クリア報酬コイン
}

export interface DailyChallengeResult {
  id: string;
  completed: boolean;
  bestScore: number;
  attempts: number;
}

// ==========================================
// 実績
// ==========================================

export type AchievementId =
  | "first_stack"          // はじめてのつみネコ
  | "stack_10"             // 10匹積み上げ
  | "stack_50"             // 50匹積み上げ
  | "stack_100"            // 100匹タワー
  | "height_1m"            // 高さ1m到達
  | "height_5m"            // 高さ5m到達
  | "height_10m"           // 天空ネコタワー
  | "combo_5"              // 5コンボ
  | "combo_10"             // 10コンボ
  | "combo_20"             // コンボマスター
  | "score_1000"           // スコア1,000
  | "score_5000"           // スコア5,000
  | "score_10000"          // スコア10,000
  | "games_10"             // 10回プレイ
  | "games_100"            // 100回プレイ
  | "daily_clear"          // デイリーチャレンジ初クリア
  | "daily_7"              // 7日連続プレイ
  | "daily_30"             // 30日連続プレイ
  | "all_shapes"           // 全形状のネコを積んだ
  | "skin_collector"       // スキン5種アンロック
  | "perfect_balance"      // 1匹も落とさず20匹積む
  | "lucky_save"           // ギリギリで崩壊を免れた
  | "speed_demon"          // 10秒以内に5匹積む
  | "night_owl";           // 深夜2時にプレイ

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;                // 絵文字アイコン
  rewardCoins: number;
  isSecret: boolean;           // 隠し実績か
}

export interface AchievementProgress {
  unlockedIds: AchievementId[];
  /** 進捗追跡（形状コレクション等） */
  shapesUsed: CatShapeId[];
  fastStackCount: number;      // speed_demon用カウンター
}

// ==========================================
// 広告
// ==========================================

export interface AdState {
  gamesUntilInterstitial: number;  // インタースティシャルまでの残りゲーム数
  rewardAvailable: boolean;
  lastRewardTime: number;          // 最終リワード視聴時刻（ms）
}

// ==========================================
// 設定
// ==========================================

export interface UserSettings {
  bgmVolume: number;            // 0.0〜1.0
  seVolume: number;             // 0.0〜1.0
  hapticsEnabled: boolean;
  showGuide: boolean;           // 落下ガイド表示
  selectedSkinId: SkinId;
}

// ==========================================
// AsyncStorageスキーマ（統合）
// ==========================================

export interface StorageSchema {
  "@tsumineko/stats": PlayerStats;
  "@tsumineko/scores": ScoreRecord[];       // 上位50件
  "@tsumineko/wallet": WalletState;
  "@tsumineko/settings": UserSettings;
  "@tsumineko/achievements": AchievementProgress;
  "@tsumineko/daily_results": Record<string, DailyChallengeResult>;
  "@tsumineko/unlocked_skins": SkinId[];
  "@tsumineko/ad_state": AdState;
}
```

---

## 5. 画面設計

### 5.1 画面遷移図

```
                    ┌──────────┐
                    │  Splash  │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
               ┌────│  Title   │────┐────────┐
               │    └────┬─────┘    │        │
               │         │         │        │
          ┌────▼───┐ ┌──▼────┐ ┌──▼─────┐ ┌▼────────┐
          │Settings│ │ Game  │ │ Shop   │ │Collection│
          └────────┘ └──┬────┘ └────────┘ └──────────┘
                        │
                   ┌────▼─────┐
                   │  Result  │──→ Game（リトライ）
                   └──────────┘──→ Title（戻る）
```

### 5.2 タイトル画面 (app/index.tsx)

```
┌─────────────────────────────┐
│         status bar          │
├─────────────────────────────┤
│                             │
│                             │
│      🐱  🐱  🐱            │
│     🐱🐱🐱🐱🐱            │  ← ネコタワーアニメ
│    🐱🐱🐱🐱🐱🐱🐱         │    （Skia描画、
│   ████████████████████      │     ゆらゆら揺れる）
│                             │
│       つ み ネ コ           │  ← タイトル文字
│       Stack Cats            │    （Skiaシャドウ付き）
│                             │
│   ┌───────────────────┐     │
│   │    ▶ あそぶ        │     │  ← メインCTA
│   └───────────────────┘     │    （パルスアニメ）
│                             │
│   ┌───────────────────┐     │
│   │  📅 デイリー       │     │  ← デイリーチャレンジ
│   └───────────────────┘     │    （未クリアなら!バッジ）
│                             │
│   🏆 Best: 12,450          │  ← ベストスコア表示
│   📏 Max: 8.5m             │
│                             │
│  [📚図鑑]  [🛍ショップ]  [⚙設定] │  ← フッターボタン
│                             │
└─────────────────────────────┘
```

**操作フロー:**
1. アプリ起動 → スプラッシュ（1.5秒） → タイトル画面
2. タワーアニメはSkia Canvasで描画。3〜5匹のネコがゆらゆら揺れている
3. 「あそぶ」タップ → game.tsx へ遷移（フェードトランジション 300ms）
4. 「デイリー」タップ → game.tsx へ遷移（dailyChallengeId付きパラメータ）
5. フッターボタン → 各画面へ遷移（スライドトランジション 250ms）

### 5.3 ゲーム画面 (app/game.tsx)

```
┌─────────────────────────────┐
│  Score: 3,450    🐱x12     │  ← HUD上部
│  Height: 4.2m   Combo: x3  │
├─────────────────────────────┤
│         ┌─────┐             │
│  NEXT:  │ 🐱  │             │  ← 次のネコプレビュー
│         └─────┘             │
│                             │
│          ▼                  │  ← ガイド矢印
│         🐱                  │  ← 現在のネコ（左右移動中）
│          │                  │    ← 点線ガイドライン
│          │                  │
│          │                  │
│       ···│···               │
│                             │
│        🐱😴                 │  ← 積まれたネコ（寝てる）
│       🐱😠🐱               │  ← 怒ってるネコ
│      🐱🐱🐱🐱              │
│     🐱🐱🐱🐱🐱             │
│   ████████████████████      │  ← 地面
│                             │
│        [⏸]                  │  ← 一時停止ボタン
└─────────────────────────────┘

--- 一時停止オーバーレイ ---
┌─────────────────────────────┐
│                             │
│        ⏸ ポーズ中           │
│                             │
│   ┌───────────────────┐     │
│   │    ▶ つづける      │     │
│   └───────────────────┘     │
│   ┌───────────────────┐     │
│   │    🏠 タイトルへ    │     │
│   └───────────────────┘     │
│                             │
└─────────────────────────────┘
```

**操作フロー:**
1. ゲーム開始 → 最初のネコが画面上部に出現、自動で左右往復移動
2. 画面タップ → ネコが現在位置から落下開始（重力加速）
3. ネコが既存タワーまたは地面に着地 → 物理シミュレーション開始
4. 1.5秒間安定を維持 → スコア加算、次のネコ生成
5. ネコが画面外（左右または下）に落下 → 崩壊判定
6. タワーの最上部ネコが基準高さから50px以上落下 → 崩壊→ゲームオーバー
7. カメラはタワーの最上部に追従（スムーズスクロール）

### 5.4 リザルト画面 (app/result.tsx)

```
┌─────────────────────────────┐
│                             │
│        GAME OVER            │
│     （崩壊アニメ再生）       │
│                             │
│   ┌─────────────────────┐   │
│   │  Score    3,450     │   │
│   │  Height   4.2m      │   │
│   │  Cats     12匹      │   │
│   │  Combo    x5        │   │
│   │                     │   │
│   │  🏆 NEW RECORD! 🏆  │   │  ← 新記録時のみ表示
│   └─────────────────────┘   │
│                             │
│   ┌───────────────────┐     │
│   │  🔄 もう一回       │     │  ← リトライ
│   └───────────────────┘     │
│   ┌───────────────────┐     │
│   │  🎬 広告を見て続行  │     │  ← リワード広告
│   └───────────────────┘     │    （1ゲーム1回まで）
│   ┌───────────────────┐     │
│   │  📸 シェアする      │     │  ← タワー画像シェア
│   └───────────────────┘     │
│                             │
│      🏠 タイトルに戻る      │
│                             │
│  ┌─────────────────────┐    │
│  │   [AdMob Banner]    │    │  ← バナー広告
│  └─────────────────────┘    │
└─────────────────────────────┘
```

**操作フロー:**
1. ゲームオーバー → 崩壊スローモーション演出（1.5秒）→ リザルト画面フェードイン
2. 新記録の場合 → 金色エフェクト＋効果音＋ハプティクス
3. 「もう一回」→ game.tsx（新規ゲーム）
4. 「広告を見て続行」→ リワード広告再生 → 成功時ゲーム画面に戻りコンティニュー（落ちたネコを除去して再開）
5. 「シェアする」→ タワー画像生成 → OS共有シート
6. インタースティシャル広告: 3ゲームに1回、リザルト表示前に挿入

### 5.5 コレクション画面 (app/collection.tsx)

```
┌─────────────────────────────┐
│  ← 戻る    📚 ネコ図鑑      │
├─────────────────────────────┤
│                             │
│  ── 形状コレクション ──      │
│  収集率: 7/10               │
│                             │
│  ┌────┐ ┌────┐ ┌────┐      │
│  │🐱  │ │🐱  │ │🐱  │      │
│  │まる│ │なが│ │ひら│      │
│  │ ✅ │ │ ✅ │ │ ✅ │      │
│  └────┘ └────┘ └────┘      │
│  ┌────┐ ┌────┐ ┌────┐      │
│  │🐱  │ │🐱  │ │ ?  │      │
│  │さん│ │ふと│ │ ?? │      │
│  │ ✅ │ │ ✅ │ │ 🔒 │      │
│  └────┘ └────┘ └────┘      │
│  ...                        │
│                             │
│  ── スキンコレクション ──    │
│  解放率: 6/15               │
│                             │
│  ┌────┐ ┌────┐ ┌────┐      │
│  │🐱  │ │🐱  │ │🐱  │      │
│  │三毛│ │黒猫│ │白猫│      │
│  │ ✅ │ │ ✅ │ │ ✅ │      │
│  └────┘ └────┘ └────┘      │
│  ...                        │
│                             │
│  ── 実績 ──                  │
│  解放率: 8/24               │
│  ┌─────────────────────┐    │
│  │ 🎯 はじめてのつみネコ │    │
│  │ ✅ ネコを1匹積み上げた │   │
│  └─────────────────────┘    │
│  ...                        │
│                             │
└─────────────────────────────┘
```

### 5.6 ショップ画面 (app/shop.tsx)

```
┌─────────────────────────────┐
│  ← 戻る    🛍 ショップ      │
│                 🪙 1,250     │  ← 所持コイン
├─────────────────────────────┤
│                             │
│  ── スキン ──                │
│                             │
│  ┌─────────────────────┐    │
│  │ 🐱 スコティッシュ    │    │
│  │ 「お耳が折れた甘えん坊」│   │
│  │        🪙 500         │    │  ← コイン購入
│  │    [購入する]          │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 🐱 ペルシャ           │    │
│  │ 「もふもふ貴族」      │    │
│  │     🔒 スコア5,000達成 │    │  ← 条件解放
│  └─────────────────────┘    │
│  ...                        │
│                             │
│  ── 課金アイテム ──          │
│                             │
│  ┌─────────────────────┐    │
│  │ 🚫 広告削除           │    │
│  │ ¥480                  │    │
│  │ [購入する]            │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ 🪙 コイン500枚        │    │
│  │ ¥160                  │    │
│  │ [購入する]            │    │
│  └─────────────────────┘    │
│  ...                        │
│                             │
└─────────────────────────────┘
```

### 5.7 設定画面 (app/settings.tsx)

```
┌─────────────────────────────┐
│  ← 戻る    ⚙ 設定           │
├─────────────────────────────┤
│                             │
│  BGM音量                     │
│  [━━━━━━━━●━━] 80%          │
│                             │
│  SE音量                      │
│  [━━━━━━━━━━●] 100%         │
│                             │
│  バイブレーション             │
│  [ON ●━━━] ← トグル         │
│                             │
│  落下ガイド表示              │
│  [ON ●━━━] ← トグル         │
│                             │
│  ─────────────────────      │
│                             │
│  スコアリセット               │
│  [リセットする] ← 確認ダイアログ│
│                             │
│  ─────────────────────      │
│                             │
│  利用規約                    │
│  プライバシーポリシー         │
│  ライセンス                  │
│  バージョン 1.0.0            │
│                             │
└─────────────────────────────┘
```

---

## 6. 物理エンジン仕様

### 6.1 定数定義 (src/constants/physics.ts)

```typescript
// src/constants/physics.ts

export const PHYSICS = {
  /** Matter.js世界の重力 */
  GRAVITY: { x: 0, y: 1.2 },

  /** 物理更新レート（ms） */
  TIMESTEP: 1000 / 60,

  /** 地面Y座標（画面座標系、上が0） */
  GROUND_Y: 750,

  /** 地面の物理プロパティ */
  GROUND: {
    friction: 0.8,
    restitution: 0.05,
    isStatic: true,
  },

  /** 壁（左右） */
  WALL: {
    friction: 0.3,
    restitution: 0.1,
    isStatic: true,
  },

  /** ネコ落下開始Y */
  SPAWN_Y: -80,

  /** ネコ横移動速度（px/frame） */
  HORIZONTAL_SPEED: 3.0,

  /** 横移動範囲（画面幅に対する割合） */
  MOVE_RANGE: 0.85,

  /** 崩壊判定: タワー最上部が直前高さからこのピクセル以上落ちたら崩壊 */
  COLLAPSE_THRESHOLD_PX: 50,

  /** 安定判定: 全ボディの速度がこの値以下なら安定とみなす */
  STABLE_VELOCITY_THRESHOLD: 0.3,

  /** 安定判定の継続フレーム数（この間安定し続けたらOK） */
  STABLE_FRAME_COUNT: 90, // 1.5秒 at 60fps

  /** 画面外判定（左右+下） */
  OUT_OF_BOUNDS: {
    left: -100,
    right: 500, // SCREEN_WIDTH + 100
    bottom: 900, // GROUND_Y + 150
  },

  /** 崩壊スローモーション倍率 */
  COLLAPSE_SLOW_FACTOR: 0.15,

  /** 崩壊スローモーション持続時間（ms） */
  COLLAPSE_SLOW_DURATION: 1500,

  /** カメラ追従の補間係数（0〜1、大きいほど速い） */
  CAMERA_LERP: 0.08,

  /** カメラの下限（地面より下にはいかない） */
  CAMERA_MIN_Y: 0,
} as const;
```

### 6.2 物理ワールド初期化 (src/engine/PhysicsWorld.ts)

```typescript
// src/engine/PhysicsWorld.ts

import Matter from "matter-js";
import { PHYSICS } from "../constants/physics";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../constants/layout";

export class PhysicsWorld {
  engine: Matter.Engine;
  world: Matter.World;
  ground: Matter.Body;
  leftWall: Matter.Body;
  rightWall: Matter.Body;
  private runner: Matter.Runner | null = null;

  constructor() {
    this.engine = Matter.Engine.create({
      gravity: PHYSICS.GRAVITY,
      enableSleeping: false, // スリープ無効（全ボディ常時更新）
    });
    this.world = this.engine.world;

    // 地面
    this.ground = Matter.Bodies.rectangle(
      SCREEN_WIDTH / 2,
      PHYSICS.GROUND_Y + 25,
      SCREEN_WIDTH,
      50,
      {
        isStatic: true,
        friction: PHYSICS.GROUND.friction,
        restitution: PHYSICS.GROUND.restitution,
        label: "ground",
      }
    );

    // 左壁
    this.leftWall = Matter.Bodies.rectangle(
      -25,
      SCREEN_HEIGHT / 2,
      50,
      SCREEN_HEIGHT * 3,
      {
        isStatic: true,
        friction: PHYSICS.WALL.friction,
        restitution: PHYSICS.WALL.restitution,
        label: "wall_left",
      }
    );

    // 右壁
    this.rightWall = Matter.Bodies.rectangle(
      SCREEN_WIDTH + 25,
      SCREEN_HEIGHT / 2,
      50,
      SCREEN_HEIGHT * 3,
      {
        isStatic: true,
        friction: PHYSICS.WALL.friction,
        restitution: PHYSICS.WALL.restitution,
        label: "wall_right",
      }
    );

    Matter.Composite.add(this.world, [
      this.ground,
      this.leftWall,
      this.rightWall,
    ]);
  }

  /** ボディ追加 */
  addBody(body: Matter.Body): void {
    Matter.Composite.add(this.world, body);
  }

  /** ボディ削除 */
  removeBody(body: Matter.Body): void {
    Matter.Composite.remove(this.world, body);
  }

  /** 1フレーム物理更新 */
  step(delta: number = PHYSICS.TIMESTEP): void {
    Matter.Engine.update(this.engine, delta);
  }

  /** スローモーション適用 */
  stepSlow(factor: number): void {
    Matter.Engine.update(this.engine, PHYSICS.TIMESTEP * factor);
  }

  /** 全ボディ取得（静的除く） */
  getDynamicBodies(): Matter.Body[] {
    return Matter.Composite.allBodies(this.world).filter(
      (b) => !b.isStatic
    );
  }

  /** 全ボディが安定しているか */
  isAllStable(): boolean {
    const bodies = this.getDynamicBodies();
    return bodies.every(
      (b) =>
        Math.abs(b.velocity.x) < PHYSICS.STABLE_VELOCITY_THRESHOLD &&
        Math.abs(b.velocity.y) < PHYSICS.STABLE_VELOCITY_THRESHOLD &&
        Math.abs(b.angularVelocity) < 0.01
    );
  }

  /** タワー最上部のY座標取得（画面座標: 小さいほど高い） */
  getHighestY(): number {
    const bodies = this.getDynamicBodies();
    if (bodies.length === 0) return PHYSICS.GROUND_Y;
    return Math.min(...bodies.map((b) => b.position.y - 30));
  }

  /** 全クリア */
  clear(): void {
    const bodies = this.getDynamicBodies();
    bodies.forEach((b) => Matter.Composite.remove(this.world, b));
  }

  /** 破棄 */
  destroy(): void {
    Matter.Engine.clear(this.engine);
  }
}
```

### 6.3 ネコ生成 (src/engine/CatSpawner.ts)

```typescript
// src/engine/CatSpawner.ts

import Matter from "matter-js";
import { CatShape, CatShapeId, CatSkin } from "../types";
import { CAT_SHAPES } from "../data/catShapes";
import { PHYSICS } from "../constants/physics";
import { SCREEN_WIDTH } from "../constants/layout";

export class CatSpawner {
  private shapeQueue: CatShapeId[] = [];

  /** 重み付きランダムで次の形状を選択 */
  selectNextShape(): CatShapeId {
    const totalWeight = CAT_SHAPES.reduce((sum, s) => sum + s.spawnWeight, 0);
    let rand = Math.random() * totalWeight;
    for (const shape of CAT_SHAPES) {
      rand -= shape.spawnWeight;
      if (rand <= 0) return shape.id;
    }
    return "round"; // フォールバック
  }

  /** 物理ボディを生成 */
  createCatBody(shapeId: CatShapeId, x: number): Matter.Body {
    const shape = CAT_SHAPES.find((s) => s.id === shapeId)!;

    // コンベックスハルから物理ボディ生成
    const body = Matter.Bodies.fromVertices(
      x,
      PHYSICS.SPAWN_Y,
      [shape.physicsVertices],
      {
        mass: shape.mass,
        friction: shape.friction,
        restitution: shape.restitution,
        frictionAir: 0.01,
        label: `cat_${shapeId}_${Date.now()}`,
        render: { visible: false }, // Skiaで描画するので不要
      }
    );

    // 重心オフセット適用
    if (shape.centerOfMass.x !== 0 || shape.centerOfMass.y !== 0) {
      Matter.Body.setCentre(body, shape.centerOfMass, true);
    }

    // 初期状態: 静的（配置待ち中は落下しない）
    Matter.Body.setStatic(body, true);

    return body;
  }

  /** ネコを落下開始（静的→動的に切り替え） */
  dropCat(body: Matter.Body): void {
    Matter.Body.setStatic(body, false);
    // 初速度なし（重力のみで落下）
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
  }

  /** 横移動（配置待ち中） */
  moveCatHorizontal(body: Matter.Body, direction: number): void {
    const newX = body.position.x + direction * PHYSICS.HORIZONTAL_SPEED;
    const halfWidth = 40; // おおよそのネコ半幅
    const minX = halfWidth;
    const maxX = SCREEN_WIDTH - halfWidth;
    const clampedX = Math.max(minX, Math.min(maxX, newX));
    Matter.Body.setPosition(body, {
      x: clampedX,
      y: body.position.y,
    });
  }
}
```

### 6.4 崩壊判定 (src/engine/CollapseDetector.ts)

```typescript
// src/engine/CollapseDetector.ts

import Matter from "matter-js";
import { PHYSICS } from "../constants/physics";

export interface CollapseResult {
  collapsed: boolean;
  fallenBodies: Matter.Body[];
  remainingBodies: Matter.Body[];
}

export class CollapseDetector {
  private previousHighestY: number = PHYSICS.GROUND_Y;
  private stableFrameCount: number = 0;

  /** タワーの現在の最高点を記録 */
  recordHeight(highestY: number): void {
    this.previousHighestY = highestY;
  }

  /** 安定フレームカウンタをリセット */
  resetStableCount(): void {
    this.stableFrameCount = 0;
  }

  /**
   * 毎フレーム呼び出し: 崩壊チェック
   * @returns "stable" | "settling" | "collapsed"
   */
  check(
    dynamicBodies: Matter.Body[],
    currentHighestY: number,
    allStable: boolean
  ): "stable" | "settling" | "collapsed" {
    // 画面外に落ちたボディを検出
    const outOfBounds = dynamicBodies.filter(
      (b) =>
        b.position.x < PHYSICS.OUT_OF_BOUNDS.left ||
        b.position.x > PHYSICS.OUT_OF_BOUNDS.right ||
        b.position.y > PHYSICS.OUT_OF_BOUNDS.bottom
    );

    // 画面外落下が2体以上 → 崩壊
    if (outOfBounds.length >= 2) {
      return "collapsed";
    }

    // タワー最上部が大きく下がった → 崩壊
    const heightDrop = currentHighestY - this.previousHighestY;
    if (heightDrop > PHYSICS.COLLAPSE_THRESHOLD_PX && dynamicBodies.length > 1) {
      return "collapsed";
    }

    // 全ボディが安定状態か判定
    if (allStable) {
      this.stableFrameCount++;
      if (this.stableFrameCount >= PHYSICS.STABLE_FRAME_COUNT) {
        return "stable";
      }
    } else {
      this.stableFrameCount = 0;
    }

    return "settling";
  }

  /** 崩壊時: 落下したボディと残ったボディを分離 */
  classifyBodies(dynamicBodies: Matter.Body[]): CollapseResult {
    const fallen: Matter.Body[] = [];
    const remaining: Matter.Body[] = [];

    for (const body of dynamicBodies) {
      const isFallen =
        body.position.x < PHYSICS.OUT_OF_BOUNDS.left ||
        body.position.x > PHYSICS.OUT_OF_BOUNDS.right ||
        body.position.y > PHYSICS.OUT_OF_BOUNDS.bottom ||
        Math.abs(body.velocity.y) > 5;

      if (isFallen) {
        fallen.push(body);
      } else {
        remaining.push(body);
      }
    }

    return {
      collapsed: fallen.length > 0,
      fallenBodies: fallen,
      remainingBodies: remaining,
    };
  }
}
```

### 6.5 ゲームループ (src/engine/GameLoop.ts)

```typescript
// src/engine/GameLoop.ts

import { GamePhase, GameState, CatShapeId } from "../types";
import { PhysicsWorld } from "./PhysicsWorld";
import { CatSpawner } from "./CatSpawner";
import { CollapseDetector } from "./CollapseDetector";
import { ScoreCalculator } from "./ScoreCalculator";
import { PHYSICS } from "../constants/physics";

export class GameLoop {
  private physics: PhysicsWorld;
  private spawner: CatSpawner;
  private collapse: CollapseDetector;
  private scorer: ScoreCalculator;

  private horizontalDirection: number = 1; // 1=右, -1=左
  private slowMotionFrames: number = 0;

  state: GameState;

  constructor() {
    this.physics = new PhysicsWorld();
    this.spawner = new CatSpawner();
    this.collapse = new CollapseDetector();
    this.scorer = new ScoreCalculator();
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      phase: "idle",
      score: 0,
      height: 0,
      heightPx: 0,
      combo: 0,
      maxCombo: 0,
      catCount: 0,
      currentCat: null,
      nextShapeId: this.spawner.selectNextShape(),
      stackedCats: [],
      fallenCats: [],
      cameraY: 0,
      isNewRecord: false,
      dailyChallengeId: null,
      activeSkinId: "mike",
    };
  }

  /** ゲーム開始: 最初のネコ生成 */
  start(): void {
    this.spawnNextCat();
  }

  /** 次のネコを生成 */
  private spawnNextCat(): void {
    const shapeId = this.state.nextShapeId;
    const startX = 200; // 画面中央付近
    const body = this.spawner.createCatBody(shapeId, startX);
    this.physics.addBody(body);

    this.state.currentCat = {
      bodyId: body.id,
      shapeId,
      skinId: this.state.activeSkinId,
      expression: "scared", // 落下前は怯え顔
      position: { x: startX, y: PHYSICS.SPAWN_Y },
      angle: 0,
      isStacked: false,
    };

    this.state.nextShapeId = this.spawner.selectNextShape();
    this.state.phase = "idle";
    this.horizontalDirection = 1;
  }

  /** 画面タップ: ネコ落下 */
  onTap(): void {
    if (this.state.phase !== "idle" || !this.state.currentCat) return;

    const body = this.getBodyById(this.state.currentCat.bodyId);
    if (!body) return;

    this.spawner.dropCat(body);
    this.state.phase = "dropping";
  }

  /** 毎フレーム更新（requestAnimationFrameから呼ばれる） */
  update(): GameState {
    switch (this.state.phase) {
      case "idle":
        this.updateIdle();
        break;
      case "dropping":
        this.updateDropping();
        break;
      case "settling":
        this.updateSettling();
        break;
      case "collapsing":
        this.updateCollapsing();
        break;
      case "gameover":
        // 何もしない
        break;
    }

    this.updateCamera();
    this.syncPositions();
    return this.state;
  }

  private updateIdle(): void {
    if (!this.state.currentCat) return;
    const body = this.getBodyById(this.state.currentCat.bodyId);
    if (!body) return;

    // 自動左右移動
    this.spawner.moveCatHorizontal(body, this.horizontalDirection);

    // 壁に近づいたら反転
    if (body.position.x >= 360) this.horizontalDirection = -1;
    if (body.position.x <= 40) this.horizontalDirection = 1;
  }

  private updateDropping(): void {
    this.physics.step();

    if (!this.state.currentCat) return;
    const body = this.getBodyById(this.state.currentCat.bodyId);
    if (!body) return;

    // 着地判定: 速度が小さくなったら settling へ
    if (
      body.position.y > PHYSICS.SPAWN_Y + 50 &&
      Math.abs(body.velocity.y) < 2.0 &&
      body.speed < 3.0
    ) {
      this.state.phase = "settling";
      this.collapse.resetStableCount();
      this.collapse.recordHeight(this.physics.getHighestY());
    }
  }

  private updateSettling(): void {
    this.physics.step();

    const dynamicBodies = this.physics.getDynamicBodies();
    const currentHighestY = this.physics.getHighestY();
    const allStable = this.physics.isAllStable();

    const result = this.collapse.check(dynamicBodies, currentHighestY, allStable);

    switch (result) {
      case "stable":
        this.onStable();
        break;
      case "collapsed":
        this.onCollapse();
        break;
      case "settling":
        // 引き続き待機
        break;
    }
  }

  private updateCollapsing(): void {
    if (this.slowMotionFrames > 0) {
      this.physics.stepSlow(PHYSICS.COLLAPSE_SLOW_FACTOR);
      this.slowMotionFrames--;
    } else {
      this.state.phase = "gameover";
    }
  }

  /** 安定成功時 */
  private onStable(): void {
    if (!this.state.currentCat) return;

    this.state.currentCat.isStacked = true;
    this.state.currentCat.expression = "sleeping"; // 寝顔に変更
    this.state.stackedCats.push(this.state.currentCat);

    this.state.catCount++;
    this.state.combo++;
    this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);

    // スコア計算
    const heightPx = PHYSICS.GROUND_Y - this.physics.getHighestY();
    this.state.heightPx = heightPx;
    this.state.height = heightPx / 100; // 100px = 1m
    this.state.score = this.scorer.calculate(
      this.state.catCount,
      this.state.height,
      this.state.combo
    );

    // 下のネコは怒り顔に
    if (this.state.stackedCats.length >= 2) {
      const below = this.state.stackedCats[this.state.stackedCats.length - 2];
      below.expression = "angry";
    }

    // 次のネコ生成
    this.spawnNextCat();
  }

  /** 崩壊時 */
  private onCollapse(): void {
    this.state.phase = "collapsing";
    this.state.combo = 0;
    this.slowMotionFrames = Math.round(
      (PHYSICS.COLLAPSE_SLOW_DURATION / PHYSICS.TIMESTEP) *
        (1 / PHYSICS.COLLAPSE_SLOW_FACTOR)
    );

    // 全ネコを驚き顔に
    for (const cat of this.state.stackedCats) {
      cat.expression = "shocked";
    }
    if (this.state.currentCat) {
      this.state.currentCat.expression = "shocked";
    }
  }

  /** カメラY更新（タワー追従） */
  private updateCamera(): void {
    const targetY = Math.min(
      0,
      -(PHYSICS.GROUND_Y - this.physics.getHighestY() - 300)
    );
    this.state.cameraY +=
      (targetY - this.state.cameraY) * PHYSICS.CAMERA_LERP;
  }

  /** 物理ボディの位置をstate.stackedCatsに同期 */
  private syncPositions(): void {
    for (const cat of this.state.stackedCats) {
      const body = this.getBodyById(cat.bodyId);
      if (body) {
        cat.position = { x: body.position.x, y: body.position.y };
        cat.angle = body.angle;
      }
    }
    if (this.state.currentCat) {
      const body = this.getBodyById(this.state.currentCat.bodyId);
      if (body) {
        this.state.currentCat.position = {
          x: body.position.x,
          y: body.position.y,
        };
        this.state.currentCat.angle = body.angle;
      }
    }
  }

  /** IDからMatter.Bodyを取得 */
  private getBodyById(id: number): Matter.Body | undefined {
    return this.physics
      .getDynamicBodies()
      .concat([this.physics.ground])
      .find((b) => b.id === id);
  }

  /** リワード広告でコンティニュー */
  continueFromReward(): void {
    // 落ちたネコを除去してゲーム再開
    const { fallenBodies, remainingBodies } =
      this.collapse.classifyBodies(this.physics.getDynamicBodies());

    for (const body of fallenBodies) {
      this.physics.removeBody(body);
    }

    this.state.stackedCats = this.state.stackedCats.filter((cat) => {
      return remainingBodies.some((b) => b.id === cat.bodyId);
    });

    this.state.fallenCats = [];
    this.spawnNextCat();
  }

  /** 破棄 */
  destroy(): void {
    this.physics.destroy();
  }
}
```

---

## 7. ネコ形状データ

```typescript
// src/data/catShapes.ts

import { CatShape } from "../types";

/**
 * 全ネコ形状データ
 * - SVGパスは80x80の座標系を基準（描画時にスケール）
 * - physicsVerticesはMatter.jsのコンベックスハル用（上が0のY軸）
 * - 質量・摩擦・反発はゲームバランスに直結
 */
export const CAT_SHAPES: CatShape[] = [
  {
    id: "round",
    name: "まんまるネコ",
    svgPath:
      "M25,15 C15,15 8,22 8,35 C8,52 18,60 40,62 C62,60 72,52 72,35 C72,22 65,15 55,15 L58,5 C58,3 56,2 55,4 L50,12 L30,12 L25,4 C24,2 22,3 22,5 Z",
    physicsVertices: [
      { x: -32, y: -25 },
      { x: -18, y: -35 },
      { x: 18, y: -35 },
      { x: 32, y: -25 },
      { x: 35, y: 0 },
      { x: 30, y: 22 },
      { x: 0, y: 28 },
      { x: -30, y: 22 },
      { x: -35, y: 0 },
    ],
    width: 70,
    height: 65,
    mass: 2.0,
    friction: 0.6,
    restitution: 0.1,
    centerOfMass: { x: 0, y: 5 },
    rarity: "common",
    spawnWeight: 18,
  },
  {
    id: "long",
    name: "ながながネコ",
    svgPath:
      "M15,20 C8,20 3,25 3,32 C3,42 10,48 20,50 L70,50 C78,48 82,42 82,32 C82,25 77,20 70,20 L73,10 C73,8 71,7 70,9 L66,18 L22,18 L18,9 C17,7 15,8 15,10 Z",
    physicsVertices: [
      { x: -42, y: -18 },
      { x: -35, y: -25 },
      { x: 35, y: -25 },
      { x: 42, y: -18 },
      { x: 42, y: 10 },
      { x: 35, y: 18 },
      { x: -35, y: 18 },
      { x: -42, y: 10 },
    ],
    width: 88,
    height: 45,
    mass: 1.8,
    friction: 0.7,
    restitution: 0.05,
    centerOfMass: { x: 0, y: 3 },
    rarity: "common",
    spawnWeight: 15,
  },
  {
    id: "flat",
    name: "ぺたんこネコ",
    svgPath:
      "M10,30 C5,28 2,32 2,38 C2,46 12,52 40,54 C68,52 78,46 78,38 C78,32 75,28 70,30 L72,22 C72,20 70,19 69,21 L66,28 L16,28 L13,21 C12,19 10,20 10,22 Z",
    physicsVertices: [
      { x: -40, y: -10 },
      { x: -30, y: -15 },
      { x: 30, y: -15 },
      { x: 40, y: -10 },
      { x: 38, y: 12 },
      { x: 0, y: 18 },
      { x: -38, y: 12 },
    ],
    width: 80,
    height: 35,
    mass: 1.2,
    friction: 0.8,
    restitution: 0.02,
    centerOfMass: { x: 0, y: 2 },
    rarity: "common",
    spawnWeight: 12,
  },
  {
    id: "triangle",
    name: "おすわりネコ",
    svgPath:
      "M40,8 L42,2 C42,0 44,0 44,2 L46,8 L36,8 L34,2 C34,0 36,0 36,2 Z M20,60 C15,60 10,55 10,48 L25,18 C28,12 52,12 55,18 L70,48 C70,55 65,60 60,60 Z",
    physicsVertices: [
      { x: 0, y: -35 },
      { x: 28, y: 20 },
      { x: 25, y: 28 },
      { x: -25, y: 28 },
      { x: -28, y: 20 },
    ],
    width: 60,
    height: 65,
    mass: 1.5,
    friction: 0.5,
    restitution: 0.15,
    centerOfMass: { x: 0, y: 8 },
    rarity: "uncommon",
    spawnWeight: 10,
  },
  {
    id: "fat",
    name: "でぶネコ",
    svgPath:
      "M20,12 C10,12 2,22 2,38 C2,55 15,68 40,70 C65,68 78,55 78,38 C78,22 70,12 60,12 L63,3 C63,1 61,0 60,2 L56,10 L24,10 L20,2 C19,0 17,1 17,3 Z",
    physicsVertices: [
      { x: -38, y: -28 },
      { x: -20, y: -38 },
      { x: 20, y: -38 },
      { x: 38, y: -28 },
      { x: 40, y: 0 },
      { x: 35, y: 28 },
      { x: 0, y: 35 },
      { x: -35, y: 28 },
      { x: -40, y: 0 },
    ],
    width: 80,
    height: 75,
    mass: 3.0,
    friction: 0.6,
    restitution: 0.08,
    centerOfMass: { x: 0, y: 5 },
    rarity: "uncommon",
    spawnWeight: 8,
  },
  {
    id: "tiny",
    name: "ちびネコ",
    svgPath:
      "M22,10 C16,10 12,15 12,22 C12,32 20,38 30,40 C40,38 48,32 48,22 C48,15 44,10 38,10 L40,4 C40,2 38,1 37,3 L35,9 L25,9 L23,3 C22,1 20,2 20,4 Z",
    physicsVertices: [
      { x: -18, y: -15 },
      { x: -10, y: -20 },
      { x: 10, y: -20 },
      { x: 18, y: -15 },
      { x: 20, y: 0 },
      { x: 15, y: 14 },
      { x: 0, y: 18 },
      { x: -15, y: 14 },
      { x: -20, y: 0 },
    ],
    width: 40,
    height: 38,
    mass: 0.5,
    friction: 0.4,
    restitution: 0.2,
    centerOfMass: { x: 0, y: 2 },
    rarity: "common",
    spawnWeight: 12,
  },
  {
    id: "loaf",
    name: "食パンネコ",
    svgPath:
      "M15,18 C8,18 5,24 5,32 C5,45 12,52 40,54 C68,52 75,45 75,32 C75,24 72,18 65,18 L67,10 C67,8 65,7 64,9 L62,16 L20,16 L18,9 C17,7 15,8 15,10 Z",
    physicsVertices: [
      { x: -35, y: -18 },
      { x: -28, y: -22 },
      { x: 28, y: -22 },
      { x: 35, y: -18 },
      { x: 35, y: 12 },
      { x: 0, y: 20 },
      { x: -35, y: 12 },
    ],
    width: 74,
    height: 45,
    mass: 1.6,
    friction: 0.7,
    restitution: 0.05,
    centerOfMass: { x: 0, y: 0 },
    rarity: "common",
    spawnWeight: 10,
  },
  {
    id: "curled",
    name: "まるまりネコ",
    svgPath:
      "M40,5 C20,5 5,18 5,38 C5,55 20,68 40,68 C60,68 75,55 75,38 C75,18 60,5 40,5 Z M55,55 C55,60 50,62 48,58 L42,48 C40,46 38,48 40,50 L44,56 C42,58 38,57 36,55 L30,42 C28,40 32,38 34,42 Z",
    physicsVertices: [
      { x: -30, y: -28 },
      { x: 0, y: -35 },
      { x: 30, y: -28 },
      { x: 35, y: 0 },
      { x: 30, y: 28 },
      { x: 0, y: 35 },
      { x: -30, y: 28 },
      { x: -35, y: 0 },
    ],
    width: 70,
    height: 70,
    mass: 2.2,
    friction: 0.5,
    restitution: 0.12,
    centerOfMass: { x: 0, y: 0 },
    rarity: "uncommon",
    spawnWeight: 7,
  },
  {
    id: "stretchy",
    name: "のびのびネコ",
    svgPath:
      "M5,28 C2,26 0,28 0,32 C0,38 5,42 15,44 L75,44 C85,42 90,38 90,32 C90,28 88,26 85,28 L87,20 C87,18 85,17 84,19 L82,26 L10,26 L8,19 C7,17 5,18 5,20 Z",
    physicsVertices: [
      { x: -48, y: -10 },
      { x: -40, y: -14 },
      { x: 40, y: -14 },
      { x: 48, y: -10 },
      { x: 45, y: 10 },
      { x: 0, y: 14 },
      { x: -45, y: 10 },
    ],
    width: 95,
    height: 30,
    mass: 1.4,
    friction: 0.9,
    restitution: 0.02,
    centerOfMass: { x: 0, y: 0 },
    rarity: "rare",
    spawnWeight: 5,
  },
  {
    id: "chunky",
    name: "ずんぐりネコ",
    svgPath:
      "M25,10 C15,10 5,20 5,35 C5,52 18,62 40,64 C62,62 75,52 75,35 C75,20 65,10 55,10 L58,2 C58,0 56,-1 55,1 L52,8 L28,8 L25,1 C24,-1 22,0 22,2 Z M15,50 C12,50 10,48 12,46 L18,42 M65,50 C68,50 70,48 68,46 L62,42",
    physicsVertices: [
      { x: -35, y: -28 },
      { x: -18, y: -35 },
      { x: 18, y: -35 },
      { x: 35, y: -28 },
      { x: 38, y: 0 },
      { x: 35, y: 25 },
      { x: 0, y: 32 },
      { x: -35, y: 25 },
      { x: -38, y: 0 },
    ],
    width: 75,
    height: 70,
    mass: 2.5,
    friction: 0.55,
    restitution: 0.1,
    centerOfMass: { x: 0, y: 3 },
    rarity: "rare",
    spawnWeight: 3,
  },
];
```

---

## 8. ネコ表情システム

```typescript
// src/data/catFaces.ts

import { FaceData, FaceExpression } from "../types";

/**
 * 表情データ
 * 全SVGパスは40x30の座標系（ネコボディの顔エリアにオーバーレイ）
 * 原点はネコボディの顔中心
 */
export const CAT_FACES: Record<FaceExpression, FaceData> = {
  normal: {
    expression: "normal",
    leftEye:  "M10,10 C10,7 13,5 15,5 C17,5 20,7 20,10 C20,12 17,13 15,13 C13,13 10,12 10,10 Z M13,9 C13,8 14,7 15,7 C16,7 17,8 17,9 C17,10 16,10 15,10 C14,10 13,10 13,9 Z",
    rightEye: "M25,10 C25,7 28,5 30,5 C32,5 35,7 35,10 C35,12 32,13 30,13 C28,13 25,12 25,10 Z M28,9 C28,8 29,7 30,7 C31,7 32,8 32,9 C32,10 31,10 30,10 C29,10 28,10 28,9 Z",
    mouth:    "M18,18 Q22,22 27,18",
    extras: undefined,
  },
  scared: {
    expression: "scared",
    leftEye:  "M10,8 C10,4 13,2 15,2 C17,2 20,4 20,8 C20,12 17,14 15,14 C13,14 10,12 10,8 Z M13,7 C13,5 14,4 15,4 C16,4 17,5 17,7 C17,9 16,9 15,9 C14,9 13,9 13,7 Z",
    rightEye: "M25,8 C25,4 28,2 30,2 C32,2 35,4 35,8 C35,12 32,14 30,14 C28,14 25,12 25,8 Z M28,7 C28,5 29,4 30,4 C31,4 32,5 32,7 C32,9 31,9 30,9 C29,9 28,9 28,7 Z",
    mouth:    "M19,19 C19,19 22,16 22,16 C22,16 25,19 25,19",
    extras:   "M8,4 L12,7 M37,4 L33,7", // 汗マーク
  },
  sleeping: {
    expression: "sleeping",
    leftEye:  "M10,10 Q15,13 20,10",  // 閉じ目（弧）
    rightEye: "M25,10 Q30,13 35,10",
    mouth:    "M20,19 Q22,21 24,19",   // 小さな口
    extras:   "M38,2 L42,0 M40,5 L44,3 M42,8 L46,6", // Zzz
  },
  angry: {
    expression: "angry",
    leftEye:  "M10,10 C10,7 13,6 15,6 C17,6 20,7 20,10 C20,12 17,13 15,13 C13,13 10,12 10,10 Z M12,8 L18,6", // 目+眉（怒り）
    rightEye: "M25,10 C25,7 28,6 30,6 C32,6 35,7 35,10 C35,12 32,13 30,13 C28,13 25,12 25,10 Z M27,6 L33,8",
    mouth:    "M17,20 L22,17 L27,20", // への字口
    extras:   "M5,2 L8,5 L5,5 Z M40,2 L37,5 L40,5 Z", // 怒りマーク
  },
  shocked: {
    expression: "shocked",
    leftEye:  "M10,6 C10,2 13,0 15,0 C17,0 20,2 20,6 C20,12 17,14 15,14 C13,14 10,12 10,6 Z",
    rightEye: "M25,6 C25,2 28,0 30,0 C32,0 35,2 35,6 C35,12 32,14 30,14 C28,14 25,12 25,6 Z",
    mouth:    "M18,18 C18,18 22,24 22,24 C22,24 26,18 26,18 Z", // 大きく開いた口
    extras:   "M6,0 L10,4 M39,0 L35,4 M22,-4 L22,0", // 驚きマーク
  },
  love: {
    expression: "love",
    leftEye:  "M11,8 L15,4 L19,8 L15,12 Z", // ハート型目
    rightEye: "M26,8 L30,4 L34,8 L30,12 Z",
    mouth:    "M18,18 Q22,23 27,18",
    extras:   "M5,0 L7,3 L9,0 L7,4 Z M36,0 L38,3 L40,0 L38,4 Z", // ハートエフェクト
  },
  dizzy: {
    expression: "dizzy",
    leftEye:  "M11,7 L19,13 M11,13 L19,7",   // ×目
    rightEye: "M26,7 L34,13 M26,13 L34,7",
    mouth:    "M18,20 Q22,23 26,20 Q22,17 18,20", // うにょうにょ口
    extras:   "M4,2 C6,0 8,2 6,4 C4,2 6,0 8,2 M37,2 C39,0 41,2 39,4 C37,2 39,0 41,2", // ぐるぐるエフェクト
  },
};

/**
 * 表情遷移ルール
 *
 * idle(配置待ち)   → normal
 * dropping(落下中) → scared
 * settling(着地後) → normal → sleeping (安定したら)
 * 上にネコが乗った → angry
 * コンボ3以上      → love
 * collapsing       → shocked
 * 落下後           → dizzy
 */
export function getExpressionForState(
  phase: string,
  isTopOfStack: boolean,
  comboCount: number,
  hasWeight: boolean
): FaceExpression {
  if (phase === "collapsing") return "shocked";
  if (phase === "dropping") return "scared";
  if (phase === "idle") return "normal";
  if (phase === "gameover") return "dizzy";

  // スタック済み
  if (comboCount >= 3 && isTopOfStack) return "love";
  if (hasWeight) return "angry";
  if (isTopOfStack) return "sleeping";
  return "normal";
}
```

### 表情描画コンポーネント

```typescript
// src/components/CatFace.tsx（擬似コード）

import { Path, Group } from "@shopify/react-native-skia";
import { CAT_FACES } from "../data/catFaces";
import { FaceExpression } from "../types";

interface CatFaceProps {
  expression: FaceExpression;
  x: number;
  y: number;
  angle: number;
  scale: number;
}

export function CatFace({ expression, x, y, angle, scale }: CatFaceProps) {
  const face = CAT_FACES[expression];

  return (
    <Group
      transform={[
        { translateX: x },
        { translateY: y },
        { rotate: angle },
        { scale: scale },
      ]}
    >
      <Path path={face.leftEye} color="#333333" />
      <Path path={face.rightEye} color="#333333" />
      <Path path={face.mouth} color="#FF6B6B" style="stroke" strokeWidth={1.5} />
      {face.extras && (
        <Path path={face.extras} color="#FFD700" style="stroke" strokeWidth={1} />
      )}
    </Group>
  );
}
```

---

## 9. スコアシステム

```typescript
// src/engine/ScoreCalculator.ts

export class ScoreCalculator {
  /**
   * スコア計算式
   *
   * 基本スコア = ネコ数 × 100
   * 高さボーナス = 高さ(m) × 50
   * コンボボーナス = コンボ数 × コンボ数 × 25 （二乗で急上昇）
   * 合計 = 基本スコア + 高さボーナス + コンボボーナス
   */
  calculate(catCount: number, heightM: number, combo: number): number {
    const baseScore = catCount * 100;
    const heightBonus = Math.floor(heightM * 50);
    const comboBonus = combo * combo * 25;
    return baseScore + heightBonus + comboBonus;
  }

  /**
   * 1匹追加時の獲得スコア表示用
   */
  getPointsForLastCat(
    catCount: number,
    heightM: number,
    combo: number
  ): number {
    const current = this.calculate(catCount, heightM, combo);
    const previous = this.calculate(
      Math.max(0, catCount - 1),
      heightM - 0.5, // おおよその1匹分の高さ
      Math.max(0, combo - 1)
    );
    return Math.max(0, current - previous);
  }

  /**
   * コンボ表示テキスト
   */
  getComboText(combo: number): string | null {
    if (combo < 2) return null;
    if (combo < 5) return `${combo} COMBO!`;
    if (combo < 10) return `${combo} COMBO!! NICE!`;
    if (combo < 20) return `${combo} COMBO!!! AMAZING!!`;
    return `${combo} COMBO!!!! LEGENDARY!!!`;
  }

  /**
   * コンボに応じたカラー
   */
  getComboColor(combo: number): string {
    if (combo < 3) return "#FFFFFF";
    if (combo < 5) return "#FFD700";   // 金
    if (combo < 10) return "#FF6B6B";  // 赤
    if (combo < 20) return "#FF00FF";  // マゼンタ
    return "#00FFFF";                   // シアン（伝説級）
  }
}
```

### スコア表示例

```
┌─────────────────────┐
│  ネコ: 15匹          │  baseScore  = 15 × 100 = 1,500
│  高さ: 6.2m          │  heightBonus = 6.2 × 50 = 310
│  コンボ: ×8          │  comboBonus = 8 × 8 × 25 = 1,600
│  合計: 3,410         │  total = 3,410
└─────────────────────┘
```

---

## 10. 収益化設計

### 10.1 AdMob配置

| 広告枠 | 種類 | 配置場所 | 表示タイミング |
|---|---|---|---|
| banner_result | バナー(320x50) | リザルト画面下部 | リザルト画面表示中常時 |
| interstitial_gameover | インタースティシャル | リザルト画面遷移前 | 3ゲームに1回 |
| reward_continue | リワード動画 | リザルト画面「広告を見て続行」 | ユーザータップ時 |

### 10.2 広告表示ルール

```typescript
// src/constants/ads.ts

export const AD_CONFIG = {
  /** バナー広告ユニットID */
  BANNER_ID: {
    ios: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
    android: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
  },
  /** インタースティシャル広告ユニットID */
  INTERSTITIAL_ID: {
    ios: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
    android: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
  },
  /** リワード広告ユニットID */
  REWARD_ID: {
    ios: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
    android: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
  },

  /** インタースティシャル表示間隔（ゲーム数） */
  INTERSTITIAL_INTERVAL: 3,

  /** リワード広告のクールダウン（ms）: 同一セッションで5分に1回まで */
  REWARD_COOLDOWN_MS: 300_000,

  /** 1ゲームあたりのリワード使用回数上限 */
  REWARD_PER_GAME_LIMIT: 1,

  /** 広告削除購入時はバナー・インタースティシャルを非表示 */
  /** リワード広告は広告削除後も表示（ユーザー任意のため） */
} as const;
```

### 10.3 IAP商品

```typescript
// src/data/shopItems.ts

import { ShopItem } from "../types";

export const SHOP_ITEMS: ShopItem[] = [
  {
    productId: "remove_ads",
    name: "広告削除",
    description: "バナー広告とインタースティシャル広告を永久に削除します",
    priceJPY: 480,
    type: "non_consumable",
  },
  {
    productId: "coin_pack_small",
    name: "コイン500枚",
    description: "ゲーム内コイン500枚を獲得",
    priceJPY: 160,
    type: "consumable",
    coinAmount: 500,
  },
  {
    productId: "coin_pack_medium",
    name: "コイン1500枚",
    description: "ゲーム内コイン1,500枚を獲得（お得！）",
    priceJPY: 400,
    type: "consumable",
    coinAmount: 1500,
  },
  {
    productId: "coin_pack_large",
    name: "コイン5000枚",
    description: "ゲーム内コイン5,000枚を獲得（超お得！）",
    priceJPY: 1000,
    type: "consumable",
    coinAmount: 5000,
  },
  {
    productId: "neko_samurai_skin",
    name: "ネコ侍スキン",
    description: "刀を背負った侍ネコ！限定デザイン",
    priceJPY: 320,
    type: "non_consumable",
  },
];
```

### 10.4 コイン獲得ルール

| 獲得方法 | コイン数 |
|---|---|
| 1ゲームクリア（崩壊まで） | catCount × 2 |
| コンボ5以上 | +50 |
| コンボ10以上 | +150 |
| 新記録達成 | +100 |
| デイリーチャレンジクリア | 100〜300（難易度依存） |
| 実績解除 | 実績ごとに50〜500 |
| リワード広告視聴 | +100 |

### 10.5 スキン購入価格（コイン）

| スキン | 解放条件 | コイン価格 |
|---|---|---|
| scottish | ショップ購入 | 500 |
| persian | スコア5,000達成 | 0（自動解放） |
| siamese | ショップ購入 | 500 |
| russian_blue | 50匹積み上げ実績 | 0（自動解放） |
| munchkin | ショップ購入 | 800 |
| sphynx | 100ゲームプレイ実績 | 0（自動解放） |
| bengal | ショップ購入 | 800 |
| ragdoll | ショップ購入 | 1200 |
| abyssinian | 30日連続プレイ | 0（自動解放） |
| neko_samurai | IAP購入（¥320） | - |

---

## 11. シェア機能

### 11.1 崩壊スローモーション

```typescript
// src/components/CollapseSlow.tsx 概要

/**
 * 崩壊検出時:
 * 1. ゲームループの物理更新を COLLAPSE_SLOW_FACTOR (0.15倍速) に切り替え
 * 2. 背景にラジアルブラー風オーバーレイ（半透明黒、中心は明るい）
 * 3. ネコの表情を全て "shocked" に切り替え
 * 4. カメラをタワー中央にフォーカス（ズームイン 1.3倍）
 * 5. 1.5秒後に通常速度に戻してゲームオーバー遷移
 *
 * 注: 動画キャプチャは expo-screen-capture + react-native-view-shot で
 *     スクリーンショット1枚を撮る方式（動画生成はパフォーマンス上困難）
 */
```

### 11.2 タワー画像OGP生成

```typescript
// src/utils/share.ts

import { makeImageFromView } from "@shopify/react-native-skia";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

/**
 * タワー画像生成仕様:
 * - サイズ: 1200 x 630 (OGP標準)
 * - 背景: グラデーション（空色→地面色）
 * - 中央: タワー全体のスナップショット（フィットするようスケール）
 * - 上部: 「つみネコ」ロゴ
 * - 下部: スコア・高さ・ネコ数の情報バー
 * - 右下: アプリアイコン小さく
 */

export async function shareResult(params: {
  score: number;
  height: number;
  catCount: number;
  isNewRecord: boolean;
  towerImageBase64: string; // Skia Canvasからキャプチャ済み
}): Promise<void> {
  const { score, height, catCount, isNewRecord } = params;

  // シェアテキスト
  const recordMark = isNewRecord ? "🏆 NEW RECORD! " : "";
  const text = [
    `${recordMark}ネコを${catCount}匹積み上げた！`,
    `📏 高さ: ${height.toFixed(1)}m`,
    `🎯 スコア: ${score.toLocaleString()}`,
    "",
    "つみネコ - ネコを積み上げるだけなのにハマる！",
    "#つみネコ #StackCats",
    "https://example.com/tsumineko", // ストアURL（リリース後差し替え）
  ].join("\n");

  // 画像ファイル保存
  const filePath = `${FileSystem.cacheDirectory}share_tower.png`;
  await FileSystem.writeAsStringAsync(filePath, params.towerImageBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // OS共有シート
  await Sharing.shareAsync(filePath, {
    mimeType: "image/png",
    dialogTitle: "つみネコの記録をシェア",
    UTI: "public.png",
  });
}
```

### 11.3 シェアテキストテンプレート

```
--- 通常シェア ---
ネコを{catCount}匹積み上げた！
📏 高さ: {height}m
🎯 スコア: {score}
つみネコ - ネコを積み上げるだけなのにハマる！
#つみネコ #StackCats

--- 新記録シェア ---
🏆 NEW RECORD! ネコを{catCount}匹積み上げた！
📏 高さ: {height}m（自己ベスト更新！）
🎯 スコア: {score}
つみネコ - ネコを積み上げるだけなのにハマる！
#つみネコ #StackCats

--- デイリーチャレンジクリア ---
📅 今日のデイリーチャレンジクリア！
ルール: {ruleName}
🎯 スコア: {score}
つみネコ - 毎日違うルールで遊べる！
#つみネコ #StackCats #デイリーチャレンジ
```

---

## 12. サウンド設計

### 12.1 サウンドファイル一覧

| ファイル名 | 種類 | 再生タイミング | 長さ | ループ |
|---|---|---|---|---|
| bgm_title.mp3 | BGM | タイトル画面 | 30秒 | Yes |
| bgm_main.mp3 | BGM | ゲーム中 | 60秒 | Yes |
| se_land_soft.mp3 | SE | 軽いネコ着地（mass < 1.5） | 0.3秒 | No |
| se_land_heavy.mp3 | SE | 重いネコ着地（mass >= 1.5） | 0.4秒 | No |
| se_collapse.mp3 | SE | 崩壊開始 | 1.0秒 | No |
| se_combo.mp3 | SE | コンボ2以上で着地成功 | 0.5秒 | No |
| se_meow.mp3 | SE | ネコ生成時（ランダム20%の確率） | 0.3秒 | No |
| se_newrecord.mp3 | SE | 新記録達成 | 1.5秒 | No |
| se_tap.mp3 | SE | UI要素タップ | 0.1秒 | No |
| se_unlock.mp3 | SE | 実績・スキン解放 | 0.8秒 | No |

### 12.2 サウンド再生フック

```typescript
// src/hooks/useSound.ts

import { Audio } from "expo-av";
import { useCallback, useEffect, useRef } from "react";
import { useStorage } from "./useStorage";

type SoundName =
  | "bgm_title"
  | "bgm_main"
  | "se_land_soft"
  | "se_land_heavy"
  | "se_collapse"
  | "se_combo"
  | "se_meow"
  | "se_newrecord"
  | "se_tap"
  | "se_unlock";

const SOUND_FILES: Record<SoundName, any> = {
  bgm_title: require("../../assets/sounds/bgm_title.mp3"),
  bgm_main: require("../../assets/sounds/bgm_main.mp3"),
  se_land_soft: require("../../assets/sounds/se_land_soft.mp3"),
  se_land_heavy: require("../../assets/sounds/se_land_heavy.mp3"),
  se_collapse: require("../../assets/sounds/se_collapse.mp3"),
  se_combo: require("../../assets/sounds/se_combo.mp3"),
  se_meow: require("../../assets/sounds/se_meow.mp3"),
  se_newrecord: require("../../assets/sounds/se_newrecord.mp3"),
  se_tap: require("../../assets/sounds/se_tap.mp3"),
  se_unlock: require("../../assets/sounds/se_unlock.mp3"),
};

export function useSound() {
  const sounds = useRef<Map<SoundName, Audio.Sound>>(new Map());
  const { settings } = useStorage();

  useEffect(() => {
    // 全サウンドをプリロード
    const load = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      for (const [name, file] of Object.entries(SOUND_FILES)) {
        const { sound } = await Audio.Sound.createAsync(file, {
          volume: name.startsWith("bgm_")
            ? settings.bgmVolume
            : settings.seVolume,
          isLooping: name.startsWith("bgm_"),
        });
        sounds.current.set(name as SoundName, sound);
      }
    };
    load();

    return () => {
      sounds.current.forEach((s) => s.unloadAsync());
    };
  }, []);

  const play = useCallback(async (name: SoundName) => {
    const sound = sounds.current.get(name);
    if (!sound) return;
    await sound.setPositionAsync(0);
    await sound.playAsync();
  }, []);

  const stop = useCallback(async (name: SoundName) => {
    const sound = sounds.current.get(name);
    if (!sound) return;
    await sound.stopAsync();
  }, []);

  const setVolume = useCallback(
    async (name: SoundName, volume: number) => {
      const sound = sounds.current.get(name);
      if (!sound) return;
      await sound.setVolumeAsync(volume);
    },
    []
  );

  return { play, stop, setVolume };
}
```

### 12.3 BGMテンポ仕様

| 状況 | BPM | 雰囲気 |
|---|---|---|
| タイトル画面 | 90 | ほのぼの・ネコっぽいマリンバ |
| ゲーム序盤（0〜5匹） | 110 | 軽快なピアノ+木琴 |
| ゲーム中盤（6〜15匹） | 120 | 同上+ベースライン追加 |
| ゲーム終盤（16匹以上） | 130 | テンションアップ+パーカッション追加 |
| 崩壊スローモーション | 元BPMの0.15倍 | ピッチダウン+リバーブ |

BGMテンポ変更は `Audio.Sound.setRateAsync()` で実現:

```typescript
// テンポ変更
async function adjustBGMTempo(catCount: number): Promise<void> {
  const bgm = sounds.current.get("bgm_main");
  if (!bgm) return;

  let rate = 1.0;
  if (catCount <= 5) rate = 1.0;
  else if (catCount <= 15) rate = 1.09; // 110→120 BPM相当
  else rate = 1.18; // 110→130 BPM相当

  await bgm.setRateAsync(rate, true); // shouldCorrectPitch=true
}
```

---

## 13. ハプティクス

```typescript
// src/hooks/useHaptics.ts

import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { useStorage } from "./useStorage";

export function useHaptics() {
  const { settings } = useStorage();

  const trigger = useCallback(
    async (type: "land" | "collapse" | "newRecord" | "combo" | "tap") => {
      if (!settings.hapticsEnabled) return;

      switch (type) {
        case "land":
          // 着地: 軽い衝撃
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case "collapse":
          // 崩壊: 重い衝撃3連続
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setTimeout(
            () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
            100
          );
          setTimeout(
            () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
            200
          );
          break;

        case "newRecord":
          // 新記録: 成功通知
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          break;

        case "combo":
          // コンボ: 軽い衝撃
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case "tap":
          // UIタップ: 選択フィードバック
          await Haptics.selectionAsync();
          break;
      }
    },
    [settings.hapticsEnabled]
  );

  return { trigger };
}
```

### ハプティクス発火タイミング一覧

| イベント | ハプティクス種類 | 強度 |
|---|---|---|
| ネコ着地（成功） | Impact Medium | 中 |
| ネコ着地（重いネコ） | Impact Heavy | 強 |
| 崩壊開始 | Impact Heavy × 3（100ms間隔） | 最強 |
| 新記録達成 | Notification Success | 中 |
| コンボ2以上 | Impact Light | 弱 |
| UIボタンタップ | Selection | 最弱 |
| 実績解除 | Notification Success | 中 |
| スキンアンロック | Notification Success | 中 |

---

## 14. AsyncStorageキー設計

### 14.1 キー一覧と構造

```typescript
// src/utils/storage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PlayerStats,
  ScoreRecord,
  WalletState,
  UserSettings,
  AchievementProgress,
  DailyChallengeResult,
  SkinId,
  AdState,
  StorageSchema,
} from "../types";

/** 全ストレージキー */
const KEYS = {
  STATS: "@tsumineko/stats",
  SCORES: "@tsumineko/scores",
  WALLET: "@tsumineko/wallet",
  SETTINGS: "@tsumineko/settings",
  ACHIEVEMENTS: "@tsumineko/achievements",
  DAILY_RESULTS: "@tsumineko/daily_results",
  UNLOCKED_SKINS: "@tsumineko/unlocked_skins",
  AD_STATE: "@tsumineko/ad_state",
} as const;

/** デフォルト値 */
const DEFAULTS: StorageSchema = {
  "@tsumineko/stats": {
    totalGames: 0,
    totalCatsStacked: 0,
    totalHeight: 0,
    bestScore: 0,
    bestHeight: 0,
    bestCombo: 0,
    bestCatCount: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayDate: "",
    firstPlayDate: "",
  },
  "@tsumineko/scores": [],
  "@tsumineko/wallet": {
    coins: 0,
    adsRemoved: false,
    purchasedSkins: [],
  },
  "@tsumineko/settings": {
    bgmVolume: 0.8,
    seVolume: 1.0,
    hapticsEnabled: true,
    showGuide: true,
    selectedSkinId: "mike",
  },
  "@tsumineko/achievements": {
    unlockedIds: [],
    shapesUsed: [],
    fastStackCount: 0,
  },
  "@tsumineko/daily_results": {},
  "@tsumineko/unlocked_skins": ["mike", "kuro", "shiro", "tora", "hachiware"],
  "@tsumineko/ad_state": {
    gamesUntilInterstitial: 3,
    rewardAvailable: true,
    lastRewardTime: 0,
  },
};

/** 型安全な読み込み */
export async function loadData<K extends keyof StorageSchema>(
  key: K
): Promise<StorageSchema[K]> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return DEFAULTS[key];
  return JSON.parse(raw) as StorageSchema[K];
}

/** 型安全な保存 */
export async function saveData<K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K]
): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/** スコア履歴に追加（上位50件を保持） */
export async function addScoreRecord(record: ScoreRecord): Promise<void> {
  const scores = await loadData("@tsumineko/scores");
  scores.push(record);
  scores.sort((a, b) => b.score - a.score);
  const trimmed = scores.slice(0, 50);
  await saveData("@tsumineko/scores", trimmed);
}

/** プレイ統計を更新 */
export async function updateStats(
  gameResult: {
    score: number;
    height: number;
    catCount: number;
    maxCombo: number;
  }
): Promise<{ isNewRecord: boolean }> {
  const stats = await loadData("@tsumineko/stats");
  const today = new Date().toISOString().split("T")[0];

  const isNewRecord = gameResult.score > stats.bestScore;

  stats.totalGames++;
  stats.totalCatsStacked += gameResult.catCount;
  stats.totalHeight += gameResult.height;
  stats.bestScore = Math.max(stats.bestScore, gameResult.score);
  stats.bestHeight = Math.max(stats.bestHeight, gameResult.height);
  stats.bestCombo = Math.max(stats.bestCombo, gameResult.maxCombo);
  stats.bestCatCount = Math.max(stats.bestCatCount, gameResult.catCount);

  // 連続プレイ日数
  if (stats.lastPlayDate === "") {
    stats.firstPlayDate = today;
    stats.currentStreak = 1;
  } else {
    const lastDate = new Date(stats.lastPlayDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / 86400000
    );

    if (diffDays === 1) {
      stats.currentStreak++;
    } else if (diffDays > 1) {
      stats.currentStreak = 1;
    }
    // diffDays === 0: 同日、変更なし
  }
  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  stats.lastPlayDate = today;

  await saveData("@tsumineko/stats", stats);
  return { isNewRecord };
}

/** 全データリセット */
export async function resetAllData(): Promise<void> {
  const keys = Object.values(KEYS);
  await AsyncStorage.multiRemove(keys);
}
```

### 14.2 データ量見積もり

| キー | 1件のサイズ | 最大件数 | 最大サイズ |
|---|---|---|---|
| stats | ~300B | 1 | 300B |
| scores | ~120B/件 | 50 | 6KB |
| wallet | ~100B | 1 | 100B |
| settings | ~150B | 1 | 150B |
| achievements | ~500B | 1 | 500B |
| daily_results | ~80B/日 | 365 | 29KB |
| unlocked_skins | ~20B/件 | 15 | 300B |
| ad_state | ~80B | 1 | 80B |
| **合計** | | | **~37KB** |

---

## 15. ネコスキン

```typescript
// src/data/catSkins.ts

import { CatSkin } from "../types";

export const CAT_SKINS: CatSkin[] = [
  // ========== 初期スキン（5種） ==========
  {
    id: "mike",
    name: "三毛猫",
    description: "おなじみの三毛猫。茶・黒・白のまだら模様",
    bodyColor: "#FFF8E7",
    patternColor: "#D4722C",
    patternSvg: "M5,10 C10,5 20,15 25,8 C30,12 35,5 40,10 L40,30 C35,25 25,35 20,28 C15,32 10,22 5,28 Z",
    earColor: "#FFBCBC",
    noseColor: "#FF8FAB",
    eyeColor: "#4CAF50",
    tailSvg: "M0,0 C5,-10 15,-15 20,-8 C25,-1 30,-12 35,-5",
    unlockCondition: { type: "default", value: 0 },
    isDefault: true,
  },
  {
    id: "kuro",
    name: "黒猫",
    description: "つやつやの黒猫。黄色い目がチャームポイント",
    bodyColor: "#2C2C2C",
    patternColor: null,
    patternSvg: null,
    earColor: "#4A4A4A",
    noseColor: "#444444",
    eyeColor: "#FFD700",
    tailSvg: "M0,0 C8,-12 16,-8 24,-15 C28,-10 32,-18 36,-12",
    unlockCondition: { type: "default", value: 0 },
    isDefault: true,
  },
  {
    id: "shiro",
    name: "白猫",
    description: "真っ白な猫。ブルーの瞳が美しい",
    bodyColor: "#FFFFFF",
    patternColor: null,
    patternSvg: null,
    earColor: "#FFD1DC",
    noseColor: "#FFB6C1",
    eyeColor: "#4FC3F7",
    tailSvg: "M0,0 C6,-8 12,-14 20,-10 C26,-6 30,-14 36,-8",
    unlockCondition: { type: "default", value: 0 },
    isDefault: true,
  },
  {
    id: "tora",
    name: "トラ猫",
    description: "元気いっぱいのトラ猫。縞模様がワイルド",
    bodyColor: "#F5A623",
    patternColor: "#8B4513",
    patternSvg: "M0,8 L40,8 L40,12 L0,12 Z M0,18 L40,18 L40,22 L0,22 Z M0,28 L40,28 L40,32 L0,32 Z",
    earColor: "#FFBCBC",
    noseColor: "#FF8FAB",
    eyeColor: "#8BC34A",
    tailSvg: "M0,0 C5,-10 10,-5 15,-12 C20,-8 25,-15 32,-10",
    unlockCondition: { type: "default", value: 0 },
    isDefault: true,
  },
  {
    id: "hachiware",
    name: "ハチワレ",
    description: "額の八の字模様がトレードマーク",
    bodyColor: "#FFFFFF",
    patternColor: "#333333",
    patternSvg: "M20,0 L0,20 L0,0 Z M20,0 L40,20 L40,0 Z",
    earColor: "#333333",
    noseColor: "#FF8FAB",
    eyeColor: "#FFB300",
    tailSvg: "M0,0 C6,-10 14,-6 20,-14 C26,-8 32,-16 38,-10",
    unlockCondition: { type: "default", value: 0 },
    isDefault: true,
  },

  // ========== アンロックスキン（10種） ==========
  {
    id: "scottish",
    name: "スコティッシュフォールド",
    description: "折れ耳がキュート。おっとりした性格",
    bodyColor: "#D4B896",
    patternColor: null,
    patternSvg: null,
    earColor: "#C4A882",
    noseColor: "#D4907F",
    eyeColor: "#FFB300",
    tailSvg: "M0,0 C4,-6 8,-10 14,-8 C18,-5 22,-10 28,-6",
    unlockCondition: { type: "score", value: 0 },
    isDefault: false,
  },
  {
    id: "persian",
    name: "ペルシャ",
    description: "ふわふわロングヘアのお嬢様ネコ",
    bodyColor: "#F5E6CA",
    patternColor: "#E8D4B0",
    patternSvg: "M0,0 C5,3 10,1 15,4 C20,2 25,5 30,3 C35,5 40,2 40,0 L40,40 C35,38 30,40 25,37 C20,39 15,36 10,38 C5,36 0,40 0,0 Z",
    earColor: "#FFCDD2",
    noseColor: "#E57373",
    eyeColor: "#4FC3F7",
    tailSvg: "M0,0 C3,-5 6,-3 9,-8 C12,-5 15,-10 20,-6 C23,-3 26,-8 30,-4",
    unlockCondition: { type: "score", value: 5000 },
    isDefault: false,
  },
  {
    id: "siamese",
    name: "シャム",
    description: "エキゾチックなポイントカラーが魅力",
    bodyColor: "#FFF3E0",
    patternColor: "#5D4037",
    patternSvg: "M15,0 L25,0 L22,10 L18,10 Z M0,35 L15,35 L15,40 L0,40 Z M25,35 L40,35 L40,40 L25,40 Z",
    earColor: "#5D4037",
    noseColor: "#5D4037",
    eyeColor: "#1565C0",
    tailSvg: "M0,0 C8,-14 16,-6 24,-16 C30,-10 34,-18 40,-12",
    unlockCondition: { type: "count", value: 0 },
    isDefault: false,
  },
  {
    id: "russian_blue",
    name: "ロシアンブルー",
    description: "銀色の被毛とエメラルドグリーンの瞳",
    bodyColor: "#90A4AE",
    patternColor: null,
    patternSvg: null,
    earColor: "#78909C",
    noseColor: "#607D8B",
    eyeColor: "#00C853",
    tailSvg: "M0,0 C6,-10 12,-6 18,-12 C24,-8 30,-14 36,-8",
    unlockCondition: {
      type: "achievement",
      value: 0,
      achievementId: "stack_50",
    },
    isDefault: false,
  },
  {
    id: "munchkin",
    name: "マンチカン",
    description: "短い足がたまらなくかわいい！",
    bodyColor: "#FFCC80",
    patternColor: "#FF8F00",
    patternSvg: "M8,25 L12,25 L12,40 L8,40 Z M28,25 L32,25 L32,40 L28,40 Z",
    earColor: "#FFB74D",
    noseColor: "#FF8FAB",
    eyeColor: "#558B2F",
    tailSvg: "M0,0 C3,-4 6,-7 10,-5 C13,-3 16,-8 20,-4",
    unlockCondition: { type: "score", value: 0 },
    isDefault: false,
  },
  {
    id: "sphynx",
    name: "スフィンクス",
    description: "毛がない！？でもあったかい不思議なネコ",
    bodyColor: "#EFBDA5",
    patternColor: "#D4967E",
    patternSvg: "M5,5 C10,3 15,7 20,4 C25,6 30,3 35,5 L38,10 C33,8 28,12 23,9 C18,11 13,8 8,10 Z",
    earColor: "#E8A088",
    noseColor: "#D4907F",
    eyeColor: "#7CB342",
    tailSvg: "M0,0 C10,-12 20,-4 30,-10 C35,-6 38,-12 42,-6",
    unlockCondition: {
      type: "achievement",
      value: 0,
      achievementId: "games_100",
    },
    isDefault: false,
  },
  {
    id: "bengal",
    name: "ベンガル",
    description: "ヒョウ柄のワイルドなネコ",
    bodyColor: "#D4A04A",
    patternColor: "#5D4037",
    patternSvg: "M8,8 C10,5 14,5 16,8 C14,11 10,11 8,8 Z M22,15 C24,12 28,12 30,15 C28,18 24,18 22,15 Z M12,24 C14,21 18,21 20,24 C18,27 14,27 12,24 Z M28,6 C30,3 34,3 36,6 C34,9 30,9 28,6 Z",
    earColor: "#C49440",
    noseColor: "#8D6E63",
    eyeColor: "#FFD600",
    tailSvg: "M0,0 C8,-14 16,-6 24,-16 C30,-10 36,-18 42,-10",
    unlockCondition: { type: "score", value: 0 },
    isDefault: false,
  },
  {
    id: "ragdoll",
    name: "ラグドール",
    description: "抱っこ大好き。ぬいぐるみのようなネコ",
    bodyColor: "#FFF8F0",
    patternColor: "#A1887F",
    patternSvg: "M15,0 L25,0 L28,15 L22,20 L18,20 L12,15 Z M0,30 L10,25 L10,40 L0,40 Z M30,25 L40,30 L40,40 L30,40 Z",
    earColor: "#A1887F",
    noseColor: "#BCAAA4",
    eyeColor: "#42A5F5",
    tailSvg: "M0,0 C4,-6 8,-12 14,-10 C18,-6 22,-14 28,-8 C32,-4 36,-10 40,-6",
    unlockCondition: { type: "score", value: 0 },
    isDefault: false,
  },
  {
    id: "abyssinian",
    name: "アビシニアン",
    description: "古代エジプト出身!? 気品あるティックドタビー",
    bodyColor: "#C8956C",
    patternColor: "#8B5E3C",
    patternSvg: "M0,5 L40,5 L40,7 L0,7 Z M0,13 L40,13 L40,15 L0,15 Z M0,21 L40,21 L40,23 L0,23 Z M0,29 L40,29 L40,31 L0,31 Z",
    earColor: "#B8854C",
    noseColor: "#A0522D",
    eyeColor: "#FFD600",
    tailSvg: "M0,0 C6,-10 14,-6 20,-14 C26,-8 34,-16 40,-8",
    unlockCondition: { type: "daily", value: 30 },
    isDefault: false,
  },
  {
    id: "neko_samurai",
    name: "ネコ侍",
    description: "刀を背負った武士ネコ。拙者、積まれるでござる！",
    bodyColor: "#E0E0E0",
    patternColor: "#9E9E9E",
    patternSvg: "M18,0 L22,0 L22,35 L18,35 Z M16,2 L24,2 L24,5 L16,5 Z",
    earColor: "#BDBDBD",
    noseColor: "#757575",
    eyeColor: "#F44336",
    tailSvg: "M0,0 C4,-8 10,-4 14,-10 C18,-6 22,-12 28,-6",
    unlockCondition: { type: "iap", value: 320 },
    isDefault: false,
  },
];
```

---

## 16. デイリーチャレンジ

### 16.1 チャレンジ生成ロジック

```typescript
// src/data/dailyChallenges.ts

import { ChallengeRule, DailyChallenge } from "../types";

/** 全ルール定義 */
const CHALLENGE_RULES: {
  rule: ChallengeRule;
  name: string;
  description: string;
  targetScore: number;
  rewardCoins: number;
  difficulty: number; // 1-5
}[] = [
  {
    rule: "heavy_cats",
    name: "おデブ祭り",
    description: "全ネコの体重が2倍！重さに耐えろ！",
    targetScore: 2000,
    rewardCoins: 200,
    difficulty: 3,
  },
  {
    rule: "bouncy_cats",
    name: "バウンスフィーバー",
    description: "ネコがめっちゃ跳ねる！安定させろ！",
    targetScore: 1500,
    rewardCoins: 250,
    difficulty: 4,
  },
  {
    rule: "tiny_only",
    name: "ちびっこ集合",
    description: "ちびネコだけ！小さいけど不安定！",
    targetScore: 2500,
    rewardCoins: 150,
    difficulty: 2,
  },
  {
    rule: "fat_only",
    name: "重量級マッチ",
    description: "でぶネコだけ！重すぎて崩壊注意！",
    targetScore: 1800,
    rewardCoins: 200,
    difficulty: 3,
  },
  {
    rule: "no_guide",
    name: "ノーガイド",
    description: "落下ガイドなし！勘を頼りに！",
    targetScore: 2000,
    rewardCoins: 300,
    difficulty: 4,
  },
  {
    rule: "speed_up",
    name: "倍速チャレンジ",
    description: "落下速度2倍！素早い判断力が試される！",
    targetScore: 1500,
    rewardCoins: 250,
    difficulty: 4,
  },
  {
    rule: "low_gravity",
    name: "月面ネコ",
    description: "重力0.5倍！ふわふわ落下！",
    targetScore: 3000,
    rewardCoins: 150,
    difficulty: 2,
  },
  {
    rule: "high_friction",
    name: "ベタベタネコ",
    description: "摩擦2倍！くっつきやすいけど形が大事！",
    targetScore: 3500,
    rewardCoins: 150,
    difficulty: 1,
  },
  {
    rule: "random_wind",
    name: "嵐の日",
    description: "ランダムに横風が吹く！風に負けるな！",
    targetScore: 1500,
    rewardCoins: 300,
    difficulty: 5,
  },
  {
    rule: "mirror",
    name: "あべこべ",
    description: "操作が左右反転！脳がバグる！",
    targetScore: 1500,
    rewardCoins: 300,
    difficulty: 5,
  },
];

/**
 * 日付からデイリーチャレンジを決定論的に生成
 * シード: 日付文字列のハッシュ
 */
export function getDailyChallenge(dateStr: string): DailyChallenge {
  // 簡易ハッシュ: 日付文字列の各文字コードの合計
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % CHALLENGE_RULES.length;
  const rule = CHALLENGE_RULES[index];

  return {
    id: dateStr,
    rule: rule.rule,
    ruleName: rule.name,
    ruleDescription: rule.description,
    targetScore: rule.targetScore,
    rewardCoins: rule.rewardCoins,
  };
}

/**
 * チャレンジルールを物理エンジンに適用
 */
export function applyChallengeRule(
  rule: ChallengeRule,
  physicsParams: {
    gravity: { x: number; y: number };
    catMass: number;
    catRestitution: number;
    catFriction: number;
    dropSpeed: number;
    showGuide: boolean;
    windForce: number;
    mirrorInput: boolean;
  }
): typeof physicsParams {
  const p = { ...physicsParams };

  switch (rule) {
    case "heavy_cats":
      p.catMass *= 2;
      break;
    case "bouncy_cats":
      p.catRestitution = 0.5;
      break;
    case "tiny_only":
      // CatSpawnerで"tiny"のみ選択（別途制御）
      break;
    case "fat_only":
      // CatSpawnerで"fat"のみ選択（別途制御）
      break;
    case "no_guide":
      p.showGuide = false;
      break;
    case "speed_up":
      p.dropSpeed *= 2;
      break;
    case "low_gravity":
      p.gravity.y *= 0.5;
      break;
    case "high_friction":
      p.catFriction *= 2;
      break;
    case "random_wind":
      p.windForce = 0.002; // Matter.jsのforce値
      break;
    case "mirror":
      p.mirrorInput = true;
      break;
  }

  return p;
}
```

### 16.2 デイリーチャレンジUI仕様

- タイトル画面の「デイリー」ボタンに未クリアバッジ（赤い丸）を表示
- タップ時にモーダルでルール説明を表示、「挑戦する」で開始
- ゲーム画面上部にチャレンジルール名をバナー表示
- クリア時（targetScore到達）に専用演出＋コイン獲得アニメーション
- 日付変更（UTC 00:00）でリセット。前日の結果はdaily_resultsに保存

---

## 17. 実績システム

```typescript
// src/data/achievements.ts

import { Achievement, AchievementId } from "../types";

export const ACHIEVEMENTS: Achievement[] = [
  // ========== 積み上げ系 ==========
  {
    id: "first_stack",
    name: "はじめてのつみネコ",
    description: "ネコを1匹積み上げた",
    icon: "🐱",
    rewardCoins: 50,
    isSecret: false,
  },
  {
    id: "stack_10",
    name: "10匹タワー",
    description: "1ゲームでネコを10匹積み上げた",
    icon: "🏗️",
    rewardCoins: 100,
    isSecret: false,
  },
  {
    id: "stack_50",
    name: "50匹の大タワー",
    description: "1ゲームでネコを50匹積み上げた",
    icon: "🗼",
    rewardCoins: 300,
    isSecret: false,
  },
  {
    id: "stack_100",
    name: "100匹タワー伝説",
    description: "1ゲームでネコを100匹積み上げた",
    icon: "🏰",
    rewardCoins: 500,
    isSecret: false,
  },

  // ========== 高さ系 ==========
  {
    id: "height_1m",
    name: "1メートル到達",
    description: "タワーの高さが1mに到達",
    icon: "📏",
    rewardCoins: 50,
    isSecret: false,
  },
  {
    id: "height_5m",
    name: "5メートルの壁",
    description: "タワーの高さが5mに到達",
    icon: "🪜",
    rewardCoins: 200,
    isSecret: false,
  },
  {
    id: "height_10m",
    name: "天空ネコタワー",
    description: "タワーの高さが10mに到達",
    icon: "☁️",
    rewardCoins: 500,
    isSecret: false,
  },

  // ========== コンボ系 ==========
  {
    id: "combo_5",
    name: "5コンボ",
    description: "5回連続でネコを安定させた",
    icon: "🔥",
    rewardCoins: 100,
    isSecret: false,
  },
  {
    id: "combo_10",
    name: "10コンボフィーバー",
    description: "10回連続でネコを安定させた",
    icon: "💥",
    rewardCoins: 200,
    isSecret: false,
  },
  {
    id: "combo_20",
    name: "コンボマスター",
    description: "20回連続でネコを安定させた",
    icon: "⚡",
    rewardCoins: 500,
    isSecret: false,
  },

  // ========== スコア系 ==========
  {
    id: "score_1000",
    name: "1,000点突破",
    description: "スコア1,000点を達成",
    icon: "🎯",
    rewardCoins: 50,
    isSecret: false,
  },
  {
    id: "score_5000",
    name: "5,000点の壁",
    description: "スコア5,000点を達成",
    icon: "🏅",
    rewardCoins: 200,
    isSecret: false,
  },
  {
    id: "score_10000",
    name: "万点プレイヤー",
    description: "スコア10,000点を達成",
    icon: "🏆",
    rewardCoins: 500,
    isSecret: false,
  },

  // ========== プレイ回数系 ==========
  {
    id: "games_10",
    name: "ネコ中毒の始まり",
    description: "10回ゲームをプレイした",
    icon: "🎮",
    rewardCoins: 100,
    isSecret: false,
  },
  {
    id: "games_100",
    name: "つみネコマニア",
    description: "100回ゲームをプレイした",
    icon: "🎪",
    rewardCoins: 300,
    isSecret: false,
  },

  // ========== デイリー系 ==========
  {
    id: "daily_clear",
    name: "デイリー初クリア",
    description: "デイリーチャレンジを初めてクリア",
    icon: "📅",
    rewardCoins: 100,
    isSecret: false,
  },
  {
    id: "daily_7",
    name: "7日連続プレイ",
    description: "7日連続でプレイした",
    icon: "📆",
    rewardCoins: 200,
    isSecret: false,
  },
  {
    id: "daily_30",
    name: "30日の絆",
    description: "30日連続でプレイした",
    icon: "🗓️",
    rewardCoins: 500,
    isSecret: false,
  },

  // ========== コレクション系 ==========
  {
    id: "all_shapes",
    name: "全形状コンプリート",
    description: "全10種類の形状のネコを積み上げた",
    icon: "📚",
    rewardCoins: 300,
    isSecret: false,
  },
  {
    id: "skin_collector",
    name: "スキンコレクター",
    description: "5種類以上のスキンをアンロックした",
    icon: "👗",
    rewardCoins: 200,
    isSecret: false,
  },

  // ========== 隠し実績 ==========
  {
    id: "perfect_balance",
    name: "パーフェクトバランス",
    description: "1匹も落とさずに20匹積み上げた",
    icon: "⚖️",
    rewardCoins: 300,
    isSecret: true,
  },
  {
    id: "lucky_save",
    name: "奇跡の生還",
    description: "崩壊寸前（閾値の90%）でギリギリ持ちこたえた",
    icon: "🍀",
    rewardCoins: 200,
    isSecret: true,
  },
  {
    id: "speed_demon",
    name: "スピードデーモン",
    description: "10秒以内に5匹積み上げた",
    icon: "⏱️",
    rewardCoins: 300,
    isSecret: true,
  },
  {
    id: "night_owl",
    name: "夜ふかしネコ",
    description: "深夜2時〜4時にプレイした",
    icon: "🦉",
    rewardCoins: 100,
    isSecret: true,
  },
];
```

### 17.1 実績判定ロジック

```typescript
// src/hooks/useAchievements.ts（判定部分の擬似コード）

import {
  AchievementId,
  AchievementProgress,
  GameState,
  PlayerStats,
} from "../types";
import { ACHIEVEMENTS } from "../data/achievements";

/**
 * ゲーム終了時に全実績をチェックし、新規解除があれば返す
 */
export function checkAchievements(
  gameState: GameState,
  stats: PlayerStats,
  progress: AchievementProgress,
  gameStartTime: number
): AchievementId[] {
  const newlyUnlocked: AchievementId[] = [];

  const check = (id: AchievementId, condition: boolean) => {
    if (!progress.unlockedIds.includes(id) && condition) {
      newlyUnlocked.push(id);
    }
  };

  // 積み上げ系
  check("first_stack", gameState.catCount >= 1);
  check("stack_10", gameState.catCount >= 10);
  check("stack_50", gameState.catCount >= 50);
  check("stack_100", gameState.catCount >= 100);

  // 高さ系
  check("height_1m", gameState.height >= 1.0);
  check("height_5m", gameState.height >= 5.0);
  check("height_10m", gameState.height >= 10.0);

  // コンボ系
  check("combo_5", gameState.maxCombo >= 5);
  check("combo_10", gameState.maxCombo >= 10);
  check("combo_20", gameState.maxCombo >= 20);

  // スコア系
  check("score_1000", gameState.score >= 1000);
  check("score_5000", gameState.score >= 5000);
  check("score_10000", gameState.score >= 10000);

  // プレイ回数系（stats更新後に判定）
  check("games_10", stats.totalGames >= 10);
  check("games_100", stats.totalGames >= 100);

  // 連続プレイ
  check("daily_7", stats.currentStreak >= 7);
  check("daily_30", stats.currentStreak >= 30);

  // コレクション
  check("all_shapes", progress.shapesUsed.length >= 10);
  // skin_collector は別途スキンアンロック時にチェック

  // 隠し実績
  check(
    "perfect_balance",
    gameState.catCount >= 20 && gameState.fallenCats.length === 0
  );

  // speed_demon: ゲーム開始から10秒以内に5匹
  const elapsedSec = (Date.now() - gameStartTime) / 1000;
  check("speed_demon", gameState.catCount >= 5 && elapsedSec <= 10);

  // night_owl: 深夜2時〜4時
  const hour = new Date().getHours();
  check("night_owl", hour >= 2 && hour < 4);

  return newlyUnlocked;
}

/**
 * lucky_save は CollapseDetector 内でリアルタイム判定
 * 閾値の90%（= COLLAPSE_THRESHOLD_PX * 0.9 = 45px）まで落下して復帰した場合
 */
export function checkLuckySave(
  heightDrop: number,
  threshold: number
): boolean {
  return heightDrop >= threshold * 0.9 && heightDrop < threshold;
}
```

### 17.2 実績解除演出

```
実績解除時の演出フロー:
1. ゲーム画面上部からトースト通知がスライドイン（300ms）
2. ハプティクス: Notification Success
3. SE: se_unlock.mp3 再生
4. トースト表示:
   ┌────────────────────────┐
   │ 🏆 実績解除!            │
   │ ⚡ コンボマスター        │
   │ +500 🪙                 │
   └────────────────────────┘
5. 3秒間表示後、上にスライドアウト（300ms）
6. ゲームは一時停止しない（プレイ中にオーバーレイ表示）
```

---

## 付録A: レイアウト定数

```typescript
// src/constants/layout.ts

import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const LAYOUT = {
  /** HUD上部の高さ */
  HUD_HEIGHT: 80,

  /** 次のネコプレビューエリア */
  PREVIEW: {
    x: SCREEN_WIDTH - 70,
    y: 100,
    size: 50,
  },

  /** ガイド矢印のサイズ */
  GUIDE_ARROW_SIZE: 20,

  /** 一時停止ボタン */
  PAUSE_BUTTON: {
    x: SCREEN_WIDTH / 2,
    y: SCREEN_HEIGHT - 50,
    size: 40,
  },

  /** ネコの描画スケール（物理座標→画面座標） */
  CAT_RENDER_SCALE: 0.8,

  /** 背景の高さ帯（各帯で色が変わる） */
  BG_BANDS: [
    { maxHeight: 0, color: "#87CEEB" },    // 地上: 空色
    { maxHeight: 300, color: "#6BB5E0" },   // 低空
    { maxHeight: 600, color: "#4A9CD4" },   // 中空
    { maxHeight: 1000, color: "#2E7CB8" },  // 高空
    { maxHeight: Infinity, color: "#1A5276" }, // 成層圏
  ],
} as const;
```

## 付録B: カラーパレット

```typescript
// src/constants/colors.ts

export const COLORS = {
  /** 背景 */
  BG_PRIMARY: "#FFE4B5",       // モカシン（タイトル画面）
  BG_GAME: "#87CEEB",          // スカイブルー（ゲーム画面）
  BG_GROUND: "#8B7355",        // 地面色

  /** テキスト */
  TEXT_PRIMARY: "#333333",
  TEXT_SECONDARY: "#666666",
  TEXT_WHITE: "#FFFFFF",
  TEXT_SCORE: "#FFD700",        // スコア表示: 金色

  /** ボタン */
  BTN_PRIMARY: "#FF6B6B",      // メインCTA: コーラルレッド
  BTN_SECONDARY: "#4ECDC4",    // サブ: ティール
  BTN_DISABLED: "#CCCCCC",

  /** コンボ */
  COMBO_NORMAL: "#FFFFFF",
  COMBO_NICE: "#FFD700",
  COMBO_AMAZING: "#FF6B6B",
  COMBO_LEGENDARY: "#00FFFF",

  /** 実績 */
  ACHIEVEMENT_BG: "#1A1A2E",
  ACHIEVEMENT_BORDER: "#FFD700",

  /** 共通 */
  OVERLAY: "rgba(0, 0, 0, 0.6)",
  SHADOW: "rgba(0, 0, 0, 0.3)",
} as const;
```

## 付録C: 背景変化仕様

```
タワー高さに応じて背景がグラデーション変化:

0m〜3m:    昼の空（#87CEEB）＋白い雲（ゆっくり流れる）＋緑の丘
3m〜6m:    高い空（#6BB5E0）＋飛行機雲
6m〜10m:   さらに高い空（#4A9CD4）＋鳥のシルエット
10m〜15m:  成層圏（#2E7CB8）＋星がチラチラ
15m以上:   宇宙（#1A5276→#0D0D2B）＋星空＋地球が小さく見える

背景はSkia Canvasの後ろレイヤーに描画。
cameraYに応じて背景要素をパララックススクロール（0.3倍速）。
```

---

**設計書 END**

本設計書に基づき、実装者は各ファイルをそのまま作成し、擬似コードを完成コードに変換して実装すること。
