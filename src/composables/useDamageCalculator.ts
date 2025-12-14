// @/composables/useDamageCalculator.ts
import { useDamageCalcStore } from "@/stores/damageCalc";
import { PassiveRawText } from "@/types/passiveModel";
import { DamageEngine } from "@/core/calculators/damage"
import { PassiveSkillParser } from "@/core/parse/passive";
import { Sync } from "@/types/syncModel";
import { computed, Ref } from "vue";

// ... 其他導入
function collectActivePassives(sync: Sync, formIndex: number): { name: string, desc: string }[] {
    const passives: { name: string, desc: string }[] = [];

    // 1. 本體被動 (Innate) - 隨 formIndex 變化
    const currentPokemon = sync.rawData.pokemon[formIndex];
    if (currentPokemon && currentPokemon.passives) {
        // 假設 passive 結構是數組
        currentPokemon.passives.forEach(p => {
            passives.push({ name: p.name, desc: p.description });
        });
    }

    // 2. 石盤被動 (Grid) - 所有形態共享
    // 除非遊戲有極其特殊的拍組是 Mega 後石盤失效（目前沒有），否則都加進去
    sync.state.gridData.forEach(tile => {
        if (tile.isActive && tile.color === '#FFC266') {
            passives.push({ name: tile.name, desc: tile.description });
        }
    });

    return passives;
}


export function useDamageCalculator(targetSync: Ref<Sync | null>) {
    const damageStore = useDamageCalcStore();
    console.log(targetSync)
    // 這裡不再是 "parsedPassives" 這種單獨的變量
    // 而是直接輸出最終的 "所有形態戰鬥數據"
    const allFormsBattleStats = computed(() => {
        const sync = targetSync.value;
        console.log(targetSync)
        if (!sync) return [];

        const rawData = sync.rawData;
        const state = sync.state;
        // const env = damageStore.env; // 獲取環境參數

        // 核心：遍歷每一個形態 (Base, Mega, Dynamax...)
        return rawData.pokemon.map((pokemon, formIndex) => {

            // ====================================================
            // 1: 收集該形態的被動
            // ====================================================
            // 這裡必須傳入 formIndex，因為不同形態的本體被動不同
            // 石盤被動通常是共享的，collectActivePassives 內部會處理合併
            const rawPassives = collectActivePassives(sync, formIndex);
            console.log(rawPassives);

            // ====================================================
            // 2: 解析被動
            // ====================================================
            // 這裡會得到該形態專屬的被動模型列表
            const passiveModels = rawPassives.map(p => {
                const parser = new PassiveSkillParser(p.name, p.desc);
                return parser.result;
            });

            // ====================================================
            // 3: 計算白值 (Stats)
            // ====================================================
            // 白值計算也要考慮被動 (如果是 Stat Boost 類型的被動)
            // 這裡可以傳入 passiveModels 讓 getFinalStatValue 處理 "變成N倍" 的白值被動
            const stats = {
                // hp: getFinalStatValue(rawData, state, 'hp', formIndex, { passives: passiveModels }),
                // atk: getFinalStatValue(rawData, state, 'atk', formIndex, { passives: passiveModels }),
                // ... 其他屬性
            };

            // ====================================================
            // 4: 計算傷害 (Damage)
            // ====================================================
            // 這裡計算該形態下的所有技能傷害
            // const moves = pokemon.moves.map(move => {
            //     // 使用 DamageEngine，傳入該形態專屬的 passiveModels
            //     const result = DamageEngine.calculateDamage(move, stats, passiveModels, env);
            //     return result;
            // });

            // const syncMove = DamageEngine.calculateDamage(pokemon.syncMove, stats, passiveModels, env);

            // ====================================================
            // Step 5: 返回該形態的完整包
            // ====================================================
            return {
                formName: pokemon.form || '基礎形態', // 形態名稱
                // stats: stats,           // 最終白值
                passives: passiveModels,// 該形態生效的被動 (供UI展示)
                // moves: moves,           // 普招傷害列表
                // syncMove: syncMove      // 拍招傷害
            };
        });
    });

    return {
        allFormsBattleStats,
    };
}
