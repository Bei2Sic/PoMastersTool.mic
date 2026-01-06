// useDamageCalcStore.ts

import {
    CRITBUFF_STATUSES,
    HINDRANCE_STATUSES,
    POKEMON_TYPES,
} from "@/constances/battle";
import * as cond from "@/types/conditions"; // 導入上面的類型
import { defineStore } from "pinia";

// 輔助函數：初始化 18 種屬性抵抗表 (全為 0)
const initRebuffs = (): cond.TypeRebuffs => {
    return POKEMON_TYPES.reduce(
        (acc, type) => ({ ...acc, [type]: 0 }),
        {} as cond.TypeRebuffs
    );
};

const initCritbuffs = (): Record<cond.CritBuffType, boolean> => {
    return Object.fromEntries(
        CRITBUFF_STATUSES.map((status) => [status, false])
    ) as Record<cond.CritBuffType, boolean>;
};

const initHindrances = (): Record<cond.HindranceType, boolean> => {
    return Object.fromEntries(
        HINDRANCE_STATUSES.map((status) => [status, false])
    ) as Record<cond.HindranceType, boolean>;
};

const initBattleCircles = (): cond.BattleCircle => {
    const map: Partial<cond.BattleCircle> = {};
    const regions: cond.RegionType[] = [
        "關都",
        "城都",
        "豐緣",
        "神奧",
        "合眾",
        "卡洛斯",
        "阿羅拉",
        "伽勒爾",
        "帕底亞",
        "帕希歐",
    ];
    regions.forEach((region) => {
        map[region] = {
            level: 0,
            actives: {
                物理: false,
                特殊: false,
                防禦: false,
            },
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
            themeType: "無" as cond.PokemonType,
            themeTypeAdd: 0 as number,
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
            syncBuff: 0 as number,
            currentHPPercent: 50 as number,
            // 異常狀態
            abnormal: "無" as cond.AbnormalType,
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
            syncBuff: 0 as number,
            abnormal: "無" as cond.AbnormalType,

            hindrance: initHindrances(),

            damageField: "無" as cond.DamageFieldType,

            currentHPPercent: 50 as number,

            typeRebuffs: initRebuffs(),
            critBuffs: initCritbuffs(),
            statLowerReduction: 5 as cond.StatLowerReduction,
        },

        weather: "無" as cond.WeatherType,
        isEXWeather: true,
        terrain: "無" as cond.TerrainType,
        isEXTerrain: false,
        zone: "無" as cond.ZoneType,
        isEXZone: true,
        battleCircles: initBattleCircles(),
        gaugeAcceleration: false,

        settings: {
            targetScope: 1 as cond.TargetScope,
            gauge: 6 as cond.GaugeValue,
            isCritical: true as boolean,
            isSuperEffective: false as boolean, // 效果絕佳强化
            effectiveType: "無" as cond.PokemonType,
            berry: 3 as cond.BerryNum,
            moveuse: 108,
        },

        special: {
            isMega: false,
        },

        config: {
            physical: 20 as number,
            special: 20 as number,
            sync: 20 as number,
            gearMove: 0 as number,
            gearSync: 0 as number,
        },
    }),

    getters: {},

    actions: {
        // 更新斗阵等级
        updateBattleCircleLevel(
            region: cond.RegionType,
            level: cond.CircleLevel
        ) {
            if (!this.battleCircles || !this.battleCircles[region]) {
                console.warn(
                    `Region ${region} not found in battleCircles state.`
                );
                return;
            }
            this.battleCircles[region].level = level;
        },

        // 更新组队技能字段
        updateThemeStats(themeStats: cond.PokemonStats) {
            this.user.theme = themeStats;
        },

        // 更新组队特定属性
        updateThemeType(type: cond.PokemonType) {
            this.user.themeType = type;
        },

        // 更新组队特定属性
        updateThemeTypeAdd(add: number) {
            this.user.themeTypeAdd = add;
        },
    },
});
