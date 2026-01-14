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
    EffectLogic,
    ExtraLogic,
    LogicType,
    MoveScope,
    SkillModel,
    ThemeContext,
} from "@/types/calculator";
import {
    CircleCategory,
    HindranceType,
    PokemonStats,
    PokemonType,
    RegionType,
} from "@/types/conditions";
import { MOVE_DEFAULT_HANDLER, MoveSkillModel } from "@/types/moveModel";
import {
    DEFAULT_SOURCE_INDEX,
    PASSIVE_DEFAULT_HANDLER,
    PassiveBoost,
    PassiveSkillModel,
} from "@/types/passiveModel";
import { MoveBase } from "@/types/syncModel";

export class DamageEngine {
    // 獲取一般屬性替換的被動（一般唯一）
    static getNormalTypeShiftEffect(
        move: MoveBase,
        passives: SkillModel[]
    ): number {
        // 一般屬性的才會變化，先判斷是不是一般屬性的
        if (getTypeCnNameByTypeIndex(move.type) !== "一般") {
            return move.type;
        }

        const shiftPassive = passives.find(
            (p) =>
                p.effect === EffectLogic.ExtraType &&
                p?.extra.logic === ExtraLogic.NormalTypeShift
        );

        if (shiftPassive) {
            // todo: 后续可以在这里增加匹配条件的（如果有的话）

            const targetTypeKey = shiftPassive.extra.key;
            const newTypeIndex = getTypeIndexByCnName(targetTypeKey);
            return newTypeIndex;
        }

        return move.type;
    }

    // 獲取屬性替換的被動（一般唯一）
    static getTypeShiftEffect(move: MoveBase, passives: SkillModel[]): number {
        if (!move) {
            return 1;
        }

        const shiftPassive = passives.find(
            (p) =>
                p.effect === EffectLogic.ExtraType &&
                p?.extra.logic === ExtraLogic.TypeShift
        );

        if (shiftPassive) {
            const targetTypeKey = shiftPassive.extra.key;
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
            // 非伤害计算类跳过
            if (passive.effect !== EffectLogic.PowerBoost) continue;
            // 跳過白值類
            // if (passive.statBoost.isStatBoost) continue;
            // if (passive.condition.logic === LogicType.NotDamage) continue;

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
            const isSpecialHandler = this.isSpecialHandler(
                passive.condition.logic
            );
            let value = pm.value;
            if (isScaling) {
                const scalingValue = this.getPassiveScalingMultiplier(
                    passive.condition,
                    passive.sourceIndex ?? DEFAULT_SOURCE_INDEX,
                    scope,
                    context,
                    passive.boost,
                    theme
                );
                value = scalingValue;
            } else if (isSpecialHandler) {
                const handler = passive.handler ?? PASSIVE_DEFAULT_HANDLER;
                value = handler(context, passive.sourceIndex ?? DEFAULT_SOURCE_INDEX);
            } else {
                if (
                    !this.checkCondition(
                        passive.condition,
                        passive.sourceIndex ?? DEFAULT_SOURCE_INDEX,
                        context,
                        move.type,
                        move.tags,
                        passive.conditions
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
            if (
                item.logic !== LogicType.GaugeCost &&
                item.logic !== LogicType.SpecialMulti
            ) {
                return sum + item.value;
            }
            return sum;
        }, 0);

        return totalPercent;
    }

    static resolvePassiveIsMulti(activePassives: ActiveMultiplier[]): number {
        const totalPercent = activePassives.reduce((sum, item) => {
            if (
                item.logic === LogicType.GaugeCost ||
                item.logic === LogicType.SpecialMulti
            ) {
                return (sum *= item.value / 100);
            }
            return sum;
        }, 1);

        return totalPercent;
    }

    // 技能威力增强....
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

    // 配置增强.....
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

    // 主动技能招式倍率.....
    static resolveMoveMultiplier(
        move: MoveBase,
        moveSkills: MoveSkillModel[],
        context: CalcEnvironment
    ): number {
        // 招式倍率增加一般只有一个
        const moveSkill = moveSkills.find(
            (s) => s.name === move.name && s.effect === EffectLogic.PowerBoost // 假设你的枚举值是这个
        );

        if (!moveSkill || !moveSkill.condition?.logic) {
            return 100;
        }

        // 判斷是不是特殊倍率類型
        if (this.isSpecialHandler(moveSkill.condition.logic)) {
            const handler = moveSkill.handler ?? MOVE_DEFAULT_HANDLER;
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
            // 主动技能都是计算拍组本身，所以使用 DEFAULT_SOURCE_INDEX
            if (
                !this.checkCondition(
                    moveSkill.condition,
                    DEFAULT_SOURCE_INDEX,
                    context,
                    move.type,
                    move.tags
                )
            ) {
                value = 100;
            }
        }

        return value;
    }

    // 环境倍率.....
    static resolveEnvMultipliers(
        move: MoveBase,
        scope: MoveScope,
        context: CalcEnvironment,
        isNoneDecay: boolean
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

        // 抗性
        const rebuffRank = context.target.typeRebuffs[typeCnName];
        const rebuffBoost = REBUFF_MULTIPLIERS[Math.abs(rebuffRank)];
        boost *= rebuffBoost;

        // 效果絕佳 & 效果絕佳强化
        if (context.settings.effectiveType === typeCnName) {
            boost *= 2.0;
            if (context.settings.isSuperEffective) {
                boost *= 1.5;
            }
        }

        // 擊中要害
        if (context.settings.isCritical) {
            boost *= 1.5;
        }

        // 目標
        if (!isNoneDecay) {
            const scopeBoost =
                TARGET_SCOPE_MULTIPLIERS[context.settings.targetScope];
            boost *= scopeBoost;
        }

        // 气魄
        if (context.user.syncBuff != 0) {
            boost *= 1 + context.user.syncBuff * 0.5;
        }

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

        // 不用处理直接返回
        return boost;
    }

    // 装备倍率....
    static resolveGearMultipliers(
        scope: MoveScope,
        context: CalcEnvironment
    ): number {
        let boost = 1;
        // 裝備加成（乘算）
        if (scope === MoveScope.Move) {
            boost *= 1 + context.config.gearMove / 100;
        } else if (scope === MoveScope.Sync) {
            boost *= 1 + context.config.gearSync / 100;
        }
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
            if (passive.effect === EffectLogic.StatBoost) {
                // 判断条件是否达成
                if (
                    this.checkCondition(
                        passive.condition,
                        DEFAULT_SOURCE_INDEX,
                        context
                    )
                ) {
                    passive?.statBoost.stats.forEach((s) => {
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

        const mitigation = context.target.statLowerReduction / 10;
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

    // 获取是否有烧伤无效被动或技能效果
    static hasBurnUseless(
        passives: PassiveSkillModel[],
        moveSkills: MoveSkillModel[],
        context: CalcEnvironment
    ): boolean {
        const passiveHas = passives.some(
            (passive) =>
                // 这里需要检测下条件是否生效
                // 目前应该没有 Compound 类别的吧?
                passive.effect === EffectLogic.ExtraType &&
                passive?.extra.logic === ExtraLogic.BurnUseless &&
                this.checkCondition(
                    passive.condition,
                    DEFAULT_SOURCE_INDEX,
                    context
                )
        );
        const moveHas = moveSkills.some(
            (move) =>
                move.effect === EffectLogic.ExtraType &&
                move?.extra.logic === ExtraLogic.BurnUseless
        );
        return passiveHas || moveHas;
    }

    // 获取是否有无衰减效果
    static hasNonDecay(
        move: MoveBase,
        scope: MoveScope,
        passives: PassiveSkillModel[],
        moveSkills: MoveSkillModel[]
    ): boolean {
        const passiveHas = passives.some(
            (passive) =>
                passive.effect === EffectLogic.ExtraType &&
                passive?.extra.logic === ExtraLogic.NonDecay &&
                this.isScopeMatch(
                    passive.boost.scope,
                    scope,
                    move.category,
                    move.name
                )
        );
        const moveHas = moveSkills.some(
            (move) =>
                move.effect === EffectLogic.ExtraType &&
                move?.extra.logic === ExtraLogic.NonDecay
        );
        return passiveHas || moveHas;
    }

    // 获取是否有无衰减效果
    static hasUseDef(moveSkills: MoveSkillModel[]): boolean {
        return moveSkills.some(
            (move) =>
                move.effect === EffectLogic.ExtraType &&
                move?.extra.logic === ExtraLogic.UseDef
        );
    }

    // 主动技能也有技能替换效果
    static hasTypeShift(
        moveSkills: MoveSkillModel[],
        context: CalcEnvironment
    ): boolean {
        return moveSkills.some(
            (move) =>
                // 技能如果是通用普通技能沒有condition
                this.checkCondition(
                    move?.condition,
                    DEFAULT_SOURCE_INDEX,
                    context
                ) &&
                move.effect === EffectLogic.ExtraType &&
                move?.extra.logic === ExtraLogic.TypeShift
        );
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
            case LogicType.BoostScaling:
            case LogicType.MasterPassive:
            case LogicType.TeamWorkPassive:
            case LogicType.ArcSuitPassive:
                return true;
            default:
                return false;
        }
    }

    private static isSpecialHandler(logicType: LogicType): boolean {
        switch (logicType) {
            case LogicType.SpecialHandler:
                return true;
            default:
                return false;
        }
    }

    private static checkCondition(
        cond: Condition,
        sourceIndex: number,
        env: CalcEnvironment,
        moveType?: number,
        moveTag?: string,
        conds?: Condition[]
    ): boolean {
        // 安全操作
        if (!cond) {
            return false;
        }

        // 先确定被动关注对象
        // 默认情况下，是当前拍组本身
        let effectiveUser = env.user;
        if (sourceIndex !== DEFAULT_SOURCE_INDEX) {
            // 安全检查：确保 env.teammates 存在，且对应索引有数据
            const teammate = env.teammates?.[sourceIndex];
            if (teammate) {
                // 切换上下文
                effectiveUser = teammate;
            } else {
                // 边界情况：被动来源是队友，但队友数据为空（可能是空槽位）
                // 这种情况下条件无法满足，直接返回 false
                return false;
            }
        }

        // 辅助函数：根据条件描述判断目标是“对手”还是“有效使用者”
        // 很多条件里会有 "对处于xx状态的对手" 这种描述
        const getSubject = (detail: string = "") => {
            return detail.includes("對手") ? env.target : effectiveUser;
        };

        switch (cond.logic) {
            // 直接返回
            case LogicType.Direct:
            case LogicType.GaugeCost:
            case LogicType.SpecialMulti:
                return true;

            case LogicType.DamageField:
                return cond.key.includes(env.target.damageField);

            case LogicType.Terrain:
                return cond.key.includes(env.terrain);

            case LogicType.Zone:
                return cond.key.includes(env.zone);

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
                // const abnormal = cond.detail.includes("對手")
                //     ? env.target.abnormal
                //     : env.user.abnormal;
                const abnormal = getSubject(cond.detail).abnormal;
                if (cond.key === "劇毒" && abnormal === "中毒") {
                    return true;
                }
                return cond.key.includes(abnormal);

            case LogicType.Hindrance:
                // const hindrance = cond.detail.includes("對手")
                //     ? env.target.hindrance
                //     : env.user.hindrance;
                const hindrance = getSubject(cond.detail).hindrance;
                return Object.keys(hindrance).some((status) => {
                    const isActive = hindrance[status as HindranceType];
                    if (!isActive) return false;

                    return cond.key.includes(status);
                });

            case LogicType.Rebuff:
                const rebuffs = env.target.typeRebuffs;

                if (cond.key == "任意") {
                    return Object.values(rebuffs).some((rank) => rank < 0);
                } else {
                    const targetRank = rebuffs[cond.key as PokemonType] || 0;
                    return targetRank < 0;
                }

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

            case LogicType.BattleCircleActive:
                return Object.values(env.battleCircles).some((regionState) =>
                    Object.values(regionState.actives).some(
                        (isActive) => isActive === true
                    )
                );

            case LogicType.StatChange:
                // const stats = cond.detail.includes("對手")
                //     ? env.target.ranks
                //     : env.user.ranks;
                const stats = getSubject(cond.detail).ranks;
                const statKey = getStatKeyByStatCnName(cond.key);
                const rankValue = stats[statKey];
                if (cond.direction.includes("下降")) {
                    return rankValue < 0;
                } else {
                    return rankValue > 0;
                }

            case LogicType.AbnormalActive:
                // const activeAbnormal = cond.detail.includes("對手")
                //     ? env.target.abnormal
                //     : env.user.abnormal;
                const activeAbnormal = getSubject(cond.detail).abnormal;
                return activeAbnormal !== "無";

            case LogicType.HindranceActive:
                // const activeHindrance = cond.detail.includes("對手")
                //     ? env.target.hindrance
                //     : env.user.hindrance;
                const activeHindrance = getSubject(cond.detail).hindrance;
                return Object.keys(activeHindrance).some((status) => {
                    const isActive = hindrance[status as HindranceType];
                    if (isActive) return true;
                });

            case LogicType.AllStatNotInHigh:
                // const allstats = cond.detail.includes("對手")
                //     ? env.target.ranks
                //     : env.user.ranks;
                const allstats = getSubject(cond.detail).ranks;
                return Object.values(allstats)
                    .filter((value) => typeof value === "number")
                    .every((value) => value <= 0);

            case LogicType.AnyStatInLow:
                // const anystats = cond.detail.includes("對手")
                //     ? env.target.ranks
                //     : env.user.ranks;
                const anystats = getSubject(cond.detail).ranks;
                return Object.values(anystats)
                    .filter((value) => typeof value === "number")
                    .some((value) => value < 0);

            case LogicType.HPLow:
                // return env.user.currentHPPercent <= 20;
                return effectiveUser.currentHPPercent <= 20;

            case LogicType.HPHalf:
                // const hpPercent = cond.detail.includes("對手")
                //     ? env.target.currentHPPercent
                //     : env.user.currentHPPercent;
                const hpPercent = getSubject(cond.detail).currentHPPercent;
                if (cond.direction?.includes("以上")) {
                    return hpPercent > 50;
                } else {
                    return hpPercent < 50;
                }

            case LogicType.HPDecreased:
                return effectiveUser.currentHPPercent < 100;

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
                // const syncBuffs = cond.detail.includes("對手")
                //     ? env.target.syncBuff
                //     : env.user.syncBuff;
                const syncBuffs = getSubject(cond.detail).syncBuff;
                if (cond.direction?.includes("充滿")) {
                    return syncBuffs > 0;
                } else {
                    return syncBuffs === 0;
                }

            case LogicType.Berry:
                return env.settings.berry === 0;

            case LogicType.IsMega:
                return env.special.isMega;

            // 复合类型
            case LogicType.Compound:
                if (!conds || conds.length === 0) return true;
                return conds.every((subCond) => {
                    return this.checkCondition(
                        subCond,
                        sourceIndex,
                        env,
                        moveType,
                        moveTag
                    );
                });

            // 复合状态
            case LogicType.MultiStatusActive:
                if (cond?.keys) {
                    if (cond.keys?.abnormal) {
                        // const multiAbnormal = cond.detail.includes("對手")
                        //     ? env.target.abnormal
                        //     : env.user.abnormal;
                        const multiAbnormal = getSubject(cond.detail).abnormal;
                        if (
                            cond.keys.abnormal.includes("劇毒") &&
                            multiAbnormal === "中毒"
                        ) {
                            return true;
                        }
                        if (cond.keys.abnormal.includes(multiAbnormal)) {
                            return true;
                        }
                    }
                    if (cond.keys?.hindrance) {
                        // const multiHindrance = cond.detail.includes("對手")
                        //     ? env.target.hindrance
                        //     : env.user.hindrance;
                        const multiHindrance = getSubject(
                            cond.detail
                        ).hindrance;
                        const t = Object.keys(multiHindrance).some((status) => {
                            const isActive =
                                multiHindrance[status as HindranceType];
                            if (!isActive) return false;

                            return cond.keys.hindrance.includes(status);
                        });
                        return t;
                    }
                }
        }
        return false;
    }

    private static getPassiveScalingMultiplier(
        cond: Condition,
        sourceIndex: number,
        scope: MoveScope,
        env: CalcEnvironment,
        boost: PassiveBoost,
        theme: ThemeContext
    ): number {
        let effectiveUser = env.user;
        if (sourceIndex !== DEFAULT_SOURCE_INDEX) {
            const teammate = env.teammates?.[sourceIndex];
            if (teammate) {
                effectiveUser = teammate;
            } else {
                return 0;
            }
        }
        const getSubject = (detail: string = "") => {
            return detail.includes("對手") ? env.target : effectiveUser;
        };

        let value = 0;
        switch (cond.logic) {
            case LogicType.SingleStatScaling: // 可能有多项，以_分割
                // const stats = cond.detail.includes("對手")
                //     ? env.target.ranks
                //     : env.user.ranks;
                const stats = getSubject(cond.detail).ranks;
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
                // const totalStats = cond.detail.includes("對手")
                //     ? env.target.ranks
                //     : env.user.ranks;
                const totalStats = getSubject(cond.detail).ranks;
                const isStatLow = cond.direction?.includes("下降");
                let totalRank = 0;
                STATS.forEach((statName) => {
                    const totalStatKey = getStatKeyByStatCnName(statName);
                    const totalRankValue =
                        totalStatKey === "hp" ? 0 : totalStats[totalStatKey];
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
                // const hpPercent = cond.detail.includes("對手")
                //     ? env.target.currentHPPercent
                //     : env.user.currentHPPercent;
                const hpPercent = getSubject(cond.detail).currentHPPercent;
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

            case LogicType.BoostScaling:
                switch (cond.key) {
                    case "物理招式威力增強":
                        return boost.value * effectiveUser.boosts.physical;
                    case "特殊招式威力增強":
                        return boost.value * effectiveUser.boosts.special;
                    case "拍組招式威力增強":
                        return boost.value * effectiveUser.boosts.sync;
                    default:
                        return 0;
                }

            case LogicType.TeamWorkPassive:
            case LogicType.MasterPassive:
            case LogicType.ArcSuitPassive:
                console.log(cond.key);
                console.log(theme.tagCounts);
                const count = theme.tagCounts[cond.key] || 0;
                value = (boost.baseValue ?? 0.0) + (count - 1) * boost.value;

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
