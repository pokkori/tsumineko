import React from "react";
import { View } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  Path,
  Line,
  G,
  Defs,
  ClipPath,
} from "react-native-svg";
import { CatSkin, SkinId } from "../types";
import { CAT_SKINS } from "../data/catSkins";

interface CatPreviewMiniProps {
  skinId: SkinId;
  size?: number;
  locked?: boolean;
}

// Darken a hex color by a factor (0-1)
function darkenColor(hex: string, factor: number): string {
  const c = hex.replace("#", "");
  const r = Math.max(0, Math.floor(parseInt(c.substring(0, 2), 16) * (1 - factor)));
  const g = Math.max(0, Math.floor(parseInt(c.substring(2, 4), 16) * (1 - factor)));
  const b = Math.max(0, Math.floor(parseInt(c.substring(4, 6), 16) * (1 - factor)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export const CatPreviewMini: React.FC<CatPreviewMiniProps> = React.memo(
  ({ skinId, size = 48, locked = false }) => {
    const skin = CAT_SKINS.find((s) => s.id === skinId);
    if (!skin) return null;

    // Use grey tones when locked
    const bodyColor = locked ? "#AAAAAA" : skin.bodyColor;
    const earColor = locked ? "#888888" : skin.earColor;
    const eyeColor = locked ? "#666666" : skin.eyeColor;
    const noseColor = locked ? "#777777" : skin.noseColor;
    const patternColor = locked ? "#999999" : skin.patternColor;

    // viewBox is 50x50 for mini preview (head-focused)
    const vw = 50;
    const vh = 50;
    const cx = vw / 2;
    const cy = vh * 0.55;
    const headR = 16;

    // Body visible as a slight curve below head
    const bodyCy = vh * 0.82;
    const bodyRx = 14;
    const bodyRy = 8;

    const whiskerColor = locked ? "#777777" : darkenColor(skin.bodyColor, 0.25);

    return (
      <View style={{ width: size, height: size, opacity: locked ? 0.5 : 1 }}>
        <Svg width={size} height={size} viewBox={`0 0 ${vw} ${vh}`}>
          <Defs>
            <ClipPath id={`bodyClipMini_${skinId}`}>
              <Ellipse cx={cx} cy={bodyCy} rx={bodyRx} ry={bodyRy} />
            </ClipPath>
            <ClipPath id={`headClipMini_${skinId}`}>
              <Circle cx={cx} cy={cy} r={headR} />
            </ClipPath>
          </Defs>

          {/* Body bump */}
          <Ellipse
            cx={cx}
            cy={bodyCy}
            rx={bodyRx}
            ry={bodyRy}
            fill={bodyColor}
            stroke={darkenColor(bodyColor, 0.12)}
            strokeWidth={0.6}
          />

          {/* Body pattern */}
          {!locked && skin.patternSvg && patternColor && (
            <G clipPath={`url(#bodyClipMini_${skinId})`}>
              <G transform={`translate(${cx - 20}, ${bodyCy - bodyRy})`}>
                <Path d={skin.patternSvg} fill={patternColor} opacity={0.5} />
              </G>
            </G>
          )}

          {/* Head */}
          <Circle
            cx={cx}
            cy={cy}
            r={headR}
            fill={bodyColor}
            stroke={darkenColor(bodyColor, 0.12)}
            strokeWidth={0.6}
          />

          {/* Head pattern */}
          {!locked && skin.patternSvg && patternColor && (
            <G clipPath={`url(#headClipMini_${skinId})`}>
              <G transform={`translate(${cx - 20}, ${cy - headR})`}>
                <Path d={skin.patternSvg} fill={patternColor} opacity={0.5} />
              </G>
            </G>
          )}

          {/* Ears - outer */}
          <Path
            d={`M${cx - headR + 2},${cy - headR * 0.4} L${cx - headR * 0.5},${cy - headR * 1.4} L${cx - 1},${cy - headR * 0.55} Z`}
            fill={bodyColor}
            stroke={darkenColor(bodyColor, 0.12)}
            strokeWidth={0.4}
          />
          <Path
            d={`M${cx + headR - 2},${cy - headR * 0.4} L${cx + headR * 0.5},${cy - headR * 1.4} L${cx + 1},${cy - headR * 0.55} Z`}
            fill={bodyColor}
            stroke={darkenColor(bodyColor, 0.12)}
            strokeWidth={0.4}
          />

          {/* Ears - inner */}
          <Path
            d={`M${cx - headR + 4},${cy - headR * 0.4} L${cx - headR * 0.5},${cy - headR * 1.2} L${cx - 2},${cy - headR * 0.5} Z`}
            fill={earColor}
            opacity={0.8}
          />
          <Path
            d={`M${cx + headR - 4},${cy - headR * 0.4} L${cx + headR * 0.5},${cy - headR * 1.2} L${cx + 2},${cy - headR * 0.5} Z`}
            fill={earColor}
            opacity={0.8}
          />

          {/* Eyes */}
          <Ellipse cx={cx - 6} cy={cy - 1} rx={2.8} ry={3.5} fill={eyeColor} />
          <Ellipse cx={cx + 6} cy={cy - 1} rx={2.8} ry={3.5} fill={eyeColor} />

          {/* Pupils */}
          <Circle cx={cx - 6} cy={cy - 0.5} r={1.3} fill="#111" />
          <Circle cx={cx + 6} cy={cy - 0.5} r={1.3} fill="#111" />

          {/* Eye highlights */}
          <Circle cx={cx - 5} cy={cy - 2.5} r={0.9} fill="#FFFFFF" />
          <Circle cx={cx + 7} cy={cy - 2.5} r={0.9} fill="#FFFFFF" />

          {/* Nose */}
          <Path d={`M${cx},${cy + 4} L${cx - 1.5},${cy + 2} L${cx + 1.5},${cy + 2} Z`} fill={noseColor} />

          {/* Omega mouth */}
          <Path
            d={`M${cx - 3.5},${cy + 5.5} Q${cx - 1.5},${cy + 8} ${cx},${cy + 6.5} Q${cx + 1.5},${cy + 8} ${cx + 3.5},${cy + 5.5}`}
            stroke="#555"
            strokeWidth={0.6}
            fill="none"
            strokeLinecap="round"
          />

          {/* Whiskers */}
          <Line x1={cx - 5} y1={cy + 3} x2={cx - 18} y2={cy + 1} stroke={whiskerColor} strokeWidth={0.4} opacity={0.5} strokeLinecap="round" />
          <Line x1={cx - 5} y1={cy + 4.5} x2={cx - 18} y2={cy + 4.5} stroke={whiskerColor} strokeWidth={0.4} opacity={0.5} strokeLinecap="round" />
          <Line x1={cx - 5} y1={cy + 6} x2={cx - 18} y2={cy + 8} stroke={whiskerColor} strokeWidth={0.4} opacity={0.5} strokeLinecap="round" />
          <Line x1={cx + 5} y1={cy + 3} x2={cx + 18} y2={cy + 1} stroke={whiskerColor} strokeWidth={0.4} opacity={0.5} strokeLinecap="round" />
          <Line x1={cx + 5} y1={cy + 4.5} x2={cx + 18} y2={cy + 4.5} stroke={whiskerColor} strokeWidth={0.4} opacity={0.5} strokeLinecap="round" />
          <Line x1={cx + 5} y1={cy + 6} x2={cx + 18} y2={cy + 8} stroke={whiskerColor} strokeWidth={0.4} opacity={0.5} strokeLinecap="round" />

          {/* Cheek blush */}
          {!locked && (
            <>
              <Ellipse cx={cx - 11} cy={cy + 2} rx={2.2} ry={1.5} fill="#FF8FAB" opacity={0.25} />
              <Ellipse cx={cx + 11} cy={cy + 2} rx={2.2} ry={1.5} fill="#FF8FAB" opacity={0.25} />
            </>
          )}

          {/* Paws */}
          <Ellipse cx={cx - 5} cy={bodyCy + bodyRy - 1} rx={3} ry={1.5} fill={bodyColor} stroke={darkenColor(bodyColor, 0.12)} strokeWidth={0.4} />
          <Ellipse cx={cx + 5} cy={bodyCy + bodyRy - 1} rx={3} ry={1.5} fill={bodyColor} stroke={darkenColor(bodyColor, 0.12)} strokeWidth={0.4} />
        </Svg>
      </View>
    );
  }
);
