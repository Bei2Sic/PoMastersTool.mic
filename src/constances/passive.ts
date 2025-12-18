import { LogicType, MoveScope, PassiveSkillModel } from "@/types/passiveModel";

export const PASSIVE_OVERRIDES: Record<string, PassiveSkillModel[]> = {
    小智的熱忱: [
        {
            name: "小智的熱忱",
            desc: "",
            passiveName: "小智的熱忱",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
    ],
    坂木的經驗: [
        {
            name: "坂木的經驗",
            desc: "",
            passiveName: "坂木的經驗",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
    ],
    洛茲的成就: [
        {
            name: "洛茲的成就",
            desc: "",
            passiveName: "洛茲的成就",
            multiplier: {
                scope: MoveScope.Move,
                value: 0.2,
            },
            condition: {
                key: "鋼屬性",
                detail: "自身",
                logic: LogicType.MoveType,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 0,
            },
            applyToParty: false,
        },
    ],
    紅髮的叛逆心: [
        {
            name: "紅髮的叛逆心",
            desc: "",
            passiveName: "紅髮的叛逆心",
            multiplier: {
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
                value: 0,
            },
            applyToParty: true,
        },
    ],
    莽撞又衝動: [
        {
            name: "莽撞又衝動",
            desc: "",
            passiveName: "莽撞又衝動",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
    ],
    工廠頭目的知識: [
        {
            name: "工廠頭目的知識",
            desc: "",
            passiveName: "工廠頭目的知識",
            multiplier: {
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
                value: 0,
            },
            applyToParty: true,
        },
    ],
    新手老師的機智: [
        {
            name: "新手老師的機智",
            desc: "",
            passiveName: "新手老師的機智",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
        {
            name: "新手老師的機智",
            desc: "",
            passiveName: "新手老師的機智",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
    ],
    百聞不如一見: [
        {
            name: "百聞不如一見",
            desc: "",
            passiveName: "百聞不如一見",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
    ],
    首席冠軍的才華: [
        {
            name: "首席冠軍的才華",
            desc: "",
            passiveName: "首席冠軍的才華",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
        {
            name: "首席冠軍的才華",
            desc: "",
            passiveName: "首席冠軍的才華",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
    ],
    王家的財力: [
        {
            name: "王家的財力",
            desc: "",
            passiveName: "王家的財力",
            multiplier: {
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
                value: 0,
            },
            applyToParty: true,
        },
    ],
    真新的啟程: [
        {
            name: "真新的啟程",
            desc: "",
            passiveName: "真新的啟程",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
    ],
    豐緣的熱忱: [
        {
            name: "豐緣的熱忱",
            desc: "",
            passiveName: "豐緣的熱忱",
            multiplier: {
                scope: MoveScope.All,
                value: 0.2,
            },
            condition: {
                key: "晴天",
                detail: "自身",
                logic: LogicType.Weather,
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 0,
            },
            applyToParty: true,
        },
        {
            name: "豐緣的熱忱",
            desc: "",
            passiveName: "豐緣的熱忱",
            multiplier: {
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
                    key: "地面屬性",
                    detail: "自身",
                    logic: LogicType.MoveType,
                },
            ],
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 0,
            },
            applyToParty: true,
        },
    ],
    洗翠流動的時間: [
        {
            name: "洗翠流動的時間",
            desc: "",
            passiveName: "洗翠流動的時間",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
    ],
    破壞的本能: [
        {
            name: "破壞的本能",
            desc: "",
            passiveName: "破壞的本能",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
    ],
    力大無窮: [
        {
            name: "力大無窮",
            desc: "",
            passiveName: "力大無窮",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
    ],
    攻擊程式: [
        {
            name: "攻擊程式",
            desc: "",
            passiveName: "攻擊程式",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
    ],
    保護夥伴的決心: [
        {
            name: "保護夥伴的決心",
            desc: "",
            passiveName: "保護夥伴的決心",
            multiplier: {
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
                value: 0,
            },
            applyToParty: true,
        },
    ],
    熾烈熱舞: [
        {
            name: "熾烈熱舞",
            desc: "",
            passiveName: "熾烈熱舞",
            multiplier: {
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
                value: 0,
            },
            applyToParty: false,
        },
    ],
};
