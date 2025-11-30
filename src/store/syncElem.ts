import { useSyncCacheStore } from "@/store/syncCache"; // 原始数据缓存Store
import { RarityIndex, StatIndex, STORAGE_KEY } from "@/type/const";
import {
    LuckCookie,
    PokemonStat,
    Sync,
    SyncComputed,
    SyncDynamicState,
    SyncMethods,
    SyncRawData,
    Tile,
    Trainer,
} from "@/type/sync"; // 导入你的核心类型
import { StatValueCalculator } from "@/utils/statValue";
import { defineStore } from "pinia";
import { computed, reactive } from "vue";

interface SyncElemState {
    currentSync: Sync | null;
    teamConfig: Sync[];
}

export const useSyncElemStore = defineStore("syncUse", {
    state: (): SyncElemState => ({
        // ------------------------------ 信息浏览场景 ------------------------------
        currentSync: null,
        // ------------------------------ 组队模式场景 ------------------------------
        teamConfig: [],
    }),
    getters: {
        // 当前Sync的最终六维属性
        currentFinalStats: (state) => {
            if (!state.currentSync) return null;
            return {
                hp: state.currentSync.computed.hp,
                atk: state.currentSync.computed.atk,
                def: state.currentSync.computed.def,
                spa: state.currentSync.computed.spa,
                spd: state.currentSync.computed.spd,
                spe: state.currentSync.computed.spe,
            };
        },

        // 当前Sync的石盘信息
        currentGridInfo: (state) => {
            if (!state.currentSync) return null;
            return {
                selectedTiles: state.currentSync.computed.selectedTiles,
                costOrbs: state.currentSync.computed.costOrbs,
                lastEnergy: state.currentSync.computed.lastEnergy,
                gridData: state.currentSync.state.gridData,
                potentialCookie: state.currentSync.state.potentialCookie,
            };
        },

        // 当前选中的宝可梦
        currentPokemon: (state) => {
            if (!state.currentSync) return null;
            return state.currentSync.computed.currentPokemon;
        },

        // 动态信息
        currentSyncDynamicState: (state) => {
            return state.currentSync?.state || null;
        },

        // 暴露方法
        exportMethods: (state) => {
            if (!state.currentSync) return null;
            return state.currentSync.methods;
        },
        // ------------------------------ 组队模式：计算属性 ------------------------------
        // 队伍中所有拍组的最终属性（用于伤害计算）
        // todo
    },
    actions: {
        // ------------------------------ 信息浏览场景：核心操作 ------------------------------
        initCurrentSync() {
            const syncCacheStore = useSyncCacheStore();
            const rawData = syncCacheStore.selectedRawData;
            if (!rawData) return;
            this.currentSync = createSync(rawData);
        },

        /**
         * 重置当前拍组的动态状态（恢复默认）
         */
        resetCurrentSync() {
            // if (!this.currentSync) return;
            // const syncId = this.currentSync.baseInfo.id;
            // this.initCurrentSync(syncId); // 重新创建实例即可重置
        },

        // 選擇拍組方法
        selectCurrentSync(trainer_id: string) {
            const syncCacheStore = useSyncCacheStore();
            const rawData = syncCacheStore.getRawDataWithTrainerId(trainer_id);
            if (!rawData) return;
            this.currentSync = createSync(rawData);
            localStorage.setItem(STORAGE_KEY, trainer_id);
        }
    },
});

// ================================= Sync工厂函数（重构适配新数据）=================================
/**
 * 创建Sync实例
 * @param jsonData 完整的拍组JSON数据
 * @returns 完整Sync对象
 */
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
        hp: computed(() => calculateStat("hp")),
        atk: computed(() => calculateStat("atk")),
        def: computed(() => calculateStat("def")),
        spa: computed(() => calculateStat("spa")),
        spd: computed(() => calculateStat("spd")),
        spe: computed(() => calculateStat("spe")),
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
    };

    // 内部工具函数：六维属性计算
    const calculateStat = (statKey: keyof PokemonStat): number => {
        const currentPokemon = jsonData.pokemon[state.selectedPokemonIndex];
        const statList = currentPokemon.stat[statKey] as [
            number,
            number,
            number,
            number,
            number,
            number,
            number
        ];

        // 基础白值计算（适配新的stat数组结构）
        const input = { level: state.level, statList };
        let result = StatValueCalculator.calculate(input);

        // 星级加成
        result = StatValueCalculator.calcuateRarityBonus(
            result,
            jsonData.trainer.rarity,
            state.currentRarity,
            state.potential,
            getStatIndexByStatKey(statKey)
        );

        // EX体系加成
        if (state.exRoleEnabled) {
            result = StatValueCalculator.calculateExRole(
                result,
                jsonData.trainer.exRole,
                getStatIndexByStatKey(statKey)
            );
        }

        return Math.floor(result);
    };

    // 辅助函数：将statKey转换为StatIndex
    const getStatIndexByStatKey = (statKey: keyof PokemonStat): StatIndex => {
        const keyMap: Record<keyof PokemonStat, StatIndex> = {
            hp: 1,
            atk: 2,
            def: 3,
            spa: 4,
            spd: 5,
            spe: 6,
        };
        return keyMap[statKey];
    };

    // 4. Sync操作方法
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
            const { name: pokemonName, form } = jsonData.pokemon[state.selectedPokemonIndex];

            const fixTrainerName = trainerName.replace(/（/g, "(").replace(/）/g, ")");
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

            const variationList = jsonData.pokemon.map(item => {
                switch (item.variationType) {
                    case 1:
                        return "Mega形態";
                    case 4:
                        return "極巨化形態";
                    case 7:
                        return "太晶化形態";
                    default:
                        return item.form ?? "未知形態";
                }
            });
            variationList[0] = "基礎形態";

            return variationList;
        },

        getPokemon: (index: number) => {
            return jsonData.pokemon[index] || null
        },

        // 切换石盘激活状态
        toggleTile: (tileId: number) => {
            const tile = state.gridData.find((t) => t.id === tileId);
            if (tile && methods.isTileReachable(tile)) {
                tile.isActive = !tile.isActive;
            }
            console.log(computedProps.selectedTiles.value);
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
            console.log(state.potentialCookie.cookieName);
        },

        // 判断石盘是否可达（基于宝数等级）
        isTileReachable: (tile: Tile) => {
            return tile.level <= state.bonusLevel;
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
                case "#FF0066":
                    keyName = "moveeffect";
                    break;
                case "#FFC266":
                    keyName = "passiveskill";
                    break;
                case "#BF80FF":
                    keyName = "syncmove";
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
                console.log(keyName);
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
            }
            if (tile.isActive) {
                keyName += "-selected";
            }
            const imagePath = `../assets/sync-grids/${keyName}.png`;
            const url = new URL(imagePath, import.meta.url).href;
            return url;
        },

        fixTileName: (tile: Tile) => {
            let name = tile.name
            switch (tile.color) {
                case "#BF80FF":
                    name = name.replace(/^.*?：/, '拍组招式：');
                    break
            }
            // name = name.replace(/[:：]\s*/, '：<br>');
            name.replace(/[:：]/, '$&\n');

            return name
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
