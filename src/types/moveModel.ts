// @/types/move.ts
import { Condition } from "@/types/calculator";

export interface MoveSkillModel {
    name: string;
    desc: string;

    condition: Condition;
    boost?: number;
}
