import {
    ABNORMAL_STATUSES,
    HINDRANCE_STATUSES,
    STAT_REGEX,
    WEATHER_STATUSES,
} from "@/types/conditions";
import { LogicType, MoveScope, PassiveSkillModel } from "@/types/passiveModel";

export class PassiveSkillParser {
    // 1. 预筛选函数 (基于您的筛选逻辑改进)
    public static isValid(name: string, desc: string): boolean {
        // // 排除列表
        // if (name.includes("威力↓")) return false;
        // if (name.includes("效果絕佳威力")) return false;
        // if (name.includes("中鋒瀕死")) return false;

        // // 包含列表 (只要包含威力或招式，且不被上面排除，即视为有效)
        // const keywords = [
        //     "拍組招式威力提升",
        //     "拍組招式提升",
        //     "拍組招式↑",
        //     "招式威力提升",
        //     "招式提升",
        //     "招式提升↑",
        //     "寶可夢招式提升",
        //     "寶可夢招式↑",
        //     "威力",
        // ];
        // return keywords.some((k) => name.includes(k));
        // 特殊处理



        if (name.includes("威力↓")) return false;
        if (name.includes("效果絕佳威力")) return false;
        if (name.includes("中鋒瀕死")) return false;


        // 必須包含关键字，且通常涉及威力提升
        // 正則解釋：包含 (招式|威力) 且包含 (提升|↑|倍)
        const hasPowerKeyword = /(?:招式|威力).*(?:提升|↑|倍)/.test(name);

        return hasPowerKeyword;
    }

    public parse(name: string): PassiveSkillModel {
        const result: PassiveSkillModel = {
            name: name,
            desc: "",
            scope: MoveScope.All,
            multiplier: { maxVal: 1.0, logic: LogicType.Complex }, // 默认值
            condition: { key: "None" },
            applyToParty: name.includes("G"), //
        };

        // 2. 解析作用范围 (Scope)
        this.parseScope(name, result);

        // 3. 解析数值 (Max Value)
        this.parseMultiplierValue(name, result);

        // 4. 解析逻辑类型与条件 (Logic & Condition)
        this.parseCondition(name, result);

        return result;
    }

    private parseScope(name: string, model: PassiveSkillModel): void {
        // 优先级：特定招式 > 极巨 > 拍组 > 普招 > 全部

        // 检查特定招式 (文件中出现的特例)
        const specificMoves = [
            "破壞光線",
            "地震",
            "近身戰",
            "冰凍光束",
            "禍不單行",
            "十萬馬力",
        ]; // [cite: 5, 7, 8]
        for (const move of specificMoves) {
            if (name.includes(move)) {
                model.scope = MoveScope.Specific;
                model.targetMoveName = move;
                return;
            }
        }

        if (name.includes("拍組極巨化招式")) {
            // [cite: 8]
            model.scope = MoveScope.Max;
        } else if (name.includes("拍組招式")) {
            // 特例处理："寶可夢招式及拍組招式" -> All [cite: 7]
            if (name.includes("寶可夢招式")) model.scope = MoveScope.All;
            else model.scope = MoveScope.Sync;
        } else if (name.includes("招式") && name.includes("威力")) {
            model.scope = MoveScope.Move;
        } else if (name.includes("計量槽消耗")) {
            model.scope = MoveScope.Gauge;
        } else if (name.includes("威力提升")) {
            if (name.includes("擊中要害")) {
                model.scope = MoveScope.All;
            } else {
                // 只写"威力提升" -> move
                model.scope = MoveScope.Move;
            }
        }
    }

    private parseMultiplierValue(name: string, model: PassiveSkillModel): void {
        // Case A: N倍 (如 "威力10倍", "威力2倍") [cite: 5, 7]
        const timesMatch = name.match(/(\d+)倍/);
        if (timesMatch) {
            const multiplier = parseInt(timesMatch[1], 10);
            model.multiplier.maxVal = multiplier - 1; // 2倍是+100%, 10倍是+900%
            model.multiplier.logic = LogicType.FixedMulti;
            return;
        }

        // Case B: ↑N 或 提升N (如 "↑5", "提升9")
        const numMatch = name.match(/[↑提升](\d+)/);
        if (numMatch) {
            model.multiplier.maxVal = parseInt(numMatch[1], 10) / 10; // ↑5 -> 0.5
        } else {
            // Case C: 无数字
            // 特殊规则：依能力/总升降幅 -> 1.2 [cite: 6, 8]
            if (name.includes("依") && name.includes("能力")) {
                model.multiplier.maxVal = 1.2;
            } else {
                // 默认 1.0 (如 "对手束缚时拍组招式↑")
                model.multiplier.maxVal = 1.0;
            }
        }
    }

    private parseCondition(name: string, model: PassiveSkillModel): void {
        // 初始化
        let foundKey = "None";
        // 默认目标是自身，除非找到“对手”
        let detail = name.includes("對手") ? "對手" : "自身";
        // let logic = LogicType.Binary;
        const cleanedTest = name.replace("對手", "").trim();

        // ============================================================
        // 1. 优先匹配：Scaling 逻辑 (依...升幅/降幅)
        // ============================================================
        if (cleanedTest.startsWith("依")) {
            const scalingMatch = cleanedTest.match(/依(.+?)(升幅|降幅)/);

            if (scalingMatch) {
                const statBlock = scalingMatch[1]; // e.g., "特攻特防" 或 "能力"
                const direction = scalingMatch[2]; // e.g., "升幅"
                const isTotalStat = statBlock.includes("能力");

                model.condition.detail = detail;
                model.multiplier.logic = isTotalStat
                    ? LogicType.TotalStatScaling
                    : LogicType.SingleStatScaling; // 即使是多 Stat，也归类为 SingleStatScaling

                if (isTotalStat) {
                    model.condition.key = "能力" + direction;
                } else {
                    // 處理多個獨立 Stat (e.g., "特攻特防")

                    // 使用 Stat 正则表达式在 Stat Block 中查找所有 Stat 名称
                    let statsFound = [];
                    let match;

                    // 通过循环执行正则表达式来找到所有匹配项
                    while ((match = STAT_REGEX.exec(statBlock)) !== null) {
                        statsFound.push(match[1]); // match[1] 是捕获到的 Stat 名称
                    }

                    // 组合 Key: "特攻升幅_特防升幅"
                    // 这样 Key 就包含了所有 Stat 的名称和方向
                    model.condition.key = statsFound
                        .map((stat) => stat + direction)
                        .join("_");
                }

                return;
            }
        }

        // ============================================================
        // 2. HP 逻辑 (HPScaling / Binary)
        // ============================================================
        if (cleanedTest.includes("HP") || cleanedTest.includes("危機")) {
            model.multiplier.logic = LogicType.HPScaling;
            model.condition.key = cleanedTest.includes("減少")
                ? "HP減少"
                : "危機";
            model.condition.detail = detail;
            return; // HP 逻辑处理完毕，直接返回
        }

        const specificPatterns = [
            /天氣場地領域變化/,
            /場地變化/,
            /天氣變化/,
            /天氣正常/,
            /異常狀態/,
            /妨害狀態/,
            /樹果次數為０/,
            /擊中要害/,
            /非效果絕佳/,
            /效果絕佳/,
            /能力非提升/,
            /抵抗↓/,
        ];
        for (const pattern of specificPatterns) {
            if (pattern.test(cleanedTest)) {
                foundKey = cleanedTest.match(pattern)![0];
                model.multiplier.logic = LogicType.Complex;
                break;
            }
        }

        // 傷害場地
        if (foundKey === "None") {
            const hazardPattern = /(.+?傷害場地)/;
            let match = cleanedTest.match(hazardPattern);
            if (match) {
                foundKey = match[1];
                model.multiplier.logic = LogicType.DamageField;
            }
        }

        // 鬥陣
        if (foundKey === "None") {
            const zonePattern = /(.+?鬥陣(?:[（(].+?[)）])?)/;
            let match = cleanedTest.match(zonePattern);
            if (match) {
                foundKey = match[1];
                model.multiplier.logic = LogicType.BattleCycle;
            }
        }

        // 場地
        if (foundKey === "None") {
            const terrainPatterns = [
                /(.+?領域)/, // 例如 "龍之領域", "惡顏領域"
                /(.+?場地)/, // 一般場地 (電氣場地, 青草場地, 精神場地)
            ];

            for (const pattern of terrainPatterns) {
                let match = cleanedTest.match(pattern);
                if (match) {
                    foundKey = match[1];
                    model.multiplier.logic = LogicType.Terrain;
                    break;
                }
            }
        }

        // 屬性
        if (foundKey === "None") {
            const attributePattern = /(.+?屬性)/;
            let match = cleanedTest.match(attributePattern);
            if (match) {
                foundKey = match[1].replace("屬性", "").trim(); // 例如 "冰屬性", "格鬥屬性"
                model.multiplier.logic = LogicType.Attribute;
            }
        }

        // 異常狀態
        if (foundKey === "None") {
            for (const keyword of ABNORMAL_STATUSES) {
                if (cleanedTest.includes(keyword)) {
                    foundKey = keyword;
                    model.multiplier.logic = LogicType.Abnormal;
                    break;
                }
            }
        }

        // 妨害狀態
        if (foundKey === "None") {
            for (const keyword of HINDRANCE_STATUSES) {
                if (cleanedTest.includes(keyword)) {
                    foundKey = keyword;
                    model.multiplier.logic = LogicType.Hindrance;
                    break;
                }
            }
        }

        // 天氣
        if (foundKey === "None") {
            for (const keyword of WEATHER_STATUSES) {
                if (cleanedTest.includes(keyword)) {
                    foundKey = keyword;
                    model.multiplier.logic = LogicType.Weather;
                    break;
                }
            }
        }

        if (foundKey === "None") {
            const fixedKeywords = [
                "反衝",
                "瀕死",
                "無傷",
                "計量槽消耗",
                "計量槽加速",
                "招式計量槽",
            ];
            for (const keyword of fixedKeywords) {
                if (cleanedTest.includes(keyword)) {
                    foundKey = keyword;
                    model.multiplier.logic = LogicType.Special;
                    break;
                }
            }
        }

        // D. 最后的兜底：属性等级变动 (Stat Rank Change)
        if (foundKey === "None") {
            const isStatDown =
                cleanedTest.includes("下降") || cleanedTest.includes("↓");
            const direction = isStatDown ? "下降" : "提升";

            if (
                cleanedTest.includes("能力") &&
                (cleanedTest.includes("下降") ||
                    cleanedTest.includes("↓") ||
                    cleanedTest.includes("提升") ||
                    cleanedTest.includes("↑"))
            ) {
                foundKey = "能力" + direction;
                model.multiplier.logic = LogicType.StatChange;
            } else {
                const statMatch = cleanedTest.match(
                    /(攻擊|特攻|防禦|特防|速度|命中|閃避).*(提升|下降|↑|↓)/
                );
                if (statMatch) {
                    foundKey = statMatch[1] + direction;
                    model.multiplier.logic = LogicType.StatChange;
                }
            }
        }

        model.condition.key = foundKey;
        model.condition.detail = detail;
    }
}
