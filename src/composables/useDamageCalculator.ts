// @/composables/useDamageCalculator.ts
import { DamageEngine } from "@/core/calculators/damage";
import { PassiveSkillParser } from "@/core/parse/passive";
import { useDamageCalcStore } from "@/stores/damageCalc";
import { CalcEnvironment } from "@/types/calculator";
import { MoveScope } from "@/types/passiveModel";
import { Sync } from "@/types/syncModel";
import { computed, Ref } from "vue";

// ... 其他導入
function collectActivePassives(
    sync: Sync,
    formIndex: number
): { name: string; desc: string; passiveName: string }[] {
    const passives: { name: string; desc: string; passiveName: string }[] = [];

    // 1. 本體被動 (Innate) - 隨 formIndex 變化
    const currentPokemon = sync.rawData.pokemon[formIndex];
    if (currentPokemon && currentPokemon.passives) {
        // 假設 passive 結構是數組
        currentPokemon.passives.forEach((p) => {
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

export function useDamageCalculator(targetSync: Ref<Sync | null>) {
    const damageStore = useDamageCalcStore();

    // 环境快照
    const envSnapshot = computed((): CalcEnvironment => {
        const u = damageStore.user;
        const t = damageStore.target;

        return {
            // 直接傳遞中文值
            weather: damageStore.weather,
            terrain: damageStore.terrain,
            zone: damageStore.zone,
            battleCircles: damageStore.battleCircles,
            user: {
                hpPercent: u.currentHPPercent,
                ranks: u.ranks,
                boosts: {
                    physical: u.boosts.physical,
                    special: u.boosts.special,
                    sync: u.boosts.sync,
                },
                abnormal: u.abnormal,
                hindrance: u.hindrance,
            },

            target: {
                // 目标白值(def&spd)
                ranks: t.ranks,
                hpPercent: t.currentHPPercent,
                abnormal: t.abnormal,
                hindrance: t.hindrance,
                damageField: t.damageField,
                typeRebuffs: t.typeRebuffs,
            },

            settings: {
                gauge: damageStore.settings.gauge,
                berry: damageStore.settings.berry,
                isCritical: damageStore.settings.isCritical,
                isSuperEffective: damageStore.settings.isEffective,
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
            // ====================================================
            // 收集該形態下的被動（包括队友被动）
            // ====================================================
            const rawPassives = collectActivePassives(sync, formIndex);
            const validRawPassives = rawPassives.filter((p) => {
                // 調用靜態方法，傳入名字和描述
                return PassiveSkillParser.isValid(p.name, p.desc);
            });
            // ====================================================
            // 解析被動
            // ====================================================
            const passiveModels = validRawPassives.map((p) => {
                // 判断合法
                const parser = new PassiveSkillParser(
                    p.name,
                    p.desc,
                    p.passiveName
                );
                return parser.result;
            });
            // ====================================================
            // 返回該形態的被动
            // ====================================================
            return {
                formName: pokemon.form || "基礎形態",
                passives: passiveModels,
            };
        });
    });

    // 伤害计算
    // 遍历每个形态，逐一遍历 moves, movesDynamax?, moveTera?, syncMove
    // 获取当前move收到被动的增益
    // 获取当前move自身的增益(部分move有, 需要有一个方法去实现)
    // 计算当前move的威力

    // 计算对应的白值(根据move的类别,拿atk/spa)

    // 计算目标对应的白值(根据move的类别,拿def/spd)

    // 获取当前环境的增益(比如火属性技能 晴天下1.5倍)

    // 伤害计算...
    const finalDamageResult = computed(() => {
        const sync = targetSync.value;
        const env = envSnapshot.value;
        const formPassivesList = passiveSnapshot.value; // 拿到剛剛解析好的被動列表

        if (!sync || !formPassivesList.length) return [];

        const rawData = sync.rawData;
        // const state = sync.state;
        // const gear = damageStore.user.gear;

        // 遍歷每一個形態
        return rawData.pokemon.map((pokemon, formIndex) => {
            const currentPassives = formPassivesList[formIndex].passives;

            // const userStats = {
            //     atk: getFinalStatValue(rawData, state, "atk", formIndex, {
            //         gearBonus: gear.atk,
            //     }),
            //     spa: getFinalStatValue(rawData, state, "spa", formIndex, {
            //         gearBonus: gear.spa,
            //     }),
            // };

            // // ------------------------------------------------
            // // B. 定義單個技能的計算函數 (避免 Move 和 Sync 代碼重複)
            // // ------------------------------------------------
            // const calculateMoveDamage = (
            //     moveData: any,
            //     category: MoveCategory,
            //     isMaxMove: boolean = false
            // ) => {
            //     if (!moveData) return null;

            //     // 1. 構建標準 MoveBase 對象
            //     const moveBase: MoveBase = {
            //         name: moveData.name,
            //         category: category,
            //         gaugeCost: moveData.gauge || 0, // 拍招通常是 0
            //         power: moveData.power || 0,
            //         type: moveData.type,            // 招式屬性 (中文: "火")
            //         classification: moveData.category // "物理" | "特殊"
            //     };

            //     // 2. 獲取 [被動技能] 的增益 (來自石盤、本體)
            //     const passiveMultipliers = DamageEngine.getMultipliers(moveBase, category, currentPassives, env);
            //     const gaugeBoosts = DamageEngine.getGaugeBoosts(moveBase, category, currentPassives, env);

            //     // 3. 獲取 [招式自身] 的增益 (Move Logic)
            //     // 例如: "對手麻痺時威力提升" (這需要 DamageEngine 有一個解析招式描述的方法)
            //     // 這裡假設引擎有一個靜態方法來處理這個
            //     const moveInherentMultipliers = DamageEngine.getMoveInherentMultipliers(moveData, env);

            //     // 4. 獲取 [環境] 的增益 (Environment Modifiers)
            //     // 包括: 天氣(火在晴天1.5)、場地(超能在精神場地1.5)、屬性抗性(Rebuff)
            //     const envModifiers = DamageEngine.getEnvModifiers(moveBase, env);

            //     // --------------------------------------------
            //     // 5. 數值計算開始
            //     // --------------------------------------------

            //     // [Step I] 確定攻擊力 (Atk/SpA) 與 防禦力 (Def/SpD)
            //     // 物理招式看 Atk vs Def, 特殊招式看 SpA vs SpD
            //     // (注意：有些特殊招式如"精神擊破"是看 Def，這裡做通用處理，特殊情況需特殊判斷)
            //     const isPhysical = moveBase.classification === "物理";
            //     const atkStat = isPhysical ? userStats.atk : userStats.spa;

            //     // 目標防禦值從 env.target.stats 獲取
            //     const defStat = isPhysical ? env.target.stats.def : env.target.stats.spd;

            //     // [Step II] 計算基礎威力 (Base Power)
            //     // 公式: 面板威力 * (1 + 計量槽加成 + 招式自帶條件加成)
            //     // 注意：招式自帶條件 (如麻痺增傷) 在 PoMa 中通常是加算在 BP 上的
            //     let powerBoostPercent = 0;
            //     gaugeBoosts.forEach(m => powerBoostPercent += m.value);
            //     moveInherentMultipliers.forEach(m => powerBoostPercent += m.value);

            //     const finalBP = moveBase.power * (1 + powerBoostPercent);

            //     // [Step III] 計算總倍率 (Total Multiplier)
            //     // 公式: (1 + 加算倍率) * (乘算倍率) * 環境倍率
            //     let additive = 0;
            //     let multiplicative = 1.0;

            //     passiveMultipliers.forEach(m => {
            //         // 根據邏輯區分
            //         if (m.logic === 'FixedMulti') multiplicative *= (1 + m.value);
            //         else additive += m.value;
            //     });

            //     // 加上 下次威力增強 (PMUN / SMUN)
            //     // 物理增強: env.user.boosts.physical * 0.4
            //     const nextMoveUp = isPhysical
            //         ? (env.user.boosts.physical * 0.4)
            //         : (env.user.boosts.special * 0.4);
            //     additive += nextMoveUp;

            //     // [Step IV] 氣魄加成 (Sync Buff)
            //     // 拍招不吃氣魄，普招吃氣魄 (每層 +50%)
            //     let syncBuffMultiplier = 1.0;
            //     if (category !== 'Sync') {
            //         syncBuffMultiplier = 1.0 + (env.user.boosts.sync * 0.5);
            //     }

            //     // [Step V] 最終傷害公式 (Simplified PoMa Formula)
            //     // Damage = (Atk / Def) * FinalBP * (1 + Additive) * Multiplicative * EnvMod * SyncBuff * Constant
            //     // Constant 約為 1.8 ~ 2.0 左右，這裡簡化處理
            //     // 如果是擊中要害，Def 不計算正等級，且 Atk * 1.5
            //     let finalAtk = atkStat;
            //     let finalDef = defStat;

            //     if (env.settings.isCritical) {
            //         finalAtk *= 1.5;
            //         // 這裡簡化了暴擊無視防禦提升的邏輯
            //     }

            //     const rawDamage = (finalAtk / finalDef) * finalBP * (1 + additive) * multiplicative * envModifiers.total * syncBuffMultiplier;

            //     // 返回詳細數據供 UI 展示
            //     return {
            //         name: moveBase.name,
            //         category: category,
            //         type: moveBase.type,
            //         damage: Math.floor(rawDamage), // 取整
            //         stats: { atk: finalAtk, def: finalDef, bp: finalBP },
            //         // 用於 UI 顯示來源列表
            //         components: {
            //             passives: passiveMultipliers,
            //             gauge: gaugeBoosts,
            //             inherent: moveInherentMultipliers,
            //             env: envModifiers.details
            //         }
            //     };
            // };

            // ------------------------------------------------
            // C. 執行計算
            // ------------------------------------------------

            // // 1. 普通招式
            const moveResults = pokemon.moves.map((m) => {
                if (m.power > 0) {
                    const multi = DamageEngine.getMultipliers(
                        m,
                        MoveScope.Move,
                        currentPassives,
                        env
                    );
                    return { multi: multi };
                }
            });

            // // 2. 拍組招式 (Sync Move)
            // const syncResult = calculateMoveDamage(pokemon.syncMove, 'Sync');

            // // 3. 極巨化招式 (如果有的話)
            // const maxResults = pokemon.movesDynamax ? pokemon.movesDynamax.map(m => calculateMoveDamage(m, 'Max', true)) : [];

            return {
                formName: pokemon.form || "基礎形態",
                // stats: userStats, // 展示該形態白值
                moves: moveResults,
                // syncMove: syncResult,
                // maxMoves: maxResults
            };
        });
    });

    return {
        passiveSnapshot,
        finalDamageResult,
    };
}
