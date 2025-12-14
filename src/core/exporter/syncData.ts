// 假設你將這些類型定義提取出來
import { MoveCategory, MovePowerCalculator } from "@/core/calculators/power";
import { StatValueCalculator } from "@/core/calculators/stat";
import {
    getStatCNnameByStatKey,
    getStatIndexByStatKey,
} from "@/core/exporter/map";
import { parseMoveTextBonus, parseStatTextBonus } from "@/core/parse/text";
import {
    BonusIndex,
    RarityIndex,
} from "@/types/indices";
import {
    MoveBase,
    MoveFinal,
    PokemonStat,
    SyncDynamicState,
    SyncRawData,
    Tile,
    Trainer,
} from "@/types/syncModel";

export interface StatCalcOptions {
    gearBonus?: number;       // 裝備加成
    themeBonus?: number;  // 組隊加成
    boost?: number; // 白值翻倍加成
}

function getTileStatBonus(
    selectedTiles: Tile[],
    statKey: keyof PokemonStat
): number {
    let bonus = 0;

    const statName = getStatCNnameByStatKey(statKey);
    // 遍歷所有已激活的石盤
    for (const tile of selectedTiles) {
        if (tile.isActive && tile.color === "#779EFF") {
            bonus += parseStatTextBonus(tile.name, statName);
        }
    }
    return bonus;
}

function getTileMoveBonus(
    selectedTiles: Tile[],
    moveName: string,
): number {
    let bonus = 0;

    // 遍歷所有已激活的石盤
    for (const tile of selectedTiles) {
        if (tile.isActive && tile.color === "#47D147") {
            bonus += parseMoveTextBonus(tile.name, moveName);
        }
    }
    return bonus;
}

export const getFinalStatValue = (
    rawData: SyncRawData,
    state: SyncDynamicState,
    statKey: keyof PokemonStat,
    formIndex: number,
    options: StatCalcOptions = {}
): number => {
    // 基礎數據準備
    const currentPokemon = rawData.pokemon[formIndex];
    // 獲取基礎形态 statList
    const statList = rawData.pokemon[0].stat[statKey] as [
        number,
        number,
        number,
        number,
        number,
        number,
        number
    ];

    // 等級加成
    const input = { level: state.level, statList };
    let result = StatValueCalculator.calculate(input);

    // 超覺醒加成
    result = StatValueCalculator.calculateAwakeningBonus(
        result,
        rawData.trainer.role,
        state.bonusLevel,
        getStatIndexByStatKey(statKey)
    );
    // 星级加成
    result = StatValueCalculator.calcuateRarityBonus(
        result,
        rawData.trainer.rarity,
        state.currentRarity,
        state.potential,
        getStatIndexByStatKey(statKey)
    );

    // EX体系加成
    if (state.exRoleEnabled) {
        result = StatValueCalculator.calculateExRole(
            result,
            rawData.trainer.exRole,
            getStatIndexByStatKey(statKey)
        );
    }

    const gear = options.gearBonus || 0;
    result += gear;

    // 形態變化加成 (需要判斷是否為當前計算的形態)
    if (currentPokemon?.scale && currentPokemon.scale.length > 0) {
        let index = getStatIndexByStatKey(statKey) - 1;
        let scale = currentPokemon.scale[index];
        const isMega = (currentPokemon.variationType === 1);
        result = StatValueCalculator.calculateVarietyBonus(result, scale, isMega);
    }

    // 石盤的白值加成為最後的加算
    result += getTileStatBonus(state.gridData, statKey);

    // 组队技能
    const theme = options.themeBonus || 0;
    result += theme;

    return Math.floor(result);
};

export function getFinalMovePower(
    move: MoveBase,
    trainer: Trainer,
    bonusLevel: BonusIndex,
    exRoleEnabled: boolean,
    rarity: RarityIndex,
    gridData: Tile[],
    moveCategory: MoveCategory
): number | "-" {
    let power = move.power;
    if (power <= 0) {
        return "-";
    }

    // 等級/寶數加成
    if (bonusLevel <= 5) {
        power = MovePowerCalculator.calculateLevelBonus(power, bonusLevel);
    } else {
        // 超覺醒加成 先計算覺醒，再加基礎威力等級加成 * 0.2)
        power = MovePowerCalculator.calculateAwakeningBonus(
            power,
            trainer.role,
            bonusLevel,
            moveCategory
        );
    }

    // EX體系加成 (僅限特定EX角色的 Sync 招式)
    if (moveCategory === "syncMove") {
        if ((trainer.exRole === 3 && exRoleEnabled) || (trainer.role === 3 && rarity === 6))
        power = Math.ceil(power * 1.5);
    }

    // 石盤的白值加成為最後的加算
    power += getTileMoveBonus(gridData, move.name);


    return Math.floor(power);
}

// 内部方法
export function mapMoveToMoveFinal(
    move: MoveBase,
    trainer: Trainer,
    state: SyncDynamicState,
    moveCategory: MoveCategory
): MoveFinal {
    if (!move) {
        return null;
    }
    const finalPower = getFinalMovePower(
        move,
        trainer,
        state.bonusLevel,
        state.exRoleEnabled,
        state.currentRarity,
        state.gridData,
        moveCategory
    );
    // 組合原始數據和計算結果
    return { ...move, finalPower };
}
