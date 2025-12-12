// 本地加载数据文件
import { getRoleInfo, getTypeInfo } from '@/core/exporter/map';
import type { GlobalSyncCache, SyncMeta, SyncRawData } from "@/types/syncModel";
export const loadAllSyncJson = async (): Promise<GlobalSyncCache> => {
    const cache: GlobalSyncCache = {};
    try {
        // 扫描 syncDir 下所有 .json 文件，懒加载（eager: false 改为 true 则同步加载）
        const modules = import.meta.glob<SyncRawData>("@/data/pairs/*.json", {
            eager: true,
            import: "default", // 导入JSON默认导出
        }) as Record<string, SyncRawData>; // 明确类型：键=文件路径，值=SyncRawData

        // 遍历所有加载的JSON文件
        for (const [filePath, rawData] of Object.entries(modules)) {
            // 校验JSON结构（避免无效文件）
            // if (!validateSyncRawData(rawData, filePath)) continue;

            // 提取元信息（轻量化，用于选择、筛选）
            const meta = extractSyncMeta(rawData, filePath);

            // 存入缓存（键=拍组ID）
            cache[rawData.trainer.id] = { meta, rawData };
        }

        // 按拍组ID排序（可选，让选择器顺序一致）
        const sortedCache: GlobalSyncCache = {};
        Object.keys(cache)
            .sort((a, b) => a.localeCompare(b))
            .forEach((trainerId) => {
                sortedCache[trainerId] = cache[trainerId];
            });

        return sortedCache;
    } catch (error) {
        console.error("动态加载拍组JSON失败：", error);
        return cache;
    }
};

// /**
//  * 校验拍组JSON结构是否合法（避免无效文件导致报错）
//  */
// const validateSyncRawData = (rawData: any, filePath: string): rawData is SyncRawData => {
//     const requiredFields = ["trainer", "trainer.id", "pokemon", "pokemon[0].name"];
//     const isValid = requiredFields.every((field) => {
//         const keys = field.split(".");
//         return keys.reduce((obj, key) => obj?.[key], rawData) !== undefined;
//     });

//     if (!isValid) {
//         console.warn(`跳过无效拍组文件：${filePath}（缺少必要字段）`);
//     }
//     return isValid;
// };

/**
 * 从原始JSON中提取元信息（轻量化，用于选择器、筛选）
 */
const extractSyncMeta = (rawData: SyncRawData, filePath: string): SyncMeta => {
    const trainer = rawData.trainer;
    const mainPokemon = rawData.pokemon[0];

    // 处理属性：统一转为数组（不管JSON中是单个还是数组）
    const pokemonType = getTypeInfo(rawData.pokemon[0].type).cnName;
    const weakness = getTypeInfo(rawData.pokemon[0].weakness).cnName;
    const role = getRoleInfo(trainer.role).cnName;
    let exRole = ""
    if (trainer.exRole != -1) {
        exRole = getRoleInfo(trainer.exRole).cnName;
    }
    
    return {
        id: trainer.id,
        name: `${trainer.name} & ${mainPokemon.name}`, // 拍组完整名称
        trainerName: trainer.name,
        pokemonName: mainPokemon.name,
        rarity: trainer.rarity,
        type: pokemonType,
        weakness: weakness,
        ex: trainer.ex,
        role: role,
        exRole: exRole,
        actorId: trainer.actorId,
    };
};
