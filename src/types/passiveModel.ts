export enum MoveScope {
    Move = "Move", // 小昭
    Sync = "Sync", // 仅拍组招式
    Max = "Max", // 仅极巨化招式
    Tera = "Tera", // 仅太晶化招式
    Gauge = "Gauge", // 仅计量槽招式
    All = "All", // 所有招式 (通常描述为"威力提升")
    Specific = "Specific", // 特定招式 (如"破坏光线")
}

export enum LogicType {
    // 固定值類型
    Complex = "Complex",
    DamageField = "DamageField", // 伤害场地
    Terrain = "Terrain", // 场地
    BattleCircle = "BattleCircle", // 鬥陣
    Weather = "Weather", // 天气变化
    Abnormal = "Abnormal", // 异常
    Hindrance = "Hindrance", // 妨害
    Rebuff = "Rebuff", // 抗性下降

    // 固定值但二元類型
    AnyFieldEffect = 'AnyFieldEffect',
    WeatherChange = 'WeatherChange',
    WeatherNormal = 'WeatherNormal',
    TerrainActive = 'TerrainActive',
    StatChange = "StatChange", // 某項能力變化（可能多項）
    AbnormalActive = "AbnormalActive",
    HindranceActive = "HindranceActive",
    AllStatNotChange = "AllStatNotChange", // 能力非提升
    HPLow = "HPLow", // 危機
    HPHighHalf = "HPHighHalf", // 一半以上
    HPDecreased = "HPDecreased", // 未滿
    Critical = "Critical",
    SuperEffective = "SuperEffective",
    Effective = "Effective",
    Reckless = "Reckless", // 反衝
    SyncType = "SyncType", // 屬性
    Berry = "Berry", // 樹果
    // 動態變化類型
    GaugeScaling = "GaugeScaling",
    SingleStatScaling = "SingleStatScaling", // 依单项能力升幅 (e.g. 依攻击升幅)
    TotalStatScaling = "TotalStatScaling", // 依总能力升降 (e.g. 依对手能力降幅)
    HPScaling = "HPScaling", // 依HP比例 (e.g. 隨HP)
    // 技能威力成倍增長類型
    FixedMulti = "FixedMulti", // 固定高倍率 (e.g. 威力10倍)

    // 白值能力加成
    StatBaseBoost = 'StatBaseBoost',
}

export interface PassiveRawText {
    name: string;
    desc: string;
}

export interface PassiveSkillModel {
    name: string;
    desc: string;
    passiveName: string;
    // 触发条件
    condition: {
        key: string; // 触发条件 (如 'Sun', 'Paralysis', 'AttackBuff')
        detail?: string; // 额外信息 (如 'Opponent', 'Self', 'Field')
    };

    // 伤害相关
    multiplier: {
        scope: MoveScope;
        moveName?: string; // 如果 scope 是 Specific，这里存招式名
        value: number; // 最大倍率 (如 0.5, 1.0, 9.0)
        logic: LogicType;
    };

    // 白值加成类，影响的白值
    statBoost: {
        isStatBoost: boolean;
        stats: string[]; // ['atk', 'def', ...]
        value: number;   // 乘算倍数
    };

    applyToParty: boolean; // 是否全队生效 (G标)
}
