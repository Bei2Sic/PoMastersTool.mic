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
    Complex = "Complex",
    Attribute = "Attribute",
    DamageField = "DamageField", // 伤害场地
    Terrain = "Terrain", // 场地
    BattleCycle = "BattleCycle", // 鬥陣
    Weather = "Weather", // 天气变化
    Abnormal = "Abnormal", // 异常
    Hindrance = "Hindrance", // 妨害
    StatChange = "StatChange", // 能力變化
    SingleStatScaling = "SingleStatScaling", // 依单项能力升幅 (e.g. 依攻击升幅)
    TotalStatScaling = "TotalStatScaling", // 依总能力升降 (e.g. 依对手能力降幅)
    HPScaling = "HPScaling", // 依HP比例 (e.g. HP减少时)
    Special = "Special",
    FixedMulti = "FixedMulti", // 固定高倍率 (e.g. 威力10倍)
}

export interface PassiveSkillModel {
    name: string;
    desc: string;
    scope: MoveScope;
    targetMoveName?: string; // 如果 scope 是 Specific，这里存招式名

    multiplier: {
        maxVal: number; // 最大倍率 (如 0.5, 1.0, 9.0)
        logic: LogicType;
    };

    condition: {
        key: string; // 触发条件 (如 'Sun', 'Paralysis', 'AttackBuff')
        detail?: string; // 额外信息 (如 'Opponent', 'Self', 'Field')
    };

    applyToParty: boolean; // 是否全队生效 (G标)
}
