// types/calculator.ts
import { LogicType } from "@/types/passiveModel";
import { PokemonType, AbnormalType, WeatherType, TerrainType, ZoneType, DamageFieldType, RebuffRank, BattleCircle } from "@/types/conditions";

// 招式類別 (由業務方在遍歷時指定)
export type MoveCategory = "Pokemon" | "Sync" | "Max";

// 基礎技能輸入
export interface MoveBase {
    name: string; // 技能名 (用於匹配 "特定招式" 被動)
    gaugeCost: number; // 耗氣量 (用於計算計量槽增益)
}

// 返回給業務方的結果 (簡單明瞭)
export interface ActiveMultiplier {
    name: string; // 來源名稱 (如 "晴天時威力提升3")
    value: number; // 數值 (如 0.3)
    logic: LogicType; // 用於業務方決定是 "乘算" 還是 "加算"
}

export interface CalcEnvironment {
    // ==========================================
    // 1. 環境
    // ==========================================
    weather: WeatherType;
    terrain: TerrainType;
    zone: ZoneType;
    battleCircles: BattleCircle[],

    // ==========================================
    // 2. 攻擊方 (User)
    // ==========================================
    user: {
        hpPercent: number; // 0-100
        stats: { [key: string]: number };
        ranks: { [key: string]: number };

        // 增強狀態
        boosts: {
            physical: number;
            special: number;
            sync: number;
        };

        abnormal: AbnormalType;
        hindrance: {
            isConfused: boolean;
            isFlinching: boolean;
            isTrapped: boolean;
            isRestrained: boolean;
        };
    };

    // ==========================================
    // 3. 防禦方 (Target)
    // ==========================================
    target: {
        ranks: { [key: string]: number };
        abnormal: AbnormalType;
        hindrance: {
            isConfused: boolean;
            isFlinching: boolean;
            isTrapped: boolean;
            isRestrained: boolean;
        };

        damageField: DamageFieldType;
        // 抗性層數 (可以直接用對象)
        typeRebuffs: Record<PokemonType, RebuffRank>;
    };

    // ==========================================
    // 4. 設定
    // ==========================================
    settings: {
        gauge: number;
        isCritical: boolean;
        isSuperEffective: boolean;
    };
}