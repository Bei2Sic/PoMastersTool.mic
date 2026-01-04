// 本地数据文件动态缓存
import { STORAGE_KEY } from "@/constances/key";
import type { GlobalSyncCache, SyncMeta, SyncRawData, SavedFilters } from "@/types/cache";
import { loadAllSyncJson } from "@/utils/jsonLoader";
import { defineStore } from "pinia";
import { type PersistenceOptions } from 'pinia-plugin-persistedstate'

export interface SyncCacheState {
    // 全局缓存：拍组ID → {元信息, 完整数据}
    cache: GlobalSyncCache;

    // 当前选中的拍组ID
    selectedTrainerId: string;

    // 筛选条件对象
    savedFilters: SavedFilters;

    // 排序字段 (强类型：必须是 SyncMeta 里的 key)
    sortField: keyof SyncMeta;

    // 排序方向
    sortDesc: boolean;
}

export const useSyncCacheStore = defineStore("syncCache", {
    state: (): SyncCacheState => ({
        // 全局缓存：拍组ID → {元信息, 完整数据}
        cache: {} as GlobalSyncCache,
        // 当前选中的拍组ID
        selectedTrainerId: "" as string,


        savedFilters: {
            exclusivity: [] as string[],
            types: [] as string[],
            weaknesses: [] as string[],
            roles: [] as string[],
            exRoles: [] as string[],
            rarity: [] as number[],
            themes: [] as string[],
        },

        sortField: '_startDate',
        sortDesc: true,
    }),
    getters: {
        getMeta: (state: SyncCacheState): SyncMeta[] => {
            return Object.values(state.cache).map((item: GlobalSyncCache[string]) => item.meta);
        },

        // 获取筛选状态
        getFilters: (state: SyncCacheState) => state.savedFilters,

        getRawDataWithTrainerId: (state: SyncCacheState) => (id: string) => {
            const cacheItem = state.cache[id];
            return cacheItem ? cacheItem.rawData : undefined;
        },

        // 当前选中拍组的完整原始数据（用于创建拍组对象）
        selectedRawData: (state: SyncCacheState): SyncRawData | null => {
            return state.selectedTrainerId
                ? state.cache[state.selectedTrainerId]?.rawData || null
                : null;
        },
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

        updateFilters(newFilters: any) {
            this.savedFilters = JSON.parse(JSON.stringify(newFilters));
        },

        updateSort(field: string, desc: boolean) {
            this.sortField = field;
            this.sortDesc = desc;
        }
    },

    persist: {
        key: '_filterCache',
        storage: localStorage,
        paths: ['savedFilters', 'sortField', 'sortDesc'],
    } as any,
});
