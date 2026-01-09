// @/types/move.ts
import { CalcEnvironment, Condition, EffectLogic, ExtraContext, SkillModel } from "@/types/calculator";
import { MoveBase } from "@/types/syncModel";
export type MoveLogicHandler = (env: CalcEnvironment, move: MoveBase) => number;

export interface MoveSkillModel extends SkillModel {
    name: string;
    desc: string;
    effect: EffectLogic;
    condition: Condition;
    extra?: ExtraContext;
    boost?: number;
    // 特殊倍率需定制handler来计算
    handler?: MoveLogicHandler;
}

export const DEFAULT_MOVE_SKILL = {
    
} as MoveSkillModel;

export const MOVE_DEFAULT_HANDLER = (env: CalcEnvironment, move: MoveBase): number => {
    return 100;
}


