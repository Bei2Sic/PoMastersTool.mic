export const SINGLE_STAT_MOVE_MULTIPLIERS = [
    0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3,
] as const;

export const SINGLE_STAT_SYNC_MULTIPLIERS = [
    0.0, 0.17, 0.33, 0.5, 0.67, 0.84, 1.0,
] as const;

export const TOTAL_STAT_MOVE_MULTIPLIERS = [
    0.0,
    0.02,
    0.05,
    0.07,
    0.1,
    0.13,
    0.15,
    0.18,
    0.2,
    0.23, // 0-9
    0.26,
    0.28,
    0.31,
    0.33,
    0.36,
    0.39,
    0.41,
    0.44,
    0.46,
    0.49, // 10-19
    0.52,
    0.54,
    0.57,
    0.59,
    0.62,
    0.65,
    0.67,
    0.7,
    0.72,
    0.75, // 20-29
    0.78,
    0.8,
    0.83,
    0.85,
    0.88,
    0.91,
    0.93,
    0.96,
    0.98,
    1.01, // 30-39
    1.04,
    1.06,
    1.09,
    1.1, // 40-43 (封頂)
] as const;

export const TOTAL_STAT_SYNC_MULTIPLIERS = [
    0.0,
    0.07,
    0.13,
    0.2,
    0.27,
    0.33,
    0.4,
    0.47,
    0.53,
    0.6, // 0-9
    0.67,
    0.73,
    0.8,
    0.87,
    0.93,
    1.0,
    1.07,
    1.13,
    1.2, // 10-18 (封頂)
] as const;

export const GAUGE_SYNC_MULTIPLIERS = [
    0.0, 0.16, 0.33, 0.5, 0.67, 0.84, 1.0,
] as const;

export const HP_LESS_THRESHOLD = [0.0, 0.25, 0.5, 1] as const;

export const HP_MORE_THRESHOLD = [1.0, 0.5, 0.25, 0.0] as const;

// 物理 & 特殊鬥陣倍率表
export const ATK_CIRCLE_MULTIPLIERS = [1.0, 1.2, 1.3, 1.4];

// 防禦鬥陣
export const DEF_CIRCLE_MULTIPLIERS = [1.0, 1.1, 1.15, 1.2];

// 抗性倍率
export const REBUFF_MULTIPLIERS = [1.0, 1.3, 1.5, 1.6];

// 基礎能力等級倍率表
export const GENERAL_RANK_MULTIPLIERS = [
    0.55,
    0.58,
    0.62,
    0.66,
    0.71,
    0.8, // -6 ~ -1
    1.0, // 0
    1.25,
    1.4,
    1.5,
    1.6,
    1.7,
    1.8, // +1 ~ +6
];

// 速度能力等級倍率
export const SPEED_RANK_MULTIPLIERS = [
    0.38,
    0.41,
    0.45,
    0.5,
    0.55,
    0.66, // -6 ~ -1
    1.0, // 0
    1.5,
    1.8,
    2.0,
    2.2,
    2.4,
    2.6, // +1 ~ +6
];

export const DAMAGE_ROLLS = [
    0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1.0,
];
