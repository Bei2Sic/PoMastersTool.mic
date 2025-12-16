// core/calculator/DamageEngine.ts
import { getStatKeyByStatCNname } from "@/core/exporter/map";
import { ActiveMultiplier, CalcEnvironment } from "@/types/calculator";
import { HindranceType, PokemonType } from "@/types/conditions";
import { LogicType, MoveScope, PassiveSkillModel } from "@/types/passiveModel";
import { MoveBase } from "@/types/syncModel";

export class DamageEngine {
    static getMultipliers(
        move: MoveBase,
        category: MoveScope,
        passives: PassiveSkillModel[],
        context: CalcEnvironment
    ): ActiveMultiplier[] {
        const result: ActiveMultiplier[] = [];

        for (const passive of passives) {
            // 0. 跳過白值類 和 計量槽消耗增加類 (這兩個由別的方法處理)
            if (passive.statBoost.isStatBoost) continue;
            if (passive.multiplier?.logic === LogicType.GaugeCost) continue;

            const pm = passive.multiplier;
            if (!pm) continue;

            // 1. 先判断效果作用对象是否符合
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

            // 判断是否是 scaling类
            const isScaling = this.isScaling(passive.multiplier.logic);
            let value = pm.value;
            if (isScaling) {
            } else {
                if (
                    !this.checkCondition(
                        passive.condition,
                        passive.multiplier.logic,
                        context,
                        move.tags
                    )
                ) {
                    continue;
                }
            }

            result.push({
                name: passive.passiveName,
                value: value,
                logic: pm.logic,
            });
        }

        return result;
    }

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
            if (pm?.logic !== LogicType.GaugeCost) continue;

            // 檢查範圍，计量槽消耗增加类一般仅适用于小招或者特定招式
            if (!this.isScopeMatch(pm.scope, category, move.name)) {
                continue;
            }

            // 3. 計算實際加成 (Rank * 0.1 * 耗氣)
            // 假設 maxVal 已經是 Rank * 0.1
            const finalValue = pm.value * move.gauge;

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
                return (
                    currentCategory === "Move" ||
                    currentCategory === "Max" ||
                    currentCategory === "Tera"
                );
            case MoveScope.Sync:
                return currentCategory === "Sync"; // 僅拍招
            case MoveScope.Max:
                return currentCategory === "Max"; // 僅極巨
            case MoveScope.Specific:
                return targetMoveName === currentMoveName;
            default:
                return false;
        }
    }

    private static isScaling(logicType: LogicType): boolean {
        switch (logicType) {
            case LogicType.SingleStatScaling ||
                LogicType.TotalStatScaling ||
                LogicType.HPScaling ||
                LogicType.GaugeScaling:
                return true;
            default:
                return false;
        }
    }

    private static checkCondition(
        cond: { key: string; detail: string; direction?: string },
        logicType: LogicType,
        env: CalcEnvironment,
        moveType: string
    ): boolean {
        switch (logicType) {
            case LogicType.DamageField:
                return cond.key.includes(env.target.damageField);

            case LogicType.Terrain:
                return cond.key.includes(env.terrain);

            case LogicType.Weather:
                return cond.key.includes(env.weather);

            case LogicType.BattleCircle:
                env.battleCircles.forEach((bc) => {
                    if (
                        cond.key.includes(bc.region) &&
                        cond.key.includes(bc.category)
                    ) {
                        return bc.isActive;
                    }
                });

            case LogicType.Abnormal:
                const abnormal = cond.detail.includes("對手")
                    ? env.target.abnormal
                    : env.user.abnormal;
                return cond.key.includes(abnormal);

            case LogicType.Hindrance:
                const hindrance = cond.detail.includes("對手")
                    ? env.target.hindrance
                    : env.user.hindrance;
                Object.keys(hindrance).some((status) => {
                    const isActive = hindrance[status as HindranceType];
                    if (!isActive) return false;

                    return cond.key.includes(status);
                });

            case LogicType.Rebuff:
                const rebuffs = env.target.typeRebuffs;
                Object.keys(rebuffs).some((rebuff) => {
                    const rebuffRank = hindrance[rebuff as PokemonType];
                    if (cond.key == "任意") {
                        if (rebuffRank !== 0) {
                            return true;
                        }
                    } else {
                        if (cond.key.includes(rebuff)) {
                            return rebuffRank !== 0;
                        }
                    }
                });
                return false;

            // // 固定值但二元類型
            case LogicType.AnyFieldEffect:
                return (
                    env.terrain !== "無" ||
                    env.weather !== "無" ||
                    env.zone !== "無"
                );

            case LogicType.WeatherChange:
                return env.weather !== "無";

            case LogicType.WeatherNormal:
                return env.weather === "無";

            case LogicType.TerrainActive:
                return env.terrain !== "無" || env.zone !== "無";

            case LogicType.StatChange:
                const stats = cond.detail.includes("對手")
                    ? env.target.ranks
                    : env.user.ranks;
                const statKey = getStatKeyByStatCNname(cond.key);
                const rankValue = stats[statKey];
                if (cond.direction.includes("下降")) {
                    return rankValue < 0;
                } else {
                    return rankValue > 0;
                }

            case LogicType.AbnormalActive:
                const activeAbnormal = cond.detail.includes("對手")
                    ? env.target.abnormal
                    : env.user.abnormal;
                return activeAbnormal !== "無";

            case LogicType.HindranceActive:
                const activeHindrance = cond.detail.includes("對手")
                    ? env.target.hindrance
                    : env.user.hindrance;
                Object.keys(activeHindrance).some((status) => {
                    const isActive = hindrance[status as HindranceType];
                    if (isActive) return true;
                });
                return false;
            // AllStatNotInHigh = "AllStatNotInHigh", // 能力非提升
            case LogicType.AllStatNotInHigh:
                const allstats = cond.detail.includes("對手")
                    ? env.target.ranks
                    : env.user.ranks;
                const rankSum = Object.keys(allstats).some(())
                return rankSum <= 0;
            // AnyStatInLow = "AnyStatInLow" // 能力降低

            case LogicType.HPLow:
                return env.user.hpPercent <= 20;

            case LogicType.HPHighHalf:
                return env.user.hpPercent >= 50;

            case LogicType.HPDecreased:
                return env.user.hpPercent < 100;

            case LogicType.Critical:
                return env.settings.isCritical;

            case LogicType.SuperEffective:
                if (cond.direction?.includes("非")) {
                    return !env.settings.isSuperEffective;
                } else {
                    return env.settings.isSuperEffective;
                }

            case LogicType.Recoil:
                return moveType === "反衝";
            // SyncType = "SyncType", // 屬性
            // Berry = "Berry", // 樹果

        }
        return false;
    }
}
