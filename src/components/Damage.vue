<script setup lang="ts">
import { useDamageCalculator } from "@/composables/useDamageCalculator";
import {
    DAMAGE_FIELDS,
    POKEMON_TYPES,
    TERRAIN_TYPES,
    WEATHER_TYPES,
    ZONE_TYPES
} from "@/constances/battle";
import { AbnormalMap, CrtibuffsMap, HindranceMap, StatMap, TypeMap, WeatherMap } from "@/constances/map";
import { getTypeKeyByCnNameOrSpecialName } from "@/core/exporter/map";
import { useDamageCalcStore } from "@/stores/damageCalc";
import { RegionType } from "@/types/conditions";
import type { Sync } from "@/types/syncModel";
import { computed } from "vue";

// --- Props & Emits ---
const props = defineProps<{
    targetSync: Sync | null;
    teamSyncs?: Sync[];
    visible: boolean;
}>();

const emit = defineEmits(["close"]);

// --- Store & Logic ---
const store = useDamageCalcStore();

const targetSyncRef = computed(() => props.targetSync);
const teamSyncsRef = props.teamSyncs
    ? props.teamSyncs.map((s) => computed(() => s))
    : [];

const { finalDamageResult, themeSnapshot } = useDamageCalculator(targetSyncRef, teamSyncsRef);

// --- Constants ---
const weatherOptions = ["無", ...WEATHER_TYPES] as const;
const terrainOptions = ["無", ...TERRAIN_TYPES] as const;
const zoneOptions = ["無", ...ZONE_TYPES] as const;
const damageFieldOptions = ["無", ...DAMAGE_FIELDS] as const;
const typeOptions = POKEMON_TYPES;

const orderedStats = Object.entries(StatMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([_, val]) => val);

const orderedTypes = POKEMON_TYPES.filter(t => t !== '無');

// --- Icon Helpers ---
const getUiIcon = (name: string) => new URL(`../assets/images/icon_${name}.png`, import.meta.url).href;

const getIcon = (key: string, target: 'user' | 'target') => {
    if (!key) return "";
    const lowerKey = key.toLowerCase();
    const field = target === 'user' ? '' : 't_';
    return getUiIcon(`stat_${field}${lowerKey}`);
};

const getStatusIcon = (key: string, status: 'abnormal' | 'hindrance') => key ? getUiIcon(`${status}_${key.toLowerCase()}`) : "";
const getBoostIcon = (type: 'physical' | 'special' | 'sync') => getUiIcon(`boost_${type}`);
const getCirclesIcon = (type: 'atk' | 'spa' | 'hp') => getUiIcon(`stat_${type}`);
const getCritbuffIcon = (key: string) => key ? getUiIcon(`break_${key.toLowerCase()}`) : "";
const getRebuffIcon = (typeName: string) => {
    const entry = Object.values(TypeMap).find(t => t.cnName === typeName);
    const key = entry ? entry.key.toLowerCase() : 'normal';
    return new URL(`../assets/images/type_${key}.png`, import.meta.url).href;
};
const getEnvIcon = (category: 'weather' | 'terrain' | 'zone' | 'damageField', name: string) => {
    if (name === '無') return new URL(`../assets/images/b_move_chain.png`, import.meta.url).href;
    if (category === 'weather') {
        const entry = Object.values(WeatherMap).find(t => name.includes(t.cnName));
        const key = entry ? entry.key.toLowerCase() : 'sunny';
        return new URL(`../assets/images/icon_weather_${key}.png`, import.meta.url).href;
    } else {
        const cleanName = name.replace("傷害場地", '');
        const typeKey = getTypeKeyByCnNameOrSpecialName(cleanName);
        return new URL(`../assets/images/move_${typeKey}.png`, import.meta.url).href;
    }
};

// --- Other Helpers ---
const getHeaderColor = (key: string) => {
    const colors: Record<string, string> = {
        hp: "bg-green-100", atk: "bg-orange-100", def: "bg-yellow-100",
        spa: "bg-blue-100", spd: "bg-indigo-100", spe: "bg-pink-100",
        acc: "bg-gray-50", eva: "bg-gray-50", ct: "bg-red-50",
    };
    return colors[key] || "bg-gray-50";
};

const getTypeBgClass = (typeIndex: number) => {
    const key = TypeMap[typeIndex]?.key.toLowerCase() || 'normal';
    return `bg_${key}`;
};

const getBoostTooltip = (res: any) => {
    if (!res.boostDetails || res.boostDetails.length === 0) return "无技能威力提升";
    return res.boostDetails.map((b: string) => `• ${b}`).join('\n');
};

const hasBaseStat = (key: string) => !["acc", "eva", "ct"].includes(key);
const isHP = (key: string) => key === "hp";

const getRankOptions = (key: string) => {
    if (key === "ct") return [0, 1, 2, 3];
    return Array.from({ length: 13 }, (_, i) => i - 6);
};
const getRebuffOptions = () => Array.from({ length: 7 }, (_, i) => i - 3);
const getBoostOptions = () => Array.from({ length: 11 }, (_, i) => i);

const getRegionClass = (region: string) => {
    const map: Record<RegionType, string> = {
        "關都": "region-kanto", "城都": "region-johto", "豐緣": "region-hoenn",
        "神奧": "region-sinnoh", "合眾": "region-unova", "卡洛斯": "region-kalos",
        "阿羅拉": "region-alola", "伽勒爾": "region-galar", "帕底亞": "region-paldea", "帕希歐": "region-pasio",
    };
    return map[region] || "region-default";
};

const getRegionLevelOptions = (region: string) => {
    const count = themeSnapshot.value?.tagCounts[region] || 0;
    const minLevel = count > 0 ? 1 : 0;
    const levels = [];
    for (let i = minLevel; i <= 3; i++) {
        levels.push(i);
    }
    return levels;
};

// --- Handlers ---
const handleAbnormalClick = (target: 'user' | 'target', item: any) => {
    const valueName = (item.key === 'Healthy' || item.cnName === '健康') ? '無' : item.cnName;
    if (target === 'user') store.user.abnormal = store.user.abnormal === valueName ? '無' : valueName;
    else store.target.abnormal = store.target.abnormal === valueName ? '無' : valueName;
};

const isAbnormalActive = (target: 'user' | 'target', item: any) => {
    const current = target === 'user' ? store.user.abnormal : store.target.abnormal;
    const valueName = (item.key === 'Healthy' || item.cnName === '健康') ? '無' : item.cnName;
    return current === valueName;
};

const handleHindranceClick = (target: 'user' | 'target', cnName: string) => {
    if (target === 'user') store.user.hindrance[cnName] = !store.user.hindrance[cnName];
    else store.target.hindrance[cnName] = !store.target.hindrance[cnName];
};
</script>

<template>
    <transition name="modal">
        <div v-if="visible" class="modal-overlay" @click.self="emit('close')">
            <div class="modal-window">

                <div class="window-header">
                    <h2>伤害计算</h2>
                    <button class="close-btn" @click="emit('close')">×</button>
                </div>

                <div class="window-content">

                    <div class="section-group">
                        <div class="section-title">我方状态</div>
                        <div class="panel-card">
                            <div class="stat-table-container">
                                <div v-for="stat in orderedStats" :key="stat.key" class="stat-col">
                                    <div class="stat-cell header-cell" :class="getHeaderColor(stat.key)">
                                        <img :src="getIcon(stat.key, 'user')" :alt="stat.cnName" class="stat-icon" />
                                    </div>

                                    <div class="stat-cell">
                                        <template v-if="isHP(stat.key)">
                                            <input type="number" v-model.number="store.user.currentHPPercent"
                                                class="val-input text-green-600" placeholder="%" title="剩余HP%">
                                        </template>
                                        <select v-else v-model.number="store.user.ranks[stat.key]" class="rank-select"
                                            :class="{ 'rank-pos': store.user.ranks[stat.key] > 0, 'rank-neg': store.user.ranks[stat.key] < 0 }">
                                            <option v-for="r in getRankOptions(stat.key)" :key="r" :value="r">{{ r > 0 ?
                                                '+'
                                                + r : r }}</option>
                                        </select>
                                    </div>

                                    <div class="stat-cell double-cell">
                                        <template v-if="isHP(stat.key) || hasBaseStat(stat.key)">
                                            <input type="number" v-model.number="store.user.gear[stat.key]"
                                                class="val-input half-input top-input" placeholder="0" title="裝備加成">
                                            <input type="number" v-model.number="store.user.theme[stat.key]"
                                                class="val-input half-input bottom-input text-blue-600" placeholder="0"
                                                title="組隊技能">
                                        </template>

                                        <div v-else-if="stat.key === 'acc'" class="stacked-label">
                                            <span class="row-label">裝備</span>
                                            <div class="label-divider"></div>
                                            <span class="row-label text-blue-600">隊伍技能</span>
                                        </div>
                                        <div v-else class="placeholder">-</div>
                                    </div>

                                </div>
                            </div>

                            <div class="status-bar">
                                <div class="status-group">
                                    <span class="common-label">異常</span>
                                    <div class="icon-row">
                                        <button v-for="(item, idx) in Object.values(AbnormalMap)" :key="idx"
                                            class="icon-btn" :class="{ active: isAbnormalActive('user', item) }"
                                            @click="handleAbnormalClick('user', item)" :title="item.cnName">
                                            <img :src="getStatusIcon(item.key, 'abnormal')" />
                                        </button>
                                    </div>
                                </div>
                                <div class="status-group">
                                    <span class="common-label">妨害</span>
                                    <div class="icon-row">
                                        <button v-for="(item, idx) in Object.values(HindranceMap)" :key="idx"
                                            class="icon-btn" :class="{ active: store.user.hindrance[item.cnName] }"
                                            @click="handleHindranceClick('user', item.cnName)" :title="item.cnName">
                                            <img :src="getStatusIcon(item.key, 'hindrance')" />
                                        </button>
                                    </div>
                                </div>
                                <div class="status-group">
                                    <span class="common-label">計量槽加速場地</span>
                                    <button class="icon-btn" :class="{ active: store.gaugeAcceleration }"
                                        @click="store.gaugeAcceleration = !store.gaugeAcceleration" title="计量槽加速">
                                        <img :src="getUiIcon('acceleration')" />
                                    </button>
                                </div>
                                <div class="status-group">
                                    <span class="common-label">氣魄</span>
                                    <input type="number" v-model.number="store.user.syncBuff" class="sync-input" />
                                </div>
                                <div class="status-group">
                                    <span class="common-label">樹果</span>
                                    <select v-model.number="store.settings.berry" class="sync-input">
                                        <option v-for="i in 4" :key="i" :value="i - 1">
                                            {{ i - 1 }}
                                        </option>
                                    </select>
                                </div>
                                <div class="status-group">
                                    <span class="common-label">技能使用次數</span>
                                    <select v-model.number="store.settings.moveuse" class="sync-input">
                                        <option v-for="i in 109" :key="i" :value="i - 1">
                                            {{ i - 1 }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="section-group">
                        <div class="section-title">目标状态</div>
                        <div class="panel-card">
                            <div class="stat-table-container bg-red-50/20">
                                <div v-for="stat in orderedStats" :key="'t-' + stat.key" class="stat-col">
                                    <div class="stat-cell header-cell" :class="getHeaderColor(stat.key)">
                                        <img :src="getIcon(stat.key, 'target')" :alt="stat.cnName" class="stat-icon" />
                                    </div>
                                    <div class="stat-cell">
                                        <div v-if="stat.key === 'ct'" class="placeholder">-</div>
                                        <template v-else-if="isHP(stat.key)">
                                            <input type="number" v-model.number="store.target.currentHPPercent"
                                                class="val-input text-green-600" placeholder="%">
                                        </template>
                                        <select v-else v-model.number="store.target.ranks[stat.key]" class="rank-select"
                                            :class="{ 'rank-pos': store.target.ranks[stat.key] > 0, 'rank-neg': store.target.ranks[stat.key] < 0 }">
                                            <option v-for="r in getRankOptions(stat.key)" :key="r" :value="r">{{ r > 0 ?
                                                '+'
                                                + r : r }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="stat-cell">
                                        <div v-if="isHP(stat.key) || stat.key === 'ct'" class="placeholder">-</div>
                                        <template v-else-if="hasBaseStat(stat.key)">
                                            <input type="number" v-model.number="store.target.stats[stat.key]"
                                                class="val-input target-val" placeholder="0">
                                        </template>
                                        <div v-else class="placeholder">-</div>
                                    </div>
                                </div>
                            </div>

                            <div class="status-bar">
                                <div class="status-group">
                                    <span class="common-label">異常</span>
                                    <div class="icon-row">
                                        <button v-for="(item, idx) in Object.values(AbnormalMap)" :key="idx"
                                            class="icon-btn" :class="{ active: isAbnormalActive('target', item) }"
                                            @click="handleAbnormalClick('target', item)" :title="item.cnName">
                                            <img :src="getStatusIcon(item.key, 'abnormal')" />
                                        </button>
                                    </div>
                                </div>
                                <div class="status-group">
                                    <span class="common-label">妨害</span>
                                    <div class="icon-row">
                                        <button v-for="(item, idx) in Object.values(HindranceMap)" :key="idx"
                                            class="icon-btn" :class="{ active: store.target.hindrance[item.cnName] }"
                                            @click="handleHindranceClick('target', item.cnName)" :title="item.cnName">
                                            <img :src="getStatusIcon(item.key, 'hindrance')" />
                                        </button>
                                    </div>
                                </div>
                                <div class="status-group">
                                    <span class="common-label">爆傷</span>
                                    <div class="icon-row">
                                        <button v-for="(item, idx) in Object.values(CrtibuffsMap)" :key="idx"
                                            class="icon-btn" :class="{ active: store.target.critBuffs[item.cnName] }"
                                            @click="store.target.critBuffs[item.cnName] = !store.target.critBuffs[item.cnName]"
                                            :title="item.cnName">
                                            <img :src="getCritbuffIcon(item.key)" />
                                        </button>
                                    </div>
                                </div>
                                <div class="status-group">
                                    <span class="common-label">氣魄</span>
                                    <input type="number" v-model.number="store.target.syncBuff" class="sync-input" />
                                </div>
                                <div class="status-group">
                                    <span class="common-label">下降抗性</span>
                                    <select v-model.number="store.target.statLowerReduction" class="sync-input">
                                        <option v-for="i in 10" :key="i" :value="i - 1">
                                            {{ i - 1 }}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div class="rebuff-section">
                                <div class="section-label">屬性抵抗</div>
                                <div class="rebuff-scroll-container">
                                    <div v-for="type in orderedTypes" :key="type" class="rebuff-col">
                                        <div class="stat-cell header-cell">
                                            <img :src="getRebuffIcon(type)" :alt="type" class="stat-icon rebuff-icon" />
                                        </div>
                                        <div class="stat-cell">
                                            <select v-model.number="store.target.typeRebuffs[type]"
                                                class="rank-select rebuff-select"
                                                :class="{ 'rank-neg': store.target.typeRebuffs[type] < 0, 'rank-pos': store.target.typeRebuffs[type] > 0 }">
                                                <option v-for="r in getRebuffOptions()" :key="r" :value="r">
                                                    {{ r > 0 ? '+' + r : r }}
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="section-group">
                        <div class="section-title">环境配置</div>

                        <div class="panel-card mb-4">

                            <div class="env-row-icons">
                                <div class="env-toolbar">
                                    <div class="label-col">天氣</div>
                                    <div class="env-scroll-container">
                                        <button class="ex-btn" :class="{ active: store.isEXWeather }"
                                            @click="store.isEXWeather = !store.isEXWeather">
                                            EX
                                        </button>
                                        <button v-for="w in weatherOptions" :key="w" class="env-btn"
                                            :class="{ active: store.weather === w }" @click="store.weather = w"
                                            :title="w">
                                            <img :src="getEnvIcon('weather', w)" />
                                        </button>
                                    </div>
                                </div>
                                <div class="env-toolbar">
                                    <div class="label-col">場地</div>
                                    <div class="env-scroll-container">
                                        <button class="ex-btn" :class="{ active: store.isEXTerrain }"
                                            @click="store.isEXTerrain = !store.isEXTerrain">
                                            EX
                                        </button>
                                        <button v-for="t in terrainOptions" :key="t" class="env-btn"
                                            :class="{ active: store.terrain === t }" @click="store.terrain = t"
                                            :title="t">
                                            <img :src="getEnvIcon('terrain', t)" />
                                        </button>
                                    </div>
                                </div>
                                <div class="env-toolbar">
                                    <div class="label-col">領域</div>
                                    <div class="env-scroll-container">
                                        <button class="ex-btn" :class="{ active: store.isEXZone }"
                                            @click="store.isEXZone = !store.isEXZone">
                                            EX
                                        </button>
                                        <button v-for="z in zoneOptions" :key="z" class="env-btn"
                                            :class="{ active: store.zone === z }" @click="store.zone = z" :title="z">
                                            <img :src="getEnvIcon('zone', z)" />
                                        </button>
                                    </div>
                                </div>
                                <div class="env-toolbar">
                                    <div class="label-col">傷害場地</div>
                                    <div class="env-scroll-container">
                                        <button v-for="z in damageFieldOptions" :key="z" class="env-btn"
                                            :class="{ active: store.target.damageField === z }"
                                            @click="store.target.damageField = z" :title="z">
                                            <img :src="getEnvIcon('damageField', z)" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="boost-section-wrapper">
                                <div class="section-label">威力增强</div>
                                <div class="boost-section">
                                    <div class="boost-group">
                                        <div class="boost-icon"><img :src="getBoostIcon('physical')" title="物理威力增强" />
                                        </div>
                                        <select v-model.number="store.user.boosts.physical" class="boost-select">
                                            <option v-for="n in getBoostOptions()" :key="n" :value="n">{{ n }}</option>
                                        </select>
                                    </div>
                                    <div class="boost-group">
                                        <div class="boost-icon"><img :src="getBoostIcon('special')" title="特殊威力增强" />
                                        </div>
                                        <select v-model.number="store.user.boosts.special" class="boost-select">
                                            <option v-for="n in getBoostOptions()" :key="n" :value="n">{{ n }}</option>
                                        </select>
                                    </div>
                                    <div class="boost-group">
                                        <div class="boost-icon"><img :src="getBoostIcon('sync')" title="拍组招式威力增强" />
                                        </div>
                                        <select v-model.number="store.user.boosts.sync" class="boost-select">
                                            <option v-for="n in getBoostOptions()" :key="n" :value="n">{{ n }}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="battle-settings-bar">
                                <div class="bs-row full-width-row">
                                    <select v-model="store.settings.effectiveType" class="type-select">
                                        <option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</option>
                                    </select>
                                    <button class="text-toggle-btn" :class="{ active: store.settings.isCritical }"
                                        @click="store.settings.isCritical = !store.settings.isCritical">
                                        要害
                                    </button>
                                    <button class="text-toggle-btn" :class="{ active: store.settings.isSuperEffective }"
                                        @click="store.settings.isSuperEffective = !store.settings.isSuperEffective">
                                        效果絕佳↑
                                    </button>
                                </div>
                                <div class="bs-row full-width-row space-between">
                                    <div class="control-group">
                                        <span class="common-label">目標</span>
                                        <div class="segment-control">
                                            <button v-for="n in 3" :key="n"
                                                :class="{ active: store.settings.targetScope === n }"
                                                @click="store.settings.targetScope = n as any">
                                                {{ n }}
                                            </button>
                                        </div>
                                    </div>
                                    <div class="control-group">
                                        <span class="common-label">氣槽</span>
                                        <div class="gauge-control">
                                            <button v-for="n in 6" :key="n"
                                                :class="{ active: store.settings.gauge >= n }"
                                                @click="store.settings.gauge = n as any">
                                                {{ n }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="circle-scroll-wrapper">
                                <div class="circle-track">
                                    <div v-for="(data, region) in store.battleCircles" :key="region"
                                        class="circle-item">
                                        <div class="circle-header" :class="getRegionClass(region as string)">
                                            {{ region }}
                                        </div>
                                        <div class="circle-toggles">
                                            <button class="toggle-circle-btn" :class="{ active: data.actives['物理'] }"
                                                @click="data.actives['物理'] = !data.actives['物理']" title="物理鬥陣">
                                                <img :src="getCirclesIcon('atk')" alt="物理" />
                                            </button>
                                            <button class="toggle-circle-btn" :class="{ active: data.actives['特殊'] }"
                                                @click="data.actives['特殊'] = !data.actives['特殊']" title="特殊鬥陣">
                                                <img :src="getCirclesIcon('spa')" alt="特殊" />
                                            </button>
                                            <button class="toggle-circle-btn" :class="{ active: data.actives['防禦'] }"
                                                @click="data.actives['防禦'] = !data.actives['防禦']" title="防禦鬥陣">
                                                <img :src="getCirclesIcon('hp')" alt="防禦" />
                                            </button>
                                        </div>
                                        <div class="circle-level-display">
                                            Lv.
                                            <select v-model.number="data.level" class="level-select">
                                                <option v-for="lvl in getRegionLevelOptions(region as string)"
                                                    :key="lvl" :value="lvl">
                                                    {{ lvl }}
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="section-group">
                        <div class="section-title">其他配置</div>
                        <div class="panel-card other-bar">
                            <div class="other-item">
                                <label>物理+（%）</label>
                                <input type="number" v-model.number="store.config.physical" class="other-input"
                                    placeholder="0">
                            </div>
                            <div class="other-item">
                                <label>特殊+（%）</label>
                                <input type="number" v-model.number="store.config.special" class="other-input"
                                    placeholder="0">
                            </div>
                            <div class="other-item">
                                <label>拍招+（%）</label>
                                <input type="number" v-model.number="store.config.sync" class="other-input"
                                    placeholder="0">
                            </div>
                            <div class="other-item">
                                <label>裝備招式*（%）</label>
                                <input type="number" v-model.number="store.config.gearMove" class="other-input"
                                    placeholder="0">
                            </div>
                            <div class="other-item">
                                <label>裝備拍招*（%）</label>
                                <input type="number" v-model.number="store.config.gearSync" class="other-input"
                                    placeholder="0">
                            </div>
                            <div class="other-item">
                                <label>組隊+（白值）</label>
                                <div class="row-inputs">
                                    <select v-model="store.user.themeType" class="type-select-small">
                                        <option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</option>
                                    </select>
                                    <input type="number" v-model.number="store.user.themeTypeAdd" class="other-input"
                                        placeholder="0">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="section-group">
                        <div class="section-title">计算结果</div>
                        <div v-if="!finalDamageResult || finalDamageResult.length === 0" class="empty-tip">
                            暂无数据，请检查拍组数据
                        </div>
                        <div v-else class="result-container">
                            <div v-for="(formResult, idx) in finalDamageResult" :key="idx" class="form-block">
                                <div class="form-title">{{ formResult.formName }}</div>
                                <div class="move-list">

                                    <template v-for="(res, mIdx) in formResult?.moves" :key="'move-'+mIdx">
                                        <div v-if="res" class="move-card" :class="getTypeBgClass(res.move.type)">
                                            <div class="move-header">
                                                <div class="header-content-left relative group">
                                                    <div class="move-name-row">
                                                        <span class="move-name">{{ res.move.name }}</span>
                                                        <span class="power-badge">威力 {{ res.movePower }}</span>
                                                    </div>

                                                    <div class="custom-tooltip"
                                                        :class="mIdx < 2 ? 'tooltip-down' : 'tooltip-up'">
                                                        <div class="tooltip-title">技能威力提升</div>
                                                        <div class="tooltip-content"
                                                            v-html="getBoostTooltip(res).replace(/\n/g, '<br/>')"></div>
                                                        <div class="tooltip-footer">
                                                            <div>环境倍率: x{{ res.envBoost }}</div>
                                                            <div>裝備倍率: x{{ res.gearBoost }}</div>
                                                            <div>招式倍率: x{{ (res.moveBoost / 100).toFixed(2) }}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="header-content-right">
                                                    <span class="stat-simple-badge">{{ res.userStat }} / {{
                                                        res.targetStat }}</span>
                                                </div>
                                            </div>

                                            <div class="damage-text-area">
                                                <template v-for="(dmg, i) in res.moveDamage" :key="i">
                                                    <span class="dmg-num">
                                                        {{ dmg }}
                                                    </span>
                                                    <span v-if="i < res.moveDamage.length - 1" class="separator">,
                                                    </span>
                                                </template>
                                            </div>
                                        </div>
                                    </template>

                                    <div v-if="formResult.teraMove" class="move-card sync-card"
                                        :class="getTypeBgClass(formResult.teraMove?.move.type)">
                                        <div class="move-header">
                                            <div class="header-content-left relative group">
                                                <div class="move-name-row">
                                                    <span class="move-name">{{ formResult.teraMove?.move.name
                                                        }}</span>
                                                    <span class="power-badge">威力 {{ formResult.teraMove?.movePower
                                                        }}</span>
                                                </div>

                                                <div class="custom-tooltip tooltip-up">
                                                    <div class="tooltip-title">技能威力提升</div>
                                                    <div class="tooltip-content"
                                                        v-html="getBoostTooltip(formResult.teraMove).replace(/\n/g, '<br/>')">
                                                    </div>
                                                    <div class="tooltip-footer">
                                                        <div>环境倍率: x{{ formResult.teraMove?.envBoost }}</div>
                                                        <div>裝備倍率: x{{ formResult.teraMove?.gearBoost }}</div>
                                                        <div>招式倍率: x{{ (formResult.teraMove?.moveBoost / 100).toFixed(2)
                                                            }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="header-content-right">
                                                <span class="stat-simple-badge">{{ formResult.teraMove?.userStat }} /
                                                    {{ formResult.teraMove?.targetStat }}</span>
                                            </div>
                                        </div>

                                        <div class="damage-text-area">
                                            <template v-for="(dmg, i) in formResult.teraMove?.moveDamage" :key="i">
                                                <span class="dmg-num">
                                                    {{ dmg }}
                                                </span>
                                                <span v-if="i < formResult.teraMove?.moveDamage.length - 1"
                                                    class="separator">, </span>
                                            </template>
                                        </div>

                                    </div>

                                    <template v-for="(res, mIdx) in formResult?.maxMoves" :key="'maxMove-'+mIdx">
                                        <div v-if="res" class="move-card" :class="getTypeBgClass(res.move.type)">
                                            <div class="move-header">
                                                <div class="header-content-left relative group">
                                                    <div class="move-name-row">
                                                        <span class="move-name">{{ res.move.name }}</span>
                                                        <span class="power-badge">威力 {{ res.movePower }}</span>
                                                    </div>

                                                    <div class="custom-tooltip"
                                                        :class="mIdx < 2 ? 'tooltip-down' : 'tooltip-up'">
                                                        <div class="tooltip-title">技能威力提升</div>
                                                        <div class="tooltip-content"
                                                            v-html="getBoostTooltip(res).replace(/\n/g, '<br/>')"></div>
                                                        <div class="tooltip-footer">
                                                            <div>环境倍率: x{{ res.envBoost }}</div>
                                                            <div>招式倍率: x{{ (res.moveBoost / 100).toFixed(2) }}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="header-content-right">
                                                    <span class="stat-simple-badge">{{ res.userStat }} / {{
                                                        res.targetStat }}</span>
                                                </div>
                                            </div>

                                            <div class="damage-text-area">
                                                <template v-for="(dmg, i) in res.moveDamage" :key="i">
                                                    <span class="dmg-num">
                                                        {{ dmg }}
                                                    </span>
                                                    <span v-if="i < res.moveDamage.length - 1" class="separator">,
                                                    </span>
                                                </template>
                                            </div>

                                        </div>
                                    </template>

                                    <div v-if="formResult.syncMove" class="move-card sync-card"
                                        :class="getTypeBgClass(formResult.syncMove.move.type)">
                                        <div class="move-header">
                                            <div class="header-content-left relative group">
                                                <div class="move-name-row">
                                                    <span class="move-name text-lg">{{ formResult.syncMove.move.name
                                                        }}</span>
                                                    <span class="power-badge">威力 {{ formResult.syncMove.movePower
                                                        }}</span>
                                                </div>

                                                <div class="custom-tooltip tooltip-up">
                                                    <div class="tooltip-title">技能威力提升</div>
                                                    <div class="tooltip-content"
                                                        v-html="getBoostTooltip(formResult.syncMove).replace(/\n/g, '<br/>')">
                                                    </div>
                                                    <div class="tooltip-footer">
                                                        <div>环境倍率: x{{ formResult.syncMove.envBoost }}</div>
                                                        <div>裝備倍率: x{{ formResult.syncMove.gearBoost }}</div>
                                                        <div>招式倍率: x{{ (formResult.syncMove.moveBoost / 100).toFixed(2)
                                                            }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="header-content-right">
                                                <span class="stat-simple-badge">{{ formResult.syncMove.userStat }} /
                                                    {{
                                                        formResult.syncMove.targetStat }}</span>
                                            </div>
                                        </div>

                                        <div class="damage-text-area">
                                            <template v-for="(dmg, i) in formResult.syncMove.moveDamage" :key="i">
                                                <span class="dmg-num">
                                                    {{ dmg }}
                                                </span>
                                                <span v-if="i < formResult.syncMove.moveDamage.length - 1"
                                                    class="separator">, </span>
                                            </template>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="window-footer"><button class="btn btn-primary" @click="emit('close')">關閉</button></div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-block-start: 5vh;
    z-index: 1000;
}

.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-active .modal-window,
.modal-leave-active .modal-window {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .modal-window,
.modal-leave-to .modal-window {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
}

.modal-window {
    background: white;
    inline-size: 95vw;
    block-size: 90vh;
    block-size: 90dvh;
    max-inline-size: 1000px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.window-header {
    padding: 10px 20px;
    color: rgb(194, 236, 181);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-image: url('../assets/images/bg1.png');
    text-shadow:
        1px 1px 0 #555,
        -1px 1px 0 #555,
        1px -1px 0 #555,
        -1px -1px 0 #555;
}

.window-header h2 {
    margin: 0;
    font-size: 1.1rem;
}

.close-btn {
    background: none;
    border: none;
    color: black;
    font-size: 1.5rem;
    cursor: pointer;
}

.window-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-image: url('../assets/images/bg2.png');
}

.window-footer {
    padding: 10px 20px;
    background: white;
    border-block-start: 1px solid #ddd;
    text-align: end;
    background-image: url('../assets/images/bg1.png');
}

.section-group {
    margin-block-end: 20px;
}

.section-title {
    font-size: 1rem;
    font-weight: bold;
    color: #333;
    margin-block-end: 10px;
    padding-inline-start: 8px;
    border-inline-start: 4px solid #009688;
}

.panel-card {
    background-image: url('../assets/images/bg1.png');
    padding: 15px;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Stat Tables */
.stat-table-container {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    border: 1px solid #eee;
    border-radius: 8px;
    background: white;
    inline-size: 100%;
}

.stat-col {
    flex: 1;
    min-inline-size: 45px;
    display: flex;
    flex-direction: column;
    border-inline-end: 1px solid #eee;
}

.stat-col:last-child {
    border-inline-end: none;
}

.stat-cell {
    block-size: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-block-end: 1px solid #f5f5f5;
    padding: 2px;
}

.header-cell {
    block-size: 40px;
    border-block-end: 1px solid #eee;
}

.bg-green-100 {
    background-color: #dcfce7;
}

.bg-orange-100 {
    background-color: #ffedd5;
}

.bg-yellow-100 {
    background-color: #fef9c3;
}

.bg-blue-100 {
    background-color: #dbeafe;
}

.bg-indigo-100 {
    background-color: #e0e7ff;
}

.bg-pink-100 {
    background-color: #fce7f3;
}

.bg-gray-50 {
    background-color: #f9fafb;
}

.bg-red-50 {
    background-color: #fef2f2;
}

.stat-icon {
    inline-size: 24px;
    block-size: 24px;
    object-fit: contain;
}

.val-input,
.rank-select {
    inline-size: 100%;
    block-size: 100%;
    border: none;
    text-align: center;
    background: transparent;
    font-size: 0.9rem;
    font-weight: bold;
    color: #444;
}

.val-input:focus,
.rank-select:focus {
    outline: none;
    background: #f0f8ff;
}

.placeholder {
    color: #ddd;
    font-size: 0.8rem;
}

.target-val {
    background: #fff5f5;
}

.rank-pos {
    color: #e65100;
}

.rank-neg {
    color: #1a237e;
}

.text-green-600 {
    color: #16a34a;
}

.text-blue-600 {
    color: #2563eb;
}

/* ✨ Double Height Cell & Merged Inputs */
.double-cell {
    block-size: 64px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0;
}

.half-input {
    block-size: 32px;
    inline-size: 100%;
    border: none;
    font-size: 0.85rem;
}

.top-input {
    border-block-end: 1px dashed #eee;
    color: #444;
}

.bottom-input {}

.stacked-label {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    block-size: 100%;
    align-items: center;
    inline-size: 100%;
}

.label-divider {
    inline-size: 80%;
    block-size: 1px;
    background: #eee;
}

.row-label {
    font-size: 0.75rem;
    font-weight: bold;
    color: #666;
}

/* Status Bar */
.status-bar {
    display: flex;
    align-items: flex-start;
    justify-content: space-evenly;
    gap: 10px;
    padding: 15px 10px;
    background: #f8fcfd;
    border-block-start: 1px solid #eee;
    flex-wrap: wrap;
}

.status-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    min-inline-size: 80px;
}

.status-label {
    font-size: 0.75rem;
    color: #888;
    font-weight: bold;
}

.common-label {
    font-size: 0.85rem;
    color: #333;
    font-weight: bold;
}

.icon-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
}

.icon-btn {
    inline-size: 34px;
    block-size: 34px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    border-radius: 6px;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    opacity: 0.5;
}

.icon-btn:hover {
    border-color: #aaa;
    opacity: 0.8;
}

.icon-btn.active {
    border-color: #2196f3;
    background: #e3f2fd;
    opacity: 1;
    box-shadow: 0 1px 3px rgba(33, 150, 243, 0.3);
}

.icon-btn img {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
}

.sync-input {
    inline-size: 60px;
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: center;
    font-weight: bold;
    font-size: 1rem;
}

/* Boost Section */
.boost-section-wrapper {
    padding: 10px;
    background: #f8fcfd;
    border-block-start: 1px dashed #eee;
    margin-block-start: 10px;
}

.boost-section {
    display: flex;
    justify-content: space-around;
}

.boost-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    inline-size: 60px;
}

.boost-icon img {
    inline-size: 28px;
    block-size: 28px;
}

.boost-select {
    inline-size: 100%;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 2px;
    font-size: 0.8rem;
}

/* Battle Settings Bar */
.battle-settings-bar {
    padding: 10px;
    background: #f8fcfd;
    border-block-start: 1px solid #eee;
    margin-block-start: 10px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.bs-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.full-width-row {
    justify-content: center;
    inline-size: 100%;
}

.space-between {
    justify-content: space-evenly;
}

.control-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.type-select {
    padding: 4px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-weight: bold;
    inline-size: 100px;
}

.text-toggle-btn {
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    font-size: 0.75rem;
    cursor: pointer;
    color: #666;
}

.text-toggle-btn.active {
    background: #b2dfdb;
    border-color: #009688;
    color: #00695c;
    font-weight: bold;
}

.segment-control {
    display: flex;
    border: 1px solid #009688;
    border-radius: 4px;
    overflow: hidden;
}

.segment-control button {
    padding: 4px 16px;
    border: none;
    background: white;
    color: #009688;
    cursor: pointer;
    font-weight: bold;
    border-inline-end: 1px solid #009688;
}

.segment-control button:last-child {
    border-inline-end: none;
}

.segment-control button.active {
    background: #b2dfdb;
    color: #004d40;
}

.gauge-control {
    display: flex;
    border: 1px solid #00acc1;
    border-radius: 4px;
    overflow: hidden;
}

.gauge-control button {
    padding: 4px 10px;
    border: none;
    background: #e0f7fa;
    color: #006064;
    cursor: pointer;
    font-size: 0.8rem;
    border-inline-end: 1px solid #80deea;
}

.gauge-control button:last-child {
    border-inline-end: none;
}

.gauge-control button.active {
    background: #00acc1;
    color: white;
}

/* Rebuff Section */
.rebuff-section {
    padding: 10px;
    background: #f8fcfd;
    border-block-start: 1px solid #eee;
    margin-block-start: 5px;
}

.section-label {
    font-size: 0.85rem;
    color: black;
    font-weight: bold;
    margin-block-end: 7px;
    text-align: center;
}

.rebuff-scroll-container {
    display: flex;
    overflow-x: auto;
    border: 1px solid #eee;
    border-radius: 6px;
    background: white;
    inline-size: 100%;
}

.rebuff-col {
    flex: 1;
    min-inline-size: 35px;
    display: flex;
    flex-direction: column;
    border-inline-end: 1px solid #f5f5f5;
    align-items: center;
}

.rebuff-col:last-child {
    border-inline-end: none;
}

.rebuff-icon {
    inline-size: 20px;
    block-size: 20px;
}

.rebuff-select {
    font-size: 0.8rem;
    background: #fafafa;
}

/* Environment Row */
.env-row-icons {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.env-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    border-block-end: 1px dashed #eee;
    padding-block-end: 8px;
}

.env-toolbar:last-child {
    border-block-end: none;
}

.label-col {
    font-size: 0.9rem;
    font-weight: bold;
    color: #555;
    inline-size: 40px;
    border-inline-start: 3px solid #009688;
    padding-inline-start: 6px;
}

.env-scroll-container {
    display: flex;
    overflow-x: auto;
    gap: 6px;
    flex: 1;
    padding-block-end: 2px;
}

.env-btn {
    inline-size: 36px;
    block-size: 36px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.5;
    padding: 4px;
    flex-shrink: 0;
}

.env-btn:hover {
    opacity: 0.8;
}

.env-btn.active {
    border-color: #009688;
    background: #e0f2f1;
    opacity: 1;
    box-shadow: 0 1px 3px rgba(0, 150, 136, 0.3);
}

.env-btn img {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
}

.ex-btn {
    inline-size: 36px;
    block-size: 36px;
    border: 1px solid #009688;
    border-radius: 4px;
    background: white;
    color: #009688;
    font-weight: bold;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.ex-btn.active {
    background: #009688;
    color: white;
}

/* Circles */
.circle-scroll-wrapper {
    background: white;
    padding: 10px;
    /* border-radius: 6px; */
    margin-block-start: 10px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.circle-track {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-block-end: 5px;
}

.circle-item {
    flex: 0 0 90px;
    border: 1px solid #ddd;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.circle-header {
    color: white;
    text-align: center;
    font-size: 0.8rem;
    font-weight: bold;
    padding: 3px 0;
}

.circle-toggles {
    display: flex;
    justify-content: space-evenly;
    padding: 6px 4px;
    background: #f9f9f9;
    border-block-end: 1px solid #eee;
}

.toggle-circle-btn {
    inline-size: 28px;
    block-size: 28px;
    border-radius: 50%;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    filter: grayscale(100%);
    opacity: 0.6;
}

.toggle-circle-btn:hover {
    opacity: 1;
    border-color: #999;
}

.toggle-circle-btn.active {
    filter: none;
    opacity: 1;
    border-color: #2196f3;
    background: white;
    box-shadow: 0 0 4px rgba(33, 150, 243, 0.4);
}

.toggle-circle-btn img {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
}

.circle-level-display {
    text-align: center;
    font-size: 0.9rem;
    font-weight: bold;
    padding: 4px;
    color: #444;
}

.level-select {
    border: none;
    background: transparent;
    font-weight: bold;
    color: #444;
    font-size: 0.9rem;
    cursor: pointer;
}

[class*="region-"] {
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.region-kanto {
    background: linear-gradient(120deg, #558B2F 50%, #D32F2F 50%);
}

.region-johto {
    background: linear-gradient(120deg, #C0A143 50%, #9E9E9E 50%);
}

.region-hoenn {
    background: linear-gradient(120deg, #D32F2F 50%, #1976D2 50%);
}

.region-sinnoh {
    background: linear-gradient(120deg, #1565C0 50%, #C2185B 50%);
}

.region-unova {
    background: linear-gradient(120deg, #212121 50%, #9E9E9E 50%);
}

.region-kalos {
    background: linear-gradient(120deg, #0D47A1 50%, #AD1457 50%);
}

.region-alola {
    background: linear-gradient(120deg, #F57C00 50%, #4FC3F7 50%);
}

.region-galar {
    background: linear-gradient(120deg, #00ACC1 50%, #E91E63 50%);
}

.region-paldea {
    background: linear-gradient(120deg, #B71C1C 50%, #7B1FA2 50%);
}

.region-pasio {
    background: linear-gradient(120deg, #304FFE 50%, #90CAF9 50%);
}

.region-default {
    background: #999;
}

.btn {
    padding: 6px 16px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: bold;
}

.btn-primary {
    background: #009688;
    color: white;
}

::-webkit-scrollbar {
    inline-size: 6px;
    block-size: 6px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
}

/* 4. Result Section Styles */
.result-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-block {
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    margin-block-end: 10px;
}

.form-title {
    background: #444;
    color: white;
    padding: 6px 12px;
    font-weight: bold;
    font-size: 0.9rem;
    border-radius: 8px 8px 0 0;
}

.move-list {
    display: flex;
    flex-direction: column;
}

.move-card {
    border-block-end: 1px solid #eee;
    position: relative;
    z-index: 1;
}

.move-card:hover {
    z-index: 50;
}

/* Fix Tooltip overlap */
.move-card:last-child {
    border-block-end: none;
    border-radius: 0 0 8px 8px;
}

/* Move Header: Dark Overlay using pseudo-element */
.move-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    position: relative;
    z-index: 10;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.move-header::before {
    content: "";
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    inset-inline-end: 0;
    inset-block-end: 0;
    background: rgba(0, 0, 0, 0.25);
    z-index: -1;
}

/* Left Content */
.header-content-left {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    z-index: 20;
}

/* Right Content */
.header-content-right {
    margin-inline-start: auto;
    position: relative;
    z-index: 20;
}

.move-name {
    font-weight: bold;
    font-size: clamp(0.8rem, 2.5vw, 0.95rem);
    color: white;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
}

.power-badge {
    background: rgba(0, 0, 0, 0.3);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: clamp(0.7rem, 2.5vw, 0.75rem);
    font-weight: bold;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.4);
    display: inline-block;
    margin-inline-start: 6px;
}

.stat-simple-badge {
    background: rgba(0, 0, 0, 0.3);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: clamp(0.7rem, 2.5vw, 0.75rem);
    font-weight: bold;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.4);
}

/* Damage Rolls: Light Overlay */
.damage-text-area {
    padding: 8px 12px;
    font-size: clamp(0.75rem, 2.5vw, 0.95rem);
    /* 字體稍大一點點 */
    /* font-family: "Roboto Mono", monospace; */
    /* 等寬字體 */
    font-weight: 800;
    /* 加粗字體 */
    line-height: 1.6;
    background: rgba(255, 255, 255, 0.15);
    color: black;
    /* text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6); */

    position: relative;
    z-index: 1;
    word-break: break-word;
    border-radius: 4px;
    /* 稍微加點圓角更柔和 */
}

/* 分隔符 (逗號) */
.separator {
    color: rgba(0, 0, 0, 0.7);
    /* 逗號稍微淡一點 */
    margin-inline-end: 4px;
}

/* 最小值：改用亮青色/淺藍色，在深色背景更明顯 */
.min-text {
    color: #81d4fa;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
    /* 加強陰影 */
    text-decoration: underline;
    /* 可選：加下劃線強調 */
}

/* 最大值：改用亮紅色/粉紅色 */
.max-text {
    color: #ff8a80;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
}

.sync-card {
    border-block-start: 3px solid #FFD700;
}

.sync-power {
    background: #FFD700;
    color: #fff;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.sync-rolls .roll-item {
    font-size: 1rem;
}

/* Tooltip Styles */
.move-info {
    cursor: help;
    position: relative;
}

.custom-tooltip {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    inset-inline-start: 0;
    background: rgba(33, 33, 33, 0.95);
    color: white;
    padding: 10px;
    border-radius: 6px;
    inline-size: 240px;
    z-index: 999;
    transition: opacity 0.2s;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    margin: 8px 0;
    text-align: start;
}

.tooltip-up {
    inset-block-end: 100%;
    margin-block-end: 8px;
}

.tooltip-down {
    inset-block-start: 100%;
    margin-block-start: 8px;
}

.group:hover .custom-tooltip {
    visibility: visible;
    opacity: 1;
}

.tooltip-title {
    font-size: 0.85rem;
    font-weight: bold;
    border-block-end: 1px solid #555;
    padding-block-end: 4px;
    margin-block-end: 4px;
    color: #FFD700;
}

.tooltip-content {
    font-size: 0.75rem;
    line-height: 1.5;
    color: #ddd;
    white-space: pre-wrap;
}

.tooltip-footer {
    margin-block-start: 8px;
    padding-block-start: 4px;
    border-block-start: 1px dashed #555;
    font-size: 0.75rem;
    color: #aaa;
}

/* ✨ Debug Bar Styles */
.row-inputs {
    display: flex;
    gap: 4px;
    align-items: center;
}

.type-select-small {
    padding: 4px 2px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-weight: bold;
    font-size: 0.85rem;
    inline-size: 60px;
    text-align: center;
    background-color: white;
}

.other-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: center;
    justify-content: space-around;
}

.other-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.other-item label {
    font-size: 0.75rem;
    font-weight: bold;
    color: #555;
}

.other-input {
    inline-size: 60px;
    padding: 4px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.9rem;
}
</style>