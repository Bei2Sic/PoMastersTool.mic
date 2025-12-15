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
            hindrance: {
                isConfused: false as boolean, // 混亂
                isFlinching: false as boolean, // 畏縮
                isTrapped: false as boolean, // 束縛
                isRestrained: false as boolean, // 禁止替換
            },
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
                atk: 0 as cond.StatRank,
                def: 0 as cond.StatRank,
                spa: 0 as cond.StatRank,
                spd: 0 as cond.StatRank,
                spe: 0 as cond.StatRank,
                acc: 0 as cond.StatRank,
                eva: 0 as cond.StatRank,
                ct: 0 as cond.CtRank,
            },

            // 異常狀態
            abnormal: "無" as cond.AbnormalType,

            // 妨害狀態
            hindrance: {
                isConfused: false as boolean, // 混亂
                isFlinching: false as boolean, // 畏縮
                isTrapped: false as boolean, // 束縛
                isRestrained: false as boolean, // 禁止替換
            },

            // 傷害場地
            damageField: "無" as cond.DamageFieldType,

            // 屬性抵抗 (Rebuffs)
            typeRebuffs: initRebuffs(),
        },

        weather: "無" as cond.WeatherType,
        terrain: "無" as cond.TerrainType,
        zone: "無" as cond.ZoneType,
        battleCircles: [] as cond.BattleCircle[],

        // todo: 大師被動

        // move: {
        //     power: 100 as number,
        //     type: "一般" as cond.PokemonType, // 招式屬性
        //     isPhysical: true as boolean, // 物理/特殊
        //     isSyncMove: false as boolean,
        //     isMaxMove: false as boolean,
        // },

        settings: {
            scope: 1 as 1 | 2 | 3, // 攻擊目標數 (1-3)
            gauge: 6 as cond.GaugeValue, // 剩餘計數槽 (1-6)
            isCritical: false as boolean, // 命中要害
            isEffective: false as boolean, // 效果絕佳
            effectiveType: "無" as cond.PokemonType,
        },

        minDamage: 0 as number,
        maxDamage: 0 as number,
    }),

    getters: {
        // Getter: 獲取指定鬥陣的等級 (如果沒有則為 0)
        getCircleLevel:
            (state) =>
            (
                region: cond.RegionType,
                category: cond.CircleCategory
            ): cond.CircleLevel | 0 => {
                const circle = state.battleCircles.find(
                    (c) => c.region === region && c.category === category
                );
                return circle ? circle.level : 0;
            },

        // 目標是否處於異常狀態
        isTargetInAbnormal: (state) => {
            return state.target.abnormal !== "無";
        },
        // 目標是否處於妨害狀態
        isTargetHindered: (state) => {
            const h = state.target.hindrance;
            return (
                h.isConfused || h.isFlinching || h.isTrapped || h.isRestrained
            );
        },
        // 判斷目標是否處於能力非提升狀態
        isTargetStatsNotRaised: (state) => {
            const ranks = state.target.ranks;
            // 檢查所有相關能力等級是否小於等於 0
            return (
                // 攻擊能力等級
                ranks.atk <= 0 &&
                ranks.spa <= 0 &&
                // 防禦能力等級
                ranks.def <= 0 &&
                ranks.spd <= 0 &&
                // 速度、命中、閃避，要害
                ranks.spe <= 0 &&
                ranks.acc <= 0 &&
                ranks.eva <= 0 &&
                ranks.ct <= 0
            );
        },
        // 判断是否天气正常
        isWeatherInNoramal: (state) => {
            return state.weather === "無";
        },
        // 判斷是否有場地效果
        hasFieldEffect:(state)=>{
            // zone & terrian & circle
        },
    },

    actions: {
        // Action: 設置或更新鬥陣狀態 (支援多開和等級)
        setCircle(
            region: cond.RegionType,
            category: cond.CircleCategory,
            level: cond.CircleLevel | 0
        ) {
            if (region === "無" || category === "無") return;

            const index = this.battleCircles.findIndex(
                (c) => c.region === region && c.category === category
            );

            if (level > 0) {
                if (index > -1) {
                    this.battleCircles[index].level = level as cond.CircleLevel; // 更新等級
                } else {
                    this.battleCircles.push({
                        region,
                        category,
                        level: level as cond.CircleLevel,
                    }); // 新增鬥陣
                }
            } else if (index > -1) {
                this.battleCircles.splice(index, 1); // 等級為 0，則移除
            }
        },

        // 其他如 setWeather, updateStatRank 等 action...
    },
});
