// @/core/calculator/utils.ts

import { PokemonType } from "@/types/conditions";

export interface ThemeBonusResult {
    flat: { atk: number; spa: number; hp: number; spe: number };
    conditional: { type: PokemonType; atk: number; spa: number } | null;
}

export const parseComplexThemeSkill = (desc: string): ThemeBonusResult => {
    const result: ThemeBonusResult = {
        flat: { atk: 0, spa: 0, hp: 0, spe: 0 },
        conditional: null,
    };

    // 预处理：按换行符或逗号分割
    // 我方全體拍組最大HP提升24\n僅在我方使出水屬性攻擊時，攻擊和特攻提升24
    const parts = desc.split(/\n|\\n/);

    parts.forEach((part) => {
        // 提取数值
        const valMatch = part.match(/(\d+)/);
        if (!valMatch) return;
        const value = parseInt(valMatch[1], 10);

        // "僅在...使出...攻擊時"
        const conditionMatch = part.match(/僅在.*使出(.+)屬性攻擊時/);

        if (conditionMatch) {
            const typeName = conditionMatch[1] as PokemonType; // 提取属性
            if (!result.conditional) {
                result.conditional = { type: typeName, atk: 0, spa: 0 };
            }

            if (part.includes("攻擊")) result.conditional.atk += value;
            if (part.includes("特攻")) result.conditional.spa += value;
        } else {
            if (part.includes("HP")) result.flat.hp += value;
            if (part.includes("速度")) result.flat.spe += value;
            if (part.includes("攻擊") && !part.includes("特攻"))
                result.flat.atk += value; // 单攻
            if (part.includes("特攻") && !part.includes("攻擊"))
                result.flat.spa += value; // 单特
            if (part.includes("攻擊") && part.includes("特攻")) {
                result.flat.atk += value;
                result.flat.spa += value;
            }
        }
    });

    return result;
};
