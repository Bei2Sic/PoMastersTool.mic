// @/constants/battle.ts

// 1. 屬性列表
export const POKEMON_TYPES = [
    "無",
    "一般",
    "火",
    "水",
    "草",
    "電",
    "冰",
    "格鬥",
    "毒",
    "地面",
    "飛行",
    "超能力",
    "蟲",
    "岩石",
    "幽靈",
    "龍",
    "惡",
    "鋼",
    "妖精",
] as const; // ✨ as const 讓它變成只讀元組，方便推導類型

// 2. 異常與妨害
export const ABNORMAL_STATUSES = [
    "灼傷",
    "麻痺",
    "冰凍",
    "中毒",
    "劇毒",
    "睡眠",
] as const;

export const HINDRANCE_STATUSES = ["混亂", "畏縮", "束縛", "禁止替換"] as const;

export const CRITBUFF_STATUSES = [
    "物理爆傷",
    "特殊爆傷",
    "拍招爆傷",
] as const;

// 3. 環境與場地
export const WEATHER_TYPES = ["晴天", "下雨", "沙暴", "冰雹"] as const;

export const TERRAIN_TYPES = [
    "電氣場地",
    "青草場地",
    "精神場地",
] as const;

export const ZONE_TYPES = [
    "一般領域",
    "冰柱領域",
    "拳頭領域",
    "劇毒領域",
    "大地領域",
    "藍天領域",
    "玉蟲領域",
    "岩石領域",
    "妖怪領域",
    "龍之領域",
    "鋼鐵領域",
    "妖精領域",
    "惡顔領域",
] as const;

// 4. 地區與鬥陣
export const BATTLE_REGIONS = [
    "關都",
    "城都",
    "豐緣",
    "神奧",
    "合眾",
    "卡洛斯",
    "阿羅拉",
    "伽勒爾",
    "帕底亞",
    "帕希歐",
] as const;

// 5. 傷害場地
export const DAMAGE_FIELDS = [
    "無",
    "一般傷害場地",
    "火傷害場地",
    "水傷害場地",
    "草傷害場地",
    "電傷害場地",
    "冰傷害場地",
    "格鬥傷害場地",
    "毒傷害場地",
    "地傷害場地",
    "飛行傷害場地",
    "超能傷害場地",
    "蟲傷害場地",
    "岩石傷害場地",
    "幽靈傷害場地",
    "龍傷害場地",
    "惡傷害場地",
    "鋼傷害場地",
    "妖精傷害場地",
] as const;

// 6. 數值相關
export const STAT_KEYS = [
    "hp",
    "atk",
    "def",
    "spa",
    "spd",
    "spe",
    "acc",
    "eva",
    "ct"
] as const;

export const STATS = [
    "HP",
    "攻擊",
    "防禦",
    "特攻",
    "特防",
    "速度",
    "閃避率",
    "命中率",
    "擊中要害率",
] as const;
