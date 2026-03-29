/**
 * つみネコ マスコット: メイン猫「ツミちゃん」
 * タイトル画面・スプラッシュ用の大きいメインキャラ
 * 1.5頭身SD / 目は頭部40% / 6表情
 */
import React from 'react';
import Svg, {
  Circle, Ellipse, Path, G, Defs, RadialGradient, LinearGradient, Stop,
} from 'react-native-svg';

type CatExpression = 'happy' | 'excited' | 'sleepy' | 'scared' | 'proud' | 'love';

interface MascotSvgProps {
  size?: number;
  expression?: CatExpression;
  color?: 'orange' | 'gray' | 'white' | 'calico';
}

const CAT_COLORS = {
  orange: { light: '#FFD1A4', main: '#FF9B50', dark: '#E87D2E', nose: '#FF6B6B' },
  gray:   { light: '#D5D5D5', main: '#9E9E9E', dark: '#757575', nose: '#FFB3B3' },
  white:  { light: '#FFFFFF', main: '#F5F5F5', dark: '#E0E0E0', nose: '#FFB3B3' },
  calico: { light: '#FFE0B2', main: '#FF9800', dark: '#E65100', nose: '#FF6B6B' },
};

export const MascotSvg: React.FC<MascotSvgProps> = ({
  size = 120,
  expression = 'happy',
  color = 'orange',
}) => {
  const c = CAT_COLORS[color];

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      accessibilityLabel="ツミちゃん（猫マスコット）"
    >
      <Defs>
        <RadialGradient id="furGrad" cx="45%" cy="35%" r="55%">
          <Stop offset="0%" stopColor={c.light} />
          <Stop offset="50%" stopColor={c.main} />
          <Stop offset="100%" stopColor={c.dark} />
        </RadialGradient>
        <RadialGradient id="bellyGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFF8E1" />
          <Stop offset="100%" stopColor="#FFECB3" />
        </RadialGradient>
      </Defs>

      {/* Shadow */}
      <Ellipse cx="60" cy="112" rx="26" ry="5" fill="#00000020" />

      {/* Tail */}
      <Path
        d="M82 85 Q100 80 105 65 Q108 55 100 52"
        stroke={c.main}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />

      {/* Body */}
      <Ellipse cx="60" cy="82" rx="24" ry="20" fill="url(#furGrad)" />

      {/* Belly */}
      <Ellipse cx="60" cy="85" rx="15" ry="12" fill="url(#bellyGrad)" opacity={0.8} />

      {/* Head */}
      <Ellipse cx="60" cy="44" rx="26" ry="24" fill="url(#furGrad)" />

      {/* Ears */}
      <Path d="M38 28 L30 6 L48 20 Z" fill={c.main} />
      <Path d="M40 26 L34 12 L47 22 Z" fill="#FFB3B3" />
      <Path d="M82 28 L90 6 L72 20 Z" fill={c.main} />
      <Path d="M80 26 L86 12 L73 22 Z" fill="#FFB3B3" />

      {/* Calico patches */}
      {color === 'calico' && (
        <G opacity={0.6}>
          <Circle cx="72" cy="38" r="8" fill="#4A4A4A" />
          <Circle cx="48" cy="78" r="7" fill="#4A4A4A" />
          <Circle cx="75" cy="88" r="6" fill="#E65100" />
        </G>
      )}

      {/* Eyes */}
      {expression === 'sleepy' ? (
        <G>
          <Path d="M44 42 Q50 38 56 42" stroke="#4A2800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M64 42 Q70 38 76 42" stroke="#4A2800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </G>
      ) : expression === 'scared' ? (
        <G>
          <Ellipse cx="48" cy="42" rx="9" ry="11" fill="#FFFFFF" />
          <Ellipse cx="72" cy="42" rx="9" ry="11" fill="#FFFFFF" />
          <Circle cx="48" cy="44" r="5" fill="#4A2800" />
          <Circle cx="72" cy="44" r="5" fill="#4A2800" />
          <Circle cx="46" cy="41" r="2.5" fill="#FFFFFF" />
          <Circle cx="70" cy="41" r="2.5" fill="#FFFFFF" />
        </G>
      ) : expression === 'love' ? (
        <G>
          <Path d="M42 40 C42 34, 48 34, 48 40 C48 34, 54 34, 54 40 C54 48, 48 52, 48 52 C48 52, 42 48, 42 40 Z" fill="#E91E63" />
          <Path d="M66 40 C66 34, 72 34, 72 40 C72 34, 78 34, 78 40 C78 48, 72 52, 72 52 C72 52, 66 48, 66 40 Z" fill="#E91E63" />
        </G>
      ) : (
        <G>
          {/* Cat eyes - vertical pupil */}
          <Ellipse cx="48" cy="42" rx="8" ry={expression === 'excited' ? 10 : 8} fill="#FFFFFF" />
          <Ellipse cx="72" cy="42" rx="8" ry={expression === 'excited' ? 10 : 8} fill="#FFFFFF" />
          <Ellipse cx="48" cy="42" rx="6" ry="7" fill="#7CB342" />
          <Ellipse cx="72" cy="42" rx="6" ry="7" fill="#7CB342" />
          {/* Vertical cat pupil */}
          <Ellipse cx="48" cy="42" rx={expression === 'excited' ? 3 : 2} ry="6" fill="#1A1A2E" />
          <Ellipse cx="72" cy="42" rx={expression === 'excited' ? 3 : 2} ry="6" fill="#1A1A2E" />
          {/* Shine */}
          <Circle cx="45" cy="39" r="2.5" fill="#FFFFFF" />
          <Circle cx="69" cy="39" r="2.5" fill="#FFFFFF" />
        </G>
      )}

      {/* Nose */}
      <Path d="M58 50 L60 53 L62 50 Z" fill={c.nose} />

      {/* Whiskers */}
      <G opacity={0.35}>
        <Path d="M42 50 L22 46" stroke="#8D6E63" strokeWidth="1" />
        <Path d="M42 52 L22 54" stroke="#8D6E63" strokeWidth="1" />
        <Path d="M78 50 L98 46" stroke="#8D6E63" strokeWidth="1" />
        <Path d="M78 52 L98 54" stroke="#8D6E63" strokeWidth="1" />
      </G>

      {/* Mouth */}
      {expression === 'happy' || expression === 'love' ? (
        <G>
          <Path d="M56 54 Q60 58 60 54" stroke="#4A2800" strokeWidth="1.5" fill="none" />
          <Path d="M60 54 Q60 58 64 54" stroke="#4A2800" strokeWidth="1.5" fill="none" />
        </G>
      ) : expression === 'excited' ? (
        <Path d="M54 54 Q60 62 66 54" stroke="#4A2800" strokeWidth="1.5" fill="#FFB3B3" strokeLinecap="round" />
      ) : expression === 'scared' ? (
        <Ellipse cx="60" cy="56" rx="4" ry="5" fill="#4A2800" />
      ) : expression === 'proud' ? (
        <Path d="M55 54 Q60 56 65 54" stroke="#4A2800" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : (
        <Path d="M57 55 L63 55" stroke="#4A2800" strokeWidth="1.5" strokeLinecap="round" />
      )}

      {/* Cheek blush */}
      <Ellipse cx="38" cy="50" rx="5" ry="3" fill="#FFAB91" opacity={0.5} />
      <Ellipse cx="82" cy="50" rx="5" ry="3" fill="#FFAB91" opacity={0.5} />

      {/* Paws */}
      <Ellipse cx="46" cy="100" rx="9" ry="6" fill={c.main} />
      <Ellipse cx="74" cy="100" rx="9" ry="6" fill={c.main} />
      {/* Toe beans */}
      <Circle cx="42" cy="99" r="2" fill="#FFB3B3" />
      <Circle cx="46" cy="98" r="2" fill="#FFB3B3" />
      <Circle cx="50" cy="99" r="2" fill="#FFB3B3" />
      <Circle cx="70" cy="99" r="2" fill="#FFB3B3" />
      <Circle cx="74" cy="98" r="2" fill="#FFB3B3" />
      <Circle cx="78" cy="99" r="2" fill="#FFB3B3" />
    </Svg>
  );
};
