import { TypeMapItem } from "@/types/indices";

export const TypeMap: Record<number, TypeMapItem> = {
    0: { key: "Trainer", cnName: "訓練家" },
    1: { key: "Normal", cnName: "一般", specialName: "一般" },
    2: { key: "Fire", cnName: "火", specialName: "火球" },
    3: { key: "Water", cnName: "水", specialName: "水之" },
    4: { key: "Electric", cnName: "電", specialName: "電氣" },
    5: { key: "Grass", cnName: "草", specialName: "青草" },
    6: { key: "Ice", cnName: "冰", specialName: "冰柱" },
    7: { key: "Fighting", cnName: "格鬥", specialName: "拳頭" },
    8: { key: "Poison", cnName: "毒", specialName: "劇毒" },
    9: { key: "Ground", cnName: "地面", specialName: "大地" },
    10: { key: "Flying", cnName: "飛行", specialName: "藍天" },
    11: { key: "Psychic", cnName: "超能力", specialName: "精神" },
    12: { key: "Bug", cnName: "蟲", specialName: "玉蟲" },
    13: { key: "Rock", cnName: "岩石", specialName: "岩石" },
    14: { key: "Ghost", cnName: "幽靈", specialName: "妖怪" },
    15: { key: "Dragon", cnName: "龍", specialName: "龍之" },
    16: { key: "Dark", cnName: "惡", specialName: "惡顔" },
    17: { key: "Steel", cnName: "鋼", specialName: "鋼鐵" },
    18: { key: "Fairy", cnName: "妖精", specialName: "妖精" },
};

export const CategoryMap: Record<string, TypeMapItem> = {
    0: { key: "Status", cnName: "變化" },
    1: { key: "Physical", cnName: "物理" },
    2: { key: "Special", cnName: "特殊" },
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

export const AbnormalMap: Record<string, TypeMapItem> = {
    0: { key: "Healthy", cnName: "健康" },
    1: { key: "Poisoned", cnName: "中毒" },
    2: { key: "BadlyPoisoned", cnName: "劇毒" },
    3: { key: "Burned", cnName: "灼傷" },
    4: { key: "Paralyzed", cnName: "麻痹" },
    5: { key: "Forzen", cnName: "冰凍" },
    6: { key: "Asleep", cnName: "睡眠" },
};

export const HindranceMap: Record<string, TypeMapItem> = {
    0: { key: "Cofused", cnName: "混亂" },
    1: { key: "Flinching", cnName: "畏縮" },
    2: { key: "Trapped", cnName: "束縛" },
    3: { key: "Restrained", cnName: "禁止替換" },
};

export const CrtibuffsMap: Record<string, TypeMapItem> = {
    0: { key: "Physical", cnName: "物理爆傷" },
    1: { key: "Special", cnName: "特殊爆傷" },
    2: { key: "Sync", cnName: "拍招爆傷" },
};

export const WeatherMap: Record<string, TypeMapItem> = {
    0: { key: "Rainy", cnName: "下雨" },
    1: { key: "Sunny", cnName: "晴天" },
    2: { key: "Sandstorm", cnName: "沙暴" },
    3: { key: "Hailstorm", cnName: "冰雹" },
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
