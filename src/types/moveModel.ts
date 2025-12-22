// @/types/move.ts
import { Condition, CalcEnvironment } from "@/types/calculator";
import { MoveBase } from "@/types/syncModel";
export type MoveLogicHandler = (env: CalcEnvironment, move: MoveBase) => number;

export interface MoveSkillModel {
    name: string;
    desc: string;

    condition: Condition;
    boost?: number;
    handler?: MoveLogicHandler;
}

export const DEFAULT_MOVE_SKILL = {
    
} as MoveSkillModel;

export const DEFAULT_HANDLER = (env: CalcEnvironment, move: MoveBase): number => {
    return 100;
}


