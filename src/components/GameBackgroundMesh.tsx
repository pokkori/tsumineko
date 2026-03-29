/**
 * つみネコ 改良版背景: メッシュグラデーション空
 * 既存Background.tsxを補完（上書きしない）
 */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Rect, Defs, RadialGradient, Stop, LinearGradient, Circle, Ellipse, Path, G,
} from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

interface GameBackgroundMeshProps {
  heightPx?: number;
  fever?: boolean;
}

export const GameBackgroundMesh: React.FC<GameBackgroundMeshProps> = ({
  heightPx = 0,
  fever = false,
}) => {
  // Progress: 0=ground, 1=high sky
  const progress = Math.min(1, heightPx / 1000);
  const skyTop = fever ? '#FF6B35' : progress > 0.7 ? '#1A1A2E' : '#87CEEB';
  const skyMid = fever ? '#FFD93D' : progress > 0.7 ? '#2A2A4E' : '#B0E0E6';
  const skyBot = fever ? '#FF6B35' : '#FFF5E6';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={skyTop} />
            <Stop offset="50%" stopColor={skyMid} />
            <Stop offset="100%" stopColor={skyBot} />
          </LinearGradient>
          <RadialGradient id="sunGlow" cx="75%" cy="15%" r="25%">
            <Stop offset="0%" stopColor="#FFD93D" stopOpacity={fever ? '0.4' : '0.2'} />
            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="warmGlow" cx="25%" cy="80%" r="35%">
            <Stop offset="0%" stopColor="#FF6B35" stopOpacity="0.06" />
            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width={W} height={H} fill="url(#skyGrad)" />
        <Rect x="0" y="0" width={W} height={H} fill="url(#sunGlow)" />
        <Rect x="0" y="0" width={W} height={H} fill="url(#warmGlow)" />

        {/* Clouds */}
        {progress < 0.5 && (
          <G opacity={0.5}>
            <Ellipse cx={W * 0.2} cy={H * 0.15} rx="25" ry="10" fill="#FFFFFF" />
            <Ellipse cx={W * 0.25} cy={H * 0.13} rx="18" ry="8" fill="#FFFFFF" />
            <Ellipse cx={W * 0.7} cy={H * 0.1} rx="22" ry="9" fill="#FFFFFF" />
          </G>
        )}

        {/* Stars at high altitude */}
        {progress > 0.7 && (
          <G>
            {[[0.1, 0.08], [0.3, 0.12], [0.5, 0.05], [0.7, 0.15], [0.9, 0.08]].map(([x, y], i) => (
              <Circle key={i} cx={W * x} cy={H * y} r={1.5} fill="#FFFFFF" opacity={0.4} />
            ))}
          </G>
        )}

        {/* Ground (always at bottom) */}
        <Rect x="0" y={H - 60} width={W} height="60" fill="#8B6914" />
        <Rect x="0" y={H - 60} width={W} height="3" fill="#6B4F10" />
        {/* Grass tufts */}
        <Path
          d={`M0 ${H - 60} Q${W * 0.1} ${H - 68} ${W * 0.2} ${H - 60} Q${W * 0.3} ${H - 65} ${W * 0.4} ${H - 60} Q${W * 0.5} ${H - 68} ${W * 0.6} ${H - 60} Q${W * 0.7} ${H - 64} ${W * 0.8} ${H - 60} Q${W * 0.9} ${H - 67} ${W} ${H - 60}`}
          fill="#4CAF50"
        />
      </Svg>
    </View>
  );
};
