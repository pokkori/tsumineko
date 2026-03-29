import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  StyleSheet,
  Modal,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGameState } from "../src/hooks/useGameState";
import { useGameStore } from "../src/stores/gameStore";
import { useDailyChallenge } from "../src/hooks/useDailyChallenge";
import { updateStreak } from "../src/lib/streak";
import { initAudioAsync, playBGM, stopBGM, playSE } from "../src/utils/audio";
import { CatBody } from "../src/components/CatBody";
import { ScoreDisplay } from "../src/components/ScoreDisplay";
import { ComboPopup } from "../src/components/ComboPopup";
import { ScorePopup } from "../src/components/ScorePopup";
import { GameOverFlash } from "../src/components/GameOverFlash";
import { CatPreview } from "../src/components/CatPreview";
import { GuideArrow } from "../src/components/GuideArrow";
import { Background } from "../src/components/Background";
import { PHYSICS } from "../src/constants/physics";
import { COLORS } from "../src/constants/colors";
import { useJuice, JuiceProvider, ComboCounter } from "../src/components/vfx";
import { useProceduralAudio } from "../src/hooks/useProceduralAudio";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ daily?: string }>();
  const isDaily = params.daily === "true";

  const settings = useGameStore((s) => s.settings);
  const { challenge, recordAttempt } = useDailyChallenge();

  const { gameState, isRunning, startGame, onTap, continueFromReward } =
    useGameState(settings.selectedSkinId);

  // VFX v2.0 Juice + Procedural Audio
  const juice = useJuice();
  const audio = useProceduralAudio();

  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const [gameOverFlash, setGameOverFlash] = useState(false);
  const [scorePopups, setScorePopups] = useState<
    { id: number; value: number; x: number; y: number }[]
  >([]);
  const prevScoreRef = useRef(0);
  const popupIdRef = useRef(0);

  const addScorePopup = useCallback((value: number, x: number, y: number) => {
    const id = popupIdRef.current++;
    setScorePopups((prev) => [...prev, { id, value, x, y }]);
    setTimeout(() => {
      setScorePopups((prev) => prev.filter((p) => p.id !== id));
    }, 800);
  }, []);

  // オーディオ初期化 + BGM 再生 + Procedural Audio
  useEffect(() => {
    initAudioAsync().then(() => playBGM()).catch(() => undefined);
    audio.startBGM();
    return () => {
      stopBGM().catch(() => undefined);
      audio.stopBGM(500);
    };
  }, []);

  useEffect(() => {
    startGame();
    setStarted(true);
  }, []);

  // スコア増加時にポップアップ表示 + SE + VFX
  useEffect(() => {
    if (!gameState) return;
    const diff = gameState.score - prevScoreRef.current;
    if (diff > 0) {
      addScorePopup(diff, 200, 160);
      playSE('place').catch(() => undefined);
      audio.playSE('success');
      juice.onCorrect(gameState.combo, diff, { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT * 0.3 });
    }
    prevScoreRef.current = gameState.score;
  }, [gameState?.score]);

  // コンボ発生時に SE
  const prevComboRef = useRef(0);
  useEffect(() => {
    if (!gameState) return;
    if (gameState.combo > 1 && gameState.combo > prevComboRef.current) {
      playSE('combo').catch(() => undefined);
      audio.playSE('combo', { comboCount: gameState.combo });
    }
    prevComboRef.current = gameState.combo;
  }, [gameState?.combo]);

  useEffect(() => {
    if (gameState?.phase === "gameover" && started) {
      setGameOverFlash(true);
      setTimeout(() => setGameOverFlash(false), 400);
      playSE('gameover').catch(() => undefined);
      audio.stopBGM(1000);
      audio.playSE('gameover');
      juice.onGameOver();
      // Navigate to result
      const finalState = gameState;
      if (isDaily) {
        recordAttempt(finalState.score);
      }
      updateStreak("tsumineko");
      const timeout = setTimeout(() => {
        router.replace({
          pathname: "/result",
          params: {
            score: String(finalState.score),
            height: String(finalState.height),
            catCount: String(finalState.catCount),
            maxCombo: String(finalState.maxCombo),
            isNewRecord: String(finalState.isNewRecord),
            isDaily: String(isDaily),
          },
        });
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [gameState?.phase]);

  const handleTap = () => {
    if (paused) return;
    onTap();
  };

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <JuiceProvider juice={juice}>
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        <Background heightPx={gameState.heightPx} />

        {/* Daily Challenge Banner */}
        {isDaily && (
          <View style={styles.dailyBanner}>
            <Text style={styles.dailyBannerText}>
              [デイリー] {challenge.ruleName}: {challenge.ruleDescription}
            </Text>
          </View>
        )}

        {/* HUD */}
        <ScoreDisplay
          score={gameState.score}
          height={gameState.height}
          catCount={gameState.catCount}
          combo={gameState.combo}
        />

        {/* Next Preview */}
        <CatPreview shapeId={gameState.nextShapeId} />

        {/* Guide Arrow */}
        {gameState.currentCat && gameState.phase === "idle" && settings.showGuide && (
          <GuideArrow
            x={gameState.currentCat.position.x}
            topY={gameState.currentCat.position.y + gameState.cameraY + 30}
            bottomY={PHYSICS.GROUND_Y + gameState.cameraY}
            visible={true}
          />
        )}

        {/* Current Cat */}
        {gameState.currentCat && (
          <CatBody cat={gameState.currentCat} cameraY={gameState.cameraY} />
        )}

        {/* Stacked Cats */}
        {gameState.stackedCats.map((cat) => (
          <CatBody key={cat.bodyId} cat={cat} cameraY={gameState.cameraY} />
        ))}

        {/* Ground Line */}
        <View
          style={[
            styles.ground,
            { top: PHYSICS.GROUND_Y + gameState.cameraY },
          ]}
        />

        {/* Combo Counter (VFX v2.0) */}
        <ComboCounter combo={gameState.combo} style={styles.comboCounter} />

        {/* Combo Popup */}
        <ComboPopup combo={gameState.combo} />

        {/* Score Popups */}
        <ScorePopup items={scorePopups} />

        {/* Game Over Flash */}
        <GameOverFlash triggered={gameOverFlash} />

        {/* Collapsing overlay */}
        {gameState.phase === "collapsing" && (
          <View style={styles.collapseOverlay}>
            <Text style={styles.collapseText}>BOOM!</Text>
          </View>
        )}

        {/* Pause Button */}
        <Pressable
          style={styles.pauseButton}
          onPress={() => setPaused(true)}
          accessibilityLabel="一時停止"
          accessibilityRole="button"
        >
          <Text style={styles.pauseButtonText}>II</Text>
        </Pressable>

        {/* Pause Modal */}
        <Modal
          visible={paused}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.pauseOverlay}>
            <View style={styles.pauseMenu}>
              <Text style={styles.pauseTitle}>ポーズ中</Text>
              <Pressable
                style={styles.pauseMenuButton}
                onPress={() => setPaused(false)}
                accessibilityLabel="再開"
                accessibilityRole="button"
              >
                <Text style={styles.pauseMenuButtonText}>▶ つづける</Text>
              </Pressable>
              <Pressable
                style={[styles.pauseMenuButton, styles.pauseMenuButtonSecondary]}
                onPress={() => {
                  setPaused(false);
                  router.replace("/");
                }}
                accessibilityLabel="ホームに戻る"
                accessibilityRole="button"
              >
                <Text style={styles.pauseMenuButtonText}>タイトルへ</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
    </JuiceProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
  loadingText: {
    fontSize: 24,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 100,
  },
  dailyBanner: {
    position: "absolute",
    top: 90,
    left: 16,
    right: 16,
    backgroundColor: "rgba(79,195,247,0.9)",
    borderRadius: 8,
    padding: 8,
    zIndex: 10,
  },
  dailyBannerText: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  ground: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: COLORS.ground,
    borderTopWidth: 3,
    borderTopColor: COLORS.groundDark,
    zIndex: 1,
  },
  collapseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 30,
  },
  collapseText: {
    fontSize: 64,
  },
  pauseButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  pauseButtonText: {
    fontSize: 24,
  },
  pauseOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  pauseMenu: {
    backgroundColor: "rgba(26,26,46,0.95)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 30,
    alignItems: "center",
    width: 280,
  },
  pauseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F1F5F9",
    marginBottom: 20,
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  pauseMenuButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 12,
    width: "100%",
    alignItems: "center",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  pauseMenuButtonSecondary: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    shadowOpacity: 0,
  },
  pauseMenuButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  comboCounter: {
    position: "absolute",
    top: 100,
    right: 16,
    zIndex: 50,
  },
});
