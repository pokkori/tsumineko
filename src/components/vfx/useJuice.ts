/**
 * useJuice.ts
 *
 * VFX統合オーケストレーションHook（全18本共通）
 *
 * 1行で全VFXを同時発火する。SE/ハプティクスも同期発火。
 * Promise.all相当の0ms同時発火を保証。
 *
 * 使い方:
 *   const juice = useJuice();
 *   juice.onCorrect(combo, scoreAdded, { x, y });  // 正解時
 *   juice.onWrong();                                 // 不正解時
 *   juice.onFever();                                 // フィーバー発動時
 *   juice.onGameOver();                              // ゲームオーバー時
 *   juice.onNewRecord();                             // 新記録時
 *
 * JuiceProviderの中で使うこと。
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import { useCallback, useRef } from 'react';
import { getComboStage, ComboStage } from './ParticleSystem';

// --- 発火イベントの型 ---
export interface JuiceShakeEvent {
  intensity: 'light' | 'medium' | 'heavy';
}

export interface JuiceFlashEvent {
  color: 'white' | 'red' | 'gold';
  duration?: number;
  peakOpacity?: number;
}

export interface JuiceHitStopEvent {
  duration: number;
  pumpScale?: number;
}

export interface JuiceParticleEvent {
  stage: ComboStage | null;
  originX: number;
  originY: number;
}

export interface JuiceScorePopupEvent {
  text: string;
  x: number;
  y: number;
  color?: string;
  fontSize?: number;
}

export interface JuiceConfettiEvent {
  count?: number;
  burst3?: boolean;
}

export interface JuiceComboEvent {
  combo: number;
  stage: ComboStage | null;
}

export interface JuiceFeverEvent {
  active: boolean;
}

// --- コールバック型 ---
export interface JuiceCallbacks {
  onShake?: (event: JuiceShakeEvent) => void;
  onFlash?: (event: JuiceFlashEvent) => void;
  onHitStop?: (event: JuiceHitStopEvent) => void;
  onParticle?: (event: JuiceParticleEvent) => void;
  onScorePopup?: (event: JuiceScorePopupEvent) => void;
  onConfetti?: (event: JuiceConfettiEvent) => void;
  onComboUpdate?: (event: JuiceComboEvent) => void;
  onFeverUpdate?: (event: JuiceFeverEvent) => void;
}

// --- Hook本体 ---
export function useJuice() {
  const callbacksRef = useRef<JuiceCallbacks>({});

  /** Provider側がコールバックを登録する */
  const registerCallbacks = useCallback((cbs: JuiceCallbacks) => {
    callbacksRef.current = cbs;
  }, []);

  /** 正解・成功時の一括発火 */
  const onCorrect = useCallback((
    combo: number,
    scoreAdded: number,
    origin: { x: number; y: number },
  ) => {
    const cbs = callbacksRef.current;
    const stage = getComboStage(combo);

    // パーティクル（常時）
    cbs.onParticle?.({ stage, originX: origin.x, originY: origin.y });

    // スコアポップアップ（常時）
    const popupConfig = getScorePopupConfig(combo, scoreAdded);
    cbs.onScorePopup?.({
      text: popupConfig.text,
      x: origin.x,
      y: origin.y - 40,
      color: popupConfig.color,
      fontSize: popupConfig.fontSize,
    });

    // コンボ更新
    cbs.onComboUpdate?.({ combo, stage });

    // 段階別追加演出
    if (stage && stage >= 2) {
      // Stage2以上: シェイク
      const shakeIntensity = stage === 2 ? 'light' : stage === 3 ? 'medium' : 'heavy';
      cbs.onShake?.({ intensity: shakeIntensity });
    }

    if (stage && stage >= 2) {
      // Stage2以上: ヒットストップ
      const hitStopDuration = stage === 2 ? 16 : stage === 3 ? 40 : 80;
      cbs.onHitStop?.({ duration: hitStopDuration });
    }

    if (stage && stage >= 3) {
      // Stage3以上: フラッシュ
      const flashColor = stage === 3 ? 'gold' as const : 'white' as const;
      cbs.onFlash?.({ color: flashColor, duration: stage === 3 ? 100 : 150 });
    }

    // Stage4: フィーバー発動
    if (stage === 4) {
      cbs.onFeverUpdate?.({ active: true });
    }
  }, []);

  /** 不正解・失敗時 */
  const onWrong = useCallback(() => {
    const cbs = callbacksRef.current;
    cbs.onShake?.({ intensity: 'medium' });
    cbs.onFlash?.({ color: 'red', duration: 100 });
    cbs.onComboUpdate?.({ combo: 0, stage: null });
    cbs.onFeverUpdate?.({ active: false });
  }, []);

  /** フィーバー発動（onCorrectからも呼ばれるが、外部から明示的に呼ぶ場合） */
  const onFever = useCallback(() => {
    const cbs = callbacksRef.current;
    cbs.onShake?.({ intensity: 'heavy' });
    cbs.onFlash?.({ color: 'white', duration: 150, peakOpacity: 0.6 });
    cbs.onHitStop?.({ duration: 80, pumpScale: 1.04 });
    cbs.onFeverUpdate?.({ active: true });
  }, []);

  /** ゲームオーバー */
  const onGameOver = useCallback(() => {
    const cbs = callbacksRef.current;
    cbs.onShake?.({ intensity: 'heavy' });
    cbs.onFlash?.({ color: 'red', duration: 200, peakOpacity: 0.6 });
    cbs.onHitStop?.({ duration: 120 });
    cbs.onFeverUpdate?.({ active: false });
  }, []);

  /** 新記録 */
  const onNewRecord = useCallback((origin: { x: number; y: number }) => {
    const cbs = callbacksRef.current;
    cbs.onConfetti?.({ count: 60, burst3: true });
    cbs.onFlash?.({ color: 'gold', duration: 200, peakOpacity: 0.5 });
    cbs.onScorePopup?.({
      text: 'NEW RECORD!',
      x: origin.x,
      y: origin.y,
      color: '#FFD93D',
      fontSize: 36,
    });
  }, []);

  /** 軽いタップフィードバック（スコアなし） */
  const onTap = useCallback((origin: { x: number; y: number }) => {
    const cbs = callbacksRef.current;
    cbs.onParticle?.({ stage: 1, originX: origin.x, originY: origin.y });
  }, []);

  return {
    registerCallbacks,
    onCorrect,
    onWrong,
    onFever,
    onGameOver,
    onNewRecord,
    onTap,
  };
}

// --- ヘルパー ---
function getScorePopupConfig(combo: number, scoreAdded: number) {
  const stage = getComboStage(combo);
  if (stage === 4) {
    return { text: `FEVER!!! +${scoreAdded}`, color: '#FF2E63', fontSize: 36 };
  }
  if (stage === 3) {
    return { text: `GREAT!! +${scoreAdded}`, color: '#FF6B35', fontSize: 32 };
  }
  if (stage === 2) {
    return { text: `GOOD! +${scoreAdded}`, color: '#FFD93D', fontSize: 28 };
  }
  return { text: `+${scoreAdded}`, color: '#FFD93D', fontSize: 24 };
}

export type UseJuiceReturn = ReturnType<typeof useJuice>;
