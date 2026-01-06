import {
    AbnormalType,
    BattleCircle,
    BattleRanks,
    BerryNum,
    BoostRank,
    CritBuffType,
    DamageFieldType,
    GaugeValue,
    HindranceType,
    PokemonStats,
    PokemonType,
    RebuffRank,
    StatLowerReduction,
    TerrainType,
    WeatherType,
    ZoneType,
} from "@/types/conditions";

export enum MoveScope {
    Move = "Move", // 小招
    Sync = "Sync", // 仅拍组招式
    Max = "Max", // 仅极巨化招式
    MoveAndMax = "MoveAndMax",
    MaxAndSync = "MaxAndSync",
    MoveAndSync = "MoveAndSync",
    MoveSpecial = "MoveSpecial",
    MovePhysical = "MovePhysical",
    All = "All", // 所有招式 (通常描述为"威力提升")
    Specific = "Specific", // 特定招式
}

export enum EffectLogic {
    PowerBoost = "PowerBoost", // 威力增长
    StatBoost = "StatBoost", // 白值增长
    ExtraType = "ExtraType", // 額外類型
}

export enum LogicType {
    // 固定值類型
    Direct = "Direct",
    DamageField = "DamageField", // 伤害场地
    Terrain = "Terrain", // 场地
    Zone = "Zone", // 领域
    BattleCircle = "BattleCircle", // 鬥陣
    Weather = "Weather", // 天气变化
    Abnormal = "Abnormal", // 异常
    Hindrance = "Hindrance", // 妨害
    Rebuff = "Rebuff", // 抗性下降

    // 固定值但二元類型
    AnyFieldEffect = "AnyFieldEffect",
    WeatherChange = "WeatherChange",
    WeatherNormal = "WeatherNormal",
    TerrainActive = "TerrainActive",
    BattleCircleActive = "BattleCircleActive",
    StatChange = "StatChange", // 某項能力變化（可能多項）
    AbnormalActive = "AbnormalActive",
    HindranceActive = "HindranceActive",
    AllStatNotInHigh = "AllStatNotInHigh", // 能力非提升
    AnyStatInLow = "AnyStatInLow", // 能力降低
    HPLow = "HPLow", // 危機
    HPHalf = "HPHalf", // 一半以上
    HPLowHalf = "HPLowHalf", // 一半以下
    HPDecreased = "HPDecreased", // 未滿
    Critical = "Critical",
    SuperEffective = "SuperEffective",
    Recoil = "Recoil", // 反衝
    MoveType = "MoveType", // 技能屬性
    SyncBuffs = "SyncBuffs", // 气魄状态
    Berry = "Berry", // 樹果
    GaugeSpeedBoostOn = "GaugeSpeedBoostOn",
    // 動態變化類型
    GaugeScaling = "GaugeScaling",
    SingleStatScaling = "SingleStatScaling", // 依单项能力升幅 (e.g. 依攻击升幅)
    TotalStatScaling = "TotalStatScaling", // 依总能力升降 (e.g. 依对手能力降幅)
    HPScaling = "HPScaling", // 依HP比例 (e.g. 隨HP)
    BoostScaling = "BoostScaling",


    // 技能威力乘算被动
    GaugeCost = "GaugeCost", // 計量槽消耗增加
    SpecialMulti = "SpecialMulti", // 特定乘算
    
    // Mega狀態
    IsMega = "IsMega",

    // 無伤害加成效果
    NotDamage = "NotDamage",
    NotDamageButCondition = "NotDamageButCondition", // 無傷害但滿足條件

    // 特殊被動
    MasterPassive = "MasterPassive",
    ArcSuitPassive = "ArcSuitPassive",
    TeamWorkPassive = "TeamWorkPassive",

    // 組合邏輯
    Compound = "Compound",
    MultiStatusActive = "MultiStatusActive", // 複合狀態(特殊異常列表/特殊妨害列表/或者組合列表)

    // 特殊倍率的move
    SpecialHandler = "SpecialHandler",
}

// 主動效果的追加補充邏輯
export enum ExtraLogic {
    BurnUseless = "BurnUseless",
    NonDecay = "NonDecay", // 無衰減
    NormalTypeShift = "NormalTypeShift", //屬性替換
    TypeShift = "TypeShift",
    UseDef = "UseDef", //使用物防結算
}

export interface Condition {
    key: string;
    detail: string;
    logic: LogicType;
    direction?: string;
    extra?: ExtraLogic;
    keys?: any; // 針對一些特殊組合邏輯, 複合key,
}

export interface ExtraContext {
    key: string;
    detail: string;
    logic: ExtraLogic;
}

export interface ThemeContext {
    // 標籤計數
    tagCounts: Record<string, number>;
    // 固定加成
    flatBonuses: PokemonStats;
    // 特定属性Tag
    tagType: PokemonType;
    // 特定属性加成
    tagAdd: number;
}

export interface ActiveMultiplier {
    name: string; //
    value: number; //
    logic: LogicType; //
    stat?: string;
}

export interface CalcEnvironment {
    weather: WeatherType;
    isEXWeather: boolean;
    terrain: TerrainType;
    isEXTerrain: boolean;
    zone: ZoneType;
    isEXZone: boolean;
    gaugeAcceleration: boolean;
    battleCircles: BattleCircle;

    user: {
        hpPercent: number; // 0-100
        gear: PokemonStats;
        ranks: BattleRanks;
        theme: PokemonStats;
        themeType: PokemonType;
        themeTypeAdd: number;
        boosts: {
            physical: BoostRank;
            special: BoostRank;
            sync: BoostRank;
        };
        syncBuff: number;
        abnormal: AbnormalType;
        hindrance: Record<HindranceType, boolean>;
    };

    target: {
        hpPercent: number;
        stats: PokemonStats;
        ranks: BattleRanks;
        syncBuff: number;
        abnormal: AbnormalType;
        hindrance: Record<HindranceType, boolean>;
        damageField: DamageFieldType;
        typeRebuffs: Record<PokemonType, RebuffRank>;
        crtiBuffs: Record<CritBuffType, boolean>;
        statLowerReduction: StatLowerReduction;
    };

    settings: {
        gauge: GaugeValue;
        targetScope: number;
        berry: BerryNum; //
        moveuse: number; // 針對 邪惡靈魂暗影球
        isCritical: boolean;
        effectiveType: PokemonType;
        isSuperEffective: boolean;
    };

    // 额外的属性
    special: {
        isMega: boolean;
    };

    config: {
        physical: number;
        special: number;
        sync: number;
        gearMove: number;
        gearSync: number;
    }
}
