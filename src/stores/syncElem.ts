import { CURRENT_SYNC_KEY } from "@/constances/key";
import { PowerMoveScope } from "@/core/calculators/power";
import {
    getFinalStatValue,
    mapMoveToMoveFinal,
} from "@/core/exporter/syncData";
import { useSyncCacheStore } from "@/stores/syncCache"; // 原始数据缓存Store
import type { SyncRawData } from "@/types/cache";
import { BattleState } from "@/types/conditions";
import { RarityIndex } from "@/types/indices";
import {
    LuckCookie,
    Sync,
    SyncDynamicState,
    SyncMethods,
    Tile,
} from "@/types/syncModel";
import { initBattleState } from "@/utils/initializers";
import { defineStore } from "pinia";
import { computed, reactive } from "vue";

interface SyncElemState {
    // 统一的队伍存储，固定 3 个槽位
    // 索引 0 通常作为"队长"或单人视图的默认对象
    team: (Sync | null)[];

    // 当前正在查看/编辑的槽位索引 (0, 1, 2)
    activeSlotIndex: number;
}

export const useSyncElemStore = defineStore("syncUse", {
    state: (): SyncElemState => ({
        // 初始化 3 个空槽位
        team: [null, null, null],
        activeSlotIndex: 0,
    }),

    getters: {
        // 获取当前激活的 Sync 对象
        // 所有的渲染都应该依赖这个 getter，而不是直接访问数组
        activeSync: (state): Sync | null => {
            return state.team[state.activeSlotIndex] || null;
        },

        teamSync(state) {
            return state.team
                .map((sync, index) => ({ sync, index }))
                .filter((item) => {
                    // 2. 排除当前选中拍组
                    const isNotActive = item.index !== state.activeSlotIndex;
                    // 3. 排除空槽位
                    const isNotEmpty = item.sync !== null;

                    return isNotActive && isNotEmpty;
                });
        },
        // 返回类型示例: Array<{ sync: Sync, index: number }>

        // ------------------------------ 下面的 Getters 全部改用 activeSync ------------------------------

        // 当前Sync的最终六维属性
        currentFinalStats(): any {
            const sync = this.activeSync;
            if (!sync) return null;
            return {
                hp: sync.computed.hp,
                atk: sync.computed.atk,
                def: sync.computed.def,
                spa: sync.computed.spa,
                spd: sync.computed.spd,
                spe: sync.computed.spe,
            };
        },

        // 当前Sync的最终技能效果
        currentFinalMoves() {
            const sync = this.activeSync;
            if (!sync) return null;
            return {
                moves: sync.computed.finalMoves,
                movesDynamax: sync.computed.finalMoveMax,
                moveTera: sync.computed.finalMoveTera,
                syncMove: sync.computed.finalSyncMove,
            };
        },

        // 当前Sync的石盘信息
        currentGridInfo() {
            const sync = this.activeSync;
            if (!sync) return null;
            return {
                selectedTiles: sync.computed.selectedTiles,
                costOrbs: sync.computed.costOrbs,
                costFieryOrbs: sync.computed.costFieryOrbs,
                costLeafOrbs: sync.computed.costLeafOrbs,
                costBubblyOrbs: sync.computed.costBubblyOrbs,
                costSparkyOrbs: sync.computed.costSparkyOrbs,
                costTMOrbs: sync.computed.costTMOrbs,
                lastEnergy: sync.computed.lastEnergy,
                gridData: sync.state.gridData,
                potentialCookie: sync.state.potentialCookie,
            };
        },

        // 当前选中的宝可梦
        currentPokemon() {
            const sync = this.activeSync;
            if (!sync) return null;
            return sync.computed.currentPokemon;
        },

        // 當前拍組动态信息
        currentDynamicState() {
            return this.activeSync?.state || null;
        },

        //  当前选中拍组的战斗状态
        currentBattleState(): BattleState | null {
            return this.activeSync?.state.battle || null;
        },

        // 暴露方法（用於渲染）
        exportMethods() {
            const sync = this.activeSync;
            if (!sync) return null;
            return sync.methods;
        },

        // ------------------------------ 组队计算属性 ------------------------------
        // 这里可以很方便地获取整个队伍，因为 team 就在 state 里
        teamSyncList: (state) => state.team,
    },

    actions: {
        // ------------------------------ 槽位管理 ------------------------------

        /**
         * 切换当前编辑/查看的槽位
         * @param index 0, 1, 2
         */
        switchActiveSlot(index: number) {
            if (index >= 0 && index < 3) {
                this.activeSlotIndex = index;
            }
        },

        /**
         * 清除当前槽位的拍组
         */
        clearActiveSlot() {
            this.team[this.activeSlotIndex] = null;
            if (this.activeSlotIndex === 0) {
                localStorage.removeItem(CURRENT_SYNC_KEY);
            }
        },

        // ------------------------------ 核心操作 (作用于当前槽位) ------------------------------

        // 初始化当前槽位 (通常用于页面加载时读取缓存)
        initActiveSync() {
            const syncCacheStore = useSyncCacheStore();
            const rawData = syncCacheStore.selectedRawData;

            // 如果缓存里有数据，就加载到当前槽位
            if (rawData) {
                this.team[this.activeSlotIndex] = createSync(rawData);
            }
        },

        /**
         * 重置当前拍组的动态状态（恢复默认）
         * 逻辑：重新用 rawData 创建一个新实例覆盖旧的
         */
        resetActiveSync() {
            const currentSync = this.activeSync;
            if (!currentSync) return;

            // 这里假设我们能通过 ID 重新获取 rawData，或者 rawData 本身就在 Sync 对象里存了一份
            // 你之前的 createSync 返回了 rawData，所以可以直接用
            const rawData = currentSync.rawData;
            this.team[this.activeSlotIndex] = createSync(rawData);
        },

        // 選擇拍組方法 (加载数据到当前槽位)
        selectSyncToActiveSlot(trainer_id: string) {
            const syncCacheStore = useSyncCacheStore();
            const rawData = syncCacheStore.getRawDataWithTrainerId(trainer_id);

            if (!rawData) return;

            // 核心修改：赋值给 team 数组的当前索引
            this.team[this.activeSlotIndex] = createSync(rawData);

            // 如果是在操作 0 号位（队长位），通常也视为操作了"单人模式"的记录
            if (this.activeSlotIndex === 0) {
                localStorage.setItem(CURRENT_SYNC_KEY, trainer_id);
            }
        },

        /**
         * 更新队伍槽位
         * @param index 0, 1, 2
         * @param sync 新的 Sync 实例
         */
        updateTeamSlot(index: number, sync: Sync) {
            if (index >= 0 && index < 3) {
                this.team[index] = sync;
            }
        },
    },
});

// ================================= Sync工厂函数 (保持不变) =================================
// 这个函数逻辑非常清晰，完全不需要动，它只负责生产对象，不负责管理状态
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
        battle: initBattleState(),
    });

    // ... (省略中间的 computedProps 和 methods 定义，与你原代码完全一致) ...
    // 为了节省篇幅，这里假定原本的 createSync 逻辑完整保留
    // ...

    // 计算属性
    const currentPokemon = computed(() => {
        return jsonData.pokemon[state.selectedPokemonIndex];
    });
    const computedProps = {
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
        costFieryOrbs: computed(() => {
            return state.gridData.reduce(
                (sum, tile) =>
                    sum +
                    (tile.isActive ? tile?.requiredItems?.fieryOrb || 0 : 0),
                0
            );
        }),
        costLeafOrbs: computed(() => {
            return state.gridData.reduce(
                (sum, tile) =>
                    sum +
                    (tile.isActive ? tile?.requiredItems?.leafyOrb || 0 : 0),
                0
            );
        }),
        costBubblyOrbs: computed(() => {
            return state.gridData.reduce(
                (sum, tile) =>
                    sum +
                    (tile.isActive ? tile?.requiredItems?.bubblyOrb || 0 : 0),
                0
            );
        }),
        costSparkyOrbs: computed(() => {
            return state.gridData.reduce(
                (sum, tile) =>
                    sum +
                    (tile.isActive ? tile?.requiredItems?.sparkyOrb || 0 : 0),
                0
            );
        }),
        costTMOrbs: computed(() => {
            return state.gridData.reduce(
                (sum, tile) =>
                    sum + (tile.isActive ? tile?.requiredItems?.tmOrb || 0 : 0),
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
        currentPokemon: currentPokemon,
        // 招式計算
        finalMoves: computed(() => {
            const moves = currentPokemon.value.moves;
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
            const syncMove = currentPokemon.value.syncMove;
            if (!syncMove) return null;
            return mapMoveToMoveFinal(
                syncMove,
                jsonData.trainer,
                state,
                PowerMoveScope.Sync
            );
        }),

        finalMoveMax: computed(() => {
            const moveMaxs = currentPokemon.value.movesDynamax;
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
            const moveTera = currentPokemon.value.moveTera;
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
                    keyName = "movepowerup";
                    break;
                case "#FF80BF":
                    keyName = "dynamaxmove";
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
                case "#7ADAF4":
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
                case "#FF80BF":
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
                case "#7ADAF4":
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
    return reactive({
        rawData: jsonData,
        state,
        computed: computedProps,
        methods: methods,
    }) as unknown as Sync;
};
