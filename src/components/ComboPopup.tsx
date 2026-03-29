import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { ScoreCalculator } from "../engine/ScoreCalculator";

interface ComboPopupProps {
  combo: number;
}

const scorer = new ScoreCalculator();

function getComboColor(combo: number): string {
  if (combo >= 10) return "#FF6B6B";
  if (combo >= 5) return "#FFD93D";
  return "#2DD4BF";
}

export const ComboPopup: React.FC<ComboPopupProps> = ({ combo }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    const comboText = scorer.getComboText(combo);
    if (!comboText) return;

    // リセット
    scale.value = 0;
    opacity.value = 1;
    translateY.value = 0;

    // 出現: scale 0 -> 1.3 -> 1.0 (spring)
    scale.value = withSpring(1, { damping: 6, stiffness: 300 });

    // 一定時間後に上昇フェードアウト
    const HOLD_DURATION = 800;
    opacity.value = withDelay(
      HOLD_DURATION,
      withTiming(0, { duration: 400 })
    );
    translateY.value = withDelay(
      HOLD_DURATION,
      withTiming(-40, { duration: 400 })
    );
  }, [combo]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const comboText = scorer.getComboText(combo);
  if (!comboText) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.Text
        style={[styles.text, { color: getComboColor(combo) }]}
      >
        {comboText}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  text: {
    fontSize: 36,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
