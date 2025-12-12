import { MoveBase, Theme } from "@/types/syncModel";
import {
    getCategoryInfo,
    getTypeInfo,
    getTypeInfoWithCNName,
} from "@/core/exporter/map";
// Move
// 格式化使用次數
export const formatMoveUses = (uses: string | number | undefined) => {
    if (
        uses === undefined ||
        uses === null ||
        typeof uses === "string" ||
        (typeof uses === "number" && isNaN(uses))
    ) {
        return "";
    }

    return `${uses}/${uses}`;
};

// 格式化命中率
export const formatMoveAccuracy = (move: MoveBase) => {
    if (move.accuracy && move.accuracy !== 0) {
        return move.accuracy;
    }
    if (move.group === "Sync" || move.tags === "SureHit") {
        return "必定命中";
    }

    return "-";
};

// 格式化目标对象
export const formatMoveTarget = (move: MoveBase) => {
    return "-";
};

// 格式化拍招效果
export const formatSyncEffect = (move: MoveBase) => {
    return "";
};

// 獲取模板樣式
export const getStyle = (
    suffix: string,
    prefix: string = "icon",
    size: string = "contain"
) => {
    return {
        backgroundImage: `var(--${prefix}${suffix})`,
        backgroundSize: size,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
    };
};

// 獲取技能屬性 icon 樣式
export const getTypeIconStyle = (type: number) => {
    const suffix = getTypeInfo(type).typeSuffix;
    return getStyle(`Move${suffix}`); // 組合成 --iconMoveFire
};

// 獲取技能分類 icon 樣式
export const getCategoryIconStyle = (category: string) => {
    const suffix = getCategoryInfo(category).typeSuffix;
    return getStyle(suffix); // 組合成 --iconPhysical
};

// 獲取技能背景顏色 Class
export const getMoveBackgroundColorClass = (type: number) => {
    return "bg_" + getTypeInfo(type).typeSuffix.toLowerCase();
};

// 獲取被動技能背景圖片樣式
export const getPassiveBackgroundStyle = (
    index: number,
    exclusivity: string
) => {
    let suffix = "";
    if (index === 1) {
        suffix = exclusivity === "Arcsuit" ? exclusivity : "";
    } else if (index === 0) {
        if (["Arcsuit", "Master"].includes(exclusivity)) {
            suffix = exclusivity;
        } else if (exclusivity === "MasterEX") {
            suffix = "Master";
        }
    }
    return getStyle(suffix, "bgPassive", "cover");
};

// 獲取組隊技能背景顏色 class
export const getThemeBackgroundColorClass = (index: number, tag: string) => {
    if (index === 0) {
        // 第一个为属性
        return "bg_" + getTypeInfoWithCNName(tag).typeSuffix.toLowerCase();
    } else {
        return "bg_trainer";
    }
};

// 獲取組隊技能圖標 icon 樣式
export const getThemeIconStyle = (theme: Theme) => {
    let suffix = "";
    switch (theme.category) {
        // 属性
        case 1:
            suffix = `Move${getTypeInfoWithCNName(theme.tag).typeSuffix}`
            break;
        // 地区
        case 2:
            suffix = 'ThemeRegion';
            break;
        // 分类
        case 3:
            suffix = 'ThemeTrainerGroup';
            break;
        // 服装
        case 4:
            suffix = 'ThemeFashion';
            break;
        // 其他
        default:
            suffix = 'ThemeOther';
            break;
    }
    return getStyle(suffix);
}

// 获取对应的训练家图片资源
export const getTrainerUrl = (actorId: string, exEnabled: boolean): string => {
    if (exEnabled) {
        actorId += "_expose";
    }
    const imagePath = `../assets/trainer/${actorId}_128.png`;
    const url = new URL(imagePath, import.meta.url).href;
    return url;
};