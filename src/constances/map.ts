import { TypeMapItem } from "@/types/indices";

export const TypeMap: Record<number, TypeMapItem> = {
    0: { typeSuffix: "Trainer", cnName: "訓練家" },
    1: { typeSuffix: "Normal", cnName: "一般" },
    2: { typeSuffix: "Fire", cnName: "火" },
    3: { typeSuffix: "Water", cnName: "水" },
    4: { typeSuffix: "Electric", cnName: "電" },
    5: { typeSuffix: "Grass", cnName: "草" },
    6: { typeSuffix: "Ice", cnName: "冰" },
    7: { typeSuffix: "Fighting", cnName: "格鬥" },
    8: { typeSuffix: "Poison", cnName: "毒" },
    9: { typeSuffix: "Ground", cnName: "地面" },
    10: { typeSuffix: "Flying", cnName: "飛行" },
    11: { typeSuffix: "Psychic", cnName: "超能力" },
    12: { typeSuffix: "Bug", cnName: "蟲" },
    13: { typeSuffix: "Rock", cnName: "岩石" },
    14: { typeSuffix: "Ghost", cnName: "幽靈" },
    15: { typeSuffix: "Dragon", cnName: "龍" },
    16: { typeSuffix: "Dark", cnName: "惡" },
    17: { typeSuffix: "Steel", cnName: "鋼" },
    18: { typeSuffix: "Fairy", cnName: "妖精" },
};

export const CategoryMap: Record<string, TypeMapItem> = {
    物理: { typeSuffix: "Physical", cnName: "物理" },
    特殊: { typeSuffix: "Special", cnName: "特殊" },
    變化: { typeSuffix: "Status", cnName: "變化" },
};

export const RoleMap: Record<string, TypeMapItem> = {
    0: { typeSuffix: "Physical_Strike", cnName: "攻擊型" },
    1: { typeSuffix: "Special_Strike", cnName: "攻擊型" },
    2: { typeSuffix: "Support", cnName: "輔助型" },
    3: { typeSuffix: "Tech", cnName: "技術型" },
    4: { typeSuffix: "Sprint", cnName: "速戰型" },
    5: { typeSuffix: "Field", cnName: "場地型" },
    6: { typeSuffix: "Multi", cnName: "複合型" },
};

export const ExRoleList = [
    "攻擊型",
    "攻擊型",
    "輔助型",
    "技術型",
    "速戰型",
    "場地型",
] as const;

export const NumtoStatKey = {
    1: "hp",
    2: "atk",
    3: "def",
    4: "spa",
    5: "spd",
    6: "spe",
} as const;
