import { useState } from 'react';

/**
 * useRewardedAd -- リワード広告フック（モック実装）
 *
 * 実際のAdMob接続はストアリリース後に行う。
 * 今はフォールバックとして即座にリワードを付与する。
 *
 * 本番運用時の手順:
 *   1. npx expo install react-native-google-mobile-ads
 *   2. app.json に googleMobileAdsAppId を設定
 *   3. 下記コメントアウトを解除し AdMob 本番ユニットID を設定
 */
export function useRewardedAd() {
  const [isLoaded] = useState(true);

  const showAd = async (onReward: () => void) => {
    // モック: そのままリワードを付与
    onReward();
  };

  return { isLoaded, showAd };
}
