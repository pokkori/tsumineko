import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";

interface ScorePopupItem {
  id: number;
  value: number;
  x: number;
  y: number;
}

interface ScorePopupProps {
  items: ScorePopupItem[];
}

const SinglePopup: React.FC<{ item: ScorePopupItem }> = ({ item }) => {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = 1;
    translateY.value = 0;

    opacity.value = withDelay(100, withTiming(0, { duration: 600 }));
    translateY.value = withTiming(-60, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[styles.popup, { left: item.x - 24, top: item.y }, animatedStyle]}
      pointerEvents="none"
    >
      <Animated.Text style={styles.text}>+{item.value}</Animated.Text>
    </Animated.View>
  );
};

export const ScorePopup: React.FC<ScorePopupProps> = ({ items }) => {
  return (
    <>
      {items.map((item) => (
        <SinglePopup key={item.id} item={item} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  popup: {
    position: "absolute",
    zIndex: 25,
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD93D",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
