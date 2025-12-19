import { Condition, MoveScope } from "@/types/calculator";

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
    condition: Condition;
    conditions?: Condition[];
    // 伤害相关
    boost: PassiveBoost;

    // 白值加成类，影响的白值
    statBoost: PassiveStatBoost;

    applyToParty: boolean; // 是否全队生效 (G标)
}
