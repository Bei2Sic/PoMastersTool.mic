// @/composables/useDamageCalculator.ts
import { useDamageCalcStore } from "@/stores/damageCalc";
import { Sync } from "@/types/syncModel";
import { computed, Ref } from "vue";
// ... 其他導入

// 接收一個 Ref<Sync | null> 作為參數
export function useDamageCalculator(targetSync: Ref<Sync | null>) {
    const damageStore = useDamageCalcStore();

    const allFormsBattleStats = computed(() => {
        // 這裡直接使用傳入的參數，而不是 store.currentSync
        const sync = targetSync.value;

        if (!sync) return [];

        const rawData = sync.rawData;
        const state = sync.state;

        // ... 後面的邏輯完全不用變 ...
        // 計算 Stats, Moves 等等
        return rawData.pokemon.map((pokemon, formIndex) => {
            // ... 計算邏輯 ...
        });
    });

    return {
        allFormsBattleStats,
    };
}
