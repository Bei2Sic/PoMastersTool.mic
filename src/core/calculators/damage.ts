// core/calculator/DamageEngine.ts
import { STATS } from "@/constances/battle";
import {
    ATK_CIRCLE_MULTIPLIERS,
    DEF_CIRCLE_MULTIPLIERS,
    GAUGE_SYNC_MULTIPLIERS,
    GENERAL_RANK_MULTIPLIERS,
    HP_LESS_THRESHOLD,
    HP_MORE_THRESHOLD,
    REBUFF_MULTIPLIERS,
    SINGLE_STAT_MOVE_MULTIPLIERS,
    SINGLE_STAT_SYNC_MULTIPLIERS,
    SPEED_RANK_MULTIPLIERS,
    TARGET_SCOPE_MULTIPLIERS,
    TOTAL_STAT_MOVE_MULTIPLIERS,
    TOTAL_STAT_SYNC_MULTIPLIERS,
} from "@/constances/rate";
import {
    getStatKeyByStatCnName,
    getTypeCnNameByTypeIndex,
    getTypeIndexByCnName,
    getTypeSpecialNameByTypeIndex,
} from "@/core/exporter/map";
import {
    ActiveMultiplier,
    CalcEnvironment,
    Condition,
    ExtraLogic,
    LogicType,
    MoveScope,
    ThemeContext,
} from "@/types/calculator";
import {
    CircleCategory,
    HindranceType,
    PokemonStats,
    PokemonType,
    RegionType,
} from "@/types/conditions";
import { DEFAULT_HANDLER, MoveSkillModel } from "@/types/moveModel";
import { PassiveBoost, PassiveSkillModel } from "@/types/passiveModel";
import { MoveBase } from "@/types/syncModel";

export class DamageEngine {
    // 獲取屬性替換的被動（一般唯一）
    static getTypeShiftPassive(
        move: MoveBase,
        passives: PassiveSkillModel[]
    ): number {
        // 一般屬性的才會變化，先判斷是不是一般屬性的
        if (getTypeCnNameByTypeIndex(move.type) !== "一般") {
            return move.type;
        }

        const shiftPassive = passives.find(
            (p) =>
                p.condition.logic === LogicType.NoEffect &&
                p.condition.extra === ExtraLogic.TypeShift
        );

        if (shiftPassive) {
            const targetTypeKey = shiftPassive.condition.key;
            const newTypeIndex = getTypeIndexByCnName(targetTypeKey);
            return newTypeIndex;
        }

        return move.type;
    }

    // 被动技能处理
    static getPassiveMultipliers(
        move: MoveBase,
        scope: MoveScope,
        passives: PassiveSkillModel[],
        context: CalcEnvironment,
        theme: ThemeContext
    ): ActiveMultiplier[] {
        const result: ActiveMultiplier[] = [];

        for (const passive of passives) {
            // 跳過白值類
            if (passive.statBoost.isStatBoost) continue;
            if (passive.condition.logic === LogicType.NoEffect) continue;

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
                const scalingValue = this.getPassiveScalingMultiplier(
                    passive.condition,
                    scope,
                    context,
                    passive.boost,
                    theme
                );
                value = scalingValue;
            } else {
                if (
                    !this.checkCondition(
                        passive.condition,
                        context,
                        move.type,
                        move.tags,
                        passive.conditions,
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

    static resolvePassiveSum(activePassives: ActiveMultiplier[]): number {
        const totalPercent = activePassives.reduce((sum, item) => {
            if (item.logic !== LogicType.GaugeCost) {
                return sum + item.value;
            }
            return sum;
        }, 0);

        return totalPercent;
    }

    static resolvePassiveIsGaugeCost(
        activePassives: ActiveMultiplier[]
    ): number {
        const totalPercent = activePassives.reduce((sum, item) => {
            if (item.logic === LogicType.GaugeCost) {
                return sum + item.value;
            }
            return sum;
        }, 0);

        return totalPercent;
    }

    static resolveBoosts(
        scope: MoveScope,
        category: number,
        context: CalcEnvironment
    ): number {
        let value = 0;
        switch (scope) {
            case MoveScope.Sync:
                const syncBoost = context.user.boosts.sync;
                value = syncBoost * 10;
                return value;
            case MoveScope.Move:
                const moveBoost =
                    category === 1
                        ? context.user.boosts.physical
                        : context.user.boosts.special;
                value = moveBoost * 40;
                return value;
            default:
                return value;
        }
    }

    static resolveConfigBoosts(
        scope: MoveScope,
        category: number,
        context: CalcEnvironment
    ): number {
        let value = 0;
        switch (scope) {
            case MoveScope.Sync:
                const syncBoost = context.config.sync;
                value = syncBoost;
                return value;
            case MoveScope.Move:
                const moveBoost =
                    category === 1
                        ? context.config.physical
                        : context.config.special;
                value = moveBoost;
                return value;
            default:
                return value;
        }
    }

    static resolveMoveMultiplier(
        move: MoveBase,
        moveSkill: MoveSkillModel,
        context: CalcEnvironment
    ): number {
        //  默認技能模型沒有名字
        if (moveSkill.name !== move.name) {
            return 100;
        }

        if (!moveSkill.condition?.logic) {
            return 100;
        }

        // 判斷是不是特殊倍率類型
        if (moveSkill.condition.logic === LogicType.SpecialHandler) {
            const handler = moveSkill.handler ?? DEFAULT_HANDLER;
            return handler(context, move);
        }

        // 判断是否是 scaling类
        const isScaling = this.isScaling(moveSkill.condition.logic);
        let value = moveSkill?.boost || 200;
        if (isScaling) {
            const scalingValue = this.getSyncMoveScalingMultiplier(
                moveSkill.condition,
                context
            );
            value = scalingValue * 100;
        } else {
            if (
                !this.checkCondition(
                    moveSkill.condition,
                    context,
                    move.type,
                    move.tags,
                )
            ) {
                value = 100;
            }
        }

        return value;
    }

    static resolveEnvMultipliers(
        move: MoveBase,
        scope: MoveScope,
        context: CalcEnvironment
    ): number {
        let boost = 1;
        // 轉化下屬性
        const typeCnName = getTypeCnNameByTypeIndex(move.type);
        const typeSpecialName = getTypeSpecialNameByTypeIndex(move.type);

        // 场地/天气/领域
        switch (typeCnName) {
            case "火":
                if (context.weather === "晴天") {
                    if (context.isEXWeather) {
                        boost *= 3.0;
                    } else {
                        boost *= 1.5;
                    }
                }
                break;
            case "水":
                if (context.weather === "下雨") {
                    if (context.isEXWeather) {
                        boost *= 3.0;
                    } else {
                        boost *= 1.5;
                    }
                }
                break;
            default:
                if (context.terrain.includes(typeSpecialName)) {
                    if (context.isEXTerrain) {
                        boost *= 3.0;
                    } else {
                        boost *= 1.5;
                    }
                } else if (context.zone.includes(typeSpecialName)) {
                    if (context.isEXZone) {
                        boost *= 3.0;
                    } else {
                        boost *= 1.5;
                    }
                }
        }

        console.log(`場地後:${boost}`);

        // 鬥陣(小招和拍招才可以享受，極巨化不行)
        if ([MoveScope.Move, MoveScope.Sync].includes(scope)) {
            const battleCircles = context.battleCircles;
            Object.values(battleCircles).forEach((regionState) => {
                const level = regionState.level;
                if (move.category === 1) {
                    if (regionState.actives["物理"] && level > 0) {
                        boost *= ATK_CIRCLE_MULTIPLIERS[level];
                    }
                }
                if (move.category === 2) {
                    if (regionState.actives["特殊"] && level > 0) {
                        boost *= ATK_CIRCLE_MULTIPLIERS[level];
                    }
                }
                if (regionState.actives["防禦"] && level > 0) {
                    boost *= DEF_CIRCLE_MULTIPLIERS[level];
                }
            });
        }

        console.log(`鬥陣後:${boost}`);

        // 抗性
        const rebuffRank = context.target.typeRebuffs[typeCnName];
        const rebuffBoost = REBUFF_MULTIPLIERS[Math.abs(rebuffRank)];
        boost *= rebuffBoost;

        console.log(`減抗後:${boost}`);

        // 效果絕佳 & 效果絕佳强化
        if (context.settings.effectiveType === typeCnName) {
            boost *= 2.0;
            if (context.settings.isSuperEffective) {
                boost *= 1.5;
            }
        }

        console.log(`效果絕佳後:${boost}`);

        // 擊中要害
        if (context.settings.isCritical) {
            boost *= 1.5;
        }

        console.log(`擊中要害後:${boost}`);

        // 目標
        const scopeBoost =
            TARGET_SCOPE_MULTIPLIERS[context.settings.targetScope];
        boost *= scopeBoost;

        console.log(`計算衰減後:${boost}`);

        // 气魄
        if (context.user.syncBuff != 0) {
            boost *= 1 + context.user.syncBuff * 0.5;
        }
        console.log(`气魄数:${context.user.syncBuff}`);
        console.log(`氣魄後:${boost}`);

        // 爆擊狀態
        if (scope === MoveScope.Sync) {
            if (context.target.crtiBuffs["拍招爆傷"]) {
                boost *= 1.5;
            }
        } else if (scope === MoveScope.Move) {
            if (context.target.crtiBuffs["物理爆傷"] && move.category === 1) {
                boost *= 1.5;
            } else if (
                context.target.crtiBuffs["特殊爆傷"] &&
                move.category === 2
            ) {
                boost *= 1.5;
            }
        }

        console.log(`爆擊狀態後:${boost}`);

        // 不用处理直接返回
        return boost;
    }

    // 获取白值加成
    static resolveStatBoost(
        passives: PassiveSkillModel[],
        context: CalcEnvironment,
        stat: keyof PokemonStats,
        ignoreBurn?: boolean
    ): number {
        let boost = 100;
        // 被动白值变化
        passives.forEach((passive) => {
            if (passive.statBoost.isStatBoost) {
                // 判断条件是否达成
                if (this.checkCondition(passive.condition, context)) {
                    passive.statBoost.stats.forEach((s) => {
                        const statKey = getStatKeyByStatCnName(s);
                        if (statKey === stat) {
                            boost *= passive.statBoost.value; // (eg: *1.5)
                        }
                    });
                }
            }
        });

        // 获取对应白值属性的变化, 倍率查表
        // todo: 增加白值属性抗性
        const currentRank = context.user.ranks[stat] || 0;
        const rankIndex = currentRank + 6;
        let rankMultiplier = 1.0;
        if (stat === "spe") {
            rankMultiplier = SPEED_RANK_MULTIPLIERS[rankIndex];
        } else {
            rankMultiplier = GENERAL_RANK_MULTIPLIERS[rankIndex];
        }
        boost *= rankMultiplier;

        // todo: 增加灼傷抗性
        // 灼伤影响(只针对攻击) (*0.8)
        if (stat === "atk") {
            if (context.user.abnormal === "灼傷" && !ignoreBurn) {
                console.log("灼伤效果触发");
                boost *= 0.8;
            }
        }

        return boost;
    }

    // 计算目标白值
    static resolveTargetStatValue(
        context: CalcEnvironment,
        stat: keyof PokemonStats
    ): number {
        let value = context.target.stats[stat] || 0;
        let boost = 100;

        // todo: 增加白值属性抗性, 现在先用 全种类抵抗5
        const mitigation = 0.5;
        let currentRank = context.target.ranks[stat] || 0;

        // 如果命中要害, 无视对手的提升
        if (context.settings.isCritical && currentRank > 0) {
            currentRank = 0;
        }

        const rankIndex = currentRank + 6;
        let rankMultiplier = 1.0;
        if (stat === "spe") {
            rankMultiplier = SPEED_RANK_MULTIPLIERS[rankIndex];
        } else {
            rankMultiplier = GENERAL_RANK_MULTIPLIERS[rankIndex];
        }

        if (currentRank < 0) {
            // 下降
            rankMultiplier = 1.0 - (1.0 - rankMultiplier) * (1 - mitigation);
        }

        boost *= rankMultiplier;

        value = Math.floor((value * boost) / 100);

        return value;
    }

    private static isScopeMatch(
        scope: MoveScope,
        currentScope: MoveScope,
        category: number,
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
                return (
                    currentScope === MoveScope.Move ||
                    currentScope === MoveScope.Max
                );
            case MoveScope.MaxAndSync:
                return (
                    currentScope === MoveScope.Sync ||
                    currentScope === MoveScope.Max
                );
            case MoveScope.MoveAndSync:
                return (
                    currentScope === MoveScope.Move ||
                    currentScope === MoveScope.Sync
                );
            case MoveScope.MovePhysical:
                return currentScope === MoveScope.Move && category === 1;
            case MoveScope.MoveSpecial:
                return currentScope === MoveScope.Move && category === 2;
            case MoveScope.Specific:
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

    private static checkCondition(
        cond: Condition,
        env: CalcEnvironment,
        moveType?: number,
        moveTag?: string,
        conds?: Condition[]
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
                const parts = cond.key.split("_");
                if (parts.length !== 2) return false;

                const [circleRegion, circleCategory] = parts;
                const region = circleRegion as RegionType;
                const category = circleCategory as CircleCategory;
                return env.battleCircles[region][category].isActive;

            case LogicType.GaugeSpeedBoostOn:
                return env.gaugeAcceleration;

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
                    const rebuffRank = rebuffs[rebuff as PokemonType];
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
                const statKey = getStatKeyByStatCnName(cond.key);
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

            case LogicType.HPHalf:
                const hpPercent = cond.detail.includes("對手")
                    ? env.target.hpPercent
                    : env.user.hpPercent;
                if (cond.direction?.includes("以上")) {
                    return hpPercent > 50;
                } else {
                    return hpPercent < 50;
                }

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
                const typeName = getTypeCnNameByTypeIndex(moveType);
                return cond.key.includes(typeName);

            case LogicType.SyncBuffs:
                const syncBuffs = cond.detail.includes("對手")
                    ? env.target.syncBuff
                    : env.user.syncBuff;
                if (cond.direction?.includes("充滿")) {
                    return syncBuffs > 0;
                } else {
                    return syncBuffs === 0;
                }

            case LogicType.Berry:
                return env.settings.berry === 0;

            // 复合类型
            case LogicType.Compound:
                if (!conds || conds.length === 0) return true;
                return conds.every((subCond) => {
                    this.checkCondition(subCond, env, moveType, moveTag)
                });

        }
        return false;
    }

    private static getPassiveScalingMultiplier(
        cond: Condition,
        scope: MoveScope,
        env: CalcEnvironment,
        boost: PassiveBoost,
        theme: ThemeContext
    ): number {
        let value = 0;
        switch (cond.logic) {
            case LogicType.SingleStatScaling: // 可能有多项，以_分割
                const stats = cond.detail.includes("對手")
                    ? env.target.ranks
                    : env.user.ranks;
                const statsList = cond.key.split("_");
                const multiplierTable =
                    scope === MoveScope.Sync
                        ? SINGLE_STAT_SYNC_MULTIPLIERS
                        : SINGLE_STAT_MOVE_MULTIPLIERS;
                statsList.forEach((statName) => {
                    const statKey = getStatKeyByStatCnName(statName);
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
                    const singleSafeIndex = Math.min(effectiveRank, 6);

                    value += multiplierTable[singleSafeIndex];
                });
                return value;

            case LogicType.TotalStatScaling:
                const totalStats = cond.detail.includes("對手")
                    ? env.target.ranks
                    : env.user.ranks;
                const isStatLow = cond.direction?.includes("下降");
                let totalRank = 0;
                STATS.forEach((statName) => {
                    const totalStatKey = getStatKeyByStatCnName(statName);
                    const totalRankValue = totalStats[totalStatKey];
                    if (isStatLow) {
                        totalRank +=
                            totalRankValue < 0 ? Math.abs(totalRankValue) : 0;
                    } else {
                        totalRank += totalRankValue < 0 ? 0 : totalRankValue;
                    }
                });
                if (scope === MoveScope.Sync) {
                    const totalSafeIndex = Math.min(
                        totalRank,
                        TOTAL_STAT_SYNC_MULTIPLIERS.length - 1
                    );
                    value = TOTAL_STAT_SYNC_MULTIPLIERS[totalSafeIndex];
                } else {
                    const totalSafeIndex = Math.min(
                        totalRank,
                        TOTAL_STAT_MOVE_MULTIPLIERS.length - 1
                    );
                    value = TOTAL_STAT_MOVE_MULTIPLIERS[totalSafeIndex];
                }
                return value;

            case LogicType.GaugeScaling:
                if (scope === MoveScope.Sync) {
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
                value = (boost.baseValue ?? 0.0) + (count - 1) * boost.value;

                console.log(`value:${value}`);
                return value;
        }

        return 0;
    }

    // 動態的只針對拍組招式
    private static getSyncMoveScalingMultiplier(
        cond: Condition,
        env: CalcEnvironment
    ): number {
        let value = 0;
        switch (cond.logic) {
            case LogicType.SingleStatScaling: // 只會有單項?後續可能有多項嗎
                const stats = cond.detail.includes("對手")
                    ? env.target.ranks
                    : env.user.ranks;
                const statKey = getStatKeyByStatCnName(cond.key);
                const rankValue = stats[statKey];
                let effectiveRank = 0;
                if (cond.direction?.includes("下降") && rankValue < 0) {
                    effectiveRank = Math.abs(rankValue);
                } else if (cond.direction?.includes("提升") && rankValue > 0) {
                    effectiveRank = rankValue;
                }
                const singleSafeIndex = Math.min(effectiveRank, 6);
                value = SINGLE_STAT_SYNC_MULTIPLIERS[singleSafeIndex] + 1.0;
                return value;

            case LogicType.TotalStatScaling:
                const totalStats = cond.detail.includes("對手")
                    ? env.target.ranks
                    : env.user.ranks;
                const isStatLow = cond.direction?.includes("下降");
                let totalRank = 0;
                STATS.forEach((statName) => {
                    const totalStatKey = getStatKeyByStatCnName(statName);
                    const totalRankValue = totalStats[totalStatKey];
                    if (isStatLow) {
                        totalRank +=
                            totalRankValue < 0 ? Math.abs(totalRankValue) : 0;
                    } else {
                        totalRank += totalRankValue < 0 ? 0 : totalRankValue;
                    }
                });
                const totalSafeIndex = Math.min(
                    totalRank,
                    TOTAL_STAT_SYNC_MULTIPLIERS.length - 1
                );
                value = TOTAL_STAT_SYNC_MULTIPLIERS[totalSafeIndex] + 1.0;

                return value;
        }

        return 1.0;
    }
}
