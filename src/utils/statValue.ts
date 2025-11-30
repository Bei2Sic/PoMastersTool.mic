import {
    StatIndex,
    ExRoleBonusConfig,
    ExRoleIndex,
    ExRoleList,
    NumToBaseType,
    RarityIndex,
} from "@/type/const";

export interface Input {
    level: number;
    statList: [number, number, number, number, number, number, number]; // 元组类型：固定长度6，顺序不可变
}

/**
 * 六维数值计算类（数组输入版，适配切片类型传参）
 */
export class StatValueCalculator {
    /**
     * 计算目标等级的数值
     * @param input - 输入参数（符合 StatsInput 接口）
     * @returns 目标等级的数值（向下取整为整数）
     * @throws 输入参数不合法时抛出错误（明确错误原因）
     */
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

    static calcuateRarityBonus(
        statValue: number,
        oriRarity: RarityIndex,
        curRarity: RarityIndex,
        potential: number,
        baseNum: StatIndex
    ): number {
        let result: number;
        if (baseNum > 1 || oriRarity !== 5) {
            result = statValue + (curRarity - oriRarity) * 40 + 2 * potential;
        } else {
            // 5星拍组 HP 系数不一样
            result = statValue + (curRarity - oriRarity) * 100 + 5 * potential;
        }

        return result;
    }

    static calculateExRole(
        statValue: number,
        t: ExRoleIndex,
        baseNum: StatIndex
    ): number {
        const baseKey = NumToBaseType[baseNum];
        // 类型需减-1找到对应索引
        const bonusRule = ExRoleBonusConfig[t - 1];
        const value = statValue + bonusRule[baseKey];

        return Math.floor(value);
    }

    static getExRoleText(t: ExRoleIndex | number): string {
        const text = ExRoleList[t - 1];

        return text;
    }
}

// 导出默认实例（支持两种导入方式）
export default new StatValueCalculator();
