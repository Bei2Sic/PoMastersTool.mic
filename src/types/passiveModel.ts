import { Condition, EffectLogic, ExtraContext, MoveScope, SkillModel, CalcEnvironment } from "@/types/calculator";

export interface PassiveBoost {
    scope: MoveScope;
    moveName?: string;
    value: number;
    baseValue?: number;
}

export interface PassiveStatBoost {
    isStatBoost?: boolean;
    stats: string[]; // ['atk', 'def', ...]
    value: number; // 乘算倍数
}

export type PassiveLogicHandler = (env: CalcEnvironment) => number;

export interface PassiveSkillModel extends SkillModel {
    name: string;
    desc: string;
    passiveName: string;
    // 影响范围
    effect: EffectLogic;
    // 触发条件
    condition: Condition;
    // LogicType.Compound 才會使用
    conditions?: Condition[];

    extra?: ExtraContext;
    // 伤害相关
    boost: PassiveBoost;
    // 白值加成类，影响的白值
    statBoost?: PassiveStatBoost;
    handler?: PassiveLogicHandler;

    unique?: boolean; // 是否唯一生效 (S标)
    applyToParty: boolean; // 是否全队生效 (G标)
}
