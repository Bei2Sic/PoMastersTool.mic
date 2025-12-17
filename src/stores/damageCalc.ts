// useDamageCalcStore.ts

import * as cond from "@/types/conditions"; // 導入上面的類型
import { defineStore } from "pinia";

// 輔助函數：初始化 18 種屬性抵抗表 (全為 0)
const initRebuffs = (): cond.TypeRebuffs => {
    const types: cond.PokemonType[] = [
        "一般",
        "火",
        "水",
        "草",
        "電",
        "冰",
        "格鬥",
        "毒",
        "地",
        "飛行",
        "超能",
        "蟲",
        "岩石",
        "幽靈",
        "龍",
        "惡",
        "鋼",
        "妖精",
    ];
    return types.reduce(
        (acc, type) => ({ ...acc, [type]: 0 }),
        {} as cond.TypeRebuffs
    );
};

const initHindrances = (): Record<cond.HindranceType, boolean> => {
    return Object.fromEntries(
        cond.HINDRANCE_STATUSES.map((status) => [status, false])
    ) as Record<cond.HindranceType, boolean>;
};

export const useDamageCalcStore = defineStore("damageCalc", {
    state: () => ({
        // ============================================
        // I. USER (當前拍組 / 攻擊方)
        // ============================================
        user: {
            // 裝備數值
            gear: {
                atk: 0 as number,
                def: 0 as number,
                spa: 0 as number,
                spd: 0 as number,
                spe: 0 as number,
            },
            // 組隊加成
            theme: {
                hp: 0 as number,
                atk: 0 as number,
                def: 0 as number,
                spa: 0 as number,
                spd: 0 as number,
                spe: 0 as number,
            },
            // 能力等級 (Stat Ranks)
            ranks: {
                atk: 0 as cond.StatRank,
                def: 0 as cond.StatRank,
                spa: 0 as cond.StatRank,
                spd: 0 as cond.StatRank,
                spe: 0 as cond.StatRank,
                acc: 0 as cond.StatRank,
                eva: 0 as cond.StatRank,
                ct: 0 as cond.CtRank,
            },
            // 增強狀態 (Boosts: 0-10)
            boosts: {
                physical: 0 as cond.BoostRank, // 物理招式增強 (PMUN)
                special: 0 as cond.BoostRank, // 特殊招式增強 (SMUN)
                sync: 0 as cond.BoostRank, // 拍組招式增強 (Sync Buff)
            },
            // 自身狀態 (用於 LowHP/Recoil 判斷)
            currentHPPercent: 100 as number,
            // 異常狀態
            abnormal: "無" as cond.AbnormalType,
            // 妨害狀態
            hindrance: initHindrances(),
        },

        // ============================================
        // II. TARGET (目標拍組 / 防禦方)
        // ============================================
        target: {
            // 基礎數值
            stats: {
                atk: 0 as number,
                def: 0 as number,
                spa: 0 as number,
                spd: 0 as number,
                spe: 0 as number,
            },
            // 能力等級 (Stat Ranks)
            ranks: {
                atk: -6 as cond.StatRank,
                def: -6 as cond.StatRank,
                spa: -6 as cond.StatRank,
                spd: -6 as cond.StatRank,
                spe: -6 as cond.StatRank,
                acc: -6 as cond.StatRank,
                eva: -6 as cond.StatRank,
            },

            // 異常狀態
            abnormal: "無" as cond.AbnormalType,

            // 妨害狀態
            hindrance: initHindrances(),

            // 傷害場地
            damageField: "無" as cond.DamageFieldType,

            currentHPPercent: 100 as number,

            // 屬性抵抗 (Rebuffs)
            typeRebuffs: initRebuffs(),
        },

        weather: "無" as cond.WeatherType,
        terrain: "無" as cond.TerrainType,
        zone: "無" as cond.ZoneType,
        battleCircles: [] as cond.BattleCircle[],

        // todo: 大師被動

        settings: {
            scope: 1 as cond.TargetScope, // 攻擊目標數 (1-3)
            gauge: 6 as cond.GaugeValue, // 剩餘計數槽 (1-6)
            isCritical: false as boolean, // 命中要害
            isEffective: false as boolean, // 效果絕佳
            effectiveType: "無" as cond.PokemonType,
            berry: 0 as cond.BerryNum,
        },
    }),

    getters: {
    },

    actions: {
    },
});
