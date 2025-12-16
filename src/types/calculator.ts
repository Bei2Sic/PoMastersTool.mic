// types/calculator.ts
import {
    BattleRanks,
    AbnormalType,
    BattleCircle,
    BerryNum,
    BoostRank,
    DamageFieldType,
    GaugeValue,
    HindranceType,
    PokemonType,
    RebuffRank,
    TerrainType,
    WeatherType,
    ZoneType,
} from "@/types/conditions";
import { LogicType } from "@/types/passiveModel";


export interface ActiveMultiplier {
    name: string; // 
    value: number; // 
    logic: LogicType; //
    stat?: string;
}

export interface CalcEnvironment {
    // ==========================================
    // 1. 環境
    // ==========================================
    weather: WeatherType;
    terrain: TerrainType;
    zone: ZoneType;
    battleCircles: BattleCircle[];

    // ==========================================
    // 2. 攻擊方 (User)
    // ==========================================
    user: {
        hpPercent: number; // 0-100
        ranks: BattleRanks;

        // 增強狀態
        boosts: {
            physical: BoostRank;
            special: BoostRank;
            sync: BoostRank;
        };

        abnormal: AbnormalType;
        hindrance: Record<HindranceType, boolean>;
    };

    // ==========================================
    // 3. 防禦方 (Target)
    // ==========================================
    target: {
        abnormal: AbnormalType;
        ranks: BattleRanks;
        hindrance: Record<HindranceType, boolean>;
        damageField: DamageFieldType;
        typeRebuffs: Record<PokemonType, RebuffRank>;
    };

    // ==========================================
    // 4. 設定
    // ==========================================
    settings: {
        gauge: GaugeValue;
        berry: BerryNum;
        isCritical: boolean;
        isSuperEffective: boolean;
    };
}
