import { CategoryMap, RoleMap, StatMap, TypeMap } from "@/constances/map";
import { StatIndex, TypeMapItem } from "@/types/indices";

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

export const getStatIndexByStatKey = (statKey: string): StatIndex => {
    const entry = Object.entries(StatMap).find(
        ([_, val]) => val.key === statKey
    );
    if (entry) {
        return Number(entry[0]) as StatIndex;
    }

    return 0 as StatIndex;
};

export const getStatCNnameByStatKey = (statKey: string): string => {
    const item = Object.values(StatMap).find((val) => val.key === statKey);
    return item ? item.cnName : statKey;
};

export const getStatKeyByStatCNname = (statCNname: string): string => {
    const item = Object.values(StatMap).find((val) => val.cnName === statCNname);
    return item ? item.key : statCNname;
};
