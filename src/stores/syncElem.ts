import { CURRENT_SYNC_KEY } from "@/constances/key";
import { PowerMoveScope } from "@/core/calculators/power";
import {
    getFinalStatValue,
    mapMoveToMoveFinal,
} from "@/core/exporter/syncData";
import { useSyncCacheStore } from "@/stores/syncCache"; // 原始数据缓存Store
import type { SyncRawData } from "@/types/cache";
import { RarityIndex } from "@/types/indices";
import {
    LuckCookie,
    Sync,
    SyncComputed,
    SyncDynamicState,
    SyncMethods,
    Tile,
} from "@/types/syncModel";
import { defineStore } from "pinia";
import { computed, reactive } from "vue";

interface SyncElemState {
    singleSync: Sync | null;
    teamSyncs: Sync[];
}

export const useSyncElemStore = defineStore("syncUse", {
    state: (): SyncElemState => ({
        // ------------------------------ 信息浏览场景 ------------------------------
        singleSync: null,
        // ------------------------------ 组队模式场景 ------------------------------
        teamSyncs: [],
    }),
    getters: {
        // 当前Sync的最终六维属性
        currentFinalStats: (state) => {
            if (!state.singleSync) return null;
            return {
                hp: state.singleSync.computed.hp,
                atk: state.singleSync.computed.atk,
                def: state.singleSync.computed.def,
                spa: state.singleSync.computed.spa,
                spd: state.singleSync.computed.spd,
                spe: state.singleSync.computed.spe,
            };
        },

        // 当前Sync的最终技能效果
        currentFinalMoves: (state) => {
            if (!state.singleSync) return null;
            return {
                moves: state.singleSync.computed.finalMoves,
                movesDynamax: state.singleSync.computed.finalMoveMax,
                moveTera: state.singleSync.computed.finalMoveTera,
                syncMove: state.singleSync.computed.finalSyncMove,
            };
        },

        // 当前Sync的石盘信息
        currentGridInfo: (state) => {
            if (!state.singleSync) return null;
            return {
                selectedTiles: state.singleSync.computed.selectedTiles,
                costOrbs: state.singleSync.computed.costOrbs,
                lastEnergy: state.singleSync.computed.lastEnergy,
                gridData: state.singleSync.state.gridData,
                potentialCookie: state.singleSync.state.potentialCookie,
            };
        },

        // 当前选中的宝可梦
        currentPokemon: (state) => {
            if (!state.singleSync) return null;
            return state.singleSync.computed.currentPokemon;
        },

        // 當前拍組动态信息
        singleSyncDynamicState: (state) => {
            return state.singleSync?.state || null;
        },

        // 暴露方法（用於渲染）
        exportMethods: (state) => {
            if (!state.singleSync) return null;
            return state.singleSync.methods;
        },

        // 用於計算的匯總數據方法
        currentActivePassive: (state) => { },

        // ------------------------------ 组队模式：计算属性 ------------------------------
        // 队伍中所有拍组的最终属性（用于伤害计算）
        // todo
    },
    actions: {
        // ------------------------------ 信息浏览场景：核心操作 ------------------------------
        initsingleSync() {
            const syncCacheStore = useSyncCacheStore();
            const rawData = syncCacheStore.selectedRawData;
            if (!rawData) return;
            this.singleSync = createSync(rawData);
        },

        /**
         * 重置当前拍组的动态状态（恢复默认）
         */
        resetsingleSync() {
            // if (!this.singleSync) return;
            // const syncId = this.singleSync.baseInfo.id;
            // this.initsingleSync(syncId); // 重新创建实例即可重置
        },

        // 選擇拍組方法
        selectSingleSync(trainer_id: string) {
            const syncCacheStore = useSyncCacheStore();
            const rawData = syncCacheStore.getRawDataWithTrainerId(trainer_id);
            if (!rawData) return;
            this.singleSync = createSync(rawData);
            localStorage.setItem(CURRENT_SYNC_KEY, trainer_id);
        },
    },
});

// ================================= Sync工厂函数 =================================
const createSync = (jsonData: SyncRawData): Sync => {
    // 初始化动态状态
    const state: SyncDynamicState = reactive({
        currentRarity: jsonData.trainer.rarity,
        level: 140,
        potential: 0,
        exRoleEnabled: false,
        bonusLevel: 5,
        gridData: reactive([]),
        potentialCookie: null,
        selectedPokemonIndex: 0, // 默认选中第一个形态
    });

    // 计算属性
    const computedProps: SyncComputed = {
        hp: computed(() =>
            getFinalStatValue(jsonData, state, "hp", state.selectedPokemonIndex)
        ),
        atk: computed(() =>
            getFinalStatValue(
                jsonData,
                state,
                "atk",
                state.selectedPokemonIndex
            )
        ),
        def: computed(() =>
            getFinalStatValue(
                jsonData,
                state,
                "def",
                state.selectedPokemonIndex
            )
        ),
        spa: computed(() =>
            getFinalStatValue(
                jsonData,
                state,
                "spa",
                state.selectedPokemonIndex
            )
        ),
        spd: computed(() =>
            getFinalStatValue(
                jsonData,
                state,
                "spd",
                state.selectedPokemonIndex
            )
        ),
        spe: computed(() =>
            getFinalStatValue(
                jsonData,
                state,
                "spe",
                state.selectedPokemonIndex
            )
        ),
        costOrbs: computed(() => {
            return state.gridData.reduce(
                (sum, tile) => sum + (tile.isActive ? tile.orb : 0),
                0
            );
        }),
        lastEnergy: computed(() => {
            const totalEnergy = 60;
            // const totalEnergy = 60 + Math.min(2 * state.bonusLevel, 10);
            const usedEnergy = state.gridData.reduce(
                (sum, tile) => sum + (tile.isActive ? tile.energy : 0),
                0
            );
            return totalEnergy - usedEnergy;
        }),
        selectedTiles: computed(() => {
            return state.gridData.filter((tile) => tile.isActive);
        }),
        currentPokemon: computed(() => {
            return jsonData.pokemon[state.selectedPokemonIndex];
        }),
        // 招式計算
        finalMoves: computed(() => {
            const moves = computedProps.currentPokemon.value.moves;
            if (!moves) return null;
            return moves.map((move) =>
                mapMoveToMoveFinal(
                    move,
                    jsonData.trainer,
                    state,
                    PowerMoveScope.Move
                )
            );
        }),

        finalSyncMove: computed(() => {
            // 使用當前形態的 Sync 招式數據
            const syncMove = computedProps.currentPokemon.value.syncMove;
            if (!syncMove) return null;
            return mapMoveToMoveFinal(
                syncMove,
                jsonData.trainer,
                state,
                PowerMoveScope.Sync
            );
        }),

        finalMoveMax: computed(() => {
            const moveMaxs = computedProps.currentPokemon.value.movesDynamax;
            if (!moveMaxs) return null;
            return moveMaxs.map((move) =>
                mapMoveToMoveFinal(
                    move,
                    jsonData.trainer,
                    state,
                    PowerMoveScope.Max
                )
            );
        }),

        finalMoveTera: computed(() => {
            const moveTera = computedProps.currentPokemon.value.moveTera;
            if (!moveTera) return null;
            return mapMoveToMoveFinal(
                moveTera,
                jsonData.trainer,
                state,
                PowerMoveScope.Move
            );
        }),
    };

    // Sync操作方法
    const methods: SyncMethods = {
        // 初始化用于渲染的石盘数据
        initGridData: () => {
            state.gridData.length = 0;
            state.gridData.push(
                ...jsonData.grid.map((Grid) => ({
                    ...Grid,
                    isActive: false, // 默认未激活
                }))
            );
        },

        getSyncName: () => {
            const { name: trainerName } = jsonData.trainer;
            const { name: pokemonName, form } =
                jsonData.pokemon[state.selectedPokemonIndex];

            const fixTrainerName = trainerName
                .replace(/（/g, "(")
                .replace(/）/g, ")");
            const fixPokemonName = `${pokemonName}${form ? `(${form})` : ""}`;

            return `${fixTrainerName} & ${fixPokemonName}`;
        },

        getSyncRarity: () => {
            return jsonData.trainer.rarity;
        },

        getSyncEXEnabled: () => {
            return jsonData.trainer.ex;
        },

        getSyncEXRole: () => {
            return jsonData.trainer.exRole;
        },

        getTrainer: () => {
            return jsonData.trainer;
        },

        getThemes: () => {
            return jsonData.themes;
        },

        getSpecialAwaking: () => {
            return jsonData.specialAwaking;
        },

        getvariationList: () => {
            if (jsonData.pokemon.length < 2) {
                return ["基礎形態"];
            }

            const variationList = jsonData.pokemon.map((item) => {
                switch (item.variationType) {
                    case 1:
                        return "超級進化";
                    case 4:
                        return "極巨化形態";
                    default:
                        return item.form != "" ? item.form : "基礎形態";
                }
            });
            return variationList;
        },

        getPokemon: (index: number) => {
            return jsonData.pokemon[index] || null;
        },

        // 切换石盘激活状态
        toggleTile: (tileId: number) => {
            const tile = state.gridData.find((t) => t.id === tileId);
            if (tile && methods.isTileReachable(tile)) {
                tile.isActive = !tile.isActive;
            }
        },

        // 更新等级（含范围验证）
        updateLevel: (level: number) => {
            if (isNaN(level)) level = 1;
            state.level = Math.max(1, Math.min(200, Math.floor(level)));
        },

        // 更新星级（EX星级重置潜力）
        updateRarity: (rarity: RarityIndex) => {
            state.currentRarity = rarity;
            if (rarity === 6) {
                state.potential = 0;
            }
        },

        // 更新潜能饼干
        updatePotentialCookie: (cookie: LuckCookie | null) => {
            state.potentialCookie = cookie;
        },

        // 带等级的饼干更新（示例：饼干名称拼接等级）
        updatePotentialCookieWithLevel: (cookie: LuckCookie, level: number) => {
            state.potentialCookie = {
                ...cookie,
                cookieName: `${cookie.cookieName}${level}`,
            };
        },

        // 判断石盘是否可达（基于宝数等级）
        isTileReachable: (tile: Tile) => {
            return tile.level <= state.bonusLevel;
        },

        // 判斷石盤是否都可符合當前等級
        checkSelectedTiles: () => {
            state.gridData.forEach((tile) => {
                // 已激活但不可达 → 禁用
                if (tile.isActive && !methods.isTileReachable(tile)) {
                    tile.isActive = false;
                }
            });
        },

        // 获取石盘对应边框图片资源
        getTileBorderUrl: (tile: Tile) => {
            let keyName = "";
            switch (tile.color) {
                case "#779EFF":
                    keyName = "statsup";
                    break;
                case "#47D147":
                    if (tile.name.includes("極巨")) {
                        keyName = "dynamaxmove";
                    } else {
                        keyName = "movepowerup";
                    }
                    break;
                case "#FF0066":
                    keyName = "moveeffect";
                    break;
                case "#FFC266":
                    keyName = "passiveskill";
                    break;
                case "#BF80FF":
                    keyName = "syncmove";
                    break;
                case "#FF80BF":
                    keyName = "learnmove";
                    break;
            }
            if (tile.isActive) {
                keyName += "-selected";
            }
            const imagePath = `../assets/sync-grids/${keyName}.png`;
            const url = new URL(imagePath, import.meta.url).href;
            return url;
        },

        // 获取石盘对应边框图片资源
        getTileFillUrl: (tile: Tile) => {
            let keyName = "";

            if (state.bonusLevel < tile.level) {
                keyName = "icons/locked-" + tile.level;
                const imagePath = `../assets/sync-grids/${keyName}.png`;
                const url = new URL(imagePath, import.meta.url).href;
                return url;
            }
            switch (tile.color) {
                case "#779EFF":
                    keyName = "icons/statsup";
                    break;
                case "#47D147":
                    keyName = "icons/movepowerup-" + tile.type;
                    break;
                case "#FF0066":
                    keyName = "icons/moveeffect";
                    break;
                case "#FFC266":
                    keyName = "icons/passiveskill";
                    break;
                case "#BF80FF":
                    keyName = "icons/syncmove";
                    break;
                case "#FF80BF":
                    keyName = "icons/learnmove";
                    break;
            }
            if (tile.isActive) {
                keyName += "-selected";
            }
            const imagePath = `../assets/sync-grids/${keyName}.png`;
            const url = new URL(imagePath, import.meta.url).href;
            return url;
        },

        fixTileName: (tile) => {
            let name = tile.name;

            //todo: 個人技替換....
            if (tile.color === "#BF80FF") {
                name = name.replace(/^.*?：/, "拍组招式：");
            } else if (tile.color === "#779EFF") {
                return [name];
            } else if (tile.color === "#FF0066") {
                // 
            }

            name = name.replace("招式計量槽", "計量槽");
            name = name.replace("拍組招式", "拍招");
            name = name.replace("效果絕佳威力提升", "效果絕佳提升");

            const colonMatch = name.match(/^(.*?[:：])(.*)$/);
            if (colonMatch) {
                const prefix = colonMatch[1].replace("：", "");
                const suffix = colonMatch[2];

                const prefixChunks = prefix.match(/.{1,6}/g) || [];
                let suffixChunks = [];
                if (suffix) {
                    // 如果是威力或数值，不切分
                    const isPowerNode = /威力|Power|^\s*\+\d/.test(suffix);
                    if (isPowerNode) {
                        suffixChunks = [suffix];
                    } else {
                        // 否则也按 5 字切分
                        suffixChunks = suffix.match(/.{1,6}/g) || [];
                    }
                }
                return [...prefixChunks, ...suffixChunks];
            } else {
                return name.match(/.{1,6}/g) || [name];
            }
        },

        // 切换宝可梦形态
        switchPokemonForm: (index: number) => {
            if (index >= 0 && index < jsonData.pokemon.length) {
                state.selectedPokemonIndex = index;
            }
        },
    };

    // 初始化石盘数据
    methods.initGridData();

    // 5. 返回完整Sync对象
    return {
        rawData: jsonData,
        state,
        computed: computedProps,
        methods: methods,
    };
};
