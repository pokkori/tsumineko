import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface GameOverFlashProps {
  triggered: boolean;
}

export const GameOverFlash: React.FC<GameOverFlashProps> = ({ triggered }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!triggered) return;

    // 赤フラッシュ: 0 -> 0.3 -> 0
    opacity.value = withSequence(
      withTiming(0.3, { duration: 100 }),
      withTiming(0, { duration: 200 })
    );
  }, [triggered]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!triggered) return null;

  return <Animated.View style={[styles.overlay, animatedStyle]} pointerEvents="none" />;
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#E63946",
    zIndex: 50,
  },
});
