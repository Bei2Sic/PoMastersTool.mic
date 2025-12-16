import { TypeMapItem } from "@/types/indices";

export const TypeMap: Record<number, TypeMapItem> = {
    0: { key: "Trainer", cnName: "訓練家" },
    1: { key: "Normal", cnName: "一般" },
    2: { key: "Fire", cnName: "火" },
    3: { key: "Water", cnName: "水" },
    4: { key: "Electric", cnName: "電" },
    5: { key: "Grass", cnName: "草" },
    6: { key: "Ice", cnName: "冰" },
    7: { key: "Fighting", cnName: "格鬥" },
    8: { key: "Poison", cnName: "毒" },
    9: { key: "Ground", cnName: "地面" },
    10: { key: "Flying", cnName: "飛行" },
    11: { key: "Psychic", cnName: "超能力" },
    12: { key: "Bug", cnName: "蟲" },
    13: { key: "Rock", cnName: "岩石" },
    14: { key: "Ghost", cnName: "幽靈" },
    15: { key: "Dragon", cnName: "龍" },
    16: { key: "Dark", cnName: "惡" },
    17: { key: "Steel", cnName: "鋼" },
    18: { key: "Fairy", cnName: "妖精" },
};

export const CategoryMap: Record<string, TypeMapItem> = {
    物理: { key: "Physical", cnName: "物理" },
    特殊: { key: "Special", cnName: "特殊" },
    變化: { key: "Status", cnName: "變化" },
};

export const RoleMap: Record<string, TypeMapItem> = {
    0: { key: "Physical_Strike", cnName: "攻擊型" },
    1: { key: "Special_Strike", cnName: "攻擊型" },
    2: { key: "Support", cnName: "輔助型" },
    3: { key: "Tech", cnName: "技術型" },
    4: { key: "Sprint", cnName: "速戰型" },
    5: { key: "Field", cnName: "場地型" },
    6: { key: "Multi", cnName: "複合型" },
};

export const ExRoleList = [
    "攻擊型",
    "攻擊型",
    "輔助型",
    "技術型",
    "速戰型",
    "場地型",
] as const;

export const StatMap: Record<string, TypeMapItem> = {
    1: { key: "hp", cnName: "HP" },
    2: { key: "atk", cnName: "攻擊" },
    3: { key: "def", cnName: "防禦" },
    4: { key: "spa", cnName: "特攻" },
    5: { key: "spd", cnName: "特防" },
    6: { key: "spe", cnName: "速度" },
    7: { key: "acc", cnName: "命中率" },
    8: { key: "eva", cnName: "閃避率" },
    9: { key: "ct", cnName: "擊中要害率" },
};
