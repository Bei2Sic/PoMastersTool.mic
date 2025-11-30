export const loadSyncGridsImageMap = async (): Promise<
    Record<string, unknown>
> => {
    const imageMap: Record<string, unknown> = {};

    try {
        const modules = import.meta.glob<{ default: string }>(
            "@/assets/sync-grids/**/*.png",
            {
                eager: true,
                import: "default",
            }
        ) as Record<string, unknown>;

        if (Object.keys(modules).length === 0) {
            console.warn(`目录 @/assets/sync-grids 下未找到任何图片）`);
            return imageMap;
        }

        for (const [filePath, resourceUrl] of Object.entries(modules)) {
            const keyName = filePath
                .replace("../assets/sync-grids/", "")
                .replace(/\\/g, "/")
                .replace(".png", "");

            if (!keyName) {
                console.warn(`跳过无效图片：${filePath}（无法解析文件名）`);
                continue;
            }
            // 处理重复文件名（后面的覆盖前面的，打印警告）
            if (imageMap[keyName]) {
                console.warn(
                    `图片文件名重复！key: ${keyName}，已存在路径: ${imageMap[keyName]}，新路径: ${filePath}`
                );
            }
            imageMap[keyName] = resourceUrl;
        }

        console.log(
            `成功加载 @/assets/sync-grids 目录下 ${
                Object.keys(imageMap).length
            } 个图片`
        );

        console.log(imageMap);
        return imageMap;
    } catch (error) {
        console.error(`加载目录 @/assets/sync-grids 图片失败：`, error);
        return imageMap;
    }
};

export const loadActorImageMap = async (): Promise<Record<string, unknown>> => {
    const imageMap: Record<string, unknown> = {};

    try {
        const modules = import.meta.glob<{ default: string }>(
            "@/assets/actors/**/*.png",
            {
                eager: true,
                import: "default",
            }
        ) as Record<string, unknown>;

        if (Object.keys(modules).length === 0) {
            console.warn(`目录 @/assets/actors 下未找到任何图片）`);
            return imageMap;
        }

        for (const [filePath, resourceUrl] of Object.entries(modules)) {
            // 提取纯文件名
            const keyName = filePath
                .replace("../assets/actors/", "")
                .replace(/\\/g, "/")
                .replace(".png", "");

            if (!keyName) {
                console.warn(`跳过无效图片：${filePath}（无法解析文件名）`);
                continue;
            }

            if (imageMap[keyName]) {
                console.warn(
                    `图片文件名重复！key: ${keyName}，已存在路径: ${imageMap[keyName]}，新路径: ${filePath}`
                );
            }
            imageMap[keyName] = resourceUrl;
        }

        console.log(
            `成功加载 @/assets/actors 目录下 ${
                Object.keys(imageMap).length
            } 个图片`
        );
        return imageMap;
    } catch (error) {
        console.error(`加载目录 @/assets/actors 图片失败：`, error);
        return imageMap;
    }
};
