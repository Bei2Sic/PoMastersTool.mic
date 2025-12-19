import { LogicType } from "@/types/calculator";
import { MoveSkillModel } from "@/types/moveModel";
// 假設這些常量在您的常量文件中定義
import {
    ABNORMAL_STATUSES,
    HINDRANCE_STATUSES,
    WEATHER_STATUSES,
} from "@/types/conditions";

export class MoveSkillParser {
    private name: string;
    private desc: string;

    constructor(name: string, desc: string) {
        this.name = name;
        this.desc = desc;
    }

    // 獲取解析結果
    public get result(): MoveSkillModel {
        // 处理通用被动
        const isValid = this.isValid(this.desc);
        if (!isValid) {
            return null;
        }
        const logicResult = this.resolveLogicAndCondition();

        return {
            name: this.name,
            desc: this.desc,

            condition: {
                key: logicResult.key,
                detail: logicResult.detail,
                direction: logicResult.direction,
                logic: logicResult.logic,
            },
        };
    }

    // 合法性檢查：只處理傷害相關
    private isValid(desc: string): boolean {
        // 带有 "威力會提高" or "威力就越大" or "會提高威力"
        const isBoost =
            desc.includes("威力會提高") ||
            desc.includes("威力就越大") ||
            desc.includes("會提高威力");

        return isBoost;
    }

    // --- 解析邏輯與條件 (Logic & Condition) ---
    private resolveLogicAndCondition(): {
        logic: LogicType;
        key: string;
        detail: string;
        direction?: string;
    } {
        const desc = this.desc;

        // 动态类
        if (desc.includes("越多,威力就越大")) {
            const match = desc.match(
                /(自己的|對手的)(.+?)(提高|降低)得越多，威力就越大/
            );
            if (match) {
                const targetStr = match[1];
                const statStr = match[2];
                const dirStr = match[3];

                const isTotal = statStr === "能力";

                return {
                    logic: isTotal
                        ? LogicType.TotalStatScaling
                        : LogicType.SingleStatScaling,
                    key: statStr,
                    detail: targetStr.includes("對手的") ? "對手" : "自身",
                    direction: dirStr === "降低" ? "下降" : "提升",
                };
            }
        }

        // 二元類
        if (desc.includes("天氣、場地或領域變化"))
            return {
                logic: LogicType.AnyFieldEffect,
                key: "天氣、場地或領域變化",
                detail: "自身",
            };
        if (desc.includes("天氣變化"))
            return {
                logic: LogicType.WeatherChange,
                key: "天氣變化",
                detail: "自身",
            };
        if (desc.includes("天氣沒有變化"))
            return {
                logic: LogicType.WeatherNormal,
                key: "天氣沒有變化",
                detail: "自身",
            };
        if (desc.includes("場地變化"))
            return {
                logic: LogicType.TerrainActive,
                key: "場地變化",
                detail: "自身",
            };
        if (desc.includes("任一鬥陣"))
            return {
                logic: LogicType.BattleCircleActive,
                key: "任一鬥陣",
                detail: "自身",
            };
        if (desc.includes("異常狀態"))
            return {
                logic: LogicType.AbnormalActive,
                key: "異常狀態",
                detail: desc.includes("對手") ? "對手" : "自身",
            };
        if (desc.includes("妨害狀態"))
            return {
                logic: LogicType.HindranceActive,
                key: "妨害狀態",
                detail: desc.includes("對手") ? "對手" : "自身",
            };
        if (desc.includes("任一能力未提高"))
            return {
                logic: LogicType.AllStatNotInHigh,
                key: "任一能力未提高",
                detail: desc.includes("對手") ? "對手" : "自身",
            };
        if (desc.includes("属性抵抗降低"))
            return {
                logic: LogicType.Rebuff,
                key: "任意",
                detail: "對手",
            };

        // 環境/狀態類
        // 傷害場地
        if (desc.includes("傷害場地")) {
            const match = desc.match(/(.+?傷害場地)/);
            if (match)
                return {
                    logic: LogicType.DamageField,
                    key: match[1],
                    detail: "對手",
                };
        }
        // 天氣
        for (const w of WEATHER_STATUSES) {
            if (desc.includes(w))
                return {
                    logic: LogicType.Weather,
                    key: w,
                    detail: "自身",
                };
        }
        // 場地 (領域/場地)
        if (desc.includes("場地") || desc.includes("領域")) {
            const match = desc.match(/(.+?(場地|領域))/);
            if (match)
                return {
                    logic: LogicType.Terrain,
                    key: match[1],
                    detail: "自身",
                };
        }
        // 鬥陣
        if (desc.includes("鬥陣")) {
            const match = desc.match(/(.+?鬥陣(?:[（(].+?[)）])?)/);
            if (match)
                return {
                    logic: LogicType.BattleCircle,
                    key: match[1],
                    detail: "自身",
                };
        }
        // 異常
        for (const s of ABNORMAL_STATUSES) {
            if (desc.includes(s))
                return {
                    logic: LogicType.Abnormal,
                    key: s,
                    detail: desc.includes("對手") ? "對手" : "自身",
                };
        }
        // 妨害
        for (const s of HINDRANCE_STATUSES) {
            if (desc.includes(s))
                return {
                    logic: LogicType.Hindrance,
                    key: s,
                    detail: desc.includes("對手") ? "對手" : "自身",
                };
        }

        // 兜底
        return {
            logic: LogicType.Direct,
            key: "通用",
            detail: "自身",
        };
    }
}
