// core/calculator/DamageEngine.ts
import { ActiveMultiplier, CalcEnvironment, MoveBase, MoveCategory } from "@/types/calculator";
import { LogicType, MoveScope, PassiveSkillModel } from "@/types/passiveModel";

export class DamageEngine {
    /**
     * 方法 1: 獲取該技能的 [倍率加成列表]
     * 包含：通用條件倍率 (如 CS2, 晴天) + 特定招式倍率 (如 逆鱗威力提升)
     */
    static getMultipliers(
        move: MoveBase,
        category: MoveCategory,
        passives: PassiveSkillModel[],
        context: CalcEnvironment
    ): ActiveMultiplier[] {
        const result: ActiveMultiplier[] = [];

        for (const passive of passives) {
            // 0. 跳過白值類 和 計量槽類 (這兩個由別的方法處理)
            if (passive.statBoost.isStatBoost) continue;
            if (passive.multiplier?.logic === LogicType.GaugeScaling)
                continue;

            const pm = passive.multiplier;
            if (!pm) continue;

            // 1. 檢查作用範圍 (Scope)
            // 這裡同時處理了 "通用範圍" 和 "特定技能(Specific)"
            if (
                !this.isScopeMatch(
                    pm.scope,
                    category,
                    move.name,
                    passive.multiplier.moveName
                )
            ) {
                continue;
            }

            // 2. 檢查環境條件
            if (!this.checkCondition(passive.condition, context)) {
                continue;
            }

            // 3. 加入結果
            result.push({
                name: passive.passiveName,
                value: pm.value,
                logic: pm.logic,
            });
        }

        return result;
    }

    /**
     * 方法 2: 獲取該技能的 [計量槽增益列表] (Power Flux)
     * 專門處理 "計量槽消耗增加威力提升" 這類直接修正 BP 的被動
     */
    static getGaugeBoosts(
        move: MoveBase,
        category: MoveCategory, // 通常 Power Flux 只對普招有效，但也可能未來有別的
        passives: PassiveSkillModel[],
        context: CalcEnvironment
    ): ActiveMultiplier[] {
        const result: ActiveMultiplier[] = [];

        for (const passive of passives) {
            // 只處理 GaugeScaling 類型
            if (passive.statBoost.isStatBoost) continue;
            const pm = passive.multiplier;
            if (pm?.logic !== LogicType.GaugeScaling) continue;

            // 1. 檢查範圍 (通常 Power Flux 是 MoveScope.Move)
            if (!this.isScopeMatch(pm.scope, category, move.name)) {
                continue;
            }

            // 2. 檢查環境條件
            if (!this.checkCondition(passive.condition, context)) {
                continue;
            }

            // 3. 計算實際加成 (Rank * 0.1 * 耗氣)
            // 假設 maxVal 已經是 Rank * 0.1
            const finalValue = pm.value * move.gaugeCost;

            result.push({
                name: passive.passiveName,
                value: finalValue,
                logic: LogicType.GaugeScaling,
            });
        }

        return result;
    }

    // =================================================================
    // 內部判斷邏輯
    // =================================================================

    private static isScopeMatch(
        scope: MoveScope | undefined,
        currentCategory: MoveCategory,
        currentMoveName: string,
        targetMoveName?: string
    ): boolean {
        if (!scope) return false;

        switch (scope) {
            case MoveScope.All:
                return true; // 適用所有
            case MoveScope.Move:
                return currentCategory === "Pokemon"; // 僅普招
            case MoveScope.Sync:
                return currentCategory === "Sync"; // 僅拍招
            case MoveScope.Max:
                return currentCategory === "Max"; // 僅極巨
            case MoveScope.Specific:
                // 關鍵：如果是特定招式，必須名字完全一樣
                return targetMoveName === currentMoveName;
            default:
                return false;
        }
    }

    private static checkCondition(
        cond: { key: string },
        env: CalcEnvironment
    ): boolean {
        // ... (保持原本的環境判斷代碼，如晴天、場地等)
        if (cond.key === "None" || cond.key === "無條件") return true;
        if (cond.key === "晴天" && env.weather === "sunny") return true;
        // ...
        return false;
    }
}
