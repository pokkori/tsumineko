/**
 * NekoCharacter.tsx
 *
 * つみネコ用キャラクターコンポーネント（5色バリ+耳+尻尾+3表情）
 * Reanimated v4専用。旧Animated API禁止。
 *
 * 5色バリエーション: 白/茶/灰/黒/三毛
 * 3表情: normal / happy / scared
 * idle bounce + タッチ反応付き
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';

export type NekoColor = 'white' | 'brown' | 'gray' | 'black' | 'calico';
export type NekoExpression = 'normal' | 'happy' | 'scared';

interface NekoCharacterProps {
  color?: NekoColor;
  expression?: NekoExpression;
  size?: number;
  onPress?: () => void;
  style?: object;
}

const COLOR_MAP: Record<NekoColor, { body: string; ear: string; nose: string; pattern?: string }> = {
  white: { body: '#FFF5EE', ear: '#FFB8C6', nose: '#FF8FAB' },
  brown: { body: '#D2A679', ear: '#C4956A', nose: '#A0522D', pattern: '#C4956A' },
  gray: { body: '#B0B0B0', ear: '#9A9A9A', nose: '#808080', pattern: '#9A9A9A' },
  black: { body: '#3A3A3A', ear: '#2A2A2A', nose: '#555555', pattern: '#2A2A2A' },
  calico: { body: '#FFF5EE', ear: '#FFB8C6', nose: '#FF8FAB', pattern: '#D2A679' },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const NekoCharacter: React.FC<NekoCharacterProps> = ({
  color = 'white',
  expression = 'normal',
  size = 80,
  onPress,
  style,
}) => {
  const colors = COLOR_MAP[color];
  const scale = useSharedValue(1);
  const bounce = useSharedValue(0);
  const tailWag = useSharedValue(0);

  // Idle bounce animation
  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    // Tail wag
    tailWag.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  const handlePress = () => {
    // Squish on tap
    scale.value = withSequence(
      withTiming(1.15, { duration: 80 }),
      withSpring(1, { damping: 8, stiffness: 300 }),
    );
    onPress?.();
  };

  const bodyStyle = useAnimatedStyle(() => {
    const translateY = interpolate(bounce.value, [0, 1], [0, -4]);
    return {
      transform: [
        { scale: scale.value },
        { translateY },
      ],
    };
  });

  const tailStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tailWag.value * 15}deg` }],
  }));

  // Eye rendering based on expression
  const renderEyes = () => {
    const eyeSize = size * 0.12;
    const eyeGap = size * 0.18;

    if (expression === 'happy') {
      // Happy: upside-down arc eyes (closed smile)
      return (
        <View style={[localStyles.eyeRow, { gap: eyeGap }]}>
          <View style={[localStyles.happyEye, { width: eyeSize, height: eyeSize * 0.5, borderRadius: eyeSize / 2 }]} />
          <View style={[localStyles.happyEye, { width: eyeSize, height: eyeSize * 0.5, borderRadius: eyeSize / 2 }]} />
        </View>
      );
    }

    if (expression === 'scared') {
      // Scared: big round eyes
      return (
        <View style={[localStyles.eyeRow, { gap: eyeGap }]}>
          <View style={[localStyles.scaredEye, { width: eyeSize * 1.3, height: eyeSize * 1.3, borderRadius: eyeSize * 0.65 }]}>
            <View style={[localStyles.pupil, { width: eyeSize * 0.6, height: eyeSize * 0.6, borderRadius: eyeSize * 0.3 }]} />
          </View>
          <View style={[localStyles.scaredEye, { width: eyeSize * 1.3, height: eyeSize * 1.3, borderRadius: eyeSize * 0.65 }]}>
            <View style={[localStyles.pupil, { width: eyeSize * 0.6, height: eyeSize * 0.6, borderRadius: eyeSize * 0.3 }]} />
          </View>
        </View>
      );
    }

    // Normal: oval eyes with pupils
    return (
      <View style={[localStyles.eyeRow, { gap: eyeGap }]}>
        <View style={[localStyles.eye, { width: eyeSize, height: eyeSize * 1.2, borderRadius: eyeSize / 2 }]}>
          <View style={[localStyles.pupil, { width: eyeSize * 0.5, height: eyeSize * 0.5, borderRadius: eyeSize * 0.25 }]} />
        </View>
        <View style={[localStyles.eye, { width: eyeSize, height: eyeSize * 1.2, borderRadius: eyeSize / 2 }]}>
          <View style={[localStyles.pupil, { width: eyeSize * 0.5, height: eyeSize * 0.5, borderRadius: eyeSize * 0.25 }]} />
        </View>
      </View>
    );
  };

  const earSize = size * 0.22;
  const noseSize = size * 0.08;
  const tailWidth = size * 0.08;
  const tailHeight = size * 0.4;

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[style, bodyStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${color}色のネコ ${expression}表情`}
    >
      {/* Ears */}
      <View style={localStyles.earsContainer}>
        <View style={[localStyles.ear, {
          width: 0, height: 0,
          borderLeftWidth: earSize * 0.6, borderRightWidth: earSize * 0.6,
          borderBottomWidth: earSize,
          borderLeftColor: 'transparent', borderRightColor: 'transparent',
          borderBottomColor: colors.ear,
          marginRight: size * 0.2,
        }]} />
        <View style={[localStyles.ear, {
          width: 0, height: 0,
          borderLeftWidth: earSize * 0.6, borderRightWidth: earSize * 0.6,
          borderBottomWidth: earSize,
          borderLeftColor: 'transparent', borderRightColor: 'transparent',
          borderBottomColor: colors.ear,
          marginLeft: size * 0.2,
        }]} />
      </View>

      {/* Body */}
      <View style={[localStyles.body, {
        width: size,
        height: size,
        borderRadius: size / 3,
        backgroundColor: colors.body,
        borderColor: colors.pattern || 'rgba(0,0,0,0.1)',
      }]}>
        {/* Calico patches */}
        {color === 'calico' && (
          <>
            <View style={[localStyles.patch, {
              width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15,
              backgroundColor: '#D2A679', top: size * 0.1, left: size * 0.1, opacity: 0.6,
            }]} />
            <View style={[localStyles.patch, {
              width: size * 0.25, height: size * 0.25, borderRadius: size * 0.125,
              backgroundColor: '#3A3A3A', bottom: size * 0.15, right: size * 0.1, opacity: 0.5,
            }]} />
          </>
        )}

        {/* Face */}
        {renderEyes()}

        {/* Nose */}
        <View style={[localStyles.nose, {
          width: noseSize, height: noseSize * 0.6,
          borderRadius: noseSize / 3,
          backgroundColor: colors.nose,
          marginTop: size * 0.02,
        }]} />

        {/* Mouth (happy = smile) */}
        {expression === 'happy' && (
          <View style={[localStyles.mouth, {
            width: noseSize * 2, height: noseSize,
            borderBottomLeftRadius: noseSize, borderBottomRightRadius: noseSize,
          }]} />
        )}

        {/* Cheeks */}
        <View style={localStyles.cheeksRow}>
          <View style={[localStyles.cheek, {
            width: size * 0.12, height: size * 0.07,
            borderRadius: size * 0.06, opacity: 0.3,
          }]} />
          <View style={{ width: size * 0.3 }} />
          <View style={[localStyles.cheek, {
            width: size * 0.12, height: size * 0.07,
            borderRadius: size * 0.06, opacity: 0.3,
          }]} />
        </View>
      </View>

      {/* Tail */}
      <Animated.View style={[localStyles.tail, tailStyle, {
        width: tailWidth,
        height: tailHeight,
        backgroundColor: colors.pattern || colors.body,
        borderRadius: tailWidth / 2,
        right: -tailWidth * 0.5,
        top: size * 0.3,
      }]} />
    </AnimatedPressable>
  );
};

const localStyles = StyleSheet.create({
  earsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    top: -12,
    width: '100%',
    zIndex: 1,
  },
  ear: {},
  body: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  patch: {
    position: 'absolute',
  },
  eyeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -4,
  },
  eye: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  happyEye: {
    backgroundColor: '#333333',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  scaredEye: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  pupil: {
    backgroundColor: '#333333',
  },
  nose: {
    alignSelf: 'center',
  },
  mouth: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginTop: 2,
  },
  cheeksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
  },
  cheek: {
    backgroundColor: '#FFB8C6',
  },
  tail: {
    position: 'absolute',
    transformOrigin: 'bottom',
  },
});
