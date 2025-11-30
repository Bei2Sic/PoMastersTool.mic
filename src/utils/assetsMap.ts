import { TypeMap, CategoryMap, RoleMap } from "@/type/map";
import { TypeMapItem } from "@/type/const";


export const getTypeInfo = (
    typeNum: number | undefined | null
): TypeMapItem => {
    if (typeNum === undefined || typeNum === null || !TypeMap[typeNum]) {
        return TypeMap[0];
    }
    return TypeMap[typeNum];
};

export const getTypeInfoWithCNName = (
    cnName: string
): TypeMapItem => {
    const typeList = Object.values(TypeMap);
    const matchedType = typeList.find(item => item.cnName === cnName);
    return matchedType ?? TypeMap[0];
};

export const getCategoryInfo = (
    typeStr: string | undefined | null
): TypeMapItem => {
    return CategoryMap[typeStr];
};

export const getRoleInfo = (
    roleNum: number
): TypeMapItem => {
    return RoleMap[roleNum];
};

// 获取对应的训练家图片资源
export const getTrainerUrl = (actorId: string, exEnabled: boolean): string => {
    if (exEnabled) {
        actorId += "_expose";
    }
    const imagePath = `../assets/trainer/${actorId}_128.png`;
    const url = new URL(imagePath, import.meta.url).href;
    return url;
};

