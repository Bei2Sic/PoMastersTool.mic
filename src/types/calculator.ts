// types/calculator.ts
import { LogicType } from "@/types/passiveModel";

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
    weather: string;
    terrain: string;
    zone: string;

    // // --- B. 對手狀態 (Enemy State) ---
    // // 用於觸發：對手麻痺時威力提升 (Dirty Fighting)、對手防禦下降分威力提升等
    // enemyStatus: 'none' | 'paralysis' | 'burn' | 'sleep' | 'poison' | 'freeze' | 'confusion' | 'trap';
    // enemyDefRank: number;   // 對手防禦等級 (-6 ~ +6)
    // enemySpDefRank: number; // 對手特防等級 (-6 ~ +6)
    
    // // --- C. 自身狀態 (Self State) ---
    // // 用於觸發：HP越多威力越強、下次物理招式威力增強 (PMUN) 等
    // currentHpPercent: number; // 當前 HP 百分比 (0 - 100)
    // physicalMoveUpNext: number; // 物理招式威力增強狀態 (0 - 10)
    // specialMoveUpNext: number;  // 特殊招式威力增強狀態 (0 - 10)
    // syncBuff: number; // 氣魄加成 (Sync Buff) 層數

    // // --- D. 數值計算參數 (Calculation Params) ---
    // // 這些不影響倍率觸發，但影響最終傷害公式
    // enemyDef: number; // 敵人的實際防禦值/特防值 (輸入框填寫的)
    // battleType: 'single' | 'multi'; // 單人或多人 (影響某些被動)
}