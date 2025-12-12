import { AwakeningBonusConfig, ExRoleBonusConfig } from "@/constances/bonus";
import { ExRoleList, NumtoStatKey } from "@/constances/map";
import {
    BonusIndex,
    ExRoleIndex,
    RarityIndex,
    RoleIndex,
    StatIndex,
} from "@/types/indices";
export interface Input {
    level: number;
    statList: [number, number, number, number, number, number, number]; // 元组类型：固定长度6，顺序不可变
}

/**
 * 六维数值计算类（数组输入版，适配切片类型传参）
 */
export class StatValueCalculator {
    static calculate(input: Input): number {
        const { level, statList } = input;
        const [base1, base30, base45, base100, base120, base140, base200] =
            statList;

        let value: number;
        const levelNum = Math.floor(level);

        if (levelNum <= 30) {
            const growthRate = (base30 - base1) / 29;
            value = base1 + growthRate * (levelNum - 1);
        } else if (levelNum <= 45) {
            const growthRate = (base45 - base30) / 15;
            value = base30 + growthRate * (levelNum - 30);
        } else if (levelNum <= 100) {
            const growthRate = (base100 - base45) / 55;
            value = base45 + growthRate * (levelNum - 45);
        } else if (levelNum <= 120) {
            const growthRate = (base120 - base100) / 20;
            value = base100 + growthRate * (levelNum - 100);
        } else if (levelNum <= 140) {
            const growthRate = (base140 - base120) / 20;
            value = base120 + growthRate * (levelNum - 120);
        } else {
            const growthRate = (base200 - base140) / 60;
            value = base140 + growthRate * (levelNum - 140);
        }

        return Math.floor(value);
    }
    // 升星加成
    static calcuateRarityBonus(
        statValue: number,
        oriRarity: RarityIndex,
        curRarity: RarityIndex,
        potential: number,
        statNum: StatIndex // 1 = HP, 2 = ATK, 3 = DEF, 4 = SPA, 5 = SPD, 6 = SPE
    ): number {
        let result: number;
        if (statNum > 1) {
            if (oriRarity != 5) {
                result =
                    statValue + (curRarity - oriRarity) * 20 + 1 * potential;
            } else {
                result =
                    statValue + (curRarity - oriRarity) * 40 + 2 * potential;
            }
        } else {
            // 拍组 HP 系数不一样
            if (oriRarity != 5) {
                result =
                    statValue + (curRarity - oriRarity) * 40 + 2 * potential;
            } else {
                result =
                    statValue + (curRarity - oriRarity) * 100 + 5 * potential;
            }
        }

        return result;
    }
    // exrole蛋糕加成
    static calculateExRole(
        statValue: number,
        t: ExRoleIndex,
        statNum: StatIndex
    ): number {
        if (t === -1) {
            return statValue;
        }

        const statKey = NumtoStatKey[statNum];
        // 类型需减-1找到对应索引
        const bonusRule = ExRoleBonusConfig[t];
        const value = statValue + bonusRule[statKey];

        return Math.floor(value);
    }
    // 超覺醒加成
    static calculateAwakeningBonus(
        statValue: number,
        role: RoleIndex,
        bonusLevel: BonusIndex,
        statNum: StatIndex
    ): number {
        // 沒有超覺醒
        if (bonusLevel < 6) {
            return statValue;
        }

        const statKey = NumtoStatKey[statNum];
        let finalValue = statValue;

        // 遍历超覺醒起始等級到当前等级，累积每个等级的加成
        for (let level = 6; level <= bonusLevel; level++) {
            const levelConfig = AwakeningBonusConfig[role][level - 6];
            // 优先取属性单独配置，无则取通用配置
            const bonusConfig = (levelConfig?.stat?.[statKey] ||
                levelConfig?.stat?.common) ?? { mode: "none" };

            if (!bonusConfig || bonusConfig.mode === "none") {
                continue; // 无加成则跳过
            }

            // 累积计算（倍率先乘，固定值后加，顺序不影响最终结果）
            switch (bonusConfig.mode) {
                case "multi":
                    finalValue = Math.floor(finalValue * bonusConfig.value);
                    break;
                case "flat":
                    finalValue = Math.floor(finalValue + bonusConfig.value);
                    break;
            }
        }
        return finalValue;
    }
    // 變化形態加成
    static calculateVarietyBonus(
        statValue: number,
        scale: number,
        isMega: boolean
    ): number {
        if (scale != 100) {
            if (isMega) {
                statValue = Math.ceil((statValue * scale) / 100) - 1;
            } else {
                statValue = Math.floor((statValue * scale) / 100);
            }
        }

        return statValue;
    }

    static getExRoleText(t: ExRoleIndex | number): string {
        const text = ExRoleList[t];

        return text;
    }
}

// 导出默认实例（支持两种导入方式）
export default new StatValueCalculator();
