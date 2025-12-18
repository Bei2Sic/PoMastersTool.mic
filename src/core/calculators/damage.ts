// core/calculator/DamageEngine.ts
import {
    GAUGE_SYNC_MULTIPLIERS,
    HP_LESS_THRESHOLD,
    HP_MORE_THRESHOLD,
    SINGLE_STAT_MOVE_MULTIPLIERS,
    SINGLE_STAT_SYNC_MULTIPLIERS,
    TOTAL_STAT_MOVE_MULTIPLIERS,
    TOTAL_STAT_SYNC_MULTIPLIERS,
} from "@/constances/rate";
import {
    getStatKeyByStatCNname,
    getTypeCNnameByTypeIndex,
} from "@/core/exporter/map";
import { ActiveMultiplier, CalcEnvironment, ThemeContext } from "@/types/calculator";
import { HindranceType, PokemonType } from "@/types/conditions";
import {
    LogicType,
    MoveScope,
    PassiveBoost,
    PassiveCondition,
    PassiveSkillModel,
} from "@/types/passiveModel";
import { MoveBase } from "@/types/syncModel";

export class DamageEngine {
    // 被动技能处理
    static getMultipliers(
        move: MoveBase,
        scope: MoveScope,
        passives: PassiveSkillModel[],
        context: CalcEnvironment,
        theme: ThemeContext,
    ): ActiveMultiplier[] {
        const result: ActiveMultiplier[] = [];

        for (const passive of passives) {
            // 跳過白值類
            if (passive.statBoost.isStatBoost) continue;
            // if (passive.condition.logic === LogicType.GaugeCost) continue;

            const pm = passive.boost;
            if (!pm) continue;

            // 1. 先判断效果作用对象是否符合
            if (
                !this.isScopeMatch(
                    pm.scope,
                    scope,
                    move.category,
                    move.name,
                    pm.moveName
                )
            ) {
                continue;
            }

            // 判断是否是 scaling类
            const isScaling = this.isScaling(passive.condition.logic);
            let value = pm.value;
            if (isScaling) {
                const scalingValue = this.getScalingMultiplier(
                    passive.condition,
                    scope,
                    context,
                    passive.boost,
                    theme,
                );
                value = scalingValue;
            } else {
                if (
                    !this.checkCondition(
                        passive.condition,
                        context,
                        move.type,
                        move.tags
                    )
                ) {
                    continue;
                }
            }

            result.push({
                name: passive.passiveName,
                value: value * 100,
                logic: passive.condition.logic,
            });
        }

        return result;
    }

    // static getGaugeCostBoosts(
    //     move: MoveBase,
    //     scope: MoveScope,
    //     passives: PassiveSkillModel[]
    // ): ActiveMultiplier[] {
    //     const result: ActiveMultiplier[] = [];

    //     for (const passive of passives) {
    //         // 只處理 GaugeScaling 類型
    //         if (passive.statBoost.isStatBoost) continue;
    //         const pm = passive.multiplier;
    //         if (passive.condition.logic !== LogicType.GaugeCost) continue;

    //         if (!this.isScopeMatch(pm.scope, scope, move.name)) {
    //             continue;
    //         }

    //         const finalValue = pm.value * 0.1;

    //         result.push({
    //             name: passive.passiveName,
    //             value: finalValue,
    //             logic: LogicType.GaugeCost,
    //         });
    //     }

    //     return result;
    // }

    private static isScopeMatch(
        scope: MoveScope,
        currentScope: MoveScope,
        category: string,
        currentMoveName: string,
        targetMoveName?: string
    ): boolean {
        if (!scope) return false;

        switch (scope) {
            case MoveScope.All:
                return true; // 適用所有
            case MoveScope.Move:
                return currentScope === MoveScope.Move;
            case MoveScope.Sync:
                return currentScope === MoveScope.Sync; // 僅拍招
            case MoveScope.Max:
                return currentScope === MoveScope.Max; // 僅極巨
            case MoveScope.MoveAndMax:
                return currentScope === MoveScope.Move || currentScope === MoveScope.Max;
            case MoveScope.MaxAndSync:
                return currentScope === MoveScope.Sync || currentScope === MoveScope.Max;
            case MoveScope.MoveAndSync:
                return currentScope === MoveScope.Move || currentScope === MoveScope.Sync;
            case MoveScope.MovePhysical:
                return currentScope === MoveScope.Move && category === "物理";
            case MoveScope.MoveSpecial:
                return currentScope === MoveScope.Move && category === "特殊";
            case MoveScope.Specific:
                console.log(targetMoveName === currentMoveName);
                return targetMoveName === currentMoveName;
            default:
                return false;
        }
    }

    private static isScaling(logicType: LogicType): boolean {
        switch (logicType) {
            case LogicType.SingleStatScaling:
            case LogicType.TotalStatScaling:
            case LogicType.HPScaling:
            case LogicType.GaugeScaling:
            case LogicType.MasterPassive:
            case LogicType.TeamWorkPassive:
            case LogicType.ArcSuitPassive:
                return true;
            default:
                return false;
        }
    }

    private static getScalingMultiplier(
        cond: PassiveCondition,
        scope: MoveScope,
        env: CalcEnvironment,
        boost: PassiveBoost,
        theme: ThemeContext,
    ): number {
        let value = 0;
        switch (cond.logic) {
            case LogicType.SingleStatScaling: // 可能有多项，以_分割
                const stats = cond.detail.includes("對手")
                    ? env.target.ranks
                    : env.user.ranks;
                const statsList = cond.key.split("_");
                const multiplierTable =
                    scope === "Sync"
                        ? SINGLE_STAT_SYNC_MULTIPLIERS
                        : SINGLE_STAT_MOVE_MULTIPLIERS;
                statsList.forEach((statName) => {
                    const statKey = getStatKeyByStatCNname(statName);
                    const rankValue = stats[statKey];
                    let effectiveRank = 0;
                    if (cond.direction?.includes("下降") && rankValue < 0) {
                        effectiveRank = Math.abs(rankValue);
                    } else if (
                        cond.direction?.includes("提升") &&
                        rankValue > 0
                    ) {
                        effectiveRank = rankValue;
                    }
                    const safeIndex = Math.min(effectiveRank, 6);

                    value += multiplierTable[safeIndex];
                });
                return value;

            case LogicType.TotalStatScaling:
                const totalStats = cond.detail.includes("對手")
                    ? env.target.ranks
                    : env.user.ranks;
                const isStatLow = cond.direction?.includes("下降");
                let totalRank = 0;
                statsList.forEach((statName) => {
                    const totalStatKey = getStatKeyByStatCNname(statName);
                    const totalRankValue = totalStats[totalStatKey];
                    if (isStatLow) {
                        totalRank +=
                            totalRankValue < 0 ? Math.abs(totalRankValue) : 0;
                    } else {
                        totalRank += totalRankValue < 0 ? 0 : totalRankValue;
                    }
                });
                if (scope === "Sync") {
                    const safeIndex = Math.min(
                        totalRank,
                        TOTAL_STAT_SYNC_MULTIPLIERS.length - 1
                    );
                    value = TOTAL_STAT_SYNC_MULTIPLIERS[safeIndex];
                } else {
                    const safeIndex = Math.min(
                        totalRank,
                        TOTAL_STAT_MOVE_MULTIPLIERS.length - 1
                    );
                    value = TOTAL_STAT_MOVE_MULTIPLIERS[safeIndex];
                }
                return value;

            case LogicType.GaugeScaling:
                if (scope === "Sync") {
                    return GAUGE_SYNC_MULTIPLIERS[env.settings.gauge] ?? 0;
                } else {
                    return env.settings.gauge * boost.value * 0.01;
                }

            case LogicType.HPScaling:
                const hpPercent = cond.detail.includes("對手")
                    ? env.target.hpPercent
                    : env.user.hpPercent;
                const factor = cond.detail.includes("對手") ? 0.1 : 0.05;
                const thresholdTable = cond.direction?.includes("下降")
                    ? HP_LESS_THRESHOLD
                    : HP_MORE_THRESHOLD;
                let threshold = 0;
                if (hpPercent === 100) {
                    threshold = thresholdTable[0];
                } else if (hpPercent <= 99 && hpPercent >= 51) {
                    threshold = thresholdTable[1];
                } else if (hpPercent <= 50 && hpPercent >= 34) {
                    threshold = thresholdTable[2];
                } else {
                    threshold = thresholdTable[3];
                }
                const rawValue = (boost.value || 0) * factor * threshold;
                value = Math.ceil(rawValue * 100) / 100;

                return value;

            case LogicType.TeamWorkPassive:
            case LogicType.MasterPassive:
            case LogicType.ArcSuitPassive:
                const count = theme.tagCounts[cond.key] || 0;
                value = (boost.baseValue || 0.0) + (count - 1) * boost.value;

                console.log(`value:${value}`);
                return value;
        }

        return 0;
    }

    private static checkCondition(
        cond: PassiveCondition,
        env: CalcEnvironment,
        moveType: number,
        moveTag: string,
        conds?: PassiveCondition[]
    ): boolean {
        switch (cond.logic) {
            // 直接返回
            case LogicType.Direct || LogicType.GaugeCost:
                return true;

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

            case LogicType.GaugeSpeedBoostOn:
                return env.gaugeSpeedBoost;

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

            case LogicType.AllStatNotInHigh:
                const allstats = cond.detail.includes("對手")
                    ? env.target.ranks
                    : env.user.ranks;
                return Object.values(allstats)
                    .filter((value) => typeof value === "number")
                    .every((value) => value <= 0);

            case LogicType.AnyStatInLow:
                const anystats = cond.detail.includes("對手")
                    ? env.target.ranks
                    : env.user.ranks;
                return Object.values(anystats)
                    .filter((value) => typeof value === "number")
                    .some((value) => value < 0);

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
                return moveTag === "反衝";

            case LogicType.MoveType:
                const typeName = getTypeCNnameByTypeIndex(moveType);
                return cond.key.includes(typeName);

            case LogicType.Berry:
                return env.settings.berry === 0;

            // 复合类型
            case LogicType.Compound:
                if (!conds || conds.length === 0) return true;
                return conds.every((subCond) =>
                    this.checkCondition(subCond, env, moveType, moveTag)
                );
        }
        return false;
    }
}
