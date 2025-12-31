// 更新日志
export interface LogEntry {
    version: string;
    date: string;
    title?: string; // 可選的標題
    content: string[]; // 更新內容列表
    isCritical?: boolean; // 是否是重大更新（可用于 UI 标红）
}

export const changelogs: LogEntry[] = [
    {
        version: "v2.64.0_1",
        date: "2025-12-31",
        title: "UI优化及功能更新",
        content: [
            "新增：增加目录模块，整合多页面入口。",
            "新增：筛选模块增加根据组队技能筛选。",
            "新增：伤害计算模块增加 [下降抗性] 选项。",
            "修复：修复伤害计算模块遗漏 [树果] 和 [技能使用次数] 选项。",
        ],
        isCritical: true,
    },
];
