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
        category: MoveScope,
        passives: PassiveSkillModel[],
        context: CalcEnvironment
    ): ActiveMultiplier[] {
        const result: ActiveMultiplier[] = [];

        for (const passive of passives) {
            // 0. 跳過白值類 和 計量槽類 (這兩個由別的方法處理)
            if (passive.statBoost.isStatBoost) continue;
            if (passive.multiplier?.logic === LogicType.GaugeCost)
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
            if (!this.checkCondition(passive.condition, passive.multiplier.logic, context)) {
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
        category: MoveScope,
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
            if (!this.checkCondition(passive.condition, passive.multiplier.logic, context)) {
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
        currentCategory: MoveScope,
        currentMoveName: string,
        targetMoveName?: string
    ): boolean {
        if (!scope) return false;

        switch (scope) {
            case MoveScope.All:
                return true; // 適用所有
            case MoveScope.Move:
                return currentCategory === "Move" || currentCategory === "Max" || currentCategory === "Tera";
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
        cond: { key: string, detail: string },
        logicType: LogicType,
        env: CalcEnvironment
    ): boolean {
        switch (logicType) {
            case LogicType.DamageField:

            // DamageField = "DamageField", // 伤害场地
            // Terrain = "Terrain", // 场地
            // BattleCircle = "BattleCircle", // 鬥陣
            // Weather = "Weather", // 天气变化
            // Abnormal = "Abnormal", // 异常
            // Hindrance = "Hindrance", // 妨害
            // Rebuff = "Rebuff", // 抗性下降

            // // 固定值但二元類型
            // AnyFieldEffect = 'AnyFieldEffect',
            // WeatherChange = 'WeatherChange',
            // WeatherNormal = 'WeatherNormal',
            // TerrainActive = 'TerrainActive',
            // StatChange = "StatChange", // 某項能力變化（可能多項）
            // AbnormalActive = "AbnormalActive",
            // HindranceActive = "HindranceActive",
            // AllStatNotChange = "AllStatNotChange", // 能力非提升
            // HPLow = "HPLow", // 危機
            // HPHighHalf = "HPHighHalf", // 一半以上
            // HPDecreased = "HPDecreased", // 未滿
            // Critical = "Critical",
            // SuperEffective = "SuperEffective",
            // Effective = "Effective",
            // Reckless = "Reckless", // 反衝
            // SyncType = "SyncType", // 屬性
            // Berry = "Berry", // 樹果
            // GaugeCost = "GaugeCost", // 
            // // 動態變化類型
            // GaugeScaling = "GaugeScaling",
            // SingleStatScaling = "SingleStatScaling", // 依单项能力升幅 (e.g. 依攻击升幅)
            // TotalStatScaling = "TotalStatScaling", // 依总能力升降 (e.g. 依对手能力降幅)
            // HPScaling = "HPScaling", // 依HP比例 (e.g. 隨HP)
        }
        return false;
    }
}
