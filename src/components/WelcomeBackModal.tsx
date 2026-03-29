/**
 * WelcomeBackModal - 復帰ユーザー演出（全ゲーム共通）
 * - 24h以上未プレイ: 「おかえり！」
 * - 48h以上未プレイ: 復帰ボーナス100コイン
 * - 7日以上未プレイ: 復帰ボーナス200コイン
 *
 * Reanimated v4 + Pressable（Modal内はPressable必須 - SDK55ルール）
 */
import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

const LAST_VISIT_KEY = '@welcome_back_last_visit';

interface WelcomeBackResult {
  shouldShow: boolean;
  hoursAway: number;
  bonusCoins: number;
  message: string;
}

/**
 * 復帰チェック: AsyncStorageから最終訪問を取得し、
 * 表示すべきか・ボーナスコイン数を返す
 */
export async function checkWelcomeBack(): Promise<WelcomeBackResult> {
  const now = Date.now();
  const raw = await AsyncStorage.getItem(LAST_VISIT_KEY);

  // 訪問記録を更新
  await AsyncStorage.setItem(LAST_VISIT_KEY, now.toString());

  if (!raw) {
    return { shouldShow: false, hoursAway: 0, bonusCoins: 0, message: '' };
  }

  const lastVisit = parseInt(raw, 10);
  const diffMs = now - lastVisit;
  const hoursAway = Math.floor(diffMs / (1000 * 60 * 60));

  if (hoursAway < 24) {
    return { shouldShow: false, hoursAway, bonusCoins: 0, message: '' };
  }

  const daysAway = Math.floor(hoursAway / 24);

  if (daysAway >= 7) {
    return {
      shouldShow: true,
      hoursAway,
      bonusCoins: 200,
      message: `${daysAway}日ぶり！おかえり！\n復帰ボーナス 200コイン`,
    };
  }
  if (hoursAway >= 48) {
    return {
      shouldShow: true,
      hoursAway,
      bonusCoins: 100,
      message: `${daysAway}日ぶり！おかえり！\n復帰ボーナス 100コイン`,
    };
  }

  return {
    shouldShow: true,
    hoursAway,
    bonusCoins: 0,
    message: 'おかえり！',
  };
}

interface WelcomeBackModalProps {
  visible: boolean;
  result: WelcomeBackResult;
  onClose: () => void;
  /** コインを受け取るコールバック */
  onClaimBonus?: (coins: number) => void;
}

export default function WelcomeBackModal({
  visible,
  result,
  onClose,
  onClaimBonus,
}: WelcomeBackModalProps) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const coinScale = useSharedValue(0);
  const buttonScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSequence(
        withSpring(1.05, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 }),
      );
      if (result.bonusCoins > 0) {
        coinScale.value = withDelay(
          300,
          withSequence(
            withSpring(1.2, { damping: 6, stiffness: 250 }),
            withSpring(1, { damping: 10 }),
          ),
        );
      }
      buttonScale.value = withDelay(500, withSpring(1, { damping: 10, stiffness: 150 }));
    } else {
      scale.value = 0.5;
      opacity.value = 0;
      coinScale.value = 0;
      buttonScale.value = 0;
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const coinStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coinScale.value }],
  }));

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleClaim = useCallback(() => {
    if (result.bonusCoins > 0 && onClaimBonus) {
      onClaimBonus(result.bonusCoins);
    }
    onClose();
  }, [result.bonusCoins, onClaimBonus, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.backdropPress} onPress={onClose}>
          <View />
        </Pressable>
        <Animated.View style={[styles.card, cardStyle]}>
          {/* メッセージ */}
          <Text style={styles.emoji} accessibilityLabel="おかえりアイコン">
            {''}
          </Text>
          <Text
            style={styles.title}
            accessibilityRole="header"
            accessibilityLabel={result.message}
          >
            {result.bonusCoins > 0 ? 'おかえりボーナス！' : 'おかえり！'}
          </Text>

          {result.bonusCoins > 0 && (
            <Animated.View style={[styles.coinRow, coinStyle]}>
              <Text style={styles.coinText}>+{result.bonusCoins} コイン</Text>
            </Animated.View>
          )}

          <Text style={styles.subText}>
            {result.hoursAway >= 168
              ? '久しぶり！待ってたよ！'
              : result.hoursAway >= 48
                ? 'また遊んでくれて嬉しい！'
                : 'さあ、始めよう！'}
          </Text>

          {/* ボタン */}
          <Animated.View style={btnStyle}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleClaim}
              accessibilityRole="button"
              accessibilityLabel={
                result.bonusCoins > 0
                  ? `${result.bonusCoins}コインを受け取る`
                  : '閉じる'
              }
            >
              <Text style={styles.buttonText}>
                {result.bonusCoins > 0 ? '受け取る！' : 'OK！'}
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: '85%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    // glassmorphism shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,217,61,0.15)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 12,
  },
  coinText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD93D',
    letterSpacing: 1,
  },
  subText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#2DD4BF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 48,
    minWidth: 180,
    alignItems: 'center',
    minHeight: 48,
  },
  buttonPressed: {
    backgroundColor: '#26B8A5',
    transform: [{ scale: 0.96 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
});
