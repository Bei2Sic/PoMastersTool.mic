// 导入依赖类型和配置（根据你的项目目录调整路径）
import { AwakeningBonusConfig } from "@/constances/bonus";
import { BonusIndex, RoleIndex } from "@/types/indices";

/** 技能类型 */
export enum PowerMoveScope {
    Move = "move",
    Sync = "syncMove",
    Max = "moveDynamax",
    Tera = "moveTera",
    None = "none"
}

export class MovePowerCalculator {
    static calculateLevelBonus(power: number, level: BonusIndex): number {
        if (level < 1 || level > 5) {
            return Math.floor(power);
        }

        const increase = Math.floor((power * (level - 1) * 5) / 100);
        return Math.floor(power + increase);
    }

    static calculateAwakeningBonus(
        power: number,
        role: RoleIndex,
        level: BonusIndex,
        powerMoveScope: PowerMoveScope
    ): number {
        // 6 以上，基礎倍率從 120% (即整數 120) 開始計算
        // 用整數百分比來計算：120 代表 1.2
        let totalPercent = 120;

        for (let l = 6; l <= level; l++) {
            const levelConfig = AwakeningBonusConfig[role]?.[l - 6];
            if (!levelConfig) continue;

            const moveConfig = levelConfig[powerMoveScope];
            if (!moveConfig || moveConfig.mode === "none") continue;

            switch (moveConfig.mode) {
                case "multi":
                    // 配置文件裡的 value 是 1.1, 1.3 這種小數
                    // 轉換為整數增量： (1.1 - 1) * 100 = 10%
                    // Math.round 是為了消除 1.1 - 1 = 0.10000000009 這種誤差
                    const increasePercent = Math.round(
                        (moveConfig.value - 1) * 100
                    );
                    totalPercent += increasePercent;
                    break;
            }
        }
        // 最後再除以 100 轉回實際數值
        return Math.floor((power * totalPercent) / 100);
    }
}
