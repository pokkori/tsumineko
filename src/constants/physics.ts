export const PHYSICS = {
  GRAVITY: { x: 0, y: 1.2 },
  TIMESTEP: 1000 / 60,
  GROUND_Y: 750,
  GROUND: {
    friction: 0.8,
    restitution: 0.05,
    isStatic: true,
  },
  WALL: {
    friction: 0.3,
    restitution: 0.1,
    isStatic: true,
  },
  SPAWN_Y: -80,
  HORIZONTAL_SPEED: 3.0,
  MOVE_RANGE: 0.85,
  COLLAPSE_THRESHOLD_PX: 50,
  STABLE_VELOCITY_THRESHOLD: 0.3,
  STABLE_FRAME_COUNT: 90,
  OUT_OF_BOUNDS: {
    left: -100,
    right: 500,
    bottom: 900,
  },
  COLLAPSE_SLOW_FACTOR: 0.15,
  COLLAPSE_SLOW_DURATION: 1500,
  CAMERA_LERP: 0.08,
  CAMERA_MIN_Y: 0,

  /** 風力の段階的増加（高度ゾーン別） */
  WIND: {
    /** 草原ゾーン (0-200px): 風なし */
    MEADOW_FORCE: 0,
    /** 雲ゾーン (200-500px): 弱い風 */
    CLOUD_FORCE: 0.0003,
    /** 成層圏ゾーン (500-800px): 中程度の風 */
    STRATOSPHERE_FORCE: 0.0008,
    /** 宇宙ゾーン (800px+): 強い横風（無重力的ドリフト） */
    SPACE_FORCE: 0.0015,
    /** 風向き変化周期（フレーム数） */
    DIRECTION_CHANGE_FRAMES: 120,
  },

  /** 初回30秒セーフティネット */
  SAFETY_NET: {
    /** セーフティネット期間（秒） */
    DURATION_SEC: 30,
    /** セーフティネット中のコラプス閾値を緩和（通常50px→120px） */
    COLLAPSE_THRESHOLD_PX: 120,
    /** セーフティネット中のOOB範囲拡大 */
    OUT_OF_BOUNDS_BOTTOM: 1100,  // 通常900→1100
  },
} as const;

/**
 * 高さに応じた風力を返す
 */
export function getWindForce(heightPx: number): number {
  if (heightPx < 200) return PHYSICS.WIND.MEADOW_FORCE;
  if (heightPx < 500) return PHYSICS.WIND.CLOUD_FORCE;
  if (heightPx < 800) return PHYSICS.WIND.STRATOSPHERE_FORCE;
  return PHYSICS.WIND.SPACE_FORCE;
}
