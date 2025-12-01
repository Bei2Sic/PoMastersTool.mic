// 导入依赖类型和配置（根据你的项目目录调整路径）
import { AwakeningBonusConfig, BonusIndex, RoleIndex } from "@/type/const";

/** 技能类型（与超觉醒配置中的技能键名对应） */
export type MoveType = "move" | "syncMove" | "dynamaxMove" | "none";

/** 单技能加成配置类型（提取自超觉醒配置） */
type MoveBonusConfig = {
    mode: "multi" | "flat" | "none";
    value: number;
};

// -------------------------- 计算工具类 --------------------------
export class MovePowerCalculator {
    static calculateLevelBonus(power: number, level: BonusIndex): number {
        if (level < 1 || level > 5) {
            return Math.floor(power);
        }
        const bonusRate = 1 + (level - 1) * 0.05;
        const result = power * bonusRate;
        return Math.floor(result);
    }

    static calculateAwakeningBonus(
        power: number,
        role: RoleIndex,
        level: BonusIndex,
        moveType: MoveType
    ): number {
        // 输入合法性校验
        if (level < 6) {
            return power;
        }
        let finalPower = power;
        for (let l = 6; l <= level; l++) {
            const levelConfig = AwakeningBonusConfig[role][l - 6];
            // 安全获取当前技能类型的加成配置（无配置则视为无加成）
            const moveConfig = levelConfig?.[moveType] ?? {
                mode: "none",
                value: 0,
            };

            // 跳过无加成配置
            if (moveConfig.mode === "none") continue;

            // 累积加成计算
            switch (moveConfig.mode) {
                case "multi":
                    finalPower = finalPower*moveConfig.value;
                    break;
                case "flat":
                    finalPower = finalPower+moveConfig.value;
                    break;
            }
        }

        // 技能威力向上取整（可根据游戏实际规则调整为Math.floor）
        return Math.floor(finalPower);
    }
}
