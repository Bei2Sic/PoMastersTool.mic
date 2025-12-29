import { PASSIVE_OVERRIDES } from "@/constances/passive";
import { DAMAGE_ROLLS } from "@/constances/rate";
import { DamageEngine } from "@/core/calculators/damage";
import { PowerMoveScope } from "@/core/calculators/power";
import { ThemeContextResolver } from "@/core/calculators/theme";
import { getTypeCnNameByTypeIndex } from "@/core/exporter/map";
import { getFinalMovePower, getFinalStatValue } from "@/core/exporter/syncData";
import { MoveSkillParser } from "@/core/parse/move";
import { PassiveSkillParser } from "@/core/parse/passive";
import { useDamageCalcStore } from "@/stores/damageCalc";
import {
    CalcEnvironment,
    ExtraLogic,
    MoveScope,
    ThemeContext,
} from "@/types/calculator";
import { CircleLevel, RegionType } from "@/types/conditions";
import { MoveBase, Pokemon, Sync } from "@/types/syncModel";
import { computed, Ref, watch } from "vue";

// ... 其他導入
function collectActivePassives(
    sync: Sync,
    formIndex: number
): { name: string; desc: string; passiveName: string }[] {
    const passives: { name: string; desc: string; passiveName: string }[] = [];

    // 1. 本體被動 - 隨 formIndex 變化
    const currentPokemon = sync.rawData.pokemon[formIndex];
    if (currentPokemon && currentPokemon.passives) {
        currentPokemon.passives.forEach((p) => {
            if (PASSIVE_OVERRIDES[p.name]) {
                passives.push({
                    name: p.name,
                    desc: p.description,
                    passiveName: p.name,
                });
                return;
            }

            if (p.detail?.length > 0) {
                p.detail.forEach((detail) => {
                    passives.push({
                        name: detail.name,
                        desc: detail.description,
                        passiveName: p.name,
                    });
                });
            } else {
                passives.push({
                    name: p.name,
                    desc: p.description,
                    passiveName: p.name,
                });
            }
        });
    }

    // 2. 石盤被動 (Grid) - 所有形態共享
    // 除非遊戲有極其特殊的拍組是 Mega 後石盤失效（目前沒有），否則都加進去
    sync.state.gridData.forEach((tile) => {
        if (
            tile.isActive &&
            (tile.color === "#FFC266" || tile.color === "#FF0066")
        ) {
            if (tile.detail?.length > 0) {
                tile.detail.forEach((detail) => {
                    passives.push({
                        name: detail.name,
                        desc: detail.description,
                        passiveName: tile.name,
                    });
                });
            } else {
                passives.push({
                    name: tile.name,
                    desc: tile.description,
                    passiveName: tile.name,
                });
            }
        }
    });

    // 3. 如果超觉醒了，要有超觉醒被动
    if (sync.state.bonusLevel === 10) {
        sync.rawData.specialAwaking.detail.forEach((detail) => {
            passives.push({
                name: detail.name,
                desc: detail.description,
                passiveName: sync.rawData.specialAwaking.name,
            });
        });
    }
    // 4. 潛能餅幹也要計入

    // 5. 队友被动也要计入

    return passives;
}

export function useDamageCalculator(
    targetSync: Ref<Sync | null>,
    teamSyncs: Ref<Sync | null>[] = []
) {
    const damageStore = useDamageCalcStore();

    const currentTeam = computed(() => {
        return [targetSync.value, ...teamSyncs.map((r) => r.value)].filter(
            Boolean
        );
    });

    // 监听隊伍標籤變化
    watch(
        currentTeam,
        (newTeam) => {
            const themeRegions = ThemeContextResolver.resolveRegion(newTeam);
            Object.entries(themeRegions).forEach(([region, count]) => {
                damageStore.updateBattleCircleLevel(
                    region as RegionType,
                    Math.min(count, 3) as CircleLevel
                );
            });

            const contextTheme = ThemeContextResolver.resolve(newTeam);
            damageStore.updateThemeStats(contextTheme.flatBonuses);
            damageStore.updateThemeType(contextTheme.tagType);
            damageStore.updateThemeTypeAdd(contextTheme.tagAdd);
        },
        {
            deep: true,
            immediate: true,
        }
    );

    // 標籤快照
    const themeSnapshot = computed((): ThemeContext => {
        const contextTheme = ThemeContextResolver.resolve(currentTeam.value);
        return contextTheme;
    });

    // 环境快照
    const envSnapshot = computed((): CalcEnvironment => {
        const u = damageStore.user;
        const t = damageStore.target;
        return {
            // 直接傳遞中文值
            weather: damageStore.weather,
            isEXWeather: damageStore.isEXWeather,
            terrain: damageStore.terrain,
            isEXTerrain: damageStore.isEXTerrain,
            zone: damageStore.zone,
            isEXZone: damageStore.isEXZone,
            battleCircles: damageStore.battleCircles,
            gaugeAcceleration: damageStore.gaugeAcceleration,
            user: {
                hpPercent: u.currentHPPercent,
                ranks: u.ranks,
                gear: u.gear,
                theme: u.theme,
                themeType: u.themeType,
                themeTypeAdd: u.themeTypeAdd,
                boosts: {
                    physical: u.boosts.physical,
                    special: u.boosts.special,
                    sync: u.boosts.sync,
                },
                syncBuff: u.syncBuff,
                abnormal: u.abnormal,
                hindrance: u.hindrance,
            },

            target: {
                stats: t.stats,
                ranks: t.ranks,
                syncBuff: t.syncBuff,
                hpPercent: t.currentHPPercent,
                abnormal: t.abnormal,
                hindrance: t.hindrance,
                damageField: t.damageField,
                typeRebuffs: t.typeRebuffs,
                crtiBuffs: t.critBuffs,
            },

            settings: {
                gauge: damageStore.settings.gauge,
                targetScope: damageStore.settings.targetScope,
                berry: damageStore.settings.berry,
                moveuse: damageStore.settings.moveuse,
                isCritical: damageStore.settings.isCritical,
                isSuperEffective: damageStore.settings.isSuperEffective,
                effectiveType: damageStore.settings.effectiveType,
            },

            special: {
                isMega: damageStore.special.isMega,
            },

            config: {
                physical: damageStore.config.physical,
                special: damageStore.config.special,
                sync: damageStore.config.sync,
                gearMove: damageStore.config.gearMove,
                gearSync: damageStore.config.gearSync,
            },
        };
    });

    // 被动快照
    const passiveSnapshot = computed(() => {
        const sync = targetSync.value;
        if (!sync) return [];

        const rawData = sync.rawData;
        // 核心：遍歷每一個形態 (Base, Mega, Dynamax...)
        return rawData.pokemon.map((pokemon, formIndex) => {
            const rawPassives = collectActivePassives(sync, formIndex);

            const passiveModels = rawPassives.flatMap((p) => {
                // 特殊被动查表
                const override = PASSIVE_OVERRIDES[p.passiveName];
                if (override) {
                    return override;
                }

                // 通用解析
                const parser = new PassiveSkillParser(
                    p.name,
                    p.desc,
                    p.passiveName
                );
                const result = parser.result;
                console.log(JSON.stringify(result, null, 2));
                if (result !== null) {
                    return [result];
                }
                return [];
            });

            return {
                formName: getFormName(pokemon),
                passives: passiveModels,
            };
        });
    });

    // 计算当前的白值倍率(rank/被动/灼伤)
    const statsBoostSnapshot = computed(() => {
        const sync = targetSync.value;
        if (!sync) return [];

        const env = envSnapshot.value;
        const passives = passiveSnapshot.value;

        const rawData = sync.rawData;

        return rawData.pokemon.map((pokemon, formIndex) => {
            const currentPassives = passives[formIndex].passives;
            return {
                atk: DamageEngine.resolveStatBoost(currentPassives, env, "atk"),
                def: DamageEngine.resolveStatBoost(currentPassives, env, "def"),
                spa: DamageEngine.resolveStatBoost(currentPassives, env, "spa"),
                spd: DamageEngine.resolveStatBoost(currentPassives, env, "spd"),
                spe: DamageEngine.resolveStatBoost(currentPassives, env, "spe"),
            };
        });
    });

    // 用于显示的效果
    const statSnapshot = computed(() => {
        const sync = targetSync.value;
        if (!sync) return [];

        const env = envSnapshot.value;
        // const theme = themeSnapshot.value;
        const statsBoost = statsBoostSnapshot.value;
        const rawData = sync.rawData;
        const state = sync.state;

        return rawData.pokemon.map((pokemon, formIndex) => {
            const currentstatsBoost = statsBoost[formIndex];
            const statsValue = {
                hp: getFinalStatValue(rawData, state, "hp", formIndex, {
                    gearBonus: env.user.gear.hp,
                    themeBonus: env.user.theme.hp,
                }),
                atk: getFinalStatValue(rawData, state, "atk", formIndex, {
                    gearBonus: env.user.gear.atk,
                    themeBonus: env.user.theme.atk,
                    boost: currentstatsBoost["atk"] || 100,
                }),
                def: getFinalStatValue(rawData, state, "def", formIndex, {
                    gearBonus: env.user.gear.def,
                    themeBonus: env.user.theme.def,
                    boost: currentstatsBoost["def"] || 100,
                }),
                spa: getFinalStatValue(rawData, state, "spa", formIndex, {
                    gearBonus: env.user.gear.spa,
                    themeBonus: env.user.theme.spa,
                    boost: currentstatsBoost["spa"] || 100,
                }),
                spd: getFinalStatValue(rawData, state, "spd", formIndex, {
                    gearBonus: env.user.gear.spd,
                    themeBonus: env.user.theme.spd,
                    boost: currentstatsBoost["spd"] || 100,
                }),
                spe: getFinalStatValue(rawData, state, "spe", formIndex, {
                    gearBonus: env.user.gear.spe,
                    themeBonus: env.user.theme.spe,
                    boost: currentstatsBoost["spe"] || 100,
                }),
            };

            return {
                formName: getFormName(pokemon),
                stats: statsValue,
            };
        });
    });

    // 目标的白值(用于显示和计算)
    const targetStatsSnapshot = computed(() => {
        const sync = targetSync.value;
        if (!sync) return {};

        const env = envSnapshot.value;
        return {
            atk: DamageEngine.resolveTargetStatValue(env, "atk"),
            def: DamageEngine.resolveTargetStatValue(env, "def"),
            spa: DamageEngine.resolveTargetStatValue(env, "spa"),
            spd: DamageEngine.resolveTargetStatValue(env, "spd"),
            spe: DamageEngine.resolveTargetStatValue(env, "spe"),
        };
    });

    // 伤害计算...
    const finalDamageResult = computed(() => {
        const sync = targetSync.value;
        const env = envSnapshot.value;
        const theme = themeSnapshot.value;
        const passives = passiveSnapshot.value;
        const targeStats = targetStatsSnapshot.value;

        if (!sync || !passives.length) return [];

        const rawData = sync.rawData;
        const state = sync.state;

        // 遍歷每一個形態
        return rawData.pokemon.map((p, formIndex) => {
            // 环境变化
            let localEnv = env as CalcEnvironment;
            if (formIndex > 0) {
                // 判断是否有拍后形态变化
                if (p.vAfterSm) {
                    const currentSyncBuff = env.user.syncBuff || 0;
                    localEnv = {
                        ...env,
                        user: {
                            ...env.user,
                            syncBuff: currentSyncBuff + 1,
                        },
                        special: {
                            ...env.special,
                            isMega: true,
                        },
                    };
                }
            }

            const calculateMoveDamage = (
                m: MoveBase,
                scope: MoveScope,
                powerScope: PowerMoveScope,
                index: number
            ) => {
                if (!m || m.power === 0) return null;

                const currentPassives = passives[index].passives;
                let activeMove = m; // 默認使用原始招式

                const parser = new MoveSkillParser(
                    activeMove.name,
                    activeMove.description
                );
                const moveSkill = parser.result;
                console.log(moveSkill);
                if (moveSkill?.condition) {
                    console.log(moveSkill);
                }

                // 获取当前技能属性中文名 (用于主题技能匹配)
                const moveTypeCnName = getTypeCnNameByTypeIndex(
                    activeMove.type
                );

                // 获取被动加成列表 (传入对应的 Scope)
                const passiveMultis = DamageEngine.getPassiveMultipliers(
                    activeMove,
                    scope,
                    currentPassives,
                    localEnv,
                    theme
                );

                // 3. 计算各种倍率
                const passiveSum =
                    DamageEngine.resolvePassiveSum(passiveMultis);
                // 被动加成信息(包括计量槽)
                const passiveStrings = passiveMultis.map((mult) => {
                    return `${mult.name}: +${mult.value}%`;
                });

                const powerBoost = DamageEngine.resolveBoosts(
                    scope,
                    activeMove.category,
                    localEnv
                );
                passiveStrings.push(`增強: +${powerBoost}%`);

                const configBoost = DamageEngine.resolveConfigBoosts(
                    scope,
                    activeMove.category,
                    localEnv
                );
                passiveStrings.push(`配置增強: +${configBoost}%`);

                const passiveBoost = passiveSum + powerBoost + configBoost;

                // 计量槽倍率 (通常只对普通 Move 有效，Sync/Max 可能会返回 0，视你的实现而定)
                const gaugeBoost =
                    DamageEngine.resolvePassiveIsGaugeCost(passiveMultis);

                // 主动技能自身的倍率
                const moveBoost = DamageEngine.resolveMoveMultiplier(
                    activeMove,
                    moveSkill,
                    localEnv
                );

                // 4. 计算技能最终威力
                const movePower = getFinalMovePower(
                    activeMove,
                    rawData.trainer,
                    state.bonusLevel,
                    state.exRoleEnabled,
                    state.currentRarity,
                    state.gridData,
                    powerScope, // <--- 关键区别：传入对应的威力计算 Scope
                    {
                        passiveBoost: passiveBoost,
                        moveBoost: moveBoost,
                        gaugeBoost: gaugeBoost,
                    }
                ) as number;

                // 获取环境提供的倍率
                const envBoost = DamageEngine.resolveEnvMultipliers(
                    activeMove,
                    scope,
                    localEnv
                );

                // 裝備乘算倍率
                const gearBoost = DamageEngine.resolveGearMultipliers(
                    scope,
                    localEnv
                );

                // 计算攻击者面板 (User Stat)
                let userStat = 0;
                // 判定攻击类型 (1: 物理, 2: 特殊)
                const isPhysical = activeMove.category === 1;
                const statType = isPhysical ? "atk" : "spa";

                // 检查是否有"无视烧伤"逻辑
                const ignoreBurn = isPhysical
                    ? moveSkill.condition?.extra === ExtraLogic.BurnUseless
                    : true;

                const userVariationStat = getFinalStatValue(
                    rawData,
                    state,
                    statType,
                    index,
                    {
                        gearBonus: localEnv.user.gear[statType],
                        themeBonus:
                            moveTypeCnName === localEnv.user.themeType
                                ? localEnv.user.theme[statType] +
                                  localEnv.user.themeTypeAdd
                                : localEnv.user.theme[statType],
                        boost: DamageEngine.resolveStatBoost(
                            currentPassives,
                            localEnv,
                            statType,
                            ignoreBurn
                        ),
                    }
                );

                const userBaseStat = getFinalStatValue(
                    rawData,
                    state,
                    statType,
                    formIndex,
                    {
                        gearBonus: localEnv.user.gear[statType],
                    }
                );

                // 击中要害判定
                userStat = localEnv.settings.isCritical
                    ? userVariationStat
                    : Math.max(userVariationStat, userBaseStat);

                // 获取防御者面板 (Target Stat)
                let targetStat = 0;
                if (activeMove.category === 1) {
                    targetStat = targeStats.def; // 物理招式看物防
                } else {
                    if (moveSkill.condition?.extra === ExtraLogic.UseDef) {
                        targetStat = targeStats.def;
                    } else {
                        targetStat = targeStats.spd;
                    }
                }

                // 8. 最终伤害 Roll 计算
                const moveDamage = Object.entries(DAMAGE_ROLLS).map(
                    ([index, roll]) => {
                        return Math.floor(
                            movePower *
                                (((userStat * 0.5) / targetStat) *
                                    envBoost * 
                                    gearBoost *
                                    roll)
                        );
                    }
                );

                return {
                    move: activeMove,
                    passiveBoost,
                    moveBoost,
                    gaugeBoost,
                    movePower,
                    envBoost,
                    gearBoost,
                    userStat,
                    targetStat,
                    moveDamage,
                    scope,
                    boostDetails: [...passiveStrings],
                };
            };

            // 普通招式
            const moveResults = p.moves
                ?.map((m) => {
                    if (m.power === 0) {
                        return null;
                    }
                    let activeMove = m; // 默認使用原始招式
                    // 属性替换被动
                    const newType = DamageEngine.getTypeShiftPassive(
                        m,
                        passives[formIndex].passives
                    );
                    if (newType !== m.type) {
                        activeMove = {
                            ...m,
                            type: newType,
                        };
                    }

                    return calculateMoveDamage(
                        activeMove,
                        MoveScope.Move,
                        PowerMoveScope.Move,
                        formIndex
                    );
                })
                .filter(Boolean);

            const teraResult = calculateMoveDamage(
                p.moveTera,
                MoveScope.Move,
                PowerMoveScope.Move,
                formIndex
            );

            // 拍組招式
            const syncResult = calculateMoveDamage(
                p.syncMove,
                MoveScope.Sync,
                PowerMoveScope.Sync,
                p.vAfterSm && formIndex === 0 ? formIndex + 1 : formIndex
            );

            // 極巨化招式
            const maxResults = p.movesDynamax
                ?.map((m) => {
                    return calculateMoveDamage(
                        m,
                        MoveScope.Max,
                        PowerMoveScope.Max,
                        formIndex
                    );
                })
                .filter(Boolean);

            return {
                formName: getFormName(p),
                moves: moveResults,
                syncMove: syncResult,
                maxMoves: maxResults,
                teraMove: teraResult,
            };
        });
    });

    return {
        themeSnapshot,
        passiveSnapshot,
        statSnapshot,
        finalDamageResult,
    };
}

function getFormName(p: Pokemon): string {
    let formName = "基礎形態";
    switch (p.variationType) {
        case 1:
            formName = "超級進化";
            break;
        case 4:
            formName = "極巨化形態";
            break;
        case 7:
            formName = "太晶化形態";
            break;
        default:
            formName = p.form === "" ? "基礎形態" : p.form;
    }

    return formName;
}
