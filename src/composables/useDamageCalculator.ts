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
import { useSyncElemStore } from "@/stores/syncElem";
import {
    CalcEnvironment,
    DamageResult,
    LogicType,
    MoveScope,
    ThemeContext,
} from "@/types/calculator";
import { CircleLevel, RegionType } from "@/types/conditions";
import { MoveBase, Pokemon, Sync } from "@/types/syncModel";
import { computed, Ref, watch } from "vue";

// ... 其他導入
function collectActivePassives(
    sync: Sync,
    formIndex: number,
    sourceIndex: number
): { name: string; desc: string; passiveName: string; sourceIndex: number }[] {
    const passives: {
        name: string;
        desc: string;
        passiveName: string;
        sourceIndex: number;
    }[] = [];

    // 1. 本體被動 - 隨 formIndex 變化
    const currentPokemon = sync.rawData.pokemon[formIndex];
    if (currentPokemon && currentPokemon.passives) {
        currentPokemon.passives.forEach((p) => {
            if (PASSIVE_OVERRIDES[p.name]) {
                passives.push({
                    name: p.name,
                    desc: p.description,
                    passiveName: p.name,
                    sourceIndex: sourceIndex,
                });
                return;
            }

            if (p.detail?.length > 0) {
                p.detail.forEach((detail) => {
                    passives.push({
                        name: detail.name,
                        desc: detail.description,
                        passiveName: p.name,
                        sourceIndex: sourceIndex,
                    });
                });
            } else {
                passives.push({
                    name: p.name,
                    desc: p.description,
                    passiveName: p.name,
                    sourceIndex: sourceIndex,
                });
            }
        });
    }

    // 2. 石盤被動 (Grid) - 所有形態共享
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
                        sourceIndex: sourceIndex,
                    });
                });
            } else {
                passives.push({
                    name: tile.name,
                    desc: tile.description,
                    passiveName: tile.name,
                    sourceIndex: sourceIndex,
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
                sourceIndex: sourceIndex,
            });
        });
    }

    // 4. 队友被动也要计入

    return passives;
}

export function useDamageCalculator(
    a: Ref<Sync | null>,
    b: Ref<Sync | null>[] = []
) {
    const syncStore = useSyncElemStore();
    const damageStore = useDamageCalcStore();

    const team = computed(() => syncStore.team);
    // 当前目标拍组
    const targetSync = computed(() => syncStore.activeSync);
    // 当前队友拍组
    const teamSyncs = computed(() => syncStore.teamSync);

    // 是否单人模式
    const hasTeammates = computed(() => {
        return syncStore.team.filter((s) => s !== null).length > 1;
    });

    const currentTeam = computed(() => {
        return [
            targetSync.value,
            ...teamSyncs.value.map((item) => item.sync),
        ].filter(Boolean);
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

            if (hasTeammates.value) {
                const contextTheme = ThemeContextResolver.resolve(newTeam);
                damageStore.updateThemeStats(contextTheme.flatBonuses);
                damageStore.updateThemeType(contextTheme.tagType);
                damageStore.updateThemeTypeAdd(contextTheme.tagAdd);
            }
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
        const u = targetSync.value.state;
        const battleState = u.battle;
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
                currentHPPercent: battleState.currentHPPercent || 0,
                ranks: battleState.ranks,
                gears: battleState.gears,
                boosts: battleState.boosts,
                syncBuff: battleState.syncBuff,
                abnormal: battleState.abnormal,
                hindrance: battleState.hindrance,
            },
            teammates: team.value.map((mate) => {
                if (!mate) return null;
                return mate.state.battle;
            }),
            themes: damageStore.themes,
            themeType: damageStore.themeType,
            themeTypeAdd: damageStore.themeTypeAdd,

            target: {
                stats: t.stats,
                ranks: t.ranks,
                syncBuff: t.syncBuff,
                currentHPPercent: t.currentHPPercent,
                abnormal: t.abnormal,
                hindrance: t.hindrance,
                damageField: t.damageField,
                typeRebuffs: t.typeRebuffs,
                crtiBuffs: t.critBuffs,
                statLowerReduction: t.statLowerReduction,
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
        const team = teamSyncs.value;
        if (!sync) return [];

        const rawData = sync.rawData;
        // 核心：遍歷每一個形態 (Base, Mega, Dynamax...)
        return rawData.pokemon.map((pokemon, formIndex) => {
            // --- 收集当前拍组被动 (Source = -1) ---
            const myPassives = collectActivePassives(sync, formIndex, -1);
            const teammatePassives: ReturnType<typeof collectActivePassives> =
                [];

            // --- 收集队友被动 (Source = index) ---
            team.forEach(({ sync, index }) => {
                // 队友通常只计算 Base 形态 (索引 0)，或者你需要根据队友当前状态取 formIndex
                const mateRaw = collectActivePassives(sync, 0, index);

                teammatePassives.push(...mateRaw);
            });

            // --- 合并所有被动 ---
            const rawPassives = [...myPassives, ...teammatePassives];

            // const rawPassives = collectActivePassives(sync, formIndex, -1);

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
                const result = parser.result; // 这里result就是技能模型
                console.log(JSON.stringify(result, null, 2));
                if (result !== null) {
                    if (p.sourceIndex !== -1 && !result.applyToParty) {
                        return []; // 丢弃队友的个人被动
                    }
                    // 浅拷贝, 并添加来源索引
                    return [{ ...result, sourceIndex: p.sourceIndex }];
                }
                return [];
            });

            // 过滤同名且唯一的被动
            const seenUniquePassives = new Set<string>();
            const finalPassiveModels = passiveModels.filter((model) => {
                // 如果该技能不是 unique 的，直接保留 (允许叠加)
                if (!model?.unique) {
                    return true;
                }
                // 如果是 unique 的，检查是否已存在
                // 使用 passiveName 作为唯一标识
                if (seenUniquePassives.has(model.passiveName)) {
                    // console.log(`Filtered duplicate unique passive: ${model.name} from source ${model.sourceIndex}`);
                    return false; // 丢弃后续出现的同名被动
                }
                // 第一次遇到这个 unique 技能，记录下来并保留
                seenUniquePassives.add(model.passiveName);
                return true;
            });

            return {
                formName: getFormName(pokemon),
                passives: finalPassiveModels,
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
                    gearBonus: env.user.gears.hp,
                    themeBonus: env.themes.hp,
                }),
                atk: getFinalStatValue(rawData, state, "atk", formIndex, {
                    gearBonus: env.user.gears.atk,
                    themeBonus: env.themes.atk,
                    boost: currentstatsBoost["atk"] || 100,
                }),
                def: getFinalStatValue(rawData, state, "def", formIndex, {
                    gearBonus: env.user.gears.def,
                    themeBonus: env.themes.def,
                    boost: currentstatsBoost["def"] || 100,
                }),
                spa: getFinalStatValue(rawData, state, "spa", formIndex, {
                    gearBonus: env.user.gears.spa,
                    themeBonus: env.themes.spa,
                    boost: currentstatsBoost["spa"] || 100,
                }),
                spd: getFinalStatValue(rawData, state, "spd", formIndex, {
                    gearBonus: env.user.gears.spd,
                    themeBonus: env.themes.spd,
                    boost: currentstatsBoost["spd"] || 100,
                }),
                spe: getFinalStatValue(rawData, state, "spe", formIndex, {
                    gearBonus: env.user.gears.spe,
                    themeBonus: env.themes.spe,
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
                index: number,
                isTeraMove?: boolean
            ): DamageResult => {
                if (!m || m.power === 0) return null;

                // 激活的所有被動list
                const currentPassives = passives[index].passives;
                let activeMove = m; // 默認使用原始招式

                const parser = new MoveSkillParser(
                    activeMove.name,
                    activeMove.description
                );
                const moveSkill = parser.result;
                // 如果是特殊效果的主动技能，需要在这里先处理技能效果
                // 例如属性替换
                if (DamageEngine.hasTypeShift(moveSkill, localEnv)) {
                    const shiftType = DamageEngine.getTypeShiftEffect(
                        activeMove,
                        moveSkill
                    );
                    activeMove = {
                        ...activeMove,
                        type: shiftType,
                    };
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
                    if (
                        mult.logic === LogicType.GaugeCost ||
                        mult.logic === LogicType.SpecialMulti
                    ) {
                        return `${mult.name}: *${mult.value / 100}`;
                    }
                    return `${mult.name}: +${mult.value.toFixed(0)}%`;
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

                // 特殊的乘算倍率
                let gaugeBoost =
                    DamageEngine.resolvePassiveIsMulti(passiveMultis);

                // 太晶倍率*1.5
                const isTera = rawData.pokemon[index]?.moveTera ? true : false;
                if (isTera && scope === MoveScope.Move && !isTeraMove) {
                    const pokemonType = rawData.pokemon[index].type;
                    if (m.type === pokemonType) {
                        gaugeBoost *= 1.5;
                        passiveStrings.push(`太晶威力增強: x1.5`);
                    }
                }

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

                // 檢測是否有無衰減
                let isNoneDecay = false;
                if (scope === MoveScope.Sync) {
                    isNoneDecay = true;
                } else {
                    isNoneDecay = DamageEngine.hasNonDecay(
                        activeMove,
                        scope,
                        currentPassives,
                        moveSkill
                    );
                }
                // 获取环境提供的倍率
                const envBoost = DamageEngine.resolveEnvMultipliers(
                    activeMove,
                    scope,
                    localEnv,
                    isNoneDecay
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
                    ? DamageEngine.hasBurnUseless(
                          currentPassives,
                          moveSkill,
                          localEnv
                      )
                    : true;

                const userVariationStat = getFinalStatValue(
                    rawData,
                    state,
                    statType,
                    index,
                    {
                        gearBonus: localEnv.user.gears[statType],
                        themeBonus:
                            moveTypeCnName === localEnv.themeType
                                ? localEnv.themes[statType] +
                                  localEnv.themeTypeAdd
                                : localEnv.themes[statType],
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
                    index,
                    {
                        gearBonus: localEnv.user.gears[statType],
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
                    if (DamageEngine.hasUseDef(moveSkill)) {
                        targetStat = targeStats.def;
                    } else {
                        targetStat = targeStats.spd;
                    }
                }

                // 8. 最终伤害 Roll 计算
                const moveDamage = Object.entries(DAMAGE_ROLLS).map(
                    ([rollIndex, roll]) => {
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
                    const newType = DamageEngine.getNormalTypeShiftEffect(
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

            // 太晶招式
            const teraResult = calculateMoveDamage(
                p.moveTera,
                MoveScope.Move,
                PowerMoveScope.Move,
                formIndex,
                true
            );

            // 拍組招式
            let syncResult: DamageResult = null;
            // 極巨化形態沒有拍招(坑...)
            if (p.syncMove) {
                let activeSyncMove = p.syncMove; // 默認使用原始招式
                // 属性替换被动
                const newType = DamageEngine.getTypeShiftEffect(
                    p.syncMove,
                    passives[formIndex].passives
                );
                if (newType !== p.syncMove.type) {
                    activeSyncMove = {
                        ...p.syncMove,
                        type: newType,
                    };
                }
                syncResult = calculateMoveDamage(
                    activeSyncMove,
                    MoveScope.Sync,
                    PowerMoveScope.Sync,
                    p.vAfterSm && formIndex === 0 ? formIndex + 1 : formIndex
                );
            }

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
