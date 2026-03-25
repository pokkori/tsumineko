/**
 * BGM / SE ユーティリティ
 * - 音声ファイル未配置時は Haptics にフォールバック（クラッシュしない）
 * - expo-av + expo-haptics
 */
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let bgmSound: Audio.Sound | null = null;
let isBgmEnabled = true;

/** Audio モードを初期化（アプリ起動時に一度だけ呼ぶ） */
export async function initAudioAsync(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch {
    // 初期化失敗はサイレント
  }
}

/** BGM を再生（すでに再生中なら何もしない） */
export async function playBGM(): Promise<void> {
  try {
    if (!isBgmEnabled) return;
    if (bgmSound) {
      await bgmSound.stopAsync();
      await bgmSound.unloadAsync();
      bgmSound = null;
    }
    const { sound } = await Audio.Sound.createAsync(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../../assets/audio/bgm.mp3') as number,
      { isLooping: true, volume: 0.5, shouldPlay: true }
    );
    bgmSound = sound;
  } catch {
    // 音声ファイル未配置時はスキップ
  }
}

/** BGM を停止してリソースを解放 */
export async function stopBGM(): Promise<void> {
  try {
    if (bgmSound) {
      await bgmSound.stopAsync();
      await bgmSound.unloadAsync();
      bgmSound = null;
    }
  } catch {
    bgmSound = null;
  }
}

/** SE を再生（ファイル未配置時は Haptics で代替） */
export async function playSE(type: 'place' | 'combo' | 'gameover' | 'clear'): Promise<void> {
  const seFiles: Record<string, () => number> = {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    place: () => require('../../assets/audio/se_place.mp3') as number,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    combo: () => require('../../assets/audio/se_combo.mp3') as number,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    gameover: () => require('../../assets/audio/se_gameover.mp3') as number,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    clear: () => require('../../assets/audio/se_clear.mp3') as number,
  };
  try {
    const { sound } = await Audio.Sound.createAsync(seFiles[type](), {
      volume: 0.8,
      shouldPlay: true,
    });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => undefined);
      }
    });
  } catch {
    // SE ファイル未配置時は Haptics で代替
    switch (type) {
      case 'combo':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'gameover':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'clear':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }
}

/** BGM 有効/無効を切り替え */
export function setBgmEnabled(enabled: boolean): void {
  isBgmEnabled = enabled;
  if (!enabled) {
    stopBGM().catch(() => undefined);
  }
}
