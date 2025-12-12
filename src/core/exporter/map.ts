import { CategoryMap, RoleMap, TypeMap } from "@/constances/map";
import { StatIndex, TypeMapItem } from "@/types/indices";
import { PokemonStat } from "@/types/syncModel";

export const getTypeInfo = (
    typeNum: number | undefined | null
): TypeMapItem => {
    if (typeNum === undefined || typeNum === null || !TypeMap[typeNum]) {
        return TypeMap[0];
    }
    return TypeMap[typeNum];
};

export const getTypeInfoWithCNName = (cnName: string): TypeMapItem => {
    const typeList = Object.values(TypeMap);
    const matchedType = typeList.find((item) => item.cnName === cnName);
    return matchedType ?? TypeMap[0];
};

export const getCategoryInfo = (
    typeStr: string | undefined | null
): TypeMapItem => {
    return CategoryMap[typeStr];
};

export const getRoleInfo = (roleNum: number): TypeMapItem => {
    return RoleMap[roleNum];
};

// 辅助函数：将statKey转换为StatIndex
export const getStatIndexByStatKey = (
    statKey: keyof PokemonStat
): StatIndex => {
    const keyMap: Record<keyof PokemonStat, StatIndex> = {
        hp: 1,
        atk: 2,
        def: 3,
        spa: 4,
        spd: 5,
        spe: 6,
    };
    return keyMap[statKey];
};

export const getStatCNnameByStatKey = (statKey: keyof PokemonStat): string => {
    const keyMap: Record<keyof PokemonStat, string> = {
        hp: "HP",
        atk: "攻擊",
        def: "防禦",
        spa: "特攻",
        spd: "特防",
        spe: "速度",
    };
    return keyMap[statKey];
};
