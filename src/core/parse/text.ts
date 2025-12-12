// 解析石盤的白值加成文本
export const parseStatTextBonus = (
    tileName: string, // "攻擊 + 5"
    statName: string // "攻擊"
): number => {
    const pattern = `^${statName}\\s*\\+\\s*(\\d+)\\s*$`;
    const regex = new RegExp(pattern, "u");
    const match = tileName.match(regex);

    if (!match) {
        return 0;
    }

    const value = parseInt(match[1], 10);
    return value;
};

// 解析石盤對應技能的加成文本
export const parseMoveTextBonus = (
    tileName: string, // "熱風：威力 + 3"
    moveName: string // "熱風"
): number => {
    const pattern =
        `^${moveName}` + // 招式名稱
        `\\s*[：:]\\s*` + // 分隔符 (：或:) 及可選空格
        `威力\\s*\\+\\s*` + // "威力 + " 部分及可選空格
        `(\\d+)` + // 數值 (捕獲組 1)
        `\\s*$`; // 字串結尾
    const regex = new RegExp(pattern, "u");
    const match = tileName.match(regex);

    if (!match) {
        return 0;
    }

    const value = parseInt(match[1], 10);

    return value;
};
