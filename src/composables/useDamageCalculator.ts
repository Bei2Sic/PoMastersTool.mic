// @/composables/useDamageCalculator.ts
import { getFinalStatValue } from "@/core/exporter/syncData";
import { PassiveSkillParser } from "@/core/parse/passive";
import { useDamageCalcStore } from "@/stores/damageCalc";
import { CalcEnvironment } from "@/types/calculator";
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

    return passives;

    // 4. 潛能餅幹也要計入
}

export function useDamageCalculator(targetSync: Ref<Sync | null>) {
    const damageStore = useDamageCalcStore();

    // 环境快照
    const envConfig = computed((): CalcEnvironment => {
        // 從 store 映射到標準結構
        return {
            weather: damageStore.weather, // 'sunny'
            terrain: damageStore.terrain, // 'electric'
            zone: damageStore.zone,
            // ...
        };
    });

    // 信息快照(白值, 技能威力)
    const allFormsBattleStats = computed(() => {
        const sync = targetSync.value;
        const gear = damageStore.user.gear;
        if (!sync) return [];

        const rawData = sync.rawData;
        const state = sync.state;
        // const env = damageStore.env; // 獲取環境參數

        // 核心：遍歷每一個形態 (Base, Mega, Dynamax...)
        return rawData.pokemon.map((pokemon, formIndex) => {
            // ====================================================
            // 1.收集該形態的被動
            // ====================================================
            const rawPassives = collectActivePassives(sync, formIndex);

            const validRawPassives = rawPassives.filter((p) => {
                // 調用靜態方法，傳入名字和描述
                return PassiveSkillParser.isValid(p.name, p.desc);
            });

            // ====================================================
            // 2: 解析被動
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
            // 3: 計算白值
            // ====================================================
            // 白值計算也要考慮被動 (如果是 Stat Boost 類型的被動)
            // 這裡可以傳入 passiveModels 讓 getFinalStatValue 處理 "變成N倍" 的白值被動
            const stats = {
                hp: getFinalStatValue(rawData, state, "hp", formIndex),
                atk: getFinalStatValue(rawData, state, "atk", formIndex, {
                    gearBonus: gear.atk,
                }),
                def: getFinalStatValue(rawData, state, "def", formIndex, {
                    gearBonus: gear.def,
                }),
                spa: getFinalStatValue(rawData, state, "spa", formIndex, {
                    gearBonus: gear.spa,
                }),
                spd: getFinalStatValue(rawData, state, "spd", formIndex, {
                    gearBonus: gear.spd,
                }),
                spe: getFinalStatValue(rawData, state, "spe", formIndex, {
                    gearBonus: gear.spe,
                }),
            };

            // ====================================================
            // 4: 計算傷害
            // ====================================================
            // 這裡計算該形態下的所有技能傷害
            // const moves = pokemon.moves.map((move) => {
            //     // 使用 DamageEngine，傳入該形態專屬的 passiveModels

            // });

            // const syncMove = DamageEngine.calculateDamage(
            //     pokemon.syncMove,
            //     stats,
            //     passiveModels,
            //     env
            // );

            // ====================================================
            // Step 5: 返回該形態的完整包
            // ====================================================
            return {
                formName: pokemon.form || "基礎形態", // 形態名稱
                // stats: stats,           // 最終白值
                passives: passiveModels, // 該形態生效的被動 (供UI展示)
                // moves: moves,           // 普招傷害列表
                // syncMove: syncMove      // 拍招傷害
            };
        });
    });

    // 伤害计算(使用 环境快照以及信息快照 )

    return {
        allFormsBattleStats,
    };
}
