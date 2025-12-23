import { ExtraLogic, LogicType, MoveScope } from "@/types/calculator";
import { PassiveSkillModel } from "@/types/passiveModel";

export const PASSIVE_OVERRIDES: Record<string, PassiveSkillModel[]> = {
    小智的熱忱: [
        {
            name: "小智的熱忱",
            desc: "",
            passiveName: "小智的熱忱",
            boost: {
                scope: MoveScope.Specific,
                moveName: "打雷",
                value: 0.3,
            },
            condition: {
                key: "",
                detail: "自身",
                logic: LogicType.Direct,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    坂木的本領: [
        {
            name: "坂木的本領",
            desc: "",
            passiveName: "坂木的本領",
            boost: {
                scope: MoveScope.Move,
                value: 1.0,
            },
            condition: {
                key: "地面",
                detail: "自身",
                logic: LogicType.NoEffect,
                extra: ExtraLogic.TypeShift,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    坂木的經驗: [
        {
            name: "坂木的經驗",
            desc: "",
            passiveName: "坂木的經驗",
            boost: {
                scope: MoveScope.Move,
                value: 0.5,
            },
            condition: {
                key: "沙暴",
                detail: "自身",
                logic: LogicType.Weather,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    洛茲的成就: [
        {
            name: "洛茲的成就",
            desc: "",
            passiveName: "洛茲的成就",
            boost: {
                scope: MoveScope.Move,
                value: 0.2,
            },
            condition: {
                key: "鋼",
                detail: "自身",
                logic: LogicType.MoveType,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    紅髮的叛逆心: [
        {
            name: "紅髮的叛逆心",
            desc: "",
            passiveName: "紅髮的叛逆心",
            boost: {
                scope: MoveScope.Move,
                value: 0.2,
            },
            condition: {
                key: "沙暴",
                detail: "自身",
                logic: LogicType.Weather,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: true,
        },
    ],
    莽撞又衝動: [
        {
            name: "莽撞又衝動",
            desc: "",
            passiveName: "莽撞又衝動",
            boost: {
                scope: MoveScope.Specific,
                moveName: "近身戰",
                value: 0.5,
            },
            condition: {
                key: "",
                detail: "自身",
                logic: LogicType.Direct,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    工廠頭目的知識: [
        {
            name: "工廠頭目的知識",
            desc: "",
            passiveName: "工廠頭目的知識",
            boost: {
                scope: MoveScope.Move,
                value: 0.2,
            },
            condition: {
                key: "禁止替換",
                detail: "對手",
                logic: LogicType.Hindrance,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: true,
        },
    ],
    新手老師的機智: [
        {
            name: "新手老師的機智",
            desc: "",
            passiveName: "新手老師的機智",
            boost: {
                scope: MoveScope.Move,
                value: 0.05,
            },
            condition: {
                key: "物理招式威力增強",
                detail: "自身",
                direction: "提升",
                logic: LogicType.BoostScaling,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
        {
            name: "新手老師的機智",
            desc: "",
            passiveName: "新手老師的機智",
            boost: {
                scope: MoveScope.Sync,
                value: 0.1,
            },
            condition: {
                key: "物理招式威力增強",
                detail: "自身",
                direction: "提升",
                logic: LogicType.BoostScaling,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    百聞不如一見: [
        {
            name: "百聞不如一見",
            desc: "",
            passiveName: "百聞不如一見",
            boost: {
                scope: MoveScope.Move,
                value: 0.5,
            },
            condition: {
                key: "计量槽消耗增加",
                detail: "自身",
                logic: LogicType.GaugeCost,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    首席冠軍的才華: [
        {
            name: "首席冠軍的才華",
            desc: "",
            passiveName: "首席冠軍的才華",
            boost: {
                scope: MoveScope.Specific,
                moveName: "百花怒放晶光轉轉",
                value: 1.0,
            },
            condition: {
                key: "计量槽消耗增加",
                detail: "自身",
                logic: LogicType.GaugeCost,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
        {
            name: "首席冠軍的才華",
            desc: "",
            passiveName: "首席冠軍的才華",
            boost: {
                scope: MoveScope.Specific,
                moveName: "晶光轉轉",
                value: 1.0,
            },
            condition: {
                key: "计量槽消耗增加",
                detail: "自身",
                logic: LogicType.GaugeCost,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    王家的財力: [
        {
            name: "王家的財力",
            desc: "",
            passiveName: "王家的財力",
            boost: {
                scope: MoveScope.All,
                value: 0.4,
            },
            condition: {
                key: "帕希歐鬥陣(防禦)",
                detail: "自身",
                logic: LogicType.BattleCircle,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: true,
        },
    ],
    真新的啟程: [
        {
            name: "真新的啟程",
            desc: "",
            passiveName: "真新的啟程",
            boost: {
                scope: MoveScope.Sync,
                value: 0.1,
            },
            condition: {
                key: "特殊招式威力增强",
                detail: "自身",
                direction: "提升",
                logic: LogicType.BoostScaling,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    披著披風的龍之使者: [
        {
            name: "披著披風的龍之使者",
            desc: "",
            passiveName: "披著披風的龍之使者",
            boost: {
                scope: MoveScope.Move,
                value: 0.0,
            },
            condition: {
                key: "龍",
                detail: "自身",
                logic: LogicType.NoEffect,
                extra: ExtraLogic.TypeShift,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    浪跡天涯的冠軍: [
        {
            name: "浪跡天涯的冠軍",
            desc: "",
            passiveName: "浪跡天涯的冠軍",
            boost: {
                scope: MoveScope.Move,
                value: 0.0,
            },
            condition: {
                key: "蟲",
                detail: "自身",
                logic: LogicType.NoEffect,
                extra: ExtraLogic.TypeShift,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    豐緣的熱忱: [
        {
            name: "豐緣的熱忱",
            desc: "",
            passiveName: "豐緣的熱忱",
            boost: {
                scope: MoveScope.All,
                value: 0.2,
            },
            condition: {
                key: "複合條件",
                detail: "自身",
                logic: LogicType.Compound,
            },
            conditions: [
                {
                    key: "晴天",
                    detail: "自身",
                    logic: LogicType.Weather,
                },
                {
                    key: "地面",
                    detail: "自身",
                    logic: LogicType.MoveType,
                },
            ],
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: true,
        },
    ],
    洗翠流動的時間: [
        {
            name: "洗翠流動的時間",
            desc: "",
            passiveName: "洗翠流動的時間",
            boost: {
                scope: MoveScope.Move,
                value: 0.5,
            },
            condition: {
                key: "晴天",
                detail: "自身",
                logic: LogicType.Weather,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    破壞的本能: [
        {
            name: "破壞的本能",
            desc: "",
            passiveName: "破壞的本能",
            boost: {
                scope: MoveScope.All,
                value: 0.5,
            },
            condition: {
                key: "沙暴",
                detail: "自身",
                logic: LogicType.Weather,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    力大無窮: [
        {
            name: "力大無窮",
            desc: "",
            passiveName: "力大無窮",
            boost: {
                scope: MoveScope.Specific,
                moveName: "地震",
                value: 0.9,
            },
            condition: {
                key: "",
                detail: "自身",
                logic: LogicType.Direct,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    攻擊程式: [
        {
            name: "攻擊程式",
            desc: "",
            passiveName: "攻擊程式",
            boost: {
                scope: MoveScope.Specific,
                moveName: "破壞光綫",
                value: 0.5,
            },
            condition: {
                key: "",
                detail: "自身",
                logic: LogicType.Direct,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    保護夥伴的決心: [
        {
            name: "保護夥伴的決心",
            desc: "",
            passiveName: "保護夥伴的決心",
            boost: {
                scope: MoveScope.All,
                value: 0.2,
            },
            condition: {
                key: "合眾鬥陣(防禦)",
                detail: "自身",
                logic: LogicType.BattleCircle,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: true,
        },
    ],
    熾烈熱舞: [
        {
            name: "熾烈熱舞",
            desc: "",
            passiveName: "熾烈熱舞",
            boost: {
                scope: MoveScope.Move,
                value: 0.5,
            },
            condition: {
                key: "異常狀態",
                detail: "自身",
                logic: LogicType.AbnormalActive,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    關都的耀眼傳說: [
        {
            name: "關都的耀眼傳說",
            desc: "",
            passiveName: "關都的耀眼傳說",
            boost: {
                scope: MoveScope.MoveAndSync,
                value: 0.15,
                baseValue: 0.2,
            },
            condition: {
                key: "關都",
                detail: "自身",
                logic: LogicType.MasterPassive,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: true,
        },
    ],
    洗翠的耀眼珍珠: [
        {
            name: "洗翠的耀眼珍珠",
            desc: "",
            passiveName: "洗翠的耀眼珍珠",
            boost: {
                scope: MoveScope.MoveAndSync,
                value: 0.15,
                baseValue: 0.2,
            },
            condition: {
                key: "神奧",
                detail: "自身",
                logic: LogicType.MasterPassive,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: true,
        },
    ],
    洗翠的寶可夢馴化師: [
        {
            name: "洗翠的寶可夢馴化師",
            desc: "",
            passiveName: "洗翠的寶可夢馴化師",
            boost: {
                scope: MoveScope.MoveAndSync,
                value: 0.15,
                baseValue: 0.2,
            },
            condition: {
                key: "神奧",
                detail: "自身",
                logic: LogicType.MasterPassive,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: true,
        },
    ],
    合眾的溫柔英雄: [
        {
            name: "合眾的溫柔英雄",
            desc: "",
            passiveName: "合眾的溫柔英雄",
            boost: {
                scope: MoveScope.MoveAndSync,
                value: 0.15,
                baseValue: 0.2,
            },
            condition: {
                key: "合眾",
                detail: "自身",
                logic: LogicType.MasterPassive,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: true,
        },
    ],
    極低溫冷氣: [
        {
            name: "極低溫冷氣",
            desc: "",
            passiveName: "極低溫冷氣",
            boost: {
                scope: MoveScope.Specific,
                moveName: "冰凍光束",
                value: 1.0,
            },
            condition: {
                key: "",
                detail: "自身",
                logic: LogicType.Direct,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: false,
        },
    ],
    合眾的熱血少女: [
        {
            name: "合眾的熱血少女",
            desc: "",
            passiveName: "合眾的熱血少女",
            boost: {
                scope: MoveScope.MoveAndSync,
                value: 0.15,
                baseValue: 0.2,
            },
            condition: {
                key: "合眾",
                detail: "自身",
                logic: LogicType.MasterPassive,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: true,
        },
    ],
    伽勒爾的耀眼王牌: [
        {
            name: "伽勒爾的耀眼王牌",
            desc: "",
            passiveName: "伽勒爾的耀眼王牌",
            boost: {
                scope: MoveScope.MoveAndSync,
                value: 0.15,
                baseValue: 0.2,
            },
            condition: {
                key: "伽勒爾",
                detail: "自身",
                logic: LogicType.MasterPassive,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: true,
        },
    ],
    夯到不行的北上潮女: [
        {
            name: "夯到不行的北上潮女",
            desc: "",
            passiveName: "夯到不行的北上潮女",
            boost: {
                scope: MoveScope.MoveAndSync,
                value: 0.15,
                baseValue: 0.2,
            },
            condition: {
                key: "帕底亞",
                detail: "自身",
                logic: LogicType.MasterPassive,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 1.0,
            },
            applyToParty: true,
        },
    ],
};
