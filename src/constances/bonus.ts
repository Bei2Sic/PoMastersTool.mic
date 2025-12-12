// ex角色加成
export const ExRoleBonusConfig = [
    // 0: 攻擊型 → hp+60, atk+40, spa+40
    { hp: 60, atk: 40, def: 0, spa: 40, spd: 0, spe: 0 },
    // 1: 攻擊型 → hp+60, atk+40, spa+40
    { hp: 60, atk: 40, def: 0, spa: 40, spd: 0, spe: 0 },
    // 2: 輔助型 → hp+60, def+40, spd+40
    { hp: 60, atk: 0, def: 40, spa: 0, spd: 40, spe: 0 },
    // 3: 技術型 → hp+60, atk+20, def+20, spa+20, spd+20
    { hp: 60, atk: 20, def: 20, spa: 20, spd: 20, spe: 0 },
    // 4: 速戰型 → hp+60, atk+20, spa+20, spe+40
    { hp: 60, atk: 20, def: 0, spa: 20, spd: 0, spe: 40 },
    // 5: 場地型 → hp+60, def+20, spd+20, spe+40
    { hp: 60, atk: 0, def: 20, spa: 0, spd: 20, spe: 40 },
] as const;

// 超覺醒加成
export const AwakeningBonusConfig = {
    // 0: 物理擊型
    0: [
        // 1級：白值六维×1.1
        {
            stat: { common: { mode: "multi", value: 1.1 } },
        },
        // 2級：基礎技能x1.1
        {
            move: { mode: "multi", value: 1.1 },
        },
        // 3級：拍招和極巨化x1.2
        {
            syncMove: { mode: "multi", value: 1.2 },
            moveDynamax: { mode: "multi", value: 1.2 },
        },
        // 4級：基礎技能x1.3
        {
            move: { mode: "multi", value: 1.3 },
        },
    ],
    // 1: 特殊攻擊型
    1: [
        // 1級：白值六维×1.1
        {
            stat: { common: { mode: "multi", value: 1.1 } },
        },
        // 2級：基礎技能x1.1
        {
            move: { mode: "multi", value: 1.1 },
        },
        // 3級：拍招和極巨化x1.2
        {
            syncMove: { mode: "multi", value: 1.2 },
            moveDynamax: { mode: "multi", value: 1.2 },
        },
        // 4級：基礎技能x1.3
        {
            move: { mode: "multi", value: 1.3 },
        },
    ],
    // 2: 輔助型
    2: [
        // 1級：白值六维×1.1
        {
            stat: { common: { mode: "multi", value: 1.1 } },
        },
        // 2級：白值HP+50
        {
            stat: {
                hp: { mode: "flat", value: 50 },
            },
        },
        // 3級：白值DEF+20、SPD+20
        {
            stat: {
                def: { mode: "flat", value: 20 },
                spd: { mode: "flat", value: 20 },
            },
        },
        // 4級：白值HP+100
        {
            stat: {
                hp: { mode: "flat", value: 100 },
            },
        },
    ],
    // 3: 技術型
    3: [
        // 1級：白值六维×1.1
        {
            stat: { common: { mode: "multi", value: 1.1 } },
        },
        // 2級：拍招和極巨化x1.1
        {
            syncMove: { mode: "multi", value: 1.1 },
            moveDynamax: { mode: "multi", value: 1.1 },
        },
        // 3級：基礎技能x1.2
        {
            move: { mode: "multi", value: 1.2 },
        },
        // 4級：拍招和極巨化x1.3
        {
            syncMove: { mode: "multi", value: 1.3 },
            moveDynamax: { mode: "multi", value: 1.3 },
        },
    ],
    // 4: 速戰型
    4: [
        // 1級：白值六维×1.1
        {
            stat: { common: { mode: "multi", value: 1.1 } },
        },
        // 2級：基礎技能x1.1
        {
            move: { mode: "multi", value: 1.1 },
        },
        // 3級：拍招和極巨化x1.2
        {
            syncMove: { mode: "multi", value: 1.2 },
            moveDynamax: { mode: "multi", value: 1.2 },
        },
        // 4級：基礎技能x1.3
        {
            move: { mode: "multi", value: 1.3 },
        },
    ],
    // 5: 場地型
    5: [
        // 1級：白值六维×1.1
        {
            stat: { common: { mode: "multi", value: 1.1 } },
        },
        // 2級：拍招和極巨化x1.1
        {
            syncMove: { mode: "multi", value: 1.1 },
            moveDynamax: { mode: "multi", value: 1.1 },
        },
        // 3級：基礎技能x1.2
        {
            move: { mode: "multi", value: 1.2 },
        },
        // 4級：拍招和極巨化x1.3
        {
            syncMove: { mode: "multi", value: 1.3 },
            moveDynamax: { mode: "multi", value: 1.3 },
        },
    ],
} as const;

