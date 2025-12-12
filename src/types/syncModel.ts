import { BonusIndex, ExRoleIndex, RarityIndex, RoleIndex } from "@/types/indices";
import { ComputedRef } from "vue";

// ------------------------------ 拍组JSON原始数据类型（与JSON结构完全对应）------------------------------
// 拍组原始JSON的完整类型（与你的JSON结构一一对应，避免类型模糊）
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
    trainerName: string; // 训练师名称
    pokemonName: string; // 宝可梦名称
    rarity: RarityIndex; // 稀有度（筛选用）
    type: string; // 宝可梦属性（统一转为数组，筛选用）
    weakness: string;
    ex: boolean; // 是否EX（筛选用）
    role: string; // 角色類型
    exRole: string; // EX角色类型（筛选用）
    fileName?: string; // 对应的JSON文件名（可选，用于调试）
    actorId: string;
}

// 全局缓存类型：键=拍组训练师ID，值=元信息+原始完整数据
export interface GlobalSyncCache {
    [trainerId: string]: {
        meta: SyncMeta; // 元信息（轻量化）
        rawData: SyncRawData; // 完整原始数据（用于创建对象）
    };
}

// ================================= 基础类型定义（适配新JSON结构）=================================
/** 训练师信息 */
export interface Trainer {
    id: string;
    name: string;
    actor: string;
    actorId: string;
    rarity: RarityIndex;
    role: RoleIndex;
    exRole: ExRoleIndex;
    ex: boolean;
    exclusivity: string;
    maxBonusLevel: number;
}

/** 宝可梦属性统计 */
export interface PokemonStat {
    hp: number[];
    atk: number[];
    def: number[];
    spa: number[];
    spd: number[];
    spe: number[];
}

/** 宝可梦被动技能 */
export interface Passive {
    name: string;
    description: string;
    detail: string[];
}

/** 招式基础信息 */
export interface MoveBase {
    user: string;
    name: string;
    type: number;
    gauge: number;
    uses: string | number;
    category: string;
    power: number;
    accuracy: number;
    target: string;
    description: string;
    group: string;
    tags: string;
}

/** 宝可梦普通招式 */
export interface Move extends MoveBase {}

/** Sync招式 */
export interface SyncMove extends MoveBase {}

/** 极巨化招式 */
export interface MoveMax extends MoveBase {}

/** 太晶招式 */
export interface MoveTera extends MoveBase {}

export interface MoveFinal extends MoveBase {
    finalPower: number | '-'; // 實際用於顯示和計算的最終威力值
}

/** 宝可梦信息（支持多形态） */
export interface Pokemon {
    id: string;
    variationType: number;
    name: string;
    form: string;
    actor: string;
    gender: number;
    is_shiny: boolean;
    type: number;
    weakness: number;
    stat: PokemonStat;
    scale?: number[];
    passives: Passive[];
    moves: Move[];
    syncMove: SyncMove;
    movesDynamax?: MoveMax[];
    moveTera?: MoveTera; // 部分宝可梦有太晶招式
}

/** 拍组主题 */
export interface Theme {
    name: string;
    description: string;
    tag: string;
    category: number;
}

/** 特殊觉醒 */
export interface SpecialAwaking {
    name: string;
    description: string;
    detail: string[];
}

/** 潜能饼干技能 */
export interface LuckCookieSkill {
    name: string[];
    description: string;
    rate: number;
}

/** 潜能饼干 */
export interface LuckCookie {
    cookieName: string;
    skills: LuckCookieSkill[];
}

/** 石盘格子数据（适配新JSON的grid结构） */
export interface Grid {
    id: number;
    name: string;
    description: string;
    detail: string[];
    energy: number;
    orb: number;
    level: number;
    x: number;
    y: number;
    color: string;
    type: number; // 招式属性
}

/** 石盘动态数据（含激活状态） */
export interface Tile extends Grid {
    isActive: boolean; // 石盘是否激活
}

/** 拍组动态属性（微调适配新类型） */
export interface SyncDynamicState {
    currentRarity: RarityIndex; // 当前选中的星级
    level: number; // 当前等级
    potential: number; // 当前潜力
    exRoleEnabled: boolean; // 是否开启EX体系
    bonusLevel: BonusIndex; // 当前宝数等级
    // bonusList: { id: number; isActive: boolean }[]; // 宝数激活列表
    gridData: Tile[]; // 石盘动态数据
    potentialCookie: LuckCookie | null; // 当前选择的潜能饼干
    selectedPokemonIndex: number; // 选中的宝可梦形态索引（默认0）
}

/** Sync计算属性（保持原有六维属性+石盘相关计算） */
export interface SyncComputed {
    hp: ComputedRef<number>; // HP白值
    atk: ComputedRef<number>; // 攻击白值
    def: ComputedRef<number>; // 防御白值
    spa: ComputedRef<number>; // 特攻白值（对应spa）
    spd: ComputedRef<number>; // 特防白值（对应spd）
    spe: ComputedRef<number>; // 速度白值（对应spe）
    costOrbs: ComputedRef<number>; // 消耗滴晶数
    lastEnergy: ComputedRef<number>; // 剩余力量
    selectedTiles: ComputedRef<Tile[]>; // 选中的石盘
    currentPokemon: ComputedRef<Pokemon>; // 当前选中的宝可梦形态
    finalMoves: ComputedRef<MoveFinal[]>;
    finalSyncMove: ComputedRef<MoveFinal>;
    finalMoveMax: ComputedRef<MoveFinal[]>;
    finalMoveTera: ComputedRef<MoveFinal | null>;
}

/** Sync操作方法（新增形态切换方法） */
export interface SyncMethods {
    initGridData: () => void; // 初始化石盘数据
    getSyncName: () => string; // 获取拍组的名字
    getSyncRarity: () => number; // 获取拍组的初始星级
    getSyncEXEnabled: () => boolean; // 获取拍组是否有ex
    getSyncEXRole: () => number; // 获取拍组ex类型
    getTrainer: () => Trainer; // 获取训练师信息
    getThemes: () => Theme[]; // 获取拍组组队技能
    getSpecialAwaking: () => SpecialAwaking; // 获取超觉醒被动
    getvariationList: () => string[]; // 获取宝可梦变化形态
    getPokemon: (index: number) => Pokemon; // 获取对应形态宝可梦
    toggleTile: (tileId: number) => void; // 切换石盘激活状态
    updateLevel: (level: number) => void; // 更新等级（含验证）
    updateRarity: (rarity: RarityIndex) => void; // 更新星级（EX后重置潜力）
    updatePotentialCookie: (cookie: LuckCookie | null) => void; // 更新潜能饼干
    updatePotentialCookieWithLevel: (cookie: LuckCookie, level: number) => void; // 带等级的饼干更新
    getTileBorderUrl: (tile: Tile) => string;
    getTileFillUrl: (tile: Tile) => string;
    fixTileName: (tile: Tile) => string;
    // getTrainerUrl: (trainer: Trainer) => string;
    isTileReachable: (tile: Tile) => boolean; // 石盘是否可达
    checkSelectedTiles: () => void;
    switchPokemonForm: (index: number) => void; // 切换宝可梦形态
}

/** 完整Sync对象 */
export interface Sync {
    rawData: SyncRawData; // 原始数据
    state: SyncDynamicState; // 动态状态（可变）
    computed: SyncComputed; // 计算属性（自动更新）
    methods: SyncMethods;
}
