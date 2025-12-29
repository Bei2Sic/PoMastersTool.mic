import { CategoryMap, RoleMap, StatMap, TypeMap } from "@/constances/map";
import { StatIndex, TypeMapItem } from "@/types/indices";

export const getTypeInfo = (
    typeIndex: number | undefined | null
): TypeMapItem => {
    if (typeIndex === undefined || typeIndex === null || !TypeMap[typeIndex]) {
        return TypeMap[0];
    }
    return TypeMap[typeIndex];
};

export const getTypeInfoWithCnName = (cnName: string): TypeMapItem => {
    const matchedType = Object.values(TypeMap).find(
        (item) => item.cnName === cnName
    );
    return matchedType ?? TypeMap[0];
};

export const getTypeCnNameByTypeIndex = (typeIndex: number): string => {
    return TypeMap[typeIndex].cnName;
};

export const getTypeSpecialNameByTypeIndex = (typeIndex: number): string => {
    return TypeMap[typeIndex].specialName;
};

export const getTypeKeyByCnNameOrSpecialName = (cnName: string): string => {
    const entry = Object.values(TypeMap).find((t) => {
        const matchSpecial = t.specialName && cnName.includes(t.specialName);
        const matchCn = cnName.includes(t.cnName);
        return matchSpecial || matchCn;
    });
    return entry ? entry.key.toLowerCase() : "normal";
};

export function getTypeIndexByCnName(cnName: string): number {
    const entry = Object.entries(TypeMap).find(
        ([_, item]) => item.cnName === cnName
    );

    return entry ? Number(entry[0]) : 1;
}

export const getTypeCnNameByTypeSpecialName = (specialName: string): string => {
    const item = Object.values(TypeMap).find(
        (val) => val.specialName === specialName
    );
    return item ? item.cnName : specialName;
};

export const getCategoryInfo = (category: number): TypeMapItem => {
    return CategoryMap[category];
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

export const getStatCnNameByStatKey = (statKey: string): string => {
    const item = Object.values(StatMap).find((val) => val.key === statKey);
    return item ? item.cnName : statKey;
};

export const getStatKeyByStatCnName = (statCNname: string): string => {
    const item = Object.values(StatMap).find(
        (val) => val.cnName === statCNname
    );
    return item ? item.key : statCNname;
};
