/**
 * useProceduralAudio.ts
 * ---------------------------------------------------------------
 * Web Audio API プロシージャル BGM/SE のための React カスタムフック v2.0
 *
 * - マウント時に自動初期化、アンマウント時に自動 cleanup
 * - 9種 SE (tap/success/fail/combo/gameover/levelup/fever_start/fever_end/new_record)
 * - フィーバー + 緊張モード
 * - Web 環境では Web Audio API で音を生成
 * - ネイティブ環境では安全に no-op
 * ---------------------------------------------------------------
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  proceduralAudio,
  type BGMOptions,
  type SEType,
  type SEOptions,
} from '../utils/proceduralAudio';

export interface UseProceduralAudioReturn {
  /** BGM を開始 */
  startBGM: (options?: BGMOptions) => void;
  /** BGM を停止 (フェードアウト) */
  stopBGM: (fadeMs?: number) => void;
  /** フィーバーモード切替 */
  setFeverMode: (enabled: boolean) => void;
  /** 緊張モード切替 (残りHP少/タイムアップ間近) */
  setTensionMode: (enabled: boolean) => void;
  /** SE を再生 */
  playSE: (type: SEType, options?: SEOptions) => void;
  /** マスター音量 0.0-1.0 */
  setMasterVolume: (volume: number) => void;
  /** BGM 音量 0.0-1.0 */
  setBGMVolume: (volume: number) => void;
  /** SE 音量 0.0-1.0 */
  setSEVolume: (volume: number) => void;
  /** BGM 再生中か */
  isBGMPlaying: () => boolean;
  /** フィーバーモード中か */
  isFeverActive: () => boolean;
  /** 緊張モード中か */
  isTensionActive: () => boolean;
}

/**
 * プロシージャルオーディオフック
 *
 * @example
 * ```tsx
 * function GameScreen() {
 *   const audio = useProceduralAudio();
 *
 *   useEffect(() => {
 *     audio.startBGM();
 *     return () => audio.stopBGM();
 *   }, []);
 *
 *   const onTap = () => audio.playSE('tap');
 *   const onCorrect = () => audio.playSE('success');
 *   const onWrong = () => audio.playSE('fail');
 *   const onCombo = (count: number) => audio.playSE('combo', { comboCount: count });
 *   const onFever = (active: boolean) => audio.setFeverMode(active);
 *   const onTension = (active: boolean) => audio.setTensionMode(active);
 *   const onGameOver = () => {
 *     audio.stopBGM(1000);
 *     audio.playSE('gameover');
 *   };
 *   const onNewRecord = () => audio.playSE('new_record');
 * }
 * ```
 */
export function useProceduralAudio(): UseProceduralAudioReturn {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      proceduralAudio.stopBGM(300);
    };
  }, []);

  const startBGM = useCallback((options?: BGMOptions) => {
    if (!mountedRef.current) return;
    proceduralAudio.startBGM(options);
  }, []);

  const stopBGM = useCallback((fadeMs?: number) => {
    proceduralAudio.stopBGM(fadeMs);
  }, []);

  const setFeverMode = useCallback((enabled: boolean) => {
    if (!mountedRef.current) return;
    proceduralAudio.setFeverMode(enabled);
  }, []);

  const setTensionMode = useCallback((enabled: boolean) => {
    if (!mountedRef.current) return;
    proceduralAudio.setTensionMode(enabled);
  }, []);

  const playSE = useCallback((type: SEType, options?: SEOptions) => {
    if (!mountedRef.current) return;
    proceduralAudio.playSE(type, options);
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    proceduralAudio.setMasterVolume(volume);
  }, []);

  const setBGMVolume = useCallback((volume: number) => {
    proceduralAudio.setBGMVolume(volume);
  }, []);

  const setSEVolume = useCallback((volume: number) => {
    proceduralAudio.setSEVolume(volume);
  }, []);

  const isBGMPlaying = useCallback(() => {
    return proceduralAudio.isBGMPlaying();
  }, []);

  const isFeverActive = useCallback(() => {
    return proceduralAudio.isFeverActive();
  }, []);

  const isTensionActive = useCallback(() => {
    return proceduralAudio.isTensionActive();
  }, []);

  return {
    startBGM,
    stopBGM,
    setFeverMode,
    setTensionMode,
    playSE,
    setMasterVolume,
    setBGMVolume,
    setSEVolume,
    isBGMPlaying,
    isFeverActive,
    isTensionActive,
  };
}
