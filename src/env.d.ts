// src/env.d.ts
/// <reference types="vite/client" />

// 补充 import.meta.glob 的类型声明
declare interface ImportMeta {
    glob<T = any>(
        pattern: string | string[],
        options?: {
            eager?: boolean;
            import?: string;
            assert?: Record<string, string>;
        }
    ): Record<string, () => Promise<T>>;
}