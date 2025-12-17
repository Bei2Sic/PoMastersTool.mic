import { LogicType, MoveScope, PassiveSkillModel } from "@/types/passiveModel";
// 假設這些常量在您的常量文件中定義
import {
    ABNORMAL_STATUSES,
    HINDRANCE_STATUSES,
    WEATHER_STATUSES,
} from "@/types/conditions";

export class PassiveSkillParser {
    private name: string;
    private desc: string;
    private passiveName: string;

    constructor(name: string, desc: string, passiveName: string) {
        this.name = name;
        this.desc = desc;
        this.passiveName = passiveName;
    }

    // 1. 合法性檢查：只處理傷害相關
    public static isValid(name: string, desc: string): boolean {
        if (name.includes("威力↓")) return false;
        if (name.includes("屬性防守")) return false;
        if (name.includes("減輕")) return false;
        if (name.includes("效果絕佳威力")) return false;
        if (name.includes("中鋒瀕死")) return false;
        if (name.includes("招式後")) return false;

        // 必須包含关键字，且通常涉及威力提升
        // 正則解釋：包含 (招式|威力) 且包含 (提升|↑|倍)
        const isDamage = /(?:招式|威力).*(?:提升|↑|倍)/.test(name);

        // const isDamage = /(?:招式|威力|攻擊).*(?:提升|↑|強)/.test(desc);

        // 白值檢查 (包含 '防禦', '特防', '速度', '特攻', 且包含 '倍' 或 '提升')
        const isStatBoost = /(?:攻击|防禦|特防|特攻|速度).*(?:倍|提升|↑)/.test(
            desc
        );

        return isDamage || isStatBoost;
    }

    // 2. 獲取解析結果
    public get result(): PassiveSkillModel {
        const scopeResult = this.resolveScope();
        const logicResult = this.resolveLogicAndCondition();
        const multiplierResult = this.resolveMultiplier(logicResult.isDynamic);
        const statBoost = this.resolveStatBoost();

        return {
            name: this.name,
            desc: this.desc,
            passiveName: this.passiveName,
            applyToParty:
                this.name.includes("G") || this.desc.includes("全體拍組"), // 注意全形G
            multiplier: {
                scope: scopeResult.scope,
                moveName: scopeResult.moveName,
                value: multiplierResult.value,
                logic: logicResult.logic,
            },
            statBoost: statBoost,
            condition: {
                key: logicResult.key,
                detail: logicResult.detail,
                direction: logicResult.direction,
            },
        };
    }

    // --- 解析作用範圍 (Scope) ---
    private resolveScope(): { scope: MoveScope; moveName?: string } {
        const desc = this.desc;
        const name = this.name;

        // =========================================================
        // 1. 優先判斷名字中的冒號
        // =========================================================
        // "逆鱗：混亂時威力提升5"
        const colonIndex =
            name.indexOf("：") !== -1 ? name.indexOf("：") : name.indexOf(":");

        if (colonIndex !== -1) {
            // 提取冒號前的名稱
            const prefix = name.substring(0, colonIndex).trim();
            if (prefix.length > 0) {
                return { scope: MoveScope.Specific, moveName: prefix };
            }
        }

        // 2. 特定招式
        const specificMoveMatch = desc.match(/「(.+?)」/);
        if (specificMoveMatch) {
            return {
                scope: MoveScope.Specific,
                moveName: specificMoveMatch[1],
            };
        }

        // 3. 優先判斷拍組/極巨
        if (desc.includes("拍組招式")) {
            // 特例："招式及拍組招式" -> All
            if (desc.includes("拍組招式和拍組極巨化招式"))
                return { scope: MoveScope.MaxAndSync }
            if (desc.includes("招式和拍組招式"))
                return { scope: MoveScope.All };
            return { scope: MoveScope.Sync };
        }
        if (desc.includes("極巨化招式")) return { scope: MoveScope.Max };

        // 3. 一般招式
        // 註：中文文本中，"招式" 通常指 Pokemon Move (P-Move)
        if (desc.includes("招式")) return { scope: MoveScope.Move };

        // 4. 兜底 (該攻擊、攻擊時) -> All
        return { scope: MoveScope.All };
    }

    // --- 解析邏輯與條件 (Logic & Condition) ---
    private resolveLogicAndCondition(): {
        logic: LogicType;
        key: string;
        detail: string;
        isDynamic: boolean;
        direction?: string;
        statboost?: string[];
    } {
        const desc = this.desc;
        const name = this.name;
        // const cleanDesc = desc.replace(/對手|自身|對象|的時候|時|，|。/g, "");

        // 1. 動態 Scaling 類 (關鍵字：隨...而提高)
        if (name.includes("隨") || name.includes("依")) {
            // 招式計量槽 (Power Flux)
            if (name.includes("招式計量槽")) {
                return {
                    logic: LogicType.GaugeScaling,
                    key: "招式計量槽",
                    detail: "自身",
                    isDynamic: false, // 动态的，但 [随招式计量槽提升] 的倍率是写在名字里的
                };
            }

            // HP
            if (name.includes("HP")) {
                return {
                    logic: LogicType.HPScaling,
                    key: "HP",
                    detail: name.includes("對手") ? "對手" : "自身",
                    direction: name.includes("降幅") ? "下降" : "提升",
                    isDynamic: false,
                };
            }

            // 能力等級 (Stat Scaling) - 這是最複雜的部分
            // 匹配：隨著 (速度) (提升/降低)
            const statMatch = name.match(
                new RegExp(
                    `((?:攻擊|特攻|防禦|特防|速度|命中|閃避|能力)+)((?:提升|下降|降低|升幅|降幅))`
                )
            );
            if (statMatch) {
                const statsString = statMatch[1];
                const direction = statMatch[2].includes("升") ? "提升" : "下降";
                const isTotal = statsString === "能力";
                let key = statsString;

                if (!isTotal) {
                    const individualStats = statsString.match(
                        new RegExp(
                            "攻擊|特攻|防禦|特防|速度|命中|閃避|能力",
                            "g"
                        )
                    );
                    if (individualStats) {
                        key = individualStats.join("_");
                    }
                }

                return {
                    logic: isTotal
                        ? LogicType.TotalStatScaling
                        : LogicType.SingleStatScaling,
                    key: isTotal ? `能力` : key,
                    detail: name.includes("對手") ? "對手" : "自身",
                    direction: direction,
                    isDynamic: true,
                };
            }
        }

        // 2. 特殊觸發的二元類
        if (desc.includes("天氣、場地或領域變化"))
            return {
                logic: LogicType.AnyFieldEffect,
                key: "天氣、場地或領域變化",
                detail: "自身",
                isDynamic: false,
            };
        if (desc.includes("天氣變化"))
            return {
                logic: LogicType.WeatherChange,
                key: "天氣變化",
                detail: "自身",
                isDynamic: false,
            };
        if (desc.includes("天氣沒有變化"))
            return {
                logic: LogicType.WeatherNormal,
                key: "天氣沒有變化",
                detail: "自身",
                isDynamic: false,
            };
        if (desc.includes("場地變化"))
            return {
                logic: LogicType.TerrainActive,
                key: "場地變化",
                detail: "自身",
                isDynamic: false,
            };
        if (desc.includes("異常狀態"))
            return {
                logic: LogicType.AbnormalActive,
                key: "異常狀態",
                detail: "自身",
                isDynamic: false,
            };
        if (desc.includes("妨害狀態"))
            return {
                logic: LogicType.HindranceActive,
                key: "妨害狀態",
                detail: "自身",
                isDynamic: false,
            };
        if (desc.includes("HP非全滿狀態"))
            return {
                logic: LogicType.HPDecreased,
                key: "HP非全滿狀態",
                detail: "自身",
                isDynamic: false,
            };
        if (desc.includes("沒有處於提高狀態的能力"))
            return {
                logic: LogicType.AllStatNotInHigh,
                key: "沒有處於提高狀態的能力",
                detail: desc.includes("自身") ? "自身" : "對手",
                isDynamic: false,
            };
        if (desc.includes("能力降低"))
            return {
                logic: LogicType.AnyStatInLow,
                key: "能力降低",
                detail: desc.includes("自身") ? "自身" : "對手",
                isDynamic: false,
            };
        if (desc.includes("HP非全滿狀態"))
            return {
                logic: LogicType.HPDecreased,
                key: "HP非全滿狀態",
                detail: "自身",
                isDynamic: false,
            };
        if (desc.includes("HP剩下一半以上"))
            return {
                logic: LogicType.HPHighHalf,
                key: "HP剩下一半以上",
                detail: "自身",
                isDynamic: false,
            };
        if (desc.includes("危機"))
            return {
                logic: LogicType.HPLow,
                key: "危機",
                detail: "自身",
                isDynamic: false,
            };
        if (desc.includes("效果絕佳"))
            return {
                logic: LogicType.SuperEffective,
                key: "效果絕佳",
                detail: "自身",
                direction: desc.includes("不是效果絕佳") ? "非" : "是",
                isDynamic: false,
            };
        if (desc.includes("擊中") && desc.includes("要害"))
            return {
                logic: LogicType.Critical,
                key: "擊中要害",
                detail: "自身",
                isDynamic: false,
            };
        if (desc.includes("属性抵抗降低"))
            return {
                logic: LogicType.Rebuff,
                key: "任意",
                detail: "對手",
                isDynamic: false,
            };
        if (desc.includes("招式计量槽加速状态"))
            return {
                logic: LogicType.GaugeSpeedBoostOn,
                key: "招式计量槽加速场地",
                detail: "自身",
                isDynamic: false,
            };
        if (name.includes("计量槽消耗增加"))
            return {
                logic: LogicType.GaugeCost,
                key: "计量槽消耗增加",
                detail: "自身",
                isDynamic: false,
            };

        // 2. 環境/狀態類 (固定倍率)
        // 傷害場地
        if (name.includes("傷害場地")) {
            const match = name.match(/(.+?傷害場地)/);
            if (match)
                return {
                    logic: LogicType.DamageField,
                    key: match[1],
                    detail: "對手",
                    isDynamic: false,
                };
        }
        // 天氣
        for (const w of WEATHER_STATUSES) {
            if (name.includes(w))
                return {
                    logic: LogicType.Weather,
                    key: w,
                    detail: "自身",
                    isDynamic: false,
                };
        }
        // 場地 (領域/場地)
        if (name.includes("場地") || name.includes("領域")) {
            const match = name.match(/(.+?(場地|領域))/);
            if (match)
                return {
                    logic: LogicType.Terrain,
                    key: match[1],
                    detail: "自身",
                    isDynamic: false,
                };
        }
        // 鬥陣
        if (name.includes("鬥陣")) {
            const match = name.match(/(.+?鬥陣(?:[（(].+?[)）])?)/);
            if (match)
                return {
                    logic: LogicType.BattleCircle,
                    key: match[1],
                    detail: "自身",
                    isDynamic: false,
                };
        }
        // 異常
        for (const s of ABNORMAL_STATUSES) {
            if (name.includes(s))
                return {
                    logic: LogicType.Abnormal,
                    key: s,
                    detail: desc.includes("自身") ? "自身" : "對手",
                    isDynamic: false,
                };
        }
        // 妨害
        for (const s of HINDRANCE_STATUSES) {
            if (name.includes(s))
                return {
                    logic: LogicType.Hindrance,
                    key: s,
                    detail: "對手",
                    isDynamic: false,
                };
        }

        // 4. 能力等級 (非 Scaling，二元判斷，如：速度提升時威力提升)
        const statCheck = name.match(
            /(攻擊|特攻|防禦|特防|速度|命中|閃避).*(提升|下降|降低)/
        );
        if (statCheck) {
            const isStatDown = name.includes("下降") || name.includes("↓");
            const direction = isStatDown ? "下降" : "提升";

            return {
                logic: LogicType.StatChange,
                key: statCheck[1],
                detail: name.includes("對手") ? "對手" : "自身",
                direction: direction,
                isDynamic: false,
            };
        }

        // 5. 兜底
        return {
            logic: LogicType.Complex,
            key: "通用",
            detail: "自身",
            isDynamic: false,
        };
    }

    // --- 解析數值 (Multiplier) ---
    private resolveMultiplier(isDynamic: boolean): { value: number } {
        // 如果邏輯判斷是動態的 (Scaling)，直接返回 0 (或其他標記值)，交由計算器處理
        if (isDynamic) {
            return { value: 0 };
        }

        // 1. 優先嘗試從名字提取 (Rank)
        // 匹配名字末尾的數字：威力提升3 -> 3
        const nameMatch = this.name.match(/(\d+)$/);
        if (nameMatch) {
            const rank = parseInt(nameMatch[1], 10);
            return { value: rank * 0.1 }; // Rank 3 = +30%
        }

        // 2. 嘗試從描述提取 (特殊寫法)
        // "威力變成2倍"
        const timesMatch = this.desc.match(/(\d+)倍/);
        if (timesMatch) {
            if (this.desc.includes("威力")) {
                return { value: parseInt(timesMatch[1], 10) - 1 };
            }
        }

        // 3. 兜底
        // 默认1.0
        return { value: 1.0 };
    }

    // --- 解析白值增益類 ---
    private resolveStatBoost(): {
        isStatBoost: boolean;
        stats: string[];
        value: number;
    } {
        const stats: string[] = [];
        const desc = this.desc;
        let value = 1;
        let isStatBoost = false;

        if (/(?:招式|威力).*變成\s*[0-9\.]+\s*倍/.test(desc)) {
            return { isStatBoost: false, stats: [], value: 1 };
        }

        // 1. 解析受影響的屬性
        if (desc.includes("所有能力") || desc.includes("5種能力")) {
            stats.push("攻擊", "防禦", "特攻", "特防", "速度");
        } else {
            if (desc.includes("攻擊")) stats.push("攻擊");
            if (desc.includes("防禦")) stats.push("防禦");
            if (desc.includes("特攻")) stats.push("特攻");
            if (desc.includes("特防")) stats.push("特防");
            if (desc.includes("速度")) stats.push("速度");
        }

        const timesMatch = desc.match(/變成\s*([0-9\.]+)\s*倍/);
        if (timesMatch) {
            // 直接提取數值： "1.3" -> 1.3, "3" -> 3.0
            value = parseFloat(timesMatch[1]);
        }

        if (stats.length > 0 && value !== 1) {
            isStatBoost = true;
        } else {
            isStatBoost = false;
            value = 1;
        }

        return { isStatBoost, stats, value };
    }
}
