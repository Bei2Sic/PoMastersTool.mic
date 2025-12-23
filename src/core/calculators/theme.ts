import { parseComplexThemeSkill } from "@/core/parse/theme";
import { ThemeContext } from "@/types/calculator";
import { PokemonType } from "@/types/conditions";
import { Sync } from "@/types/syncModel";

export class ThemeContextResolver {
    static resolve(team: (Sync | null)[]): ThemeContext {
        const counts: Record<string, number> = {};
        const flat = { atk: 0, spa: 0, hp: 0, spe: 0, def: 0, spd: 0 };
        let tagType = "無" as PokemonType;
        let tagAdd = 0;

        // 过滤空队友
        const activeMembers = team.filter((m): m is Sync => m !== null);

        // 统计标签数量
        activeMembers.forEach((member) => {
            member.rawData.themes.forEach((theme) => {
                counts[theme.tag] = (counts[theme.tag] || 0) + 1;
            });
        });

        // 当标签数量 >= 2 时，队伍技能才生效
        activeMembers.forEach((member) => {
            member.rawData.themes.forEach((theme) => {
                const tagCount = counts[theme.tag] || 0;
                if (tagCount >= 2) {
                    const { flat: fBonus, conditional: cBonus } =
                        parseComplexThemeSkill(theme.description);
                    // 累加固定加成
                    flat.atk += fBonus.atk;
                    flat.spa += fBonus.spa;
                    flat.hp += fBonus.hp;
                    flat.spe += fBonus.spe;
                    // 累加条件加成
                    if (cBonus) {
                        tagType = cBonus.type;
                        tagAdd = cBonus.atk; // 攻擊和特攻加成是一致的
                    }
                }
            });
        });

        return {
            tagCounts: counts,
            flatBonuses: flat,
            tagType: tagType,
            tagAdd: tagAdd,
        };
    }

    static resolveRegion(team: (Sync | null)[]): Record<string, number> {
        const counts: Record<string, number> = {};
        // 过滤空队友
        const activeMembers = team.filter((m): m is Sync => m !== null);

        // 统计标签数量
        activeMembers.forEach((member) => {
            member.rawData.themes.forEach((theme) => {
                if (theme.category === 2) {
                    // 地區的分類
                    counts[theme.tag] = (counts[theme.tag] || 0) + 1;
                }
            });
        });

        return counts;
    }
}
