
export type RarityIndex = 3 | 4 | 5 | 6;
export type RoleIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type ExRoleIndex = -1 | 0 | 1 | 2 | 3 | 4 | 5;
export type StatIndex = 1 | 2 | 3 | 4 | 5 | 6;
export type BonusIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface TypeMapItem {
    key: string;
    cnName: string;
    specialName?: string;
}

// temp: 潜能饼干类型资源
export const PotentialCookiesUrl = [
    new URL("../assets/images/icon_arcsuit.png", import.meta.url).href,
    new URL("../assets/images/icon_masterex.png", import.meta.url).href,
    new URL("../assets/images/icon_master.png", import.meta.url).href,
    new URL("../assets/images/icon_mega.png", import.meta.url).href,
    new URL("../assets/images/icon_dynamax.png", import.meta.url).href,
    new URL("../assets/images/icon_shiny.png", import.meta.url).href,
];

// temp: mock data
export const PotentialSkills = [
    {
        id: 1,
        type: 1,
        cookieName: "危機時威力提升",
        desc: "在陷入危機時，會提高招式的威力。",
        level: [1, 2],
    },
    {
        id: 2,
        type: 1,
        cookieName: "沙暴時威力提升",
        desc: "當天氣為沙暴時，會提高招式的威力。",
        level: [1, 2, 3],
    },
    {
        id: 3,
        type: 1,
        cookieName: "異常狀態時威力提升",
        desc: "當自己陷入異常狀態時，會提高招式的威力。",
        level: [1, 2, 3],
    },
    {
        id: 4,
        type: 1,
        cookieName: "效果絕佳時威力提升1",
        desc: "當效果絕佳時，會提高該招式的威力。",
        level: null,
    },
    {
        id: 5,
        type: 2,
        cookieName: "攻擊下降抗性",
        desc: "當攻擊降低時，會減低攻擊的下降率。",
        level: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    {
        id: 6,
        type: 2,
        cookieName: "攻擊下降無效",
        desc: "攻擊不會降低。",
        level: null,
    },
    {
        id: 7,
        type: 3,
        cookieName: "中毒無效",
        desc: "不會陷入中毒狀態和劇毒狀態。",
        level: null,
    },
    {
        id: 8,
        type: 4,
        cookieName: "水屬性防守",
        desc: "可減輕受到水屬性招式攻擊時的傷害。",
        level: null,
    },
    {
        id: 9,
        type: 5,
        cookieName: "上場時命中率提升2",
        desc: "上場時，會提高自己的命中率2階段。",
        level: null,
    },
    {
        id: 10,
        type: 6,
        cookieName: "擊中要害時威力提升3",
        desc: "擊中對手要害時，會提高當下該攻擊的威力。",
        level: null,
    },
];
