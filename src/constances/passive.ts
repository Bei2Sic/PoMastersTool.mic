// @/core/constants/skillOverrides.ts
import { LogicType, MoveScope, PassiveSkillModel } from "@/types/passiveModel"; // 假設路徑

// 這是一個映射表：技能名稱 -> 手寫的解析結果
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
                logic: LogicType.Complex,
            },
            condition: {
                key: "",
                detail: "自身",
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
                logic: LogicType.Weather,
            },
            condition: {
                key: "沙暴",
                detail: "自身",
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
                logic: LogicType.SyncType,
            },
            condition: {
                key: "鋼屬性",
                detail: "自身",
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 0,
            },
            applyToParty: false,
        },
    ],
    挖掘化石的成果: [
        {
            name: "挖掘化石的成果",
            desc: "",
            passiveName: "挖掘化石的成果",
            multiplier: {
                scope: MoveScope.Move,
                value: 0.2,
                logic: LogicType.SyncType,
            },
            condition: {
                key: "岩石屬性",
                detail: "自身",
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 0,
            },
            applyToParty: true,
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
                logic: LogicType.Weather,
            },
            condition: {
                key: "沙暴",
                detail: "自身",
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 0,
            },
            applyToParty: true,
        },
    ],
    "我活力十足喔~!": [
        {
            name: "我活力十足喔~!",
            desc: "",
            passiveName: "我活力十足喔~!",
            multiplier: {
                scope: MoveScope.Move,
                value: 0.2,
                logic: LogicType.SyncType,
            },
            condition: {
                key: "一般屬性",
                detail: "自身",
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 0,
            },
            applyToParty: true,
        },
    ],
    高峰上感受到的風: [
        {
            name: "高峰上感受到的風",
            desc: "",
            passiveName: "高峰上感受到的風",
            multiplier: {
                scope: MoveScope.Move,
                value: 0.2,
                logic: LogicType.SyncType,
            },
            condition: {
                key: "飛行屬性",
                detail: "自身",
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
                logic: LogicType.Complex,
            },
            condition: {
                key: "",
                detail: "自身",
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 0,
            },
            applyToParty: false,
        },
    ],
    幽靈們的輪舞曲: [
        {
            name: "幽靈們的輪舞曲",
            desc: "",
            passiveName: "幽靈們的輪舞曲",
            multiplier: {
                scope: MoveScope.Move,
                value: 0.2,
                logic: LogicType.SyncType,
            },
            condition: {
                key: "幽靈屬性",
                detail: "自身",
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 0,
            },
            applyToParty: true,
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
                logic: LogicType.Hindrance,
            },
            condition: {
                key: "禁止替換",
                detail: "對手",
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
                logic: LogicType.BoostScaling,
            },
            condition: {
                key: "物理招式威力增強",
                detail: "自身",
                direction: "提升",
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
                logic: LogicType.BoostScaling,
            },
            condition: {
                key: "禁止替換",
                detail: "對手",
            },
            statBoost: {
                isStatBoost: false,
                stats: [],
                value: 0,
            },
            applyToParty: false,
        },
    ],
    極巨化・伸展台: [
        {
            name: "極巨化・伸展台",
            desc: "",
            passiveName: "極巨化・伸展台",
            multiplier: {
                scope: MoveScope.Max,
                value: 0.9,
                logic: LogicType.Weather,
            },
            condition: {
                key: "下雨",
                detail: "自身",
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
