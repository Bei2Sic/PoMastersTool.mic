// 本地数据文件动态缓存
import { STORAGE_KEY } from "@/constances/key";
import type { GlobalSyncCache, SyncMeta, SyncRawData } from "@/types/syncModel";
import { loadAllSyncJson } from "@/utils/jsonLoader";
import { defineStore } from "pinia";

export const useSyncCacheStore = defineStore("syncCache", {
    state: () => ({
        // 全局缓存：拍组ID → {元信息, 完整数据}
        cache: {} as GlobalSyncCache,
        // 加载状态（用于显示加载中动画）
        isLoading: false,
        // 加载失败状态
        loadError: "" as string,
        // 当前选中的拍组ID
        selectedTrainerId: "" as string,
        // 石盘资源路径映射
        gridsImage: {},
        // 拍组头像资源路径映射
        actorsImage: {},
    }),
    getters: {
        getMeta: (state): SyncMeta[] => {
            return Object.values(state.cache).map(item => item.meta);
        },

        getRawDataWithTrainerId: (state) => (id: string) => {
            const cacheItem = state.cache[id];
            return cacheItem ? cacheItem.rawData : undefined;
        },

        // // 拍组选择器列表（所有拍组的元信息，用于渲染选择器）
        // syncOptions: (state): SyncMeta[] => {
        //     return Object.values(state.cache).map((item) => item.meta);
        // },

        // // 按星级筛选
        // syncsByRarity: (state) => (rarity: RarityIndex) => {
        //     return Object.values(state.cache)
        //         .filter((item) => item.meta.rarity === rarity)
        //         .map((item) => item.meta);
        // },

        // // 按是否EX筛选
        // syncsByExRole: (state) => (exRole: ExRoleIndex) => {
        //     return Object.values(state.cache)
        //         .filter((item) => item.meta.exRole === exRole)
        //         .map((item) => item.meta);
        // },

        // // 按是否EX筛选
        // syncsByEx: (state) => (isEx: boolean) => {
        //     return Object.values(state.cache)
        //         .filter((item) => item.meta.ex === isEx)
        //         .map((item) => item.meta);
        // },

        // 按属性筛选
        syncsByType: (state) => (type: string) => {
            return Object.values(state.cache)
                .filter((item) => item.meta.type.includes(type))
                .map((item) => item.meta);
        },

        // 当前选中拍组的完整原始数据（用于创建拍组对象）
        selectedRawData: (state): SyncRawData | null => {
            return state.selectedTrainerId
                ? state.cache[state.selectedTrainerId]?.rawData || null
                : null;
        },

        // selectedMeta: (state): SyncMeta | null => {
        //     return state.selectedTrainerId
        //         ? state.cache[state.selectedTrainerId]?.meta || null
        //         : null;
        // },
    },
    actions: {
        /**
         * 初始化加载所有拍组JSON（网页初始化时调用）
         */
        async initSyncCache() {
            this.isLoading = true;
            this.loadError = "";
            try {
                // 调用动态加载工具，加载指定目录所有JSON
                this.cache = await loadAllSyncJson();
                // 自动选中最新的牌組

                this.selectedTrainerId = localStorage.getItem(STORAGE_KEY);
                if (!this.selectedTrainerId) {
                    this.selectedTrainerId = "10000400000";
                }
            } catch (error) {
                this.loadError = "拍组数据加载失败，请刷新重试";
                console.error("初始化拍组缓存失败：", error);
            } finally {
                this.isLoading = false;
            }
        },

        // async initAssetsMap() {
        //     this.gridsImage = await loadSyncGridsImageMap();
        //     this.actorsImage = await loadActorImageMap();
        // },

        /**
         * 切换选中的拍组
         * @param trainerId 拍组ID
         */
        selectSync(trainerId: string) {
            if (this.cache[trainerId]) {
                this.selectedTrainerId = trainerId;
                // todo：存入localStorage，保存上次选择的拍组动态信息
                // localStorage.setItem("lastSelectedSyncId", trainerId);
            } else {
                console.warn(`未找到拍组ID：${trainerId}`);
            }
        },

        /**
         * 刷新缓存（用于JSON文件更新后重新加载，无需重启项目）
         */
        async refreshSyncCache() {
            await this.initSyncCache();
        },
    },
});
