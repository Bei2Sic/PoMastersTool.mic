export type StatRank = -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6; // 能力等級
export type CtRank = 0 | 1 | 2 | 3; // 能力等級
export type BoostRank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // 增強等級 (PMUN/SMUN)
export type GaugeValue = 1 | 2 | 3 | 4 | 5 | 6; // 計量槽值
export type TargetScope = 1 | 2 | 3;
export type RebuffRank = -3 | -2 | -1 | 0; // 抵抗等級
export type BerryNum = 0 | 1 | 2 | 3;

export interface BattleRanks {
    atk: StatRank;
    def: StatRank;
    spa: StatRank;
    spd: StatRank;
    spe: StatRank;
    acc: StatRank;
    eva: StatRank;
    ct?: CtRank;
}

export interface RegionCircleState {
    level: CircleLevel;
    actives: {
        [key in CircleCategory]: boolean;
    };
}
// 所有地區的映射
export type BattleCircle = {
    [key in RegionType]: RegionCircleState;
};

export interface PokemonStats {
    hp?: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
}

// 18種屬性名稱
export type PokemonType =
    | "無"
    | "一般"
    | "火"
    | "水"
    | "草"
    | "電"
    | "冰"
    | "格鬥"
    | "毒"
    | "地面"
    | "飛行"
    | "超能力"
    | "蟲"
    | "岩石"
    | "幽靈"
    | "龍"
    | "惡"
    | "鋼"
    | "妖精";

// ==========================================
// 2. 環境與場地類型 (Environment Types)
// ==========================================

export type WeatherType = "無" | "晴天" | "下雨" | "沙暴" | "冰雹";
export type TerrainType = "無" | "電氣場地" | "青草場地" | "精神場地";
export type ZoneType =
    | "無"
    | "一般領域"
    | "冰柱領域"
    | "拳頭領域"
    | "劇毒領域"
    | "大地領域"
    | "藍天領域"
    | "玉虫領域"
    | "岩石領域"
    | "妖怪領域"
    | "龍之領域"
    | "鋼鐵領域"
    | "妖精領域"
    | "惡顏領域";

// ==========================================
// 3. 鬥陣類型 (Battle Circles)
// ==========================================

export type RegionType =
    | "無"
    | "關都"
    | "城都"
    | "豐緣"
    | "神奧"
    | "合眾"
    | "卡洛斯"
    | "阿羅拉"
    | "伽勒爾"
    | "帕底亞"
    | "帕希歐";
export type CircleCategory = "物理" | "特殊" | "防禦";
export type CircleLevel = 0 | 1 | 2 | 3;

export type StatType = "攻擊" | "防禦" | "特攻" | "特防" | "速度";

// 異常狀態
export type AbnormalType =
    | "無"
    | "灼傷"
    | "中毒"
    | "劇毒"
    | "睡眠"
    | "冰凍"
    | "麻痺";

// 妨害狀態
export type HindranceType = "束縛" | "混亂" | "畏縮" | "禁止替換";

export type DamageFieldType =
    | "無"
    | "一般傷害場地"
    | "火傷害場地"
    | "水傷害場地"
    | "草傷害場地"
    | "電傷害場地"
    | "冰傷害場地"
    | "格鬥傷害場地"
    | "毒傷害場地"
    | "地傷害場地"
    | "飛行傷害場地"
    | "超能傷害場地"
    | "蟲傷害場地"
    | "岩石傷害場地"
    | "幽靈傷害場地"
    | "龍傷害場地"
    | "惡傷害場地"
    | "鋼傷害場地"
    | "妖精傷害場地";

// 抵抗表
export type TypeRebuffs = Record<PokemonType, RebuffRank>;

// 技能类型
export type MoveType = "無" | "反衝" | "快攻" | "連續" | "必中";

export const STATS = [
    "攻擊",
    "防禦",
    "特攻",
    "特防",
    "速度",
    "閃避率",
    "命中率",
    "擊中要害率",
];

export const ABNORMAL_STATUSES = [
    "中毒",
    "劇毒",
    "冰凍",
    "麻痺",
    "睡眠",
    "灼傷",
];
export const HINDRANCE_STATUSES = ["束縛", "混亂", "畏縮", "禁止替換"];
export const WEATHER_STATUSES = ["晴天", "下雨", "沙暴", "冰雹"];
