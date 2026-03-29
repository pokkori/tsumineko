import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { ActiveCat, FaceExpression } from "../types";
import { CAT_SHAPES } from "../data/catShapes";
import { CAT_SKINS } from "../data/catSkins";

interface CatBodyProps {
  cat: ActiveCat;
  cameraY: number;
}

export const CatBody: React.FC<CatBodyProps> = React.memo(({ cat, cameraY }) => {
  const shape = CAT_SHAPES.find((s) => s.id === cat.shapeId);
  const skin = CAT_SKINS.find((s) => s.id === cat.skinId);
  if (!shape || !skin) return null;

  const w = shape.width;
  const h = shape.height;

  // Idle breathing animation (Reanimated v4)
  const breathe = useSharedValue(0);
  const tailWag = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    tailWag.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  const bodyAnimStyle = useAnimatedStyle(() => {
    const scaleY = interpolate(breathe.value, [0, 1], [1, 1.02]);
    const translateY = interpolate(breathe.value, [0, 1], [0, -1.5]);
    return {
      transform: [
        { scaleY },
        { translateY },
      ],
    };
  });

  const tailAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tailWag.value * 12}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: cat.position.x - w / 2,
          top: cat.position.y + cameraY - h / 2,
          width: w,
          height: h,
          transform: [{ rotate: `${cat.angle}rad` }],
        },
        bodyAnimStyle,
      ]}
    >
      {/* Tail */}
      <Animated.View
        style={[
          styles.tail,
          {
            backgroundColor: skin.patternColor || skin.bodyColor,
            right: -4,
            top: h * 0.2,
          },
          tailAnimStyle,
        ]}
      />

      {/* Body */}
      <View
        style={[
          styles.body,
          {
            width: w,
            height: h,
            borderRadius: shape.id === "flat" || shape.id === "stretchy" ? h / 3 : w / 3,
            backgroundColor: skin.bodyColor,
            borderWidth: 2,
            borderColor: skin.patternColor || "#00000020",
          },
        ]}
      >
        {/* Ears */}
        <View style={[styles.earLeft, { borderBottomColor: skin.earColor }]} />
        <View style={[styles.earRight, { borderBottomColor: skin.earColor }]} />
        {/* Face */}
        <View style={styles.face}>
          <View style={[styles.eye, { backgroundColor: skin.eyeColor }]} />
          <View style={[styles.nose, { backgroundColor: skin.noseColor }]} />
          <View style={[styles.eye, { backgroundColor: skin.eyeColor }]} />
        </View>
        {/* Cheeks (new) */}
        <View style={styles.cheeksRow}>
          <View style={[styles.cheek, { backgroundColor: skin.earColor || '#FFB8C6' }]} />
          <View style={{ width: 16 }} />
          <View style={[styles.cheek, { backgroundColor: skin.earColor || '#FFB8C6' }]} />
        </View>
        {/* Expression overlay */}
        <View style={styles.expressionContainer}>
          <ExpressionIndicator expression={cat.expression} />
        </View>
      </View>
    </Animated.View>
  );
});

const ExpressionIndicator: React.FC<{ expression: FaceExpression }> = ({ expression }) => {
  // SVG-style text indicators instead of emoji
  const marks: Record<FaceExpression, string> = {
    normal: "",
    scared: "!!",
    sleeping: "Zzz",
    angry: "!!",
    shocked: "!?",
    love: "",
    dizzy: "@@",
  };
  const markColors: Record<FaceExpression, string> = {
    normal: "transparent",
    scared: "#64B5F6",
    sleeping: "#90A4AE",
    angry: "#E63946",
    shocked: "#FFD93D",
    love: "#FF6B81",
    dizzy: "#B39DDB",
  };
  const mark = marks[expression];
  if (!mark) return null;

  return (
    <Text style={[styles.markText, { color: markColors[expression] }]}>{mark}</Text>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
  body: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  earLeft: {
    position: "absolute",
    top: -8,
    left: 8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FFBCBC",
  },
  earRight: {
    position: "absolute",
    top: -8,
    right: 8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FFBCBC",
  },
  face: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -4,
  },
  eye: {
    width: 8,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#333",
  },
  nose: {
    width: 6,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#FF8FAB",
    marginTop: 2,
  },
  cheeksRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 1,
  },
  cheek: {
    width: 8,
    height: 5,
    borderRadius: 4,
    opacity: 0.35,
  },
  expressionContainer: {
    position: "absolute",
    top: -16,
    right: -8,
  },
  markText: {
    fontSize: 10,
    fontWeight: "900",
  },
  tail: {
    position: "absolute",
    width: 6,
    height: 20,
    borderRadius: 3,
    transformOrigin: "bottom",
  },
});
