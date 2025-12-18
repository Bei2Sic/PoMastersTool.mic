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

export enum LogicType {
    // 固定值類型
    Direct = "Direct",
    DamageField = "DamageField", // 伤害场地
    Terrain = "Terrain", // 场地
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
    StatChange = "StatChange", // 某項能力變化（可能多項）
    AbnormalActive = "AbnormalActive",
    HindranceActive = "HindranceActive",
    AllStatNotInHigh = "AllStatNotInHigh", // 能力非提升
    AnyStatInLow = "AnyStatInLow", // 能力降低
    HPLow = "HPLow", // 危機
    HPHighHalf = "HPHighHalf", // 一半以上
    HPDecreased = "HPDecreased", // 未滿
    Critical = "Critical",
    SuperEffective = "SuperEffective",
    Recoil = "Recoil", // 反衝
    MoveType = "MoveType", // 技能屬性
    SyncType = "SyncType", // 拍組屬性
    Berry = "Berry", // 樹果
    GaugeSpeedBoostOn = "GaugeSpeedBoostOn",
    GaugeCost = "GaugeCost", //
    // 動態變化類型
    GaugeScaling = "GaugeScaling",
    SingleStatScaling = "SingleStatScaling", // 依单项能力升幅 (e.g. 依攻击升幅)
    TotalStatScaling = "TotalStatScaling", // 依总能力升降 (e.g. 依对手能力降幅)
    HPScaling = "HPScaling", // 依HP比例 (e.g. 隨HP)
    BoostScaling = "BoostScaling",
    // 技能威力成倍增長類型
    FixedMulti = "FixedMulti", // 固定高倍率 (e.g. 威力10倍)

    // 白值能力加成
    StatBaseBoost = "StatBaseBoost",

    // 特殊效果
    Compound = "Compound",
    NoDecay = "NoDecay",

    // 特殊被動
    MasterPassive = "MasterPassive",
    ArcSuitPassive = "ArcSuitPassive",
    TeamWorkPassive = "TeamWorkPassive"
}

export interface PassiveRawText {
    name: string;
    desc: string;
}

export interface PassiveCondition {
    key: string;
    detail: string;
    logic: LogicType;
    direction?: string;
}

export interface PassiveBoost {
    scope: MoveScope;
    moveName?: string;
    value: number;
    baseValue?: number;
}

export interface PassiveStatBoost {
    isStatBoost: boolean;
    stats: string[]; // ['atk', 'def', ...]
    value: number; // 乘算倍数
}

export interface PassiveSkillModel {
    name: string;
    desc: string;
    passiveName: string;
    // 触发条件
    // LogicType.Compound 才會使用
    condition: PassiveCondition;
    conditions?: PassiveCondition[];
    // 伤害相关
    boost: PassiveBoost;

    // 白值加成类，影响的白值
    statBoost: PassiveStatBoost;

    applyToParty: boolean; // 是否全队生效 (G标)
}
