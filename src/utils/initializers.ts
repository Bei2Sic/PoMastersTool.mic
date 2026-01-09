import {
    BATTLE_REGIONS,
    CRITBUFF_STATUSES,
    HINDRANCE_STATUSES,
    POKEMON_TYPES,
} from "@/constances/battle";
import {
    BattleCircle,
    BattleState,
    CritBuffType,
    HindranceType,
    TypeRebuffs
} from "@/types/conditions"; // 導入上面的類型


// 輔助函數：初始化 18 種屬性抵抗表 (全為 0)
export const initRebuffs = (): TypeRebuffs => {
    return POKEMON_TYPES.reduce(
        (acc, type) => ({ ...acc, [type]: 0 }),
        {} as TypeRebuffs
    );
};

export const initCritbuffs = (): Record<CritBuffType, boolean> => {
    return Object.fromEntries(
        CRITBUFF_STATUSES.map((status) => [status, false])
    ) as Record<CritBuffType, boolean>;
};

export const initHindrances = (): Record<HindranceType, boolean> => {
    return Object.fromEntries(
        HINDRANCE_STATUSES.map((status) => [status, false])
    ) as Record<HindranceType, boolean>;
};

export const initBattleCircles = (): BattleCircle => {
    const map: Partial<BattleCircle> = {};
    // const regions: RegionType[] = [
    //     "關都",
    //     "城都",
    //     "豐緣",
    //     "神奧",
    //     "合眾",
    //     "卡洛斯",
    //     "阿羅拉",
    //     "伽勒爾",
    //     "帕底亞",
    //     "帕希歐",
    // ];
    BATTLE_REGIONS.forEach((region) => {
        map[region] = {
            level: 0,
            actives: {
                物理: false,
                特殊: false,
                防禦: false,
            },
        };
    });
    return map as BattleCircle;
};

export const initBattleState = (): BattleState => ({
    gears: {
        hp: 100,
        atk: 40,
        def: 40,
        spa: 40,
        spd: 40,
        spe: 40,
    },
    ranks: {
        atk: 0,
        def: 0,
        spa: 0,
        spd: 0,
        spe: 0,
        acc: 0,
        eva: 0,
        ct: 0,
    },
    boosts: {
        physical: 0,
        special: 0,
        sync: 0,
    },
    syncBuff: 0,
    currentHPPercent: 100,
    abnormal: "無",
    hindrance: initHindrances(),
});
