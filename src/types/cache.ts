import {
    RarityIndex,
} from "@/types/indices";
import {
    Grid,
    LuckCookie,
    Pokemon,
    SpecialAwaking,
    Theme,
    Trainer,
} from "@/types/syncModel";

export interface SavedFilters {
    exclusivity: string[];
    types: string[];
    weaknesses: string[];
    roles: string[];
    exRoles: string[];
    rarity: number[];
    themes: string[];
    variation: string[]; 
    special: string[];
}


export interface SyncRawData {
    trainer: Trainer;
    pokemon: Pokemon[];
    themes: Theme[];
    specialAwaking: SpecialAwaking;
    luckCookies: LuckCookie[];
    grid: Grid[]; // 简化，按实际JSON补充
    scoutMethod: number;
    scheduleId: string;
}

// 拍组元信息（从原始JSON中提取的轻量化数据，用于选择器、筛选）
export interface SyncMeta {
    id: string; // 拍组ID（与原始数据一致）
    name: string; // 拍组名称（训练师+宝可梦）
    enActor: string; // 训练师英文名称（用于图片资源）
    dexNumber: string; // 宝可梦编号（用于图片资源）
    count: number; // 当前训练师宝可梦组合出现次数
    trainerName: string; // 训练师名称
    pokemonName: string; // 宝可梦名称
    rarity: RarityIndex; // 稀有度（筛选用）
    type: string; // 宝可梦属性（统一转为数组，筛选用）
    weakness: string;
    ex: boolean; // 是否EX（筛选用）
    role: string; // 角色類型
    exRole: string; // EX角色类型（筛选用）
    exclusivity: string; // 稀罕度（筛选用）
    fileName?: string; // 对应的JSON文件名（可选，用于调试）
    themes: string[]; // 主题技能（筛选用）
    superAwakening: boolean; // 超觉醒（筛选用）
    actorId: string;
    variationTypes: number[];
    _startDate: number;
    _exStartDate: number;
    _exRoleDate: number;
    _gridDate: number;
    _extendGridDate: number;
    _awakingDate: number;

}

// 全局缓存类型：键=拍组训练师ID，值=元信息+原始完整数据
export interface GlobalSyncCache {
    [trainerId: string]: {
        meta: SyncMeta; // 元信息（轻量化）
        rawData: SyncRawData; // 完整原始数据（用于创建对象）
    };
}