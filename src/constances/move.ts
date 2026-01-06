import { ABNORMAL_STATUSES, HINDRANCE_STATUSES, STATS } from "@/constances/battle";
import {
    SINGLE_STAT_SYNC_MULTIPLIERS,
} from "@/constances/rate";
import {
    getStatKeyByStatCnName,
} from "@/core/exporter/map";
import { EffectLogic, ExtraLogic, LogicType } from "@/types/calculator";
import { MoveSkillModel } from "@/types/moveModel";

export const MOVE_OVERRIDES: Record<string, MoveSkillModel[]> = {
    硬撐: [{
        name: "硬撐",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "複合狀態",
            detail: "自身",
            logic: LogicType.MultiStatusActive,
            keys: {
                abnormal: ABNORMAL_STATUSES.filter(status =>
                    !["睡眠"].includes(status)
                ),
            },
        },
        boost: 200,
    },{
        name: "硬撐",
        desc: "",
        effect: EffectLogic.ExtraType,
        extra: {
            key:"",
            detail:"自身",
            logic: ExtraLogic.BurnUseless,
        },
        condition: {
            key: "",
            detail: "",
            logic: LogicType.Direct,
        },
    }],
    陀螺球: [{
        name: "陀螺球",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "速度",
            detail: "對手",
            direction: "提高",
            logic: LogicType.StatChange,
        },
        boost: 200,
    }],
    鹽水: [{
        name: "鹽水",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "HP一半",
            detail: "對手",
            direction: "以下",
            logic: LogicType.HPHalf,
        },
        boost: 200,
    }],
    毒液衝擊: [{
        name: "毒液衝擊",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "中毒",
            detail: "對手",
            logic: LogicType.Abnormal,
        },
        boost: 200,
    }],
    禍不單行: [{
        name: "禍不單行",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "異常狀態",
            detail: "對手",
            logic: LogicType.AbnormalActive,
        },
        boost: 200,
    }],
    極巨炮: [{
        name: "極巨炮",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "氣魄",
            detail: "對手",
            direction: "充滿",
            logic: LogicType.SyncBuffs,
        },
        boost: 150,
    }],
    巨獸斬: [{  
        name: "巨獸斬",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "氣魄",
            detail: "對手",
            direction: "充滿",
            logic: LogicType.SyncBuffs,
        },
        boost: 150,
    }],
    巨獸彈: [{
        name: "巨獸彈",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "氣魄",
            detail: "對手",
            direction: "充滿",
            logic: LogicType.SyncBuffs,
        },
        boost: 150,
    }],
    群魔亂舞: [{
        name: "群魔亂舞",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "異常狀態",
            detail: "對手",
            logic: LogicType.AbnormalActive,
        },
        boost: 200,
    }],
    全開猛撞: [{
        name: "全開猛撞",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "效果絕佳",
            detail: "自身",
            direction: "是",
            logic: LogicType.SuperEffective,
        },
        boost: 130,
    }],
    閃電猛衝: [{
        name: "閃電猛衝",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "效果絕佳",
            detail: "自身",
            direction: "是",
            logic: LogicType.SuperEffective,
        },
        boost: 130,
    }],
    怒火中燒・烈: [{
        name: "怒火中燒・烈",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "危機",
            detail: "自身",
            logic: LogicType.HPLow,
        },
        boost: 120,
    }],
    瘋狂電網: [{    
        name: "瘋狂電網",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "妖精領域",
            detail: "自身",
            logic: LogicType.Terrain,
        },
        boost: 200,
    }],
    狂熱污泥波: [{
        name: "狂熱污泥波",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "電氣場地",
            detail: "自身",
            logic: LogicType.Terrain,
        },
        boost: 150,
    }],
    哀響破音: [{
        name: "哀響破音",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "異常狀態",
            detail: "對手",
            logic: LogicType.AbnormalActive,
        },
        boost: 120,
    }],
    冤冤相報・幻妖: [{
        name: "冤冤相報・幻妖",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "複合狀態",
            detail: "對手",
            logic: LogicType.MultiStatusActive,
            keys: {
                abnormal: ABNORMAL_STATUSES,
                hindrance: HINDRANCE_STATUSES.filter(status =>
                    !["禁止替換"].includes(status)
                ),
            },
        },
        boost: 200,
    }],  
    昇焰之禍不單行: [{  
        name: "昇焰之禍不單行",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "複合狀態",
            detail: "對手",
            logic: LogicType.MultiStatusActive,
            keys: {
                abnormal: ABNORMAL_STATUSES,
                hindrance: HINDRANCE_STATUSES.filter(status =>
                    !["禁止替換"].includes(status)
                ),
            },
        },
        boost: 200,
    }],
    S・全開猛撞: [{ 
        name: "S・全開猛撞",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "效果絕佳",
            detail: "自身",
            direction: "是",
            logic: LogicType.SuperEffective,
        },
        boost: 130,
    }],
    V・閃電猛衝: [{
        name: "V・閃電猛衝",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "效果絕佳",
            detail: "自身",
            direction: "是",
            logic: LogicType.SuperEffective,
        },
        boost: 130,
    }],
    巨獸斬・蒼牙: [{
        name: "巨獸斬・蒼牙",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "氣魄",
            detail: "對手",
            direction: "充滿",
            logic: LogicType.SyncBuffs,
        },
        boost: 200,
    }],
    群魔亂舞・逢魔: [{
        name: "群魔亂舞・逢魔",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "異常狀態",
            detail: "對手",
            logic: LogicType.AbnormalActive,
        },
        boost: 200,
    }],
    氣旋攻擊・聖海: [{
        name: "氣旋攻擊・聖海",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "異常狀態",
            detail: "對手",
            logic: LogicType.AbnormalActive,
        },
        boost: 150,
    }],
    輝爪之龍爪: [{
        name: "輝爪之龍爪",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "氣魄",
            detail: "自身",
            direction: "沒有",
            logic: LogicType.SyncBuffs,
        },
        boost: 200,
    }],
    幻光之禍不單行: [{
        name: "幻光之禍不單行",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "異常狀態",
            detail: "對手",
            logic: LogicType.AbnormalActive,
        },
        boost: 200,
    }],
    絢麗之破壞光線: [{
        name: "絢麗之破壞光線",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "異常狀態",
            detail: "對手",
            logic: LogicType.AbnormalActive,
        },
        boost: 200,
    }],
    暴風・聖嵐: [{
        name: "暴風・聖嵐",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "自身",
            logic: LogicType.IsMega,
        },
        boost: 200,
    }],
    光刃之精神劍: [{
        name: "光刃之精神劍",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "任一場地",
            detail: "自身",
            logic: LogicType.TerrainActive,
        },
        boost: 150,
    }],

    // 複雜倍率
    鏡面反射: [{
        name: "鏡面反射",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler
        },
        handler: (env) => {
            const hpPercent = env.user.hpPercent;
            if (hpPercent >= 68) {
                return 100;
            } else if (hpPercent < 68 || hpPercent >= 51) {
                return 150;
            } else if (hpPercent < 51 || hpPercent >= 18) {
                return 223;
            } else if (hpPercent < 18 || hpPercent > 0) {
                return 337;
            }
        }
    }],
    噴火: [{    
        name: "噴火",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const hpPercent = env.user.hpPercent;
            if (hpPercent === 100) {
                return 100;
            } else if (hpPercent < 100 || hpPercent >= 50) {
                return 80;
            } else if (hpPercent < 50 || hpPercent >= 33) {
                return 65;
            } else if (hpPercent < 33 || hpPercent > 0) {
                return 45;
            }
        }
    }],
    金屬爆炸: [{    
        name: "金屬爆炸",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        // 鏡面反射同款
        handler: (env) => {
            const hpPercent = env.user.hpPercent;
            if (hpPercent >= 68) {
                return 100;
            } else if (hpPercent < 68 || hpPercent >= 51) {
                return 150;
            } else if (hpPercent < 51 || hpPercent >= 18) {
                return 223;
            } else if (hpPercent < 18 || hpPercent > 0) {
                return 337;
            }
        }
    }],
    捏碎: [{    
        name: "捏碎",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const hpPercent = env.target.hpPercent;
            if (hpPercent === 100) {
                return 100;
            } else if (hpPercent < 100 || hpPercent >= 50) {
                return 70;
            } else if (hpPercent < 50 || hpPercent >= 33) {
                return 40;
            } else if (hpPercent < 33 || hpPercent > 0) {
                return 20;
            }
        }
    }],
    輔助力量: [{
        name: "輔助力量",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const stats = env.user.ranks;
            let ranks = 0;
            STATS.forEach((statName) => {
                const statKey = getStatKeyByStatCnName(statName);
                const rankValue = stats[statKey];
                ranks += rankValue < 0 ? 0 : rankValue;
            });
            const totalRank = Math.min(
                ranks,
                11
            );
            // 最高11層
            return (totalRank + 1) * 100;
        }
    }],
    囂張: [{    
        name: "囂張",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        // 輔助力量同款
        handler: (env) => {
            const stats = env.user.ranks;
            let ranks = 0;
            STATS.forEach((statName) => {
                const statKey = getStatKeyByStatCnName(statName);
                const rankValue = stats[statKey];
                ranks += rankValue < 0 ? 0 : rankValue;
            });
            const totalRank = Math.min(
                ranks,
                11
            );
            // 最高11層,自身倍率
            return (totalRank + 1) * 100;
        }
    }  ],
    友情十萬伏特: [{
        name: "友情十萬伏特",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const gauges = env.settings.gauge;
            const rate = gauges * 25
            return rate + 100;
        }
    }],
    電光雙擊・迅: [{
        name: "電光雙擊・迅",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const spes = env.user.ranks.spe > 0 ? env.user.ranks.spe : 0;
            const rate = spes * 50
            return rate + 100;
        }
    }],
    摧毀之地震: [{
        name: "摧毀之地震",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const spas = env.user.ranks.spa > 0 ? env.user.ranks.spa : 0;
            const rate = spas * 5
            return rate + 100;
        }
    }],
    突圍花朵加農炮: [{
        name: "突圍花朵加農炮",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const spas = env.target.ranks.spa < 0 ? Math.abs(env.target.ranks.spa) : 0;
            const rate = spas * 30
            return rate + 100;
        }
    }],
    突飛猛撲・朦朧: [{  
        name: "突飛猛撲・朦朧",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const hpPercent = env.user.hpPercent;
            if (hpPercent === 100) {
                return 100;
            } else if (hpPercent < 100 || hpPercent >= 75) {
                return 110;
            } else if (hpPercent < 75 || hpPercent >= 50) {
                return 120;
            } else if (hpPercent < 50 || hpPercent >= 25) {
                return 130;
            } else if (hpPercent < 25 || hpPercent > 0) {
                return 150;
            }
        }
    }  ],
    原型輔助力量: [{    
        name: "原型輔助力量",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const stats = env.user.ranks;
            let ranks = 0;
            STATS.forEach((statName) => {
                const statKey = getStatKeyByStatCnName(statName);
                const rankValue = stats[statKey];
                ranks += rankValue < 0 ? 0 : rankValue;
            });
            // 安全
            const totalRank = Math.min(
                ranks,
                45
            );
            // 最高11層
            return totalRank * 10 + 100;
        }
    }],
    黑風・枯葉風暴: [   {    
        name: "黑風・枯葉風暴",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const phyBoosts = env.user.boosts.physical > 0 ? env.user.boosts.physical : 0;
            const rate = phyBoosts * 5
            return rate + 100;
        }
    }],
    幽魂流星光束: [ {
        name: "幽魂流星光束",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const spds = env.target.ranks.spd < 0 ? Math.abs(env.target.ranks.spd) : 0;
            const rate = spds * 5
            return rate + 100;
        }
    }    ],
    破壞光線・轟天: [{  
        name: "破壞光線・轟天",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const defs = env.target.ranks.def < 0 ? Math.abs(env.target.ranks.def) : 0;
            const spds = env.target.ranks.spd < 0 ? Math.abs(env.target.ranks.spd) : 0;
            const rate = (spds + defs) * 20
            return rate + 100;
        }
    }    ],
    完美仆斬: [{    
        name: "完美仆斬",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const syncBoosts = env.user.boosts.sync > 0 ? env.user.boosts.sync : 0;
            const rate = syncBoosts * 10
            return rate + 100;
        }
    }    ],
    水流裂破森巴: [{        
        name: "水流裂破森巴",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const spes = env.user.ranks.spe > 0 ? env.user.ranks.spe : 0;
            const rate = spes * 10
            return rate + 100;
        }
    }    ],
    咬碎・暴食: [{    
        name: "咬碎・暴食",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const defs = env.user.ranks.def > 0 ? env.user.ranks.def : 0;
            const spds = env.user.ranks.spd > 0 ? env.user.ranks.spd : 0;
            const rate = (spds + defs) * 25
            return rate + 100;
        }
    }],
    爆炎之魔法火焰: [{
        name: "爆炎之魔法火焰",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const defs = env.user.ranks.def < 0 ? Math.abs(env.user.ranks.def) : 0;
            const safeIndex = Math.min(defs, 6)
            // 精確點, 使用手寫倍率表
            const rate = SINGLE_STAT_SYNC_MULTIPLIERS[safeIndex]
            return (rate + 1) * 100;
        }
    }],
    暗黑爆破・暝天: [{
        name: "暗黑爆破・暝天",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const stats = env.target.ranks;
            let ranks = 0;
            STATS.forEach((statName) => {
                const statKey = getStatKeyByStatCnName(statName);
                const rankValue = stats[statKey];
                ranks += rankValue < 0 ? Math.abs(rankValue) : 0;
            });
            // 安全
            const totalRank = Math.min(
                ranks,
                45
            );

            return totalRank * 10 + 100;
        }
    }],
    邪惡靈魂暗影球: [{
        name: "邪惡靈魂暗影球",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const uses = env.settings.moveuse;
            const rate = uses * 5
            return rate + 100;
        }
    }],
    能量球・繚亂: [{
        name: "能量球・繚亂",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const berrys = env.settings.berry;
            switch (berrys) {
                case 3:
                    return 500;
                case 2:
                    return 300;
                case 1:
                    return 150;
                default:
                    return 100;
            }
        }
    }],
    破壞光線・陽天: [{
        name: "破壞光線・陽天",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        // 友十同款
        handler: (env) => {
            const gauges = env.settings.gauge;
            const rate = gauges * 25
            return rate + 100;
        }
    }],
    寶鱗之逆鱗: [{
        name: "寶鱗之逆鱗",
        desc: "",
        effect: EffectLogic.PowerBoost,
        condition: {
            key: "",
            detail: "",
            logic: LogicType.SpecialHandler,
        },
        handler: (env) => {
            const spBoosts = env.user.boosts.special > 0 ? env.user.boosts.special : 0;
            return (spBoosts + 1) * 100;
        }
    }],

    // 特殊效果
    歡喜雀躍心跳加速之格鬥衝擊: [{
        name: "歡喜雀躍心跳加速之格鬥衝擊",
        desc: "",
        effect: EffectLogic.ExtraType,
        condition: {
            key: "",
            detail: "自身",
            logic: LogicType.IsMega,
        },
        extra: {
            key: "格鬥",
            detail: "自身",
            logic: ExtraLogic.TypeShift,
        },
    }],
};
