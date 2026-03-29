/**
 * JuiceProvider.tsx
 *
 * VFX統合ラッパー（全18本共通）
 *
 * ScreenShake + HitStop + FlashOverlay + ParticleSystem + ScorePopup + Confetti + FeverOverlay
 * を1つのコンポーネントに統合し、useJuice() Hookで一括制御する。
 *
 * 使い方:
 *   function GameScreen() {
 *     const juice = useJuice();
 *     return (
 *       <JuiceProvider juice={juice}>
 *         {ゲーム本体}
 *       </JuiceProvider>
 *     );
 *   }
 *
 * Reanimated v4専用。旧Animated API / Easing.linear 使用禁止。
 */

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import type { UseJuiceReturn, JuiceCallbacks } from './useJuice';
import { ScreenShake } from './ScreenShake';
import { HitStop } from './HitStop';
import { FlashOverlay } from './FlashOverlay';
import { ParticleSystem, ComboStage } from './ParticleSystem';
import { ScorePopup } from './ScorePopup';
import { Confetti } from './Confetti';
import { FeverOverlay } from './FeverOverlay';

const { width: SW, height: SH } = Dimensions.get('window');

interface JuiceProviderProps {
  juice: UseJuiceReturn;
  children: React.ReactNode;
}

export const JuiceProvider: React.FC<JuiceProviderProps> = ({ juice, children }) => {
  // --- トリガーカウンター ---
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [shakeIntensity, setShakeIntensity] = useState<'light' | 'medium' | 'heavy'>('light');

  const [hitStopTrigger, setHitStopTrigger] = useState(0);
  const [hitStopDuration, setHitStopDuration] = useState(80);
  const [hitStopPumpScale, setHitStopPumpScale] = useState(1.02);

  const [flashTrigger, setFlashTrigger] = useState(0);
  const [flashColor, setFlashColor] = useState<'white' | 'red' | 'gold'>('white');
  const [flashDuration, setFlashDuration] = useState(150);
  const [flashPeakOpacity, setFlashPeakOpacity] = useState(0.5);

  const [particleTrigger, setParticleTrigger] = useState(0);
  const [particleStage, setParticleStage] = useState<ComboStage | null>(null);
  const [particleOrigin, setParticleOrigin] = useState({ x: SW / 2, y: SH * 0.4 });

  const [popupTrigger, setPopupTrigger] = useState(0);
  const [popupText, setPopupText] = useState('+100');
  const [popupPos, setPopupPos] = useState({ x: SW / 2, y: SH * 0.35 });
  const [popupColor, setPopupColor] = useState('#FFD93D');
  const [popupFontSize, setPopupFontSize] = useState(24);

  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [confettiCount, setConfettiCount] = useState(50);
  const [confettiBurst3, setConfettiBurst3] = useState(true);

  const [feverActive, setFeverActive] = useState(false);

  // --- コールバック登録 ---
  useEffect(() => {
    const callbacks: JuiceCallbacks = {
      onShake: (e) => {
        setShakeIntensity(e.intensity);
        setShakeTrigger((t) => t + 1);
      },
      onFlash: (e) => {
        setFlashColor(e.color);
        if (e.duration !== undefined) setFlashDuration(e.duration);
        if (e.peakOpacity !== undefined) setFlashPeakOpacity(e.peakOpacity);
        setFlashTrigger((t) => t + 1);
      },
      onHitStop: (e) => {
        setHitStopDuration(e.duration);
        if (e.pumpScale !== undefined) setHitStopPumpScale(e.pumpScale);
        setHitStopTrigger((t) => t + 1);
      },
      onParticle: (e) => {
        setParticleStage(e.stage);
        setParticleOrigin({ x: e.originX, y: e.originY });
        setParticleTrigger((t) => t + 1);
      },
      onScorePopup: (e) => {
        setPopupText(e.text);
        setPopupPos({ x: e.x, y: e.y });
        if (e.color) setPopupColor(e.color);
        if (e.fontSize) setPopupFontSize(e.fontSize);
        setPopupTrigger((t) => t + 1);
      },
      onConfetti: (e) => {
        if (e.count !== undefined) setConfettiCount(e.count);
        if (e.burst3 !== undefined) setConfettiBurst3(e.burst3);
        setConfettiTrigger((t) => t + 1);
      },
      onComboUpdate: (_e) => {
        // コンボ表示は各ゲーム側で管理（JuiceProviderでは発火のみ担当）
      },
      onFeverUpdate: (e) => {
        setFeverActive(e.active);
      },
    };

    juice.registerCallbacks(callbacks);
  }, [juice]);

  return (
    <ScreenShake intensity={shakeIntensity} trigger={shakeTrigger}>
      <HitStop duration={hitStopDuration} pumpScale={hitStopPumpScale} trigger={hitStopTrigger}>
        <View style={styles.container}>
          {children}

          {/* フィーバーオーバーレイ（ゲーム本体の上） */}
          <FeverOverlay active={feverActive} />

          {/* パーティクル */}
          <ParticleSystem
            triggerKey={particleTrigger}
            originX={particleOrigin.x}
            originY={particleOrigin.y}
            stage={particleStage}
          />

          {/* スコアポップアップ */}
          <ScorePopup
            text={popupText}
            trigger={popupTrigger}
            x={popupPos.x}
            y={popupPos.y}
            color={popupColor}
            fontSize={popupFontSize}
          />

          {/* 紙吹雪 */}
          <Confetti
            trigger={confettiTrigger}
            count={confettiCount}
            burst3={confettiBurst3}
          />

          {/* フラッシュオーバーレイ（最前面） */}
          <FlashOverlay
            color={flashColor}
            trigger={flashTrigger}
            duration={flashDuration}
            peakOpacity={flashPeakOpacity}
          />
        </View>
      </HitStop>
    </ScreenShake>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
