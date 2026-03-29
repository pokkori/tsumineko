/**
 * SVG icons for TsuminNeko - replaces all emoji usage
 * react-native-svg based, fully accessible
 */
import React from 'react';
import Svg, { Circle, Path, Rect, G, Ellipse } from 'react-native-svg';

export type NekoIconName =
  | 'trophy'
  | 'coin'
  | 'cat_face'
  | 'building'
  | 'tower'
  | 'castle'
  | 'ruler'
  | 'ladder'
  | 'cloud'
  | 'fire'
  | 'explosion'
  | 'lightning'
  | 'target'
  | 'medal'
  | 'gamepad'
  | 'tent'
  | 'all_shapes'
  | 'fast_stack'
  | 'star';

interface IconSvgProps {
  name: NekoIconName;
  size?: number;
  color?: string;
}

export const IconSvg: React.FC<IconSvgProps> = ({ name, size = 24, color = '#FFD700' }) => {
  switch (name) {
    case 'trophy':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="トロフィー">
          <Path d="M12 15c-3.31 0-6-2.69-6-6V3h12v6c0 3.31-2.69 6-6 6z" fill="#FFD700" />
          <Path d="M6 3H3v3c0 1.66 1.34 3 3 3V3z" fill="#FFB300" />
          <Path d="M18 3h3v3c0 1.66-1.34 3-3 3V3z" fill="#FFB300" />
          <Rect x="9" y="15" width="6" height="2" fill="#FFD700" />
          <Rect x="7" y="17" width="10" height="2" fill="#FFD700" />
        </Svg>
      );

    case 'coin':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="コイン">
          <Circle cx="12" cy="12" r="10" fill="#FFD700" />
          <Circle cx="12" cy="12" r="8" fill="#FFA000" />
          <Path
            d="M12 7v10M9 9h4.5c.83 0 1.5.67 1.5 1.5S14.33 12 13.5 12H10.5c-.83 0-1.5.67-1.5 1.5S9.67 15 10.5 15H15"
            stroke="#FFD700"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'cat_face':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="ネコ">
          <Path d="M3 18V6l4 4h10l4-4v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2z" fill="#FF6B35" />
          <Path d="M3 6l4 4L7 6z" fill="#FF8F5E" />
          <Path d="M21 6l-4 4V6z" fill="#FF8F5E" />
          <Circle cx="9" cy="14" r="1.5" fill="#FFF" />
          <Circle cx="15" cy="14" r="1.5" fill="#FFF" />
          <Circle cx="9" cy="14.5" r="0.8" fill="#333" />
          <Circle cx="15" cy="14.5" r="0.8" fill="#333" />
          <Ellipse cx="12" cy="17" rx="1.5" ry="1" fill="#FF8F5E" />
        </Svg>
      );

    case 'building':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="ビルディング">
          <Rect x="4" y="3" width="16" height="19" rx="1" fill="#78909C" />
          <Rect x="7" y="6" width="3" height="3" fill="#FFF9C4" />
          <Rect x="14" y="6" width="3" height="3" fill="#FFF9C4" />
          <Rect x="7" y="12" width="3" height="3" fill="#FFF9C4" />
          <Rect x="14" y="12" width="3" height="3" fill="#FFF9C4" />
          <Rect x="10" y="17" width="4" height="5" fill="#5D4037" />
        </Svg>
      );

    case 'tower':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="タワー">
          <Path d="M8 22V8l4-6 4 6v14H8z" fill="#E53935" />
          <Rect x="10" y="10" width="4" height="3" fill="#FFF" />
          <Rect x="10" y="16" width="4" height="3" fill="#FFF" />
          <Path d="M12 2l4 6H8l4-6z" fill="#C62828" />
        </Svg>
      );

    case 'castle':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="城">
          <Rect x="3" y="10" width="18" height="12" fill="#8D6E63" />
          <Rect x="3" y="8" width="4" height="4" fill="#795548" />
          <Rect x="10" y="8" width="4" height="4" fill="#795548" />
          <Rect x="17" y="8" width="4" height="4" fill="#795548" />
          <Rect x="3" y="6" width="2" height="2" fill="#6D4C41" />
          <Rect x="5" y="6" width="2" height="2" fill="none" />
          <Rect x="10" y="6" width="2" height="2" fill="#6D4C41" />
          <Rect x="12" y="6" width="2" height="2" fill="none" />
          <Rect x="17" y="6" width="2" height="2" fill="#6D4C41" />
          <Rect x="19" y="6" width="2" height="2" fill="none" />
          <Rect x="10" y="16" width="4" height="6" fill="#5D4037" />
        </Svg>
      );

    case 'ruler':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="定規">
          <Rect x="3" y="5" width="18" height="14" rx="1" fill="#FFC107" />
          <Path d="M5 5v3M8 5v5M11 5v3M14 5v5M17 5v3M20 5v3" stroke="#F57F17" strokeWidth="1.5" />
        </Svg>
      );

    case 'ladder':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="はしご">
          <Path d="M8 2v20M16 2v20" stroke="#8D6E63" strokeWidth="2.5" />
          <Path d="M8 6h8M8 10h8M8 14h8M8 18h8" stroke="#A1887F" strokeWidth="2" />
        </Svg>
      );

    case 'cloud':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="雲">
          <Path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#B3E5FC" />
        </Svg>
      );

    case 'fire':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="炎">
          <Path d="M12 23c-4.42 0-8-3.58-8-8 0-2.72 1.36-5.12 3.44-6.58C7.91 9.8 8 11.38 8 11.38c0-3.03 2.05-5.55 4.89-6.38C12 7.5 12 8.62 12 8.62c0-2.21 1.79-4 4-4 0 0-1 6-1 9 0 4.42-1.34 7.69-3 9.38z" fill="#FF6B35" />
          <Path d="M12 19c-1.65 0-3-1.35-3-3 0-1.02.51-1.93 1.3-2.47.19.79.2 1.47.2 1.47 0-1.14.77-2.08 1.84-2.4C12 13.5 12 14 12 14c0-.83.67-1.5 1.5-1.5 0 0-.5 2.25-.5 3.5 0 1.65-.5 2.88-1 3.5z" fill="#FFD700" />
        </Svg>
      );

    case 'explosion':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="爆発">
          <Path d="M12 2l2 5 5-2-2 5 5 2-5 2 2 5-5-2-2 5-2-5-5 2 2-5-5-2 5-2-2-5 5 2z" fill="#FF5722" />
          <Circle cx="12" cy="12" r="4" fill="#FFAB40" />
        </Svg>
      );

    case 'lightning':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="雷">
          <Path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="#FFC107" />
        </Svg>
      );

    case 'target':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="ターゲット">
          <Circle cx="12" cy="12" r="10" fill="none" stroke="#E53935" strokeWidth="2" />
          <Circle cx="12" cy="12" r="6" fill="none" stroke="#E53935" strokeWidth="2" />
          <Circle cx="12" cy="12" r="2" fill="#E53935" />
        </Svg>
      );

    case 'medal':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="メダル">
          <Path d="M12 2L9 8H3l5 4-2 6 6-4 6 4-2-6 5-4h-6z" fill="#FFD700" />
          <Circle cx="12" cy="14" r="5" fill="#FFA000" />
          <Path d="M12 10v8M9 14h6" stroke="#FFD700" strokeWidth="1.5" />
        </Svg>
      );

    case 'gamepad':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="ゲームパッド">
          <Path d="M6 9h12a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-1l-2-3H9l-2 3H6a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4z" fill="#78909C" />
          <Rect x="8" y="11" width="2" height="4" fill="#B0BEC5" />
          <Rect x="7" y="12" width="4" height="2" fill="#B0BEC5" />
          <Circle cx="16" cy="12" r="1" fill="#4CAF50" />
          <Circle cx="18" cy="14" r="1" fill="#F44336" />
        </Svg>
      );

    case 'tent':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="テント">
          <Path d="M12 2L2 20h20L12 2z" fill="#E91E63" />
          <Path d="M12 2l5 18H7L12 2z" fill="#F06292" />
          <Path d="M12 2v18" stroke="#C2185B" strokeWidth="1" />
          <Circle cx="6" cy="8" r="1" fill="#FFEB3B" />
          <Circle cx="18" cy="10" r="1.2" fill="#FFEB3B" />
          <Circle cx="15" cy="5" r="0.8" fill="#4CAF50" />
        </Svg>
      );

    case 'all_shapes':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="全形状">
          <Circle cx="8" cy="8" r="4" fill="#FF6B35" />
          <Rect x="14" y="4" width="7" height="7" fill="#4ECDC4" />
          <Path d="M8 15l4 7 4-7H8z" fill="#FFD700" />
        </Svg>
      );

    case 'fast_stack':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="高速積み">
          <Path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="#FF6B35" />
        </Svg>
      );

    case 'star':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="スター">
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FFD700" />
        </Svg>
      );

    default:
      return null;
  }
};

/**
 * Map achievement icon IDs to SVG icon names
 */
export const ACHIEVEMENT_ICON_MAP: Record<string, NekoIconName> = {
  'first_stack': 'cat_face',
  'stack_10': 'building',
  'stack_50': 'tower',
  'stack_100': 'castle',
  'height_1m': 'ruler',
  'height_5m': 'ladder',
  'height_10m': 'cloud',
  'combo_5': 'fire',
  'combo_10': 'explosion',
  'combo_20': 'lightning',
  'score_1000': 'target',
  'score_5000': 'medal',
  'score_10000': 'trophy',
  'games_10': 'gamepad',
  'games_100': 'tent',
  'all_shapes': 'all_shapes',
  'fast_stack': 'fast_stack',
};
