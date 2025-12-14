import { PassiveSkillModel, LogicType } from "@/types/passiveModel";

// 定义计算环境接口 (解耦 Pinia)
export interface CalcEnvironment {
    weather: string;
    terrain: string;
    enemyDef: number;
    // ... 其他环境参数
}

export class DamageEngine {
    
    // 计算总倍率 (Total Multiplier)
    static calculateMultipliers(
        passives: PassiveSkillModel[], 
        context: CalcEnvironment
    ): number {
        let totalMultiplier = 1.0;

        for (const passive of passives) {
            // 1. 检查条件是否满足
            if (!this.checkCondition(passive.condition, context)) continue;

            // 2. 只有伤害类被动参与此计算 (排除白值类)
            if (passive.statBoost.isStatBoost) continue;
            
            // 3. 累加倍率
            // 注意：这里要处理 FixedMulti (变成N倍) 和 Additive (提升N)
            const val = passive.multiplier?.value || 0;
            if (passive.multiplier?.logic === LogicType.FixedMulti) {
                totalMultiplier *= (1 + val); // 独立乘区
            } else {
                totalMultiplier += val; // 加算区
            }
        }
        return totalMultiplier;
    }

    // 内部条件检查器
    private static checkCondition(cond: { key: string }, env: CalcEnvironment): boolean {
        if (cond.key === 'None') return true;
        if (cond.key === '晴天' && env.weather === 'sunny') return true;
        // ... 其他条件判断
        return false;
    }
}