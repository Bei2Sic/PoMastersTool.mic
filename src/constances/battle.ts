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

export const CRITBUFF_STATUSES = ["物理爆傷", "特殊爆傷", "拍招爆傷"] as const;

// 3. 環境與場地
export const WEATHER_TYPES = ["晴天", "下雨", "沙暴", "冰雹"] as const;

export const TERRAIN_TYPES = ["電氣場地", "青草場地", "精神場地"] as const;

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
    "超能力傷害場地",
    "蟲傷害場地",
    "岩石傷害場地",
    "幽靈傷害場地",
    "龍傷害場地",
    "惡傷害場地",
    "鋼傷害場地",
    "妖精傷害場地",
] as const;

// 6. 類型相關
export const ROLE_TYPES = [
    "攻擊型",
    "輔助型",
    "技術型",
    "速戰型",
    "場地型",
    "複合型",
] as const;

// 7. 數值相關
export const STAT_KEYS = [
    "hp",
    "atk",
    "def",
    "spa",
    "spd",
    "spe",
    "acc",
    "eva",
    "ct",
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

export const THEME_TRAINER_GROUP = [
    "主角",
    "四天王",
    "道館館主",
    "勁敵",
    "冠軍",
    "邪惡組織",
    "給予考驗之人",
    "對戰設施的強者",
    "天星隊",
] as const;

export const THEME_FASHION = [
    "美極套裝",
    "太陽眼鏡",
    "眼鏡",
    "面罩",
    "披風",
    "圍巾",
    "季節服裝",
    "雙馬尾",
    "特別服裝",
    "阿爾套裝",
] as const;

export const THEME_OTHER = [
    "我行我素",
    "機械愛好者",
    "洗翠的冒險",
    "漣漪鎮",
    "火箭隊永恆不朽!",
    "烹飪",
    "甜點愛好者",
    "真新鎮",
    "知識豐富",
    "石頭愛好者",
    "研究者",
    "神奧切不斷的緣分",
    "組隊對戰",
    "美樂美樂島的家族",
    "老手",
    "不可思議的力量",
    "伽勒爾的冒險",
    "卡洛斯的鄰居",
    "合眾的冒險",
    "合眾道館的友情",
    "命運糾纏的父子",
    "大姐姐",
    "大小姐",
    "天文台的親戚",
    "宇宙中心",
    "寶可全能競技賽",
    "對決場",
    "往事",
    "忍者父女",
    "愛好自然之人",
    "帕希歐學院",
] as const;
