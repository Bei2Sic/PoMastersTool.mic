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

const initBattleCircles = (): cond.BattleCircle => {
    const map: Partial<cond.BattleCircle> = {};
    const BATTLE_REGIONS = [
        "關都",
        "城都",
        "豐緣",
        "神奧",
        "合眾",
        "卡洛斯",
        "阿羅拉",
        "伽勒爾",
        "帕底亞",
        "帕希歐"
    ]
    BATTLE_REGIONS.forEach((region) => {
        map[region] = {
            level: 0,
            actives: {
                "物理": false,
                "特殊": false,
                "防禦": false
            }
        };
    });
    return map as cond.BattleCircle;
};

export const useDamageCalcStore = defineStore("damageCalc", {
    state: () => ({
        user: {
            gear: {
                hp: 100 as number,
                atk: 40 as number,
                def: 40 as number,
                spa: 40 as number,
                spd: 40 as number,
                spe: 40 as number,
            } as cond.PokemonStats,
            theme: {
                hp: 0 as number,
                atk: 0 as number,
                def: 0 as number,
                spa: 0 as number,
                spd: 0 as number,
                spe: 0 as number,
            } as cond.PokemonStats,
            ranks: {
                atk: 6 as cond.StatRank,
                def: 6 as cond.StatRank,
                spa: 6 as cond.StatRank,
                spd: 6 as cond.StatRank,
                spe: 6 as cond.StatRank,
                acc: 6 as cond.StatRank,
                eva: 6 as cond.StatRank,
                ct: 3 as cond.CtRank,
            },
            boosts: {
                physical: 0 as cond.BoostRank, // 物理招式增強
                special: 0 as cond.BoostRank, // 特殊招式增強
                sync: 0 as cond.BoostRank, // 拍組招式增強
            },
            currentHPPercent: 100 as number,
            // 異常狀態
            abnormal: '灼傷' as cond.AbnormalType,
            // 妨害狀態
            hindrance: initHindrances(),
        },

        target: {
            stats: {
                atk: 114 as number,
                def: 114 as number,
                spa: 114 as number,
                spd: 114 as number,
                spe: 114 as number,
            } as cond.PokemonStats,
            ranks: {
                atk: -6 as cond.StatRank,
                def: -6 as cond.StatRank,
                spa: -6 as cond.StatRank,
                spd: -6 as cond.StatRank,
                spe: -6 as cond.StatRank,
                acc: -6 as cond.StatRank,
                eva: -6 as cond.StatRank,
            },
            abnormal: "無" as cond.AbnormalType,

            hindrance: initHindrances(),

            damageField: "無" as cond.DamageFieldType,

            currentHPPercent: 100 as number,

            typeRebuffs: initRebuffs(),
        },

        weather: "無" as cond.WeatherType,
        isEXWeather: false,
        terrain: "無" as cond.TerrainType,
        isEXTerrain: false,
        zone: "無" as cond.ZoneType,
        isEXZone: false,
        battleCircles: initBattleCircles(),
        gaugeSpeedBoost: false,

        settings: {
            scope: 1 as cond.TargetScope,
            gauge: 6 as cond.GaugeValue,
            isCritical: false as boolean,
            isSuperEffective: false as boolean, // 效果絕佳强化
            effectiveType: "無" as cond.PokemonType,
            berry: 3 as cond.BerryNum,
            moveuse: 108,
        },
    }),

    getters: {
    },

    actions: {
    },
});
