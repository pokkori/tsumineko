import React, { useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { COLORS } from "../constants/colors";

interface BackgroundProps {
  heightPx: number;
}

/**
 * Height zone system:
 *   Zone 1: Meadow (0-200px)       - green grass, light sky
 *   Zone 2: Clouds (200-500px)      - white wisps, blue sky
 *   Zone 3: Stratosphere (500-800px) - deep blue, thin air
 *   Zone 4: Space (800px+)          - dark purple/black, stars
 */
interface ZoneConfig {
  bgTop: [number, number, number];
  bgBottom: [number, number, number];
  label: string;
  labelColor: string;
}

const ZONES: ZoneConfig[] = [
  { bgTop: [135, 206, 235], bgBottom: [100, 180, 220], label: '', labelColor: 'transparent' },
  { bgTop: [100, 180, 235], bgBottom: [70, 140, 210], label: '-- Cloud Zone --', labelColor: 'rgba(255,255,255,0.5)' },
  { bgTop: [30, 60, 140], bgBottom: [15, 20, 80], label: '-- Stratosphere --', labelColor: 'rgba(150,200,255,0.6)' },
  { bgTop: [10, 5, 40], bgBottom: [0, 0, 10], label: '-- Space --', labelColor: 'rgba(200,170,255,0.7)' },
];

const ZONE_THRESHOLDS = [0, 200, 500, 800];

function getZoneIndex(heightPx: number): number {
  for (let i = ZONE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (heightPx >= ZONE_THRESHOLDS[i]) return i;
  }
  return 0;
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

export const Background: React.FC<BackgroundProps> = ({ heightPx }) => {
  const zoneIdx = getZoneIndex(heightPx);
  const zone = ZONES[zoneIdx];
  const nextZone = ZONES[Math.min(zoneIdx + 1, ZONES.length - 1)];
  const threshold = ZONE_THRESHOLDS[zoneIdx];
  const nextThreshold = ZONE_THRESHOLDS[Math.min(zoneIdx + 1, ZONE_THRESHOLDS.length - 1)] || threshold + 300;

  // Smooth transition within zone
  const progress = Math.min(1, (heightPx - threshold) / (nextThreshold - threshold));
  const bgColor = lerpColor(zone.bgTop, nextZone.bgTop, progress);

  // Stars in space zone
  const showStars = zoneIdx >= 3;
  const showClouds = zoneIdx === 1;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Zone label */}
      {zone.label ? (
        <Text style={[styles.zoneLabel, { color: zone.labelColor }]}>
          {zone.label}
        </Text>
      ) : null}

      {/* Cloud wisps in cloud zone */}
      {showClouds && (
        <>
          <View style={[styles.cloud, { top: '20%', left: '10%', width: 80, height: 30 }]} />
          <View style={[styles.cloud, { top: '40%', right: '15%', width: 60, height: 24 }]} />
          <View style={[styles.cloud, { top: '65%', left: '50%', width: 100, height: 28 }]} />
        </>
      )}

      {/* Stars in space zone */}
      {showStars && (
        <>
          {Array.from({ length: 20 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  top: `${(i * 37 + 13) % 90}%`,
                  left: `${(i * 53 + 7) % 95}%`,
                  width: i % 3 === 0 ? 3 : 2,
                  height: i % 3 === 0 ? 3 : 2,
                  opacity: 0.4 + (i % 5) * 0.12,
                },
              ]}
            />
          ))}
        </>
      )}

      {/* Ground (only visible in meadow zone) */}
      {zoneIdx === 0 && <View style={styles.ground} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: COLORS.ground,
    borderTopWidth: 3,
    borderTopColor: COLORS.groundDark,
  },
  zoneLabel: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    width: '100%',
    textAlign: 'center',
  },
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});
