import { PassiveSkillParser } from "@/core/parse/passive";

export function debugParser(parser: PassiveSkillParser, texts: string[]): void {
    const results = texts.map((text) => {
        const model = parser.parse(text);

        return {
            "Original Text": model.originalText, // 原始文本
            Scope: model.scope, // 作用范围
            Logic: model.multiplier.logic, // 逻辑类型
            Value: model.multiplier.maxVal, // 倍率数值
            "Cond Key": model.condition.key, // 触发条件 Key
            "Cond Detail": model.condition.detail, // 触发条件 Detail
            "Move Name": model.targetMoveName || "-", // 特定招式名
            "Is Party (G)": model.applyToParty, // 是否全体
        };
    });

    console.log(`\n=== 解析结果预览 (共 ${texts.length} 条) ===`);
    console.table(results);
}


export const parser = new PassiveSkillParser();
const inputTexts: string[] = [
    "大地領域時攻擊招式威力↓",
    "中鋒瀕死時威力7倍",
    "對手束縛時拍組招式↑",
    "依特防升幅拍組招式↑",
    "對手岩石傷害場地時威力提升",
    "阿羅拉鬥陣(特殊)時拍組招式威力↑",
    "冰屬性拍組招式威力提升",
    "非效果絕佳時威力提升G",
    "依防禦升幅威力提升",
    "依特攻特防升幅拍組招式↑",
    "依對手能力降幅拍組招式威力提升",
    "電氣場地時招式威力提升9",
    "擊中要害時威力提升3",
    "天氣變化時寶可夢招式及拍組招式↑3",
    "威力隨招式計量槽提升3",
    "計量槽消耗增加威力提升5",
    "拍組招式威力隨招式計量槽提升",
    "場地招式計量槽加速時拍組招式↑",
    "晴天時十萬馬力威力2倍",
    "首次危機時擊中要害率提升5",
    "攻擊提升時拍組極巨化招式威力提升9",
    "依對手特攻特防降幅威力↑"
];

export const validTexts = inputTexts.filter((text) =>
    PassiveSkillParser.isValid(text, "")
);
