<template>
    <div class="filter-container">
        <div class="search-bar-container">
            <div class="input-wrapper">
                <input v-model="searchKey" placeholder="搜索拍組名稱..." class="filter-input" />
                <transition name="fade">
                    <span v-if="filteredTrainers.length > 0" class="result-count">
                        {{ filteredTrainers.length }}
                    </span>
                </transition>
            </div>
            <div class="sort-controls">
                <select v-model="sortField" class="sort-select">
                    <option value="_startDate">登陸日期</option>
                    <option value="dexNumber">圖鑑編號</option>
                    <option value="_exStartDate">EX 開放日</option>
                    <option value="_gridDate">石盤開放日</option>
                </select>
                <button class="sort-direction-btn" @click="toggleSortOrder"
                    :title="sortDesc ? '降序 (新->舊)' : '升序 (舊->新)'">
                    {{ sortDesc ? '⬇️' : '⬆️' }}
                </button>
            </div>
            <button class="filter-toggle-btn" @click="showFilterModal = true">
                <span class="icon-filter">≡</span> 篩選
                <span v-if="activeFilterCount > 0" class="badge">{{ activeFilterCount }}</span>
            </button>
        </div>

        <div class="trainer-list">
            <div v-if="filteredTrainers.length === 0" class="no-result">
                未找到匹配的拍組～
            </div>

            <div v-for="trainer in filteredTrainers" :key="trainer.id" class="trainer-item"
                @click="handleSelect(trainer)">

                <div class="image-wrapper">
                    <img :src="getTrainerUrl(trainer.enActor, trainer.dexNumber, trainer.rarity, trainer.count)"
                        alt="trainer" class="trainer-avatar" loading="lazy" />

                    <div class="trainer-meta-overlay">
                        <img :src="getRoleIcon('normal', trainer.role)" :alt="trainer.role" class="meta-icon" />

                        <img v-if="trainer.exRole" :src="getRoleIcon('ex', trainer.exRole)" :alt="trainer.exRole"
                            class="meta-icon" />
                    </div>
                </div>
            </div>
        </div>

        <button class="close-btn" @click="emit('close-modal')">關閉窗口</button>

        <transition name="modal">
            <div v-if="showFilterModal" class="advanced-filter-modal" @click.self="showFilterModal = false">
                <div class="filter-content">
                    <div class="filter-header">
                        <h3>筛选条件</h3>
                        <button class="reset-icon-btn" @click="resetFilters" title="重置筛选">
                            <img :src="getUiIcon('rotate')" alt="重置" class="reset-icon" />
                        </button>
                    </div>

                    <div class="main-tabs-container">
                        <div class="segmented-control">
                            <button class="segment-btn" :class="{ active: activeMainTab === 'basic' }"
                                @click="activeMainTab = 'basic'">
                                基礎信息
                            </button>
                            <button class="segment-btn" :class="{ active: activeMainTab === 'skills' }"
                                @click="activeMainTab = 'skills'">
                                隊伍技能
                                <span v-if="tempFilters.themes.length > 0" class="mini-dot"></span>
                            </button>
                        </div>
                    </div>

                    <div class="filter-body">
                        <div v-show="activeMainTab === 'basic'" class="basic-filters-view">
                            <div class="filter-section">
                                <div class="section-title" @click="toggleSection('exclusivity')">
                                    <span>特殊標籤 (Exclusivity)</span>
                                    <span class="arrow-icon" :class="{ rotated: sectionState.exclusivity }">▼</span>
                                </div>
                                <transition name="collapse">
                                    <div v-show="sectionState.exclusivity" class="options-grid exclusivity">
                                        <button v-for="tab in exclusivityTabs" :key="tab.key"
                                            class="option-btn icon-text-btn"
                                            :class="{ active: tempFilters.exclusivity.includes(tab.key) }"
                                            @click="toggleFilter('exclusivity', tab.key)">

                                            <img v-if="tab.iconName" :src="getUiIcon(tab.iconName)"
                                                class="filter-icon" />
                                            {{ tab.label }}
                                        </button>
                                    </div>
                                </transition>
                            </div>

                            <div class="filter-section">
                                <div class="section-title" @click="toggleSection('variation')">
                                    <span>形態變化 (Variation)</span>
                                    <span class="arrow-icon" :class="{ rotated: sectionState.variation }">▼</span>
                                </div>
                                <transition name="collapse">
                                </transition>
                            </div>

                            <div class="filter-section">
                                <div class="section-title" @click="toggleSection('rarity')">
                                    <span>星數 (Rarity)</span>
                                    <span class="arrow-icon" :class="{ rotated: sectionState.rarity }">▼</span>
                                </div>
                                <transition name="collapse">
                                    <div v-show="sectionState.rarity" class="options-grid rarity">
                                        <div v-for="r in rarityOptions" :key="r" class="option-btn icon-btn"
                                            :class="{ active: tempFilters.rarity.includes(r) }"
                                            @click="toggleFilter('rarity', r)">
                                            <img :src="getRarityIcon(r)" :alt="r + '星'" class="filter-icon" />
                                        </div>
                                    </div>
                                </transition>
                            </div>

                            <div class="filter-section">
                                <div class="section-title" @click="toggleSection('types')">
                                    <span>屬性 (Type)</span>
                                    <span class="arrow-icon" :class="{ rotated: sectionState.types }">▼</span>
                                </div>
                                <transition name="collapse">
                                    <div v-show="sectionState.types" class="options-grid types">
                                        <div v-for="type in typeOptions" :key="type" class="option-btn icon-btn"
                                            :class="{ active: tempFilters.types.includes(type) }"
                                            @click="toggleFilter('types', type)">
                                            <img :src="getTypeIcon(type)" :alt="type" class="filter-icon" />
                                        </div>
                                    </div>
                                </transition>
                            </div>

                            <div class="filter-section">
                                <div class="section-title" @click="toggleSection('weaknesses')">
                                    <span>弱點 (Weakness)</span>
                                    <span class="arrow-icon" :class="{ rotated: sectionState.weaknesses }">▼</span>
                                </div>
                                <transition name="collapse">
                                    <div v-show="sectionState.weaknesses" class="options-grid types">
                                        <div v-for="type in typeOptions" :key="type" class="option-btn icon-btn"
                                            :class="{ active: tempFilters.weaknesses.includes(type) }"
                                            @click="toggleFilter('weaknesses', type)">
                                            <img :src="getTypeIcon(type)" :alt="type" class="filter-icon" />
                                        </div>
                                    </div>
                                </transition>
                            </div>

                            <div class="filter-section">
                                <div class="section-title" @click="toggleSection('roles')">
                                    <span>體系 (Role)</span>
                                    <span class="arrow-icon" :class="{ rotated: sectionState.roles }">▼</span>
                                </div>
                                <transition name="collapse">
                                    <div v-show="sectionState.roles" class="options-grid roles">
                                        <div v-for="role in roleOptions" :key="role" class="option-btn icon-btn"
                                            :class="{ active: tempFilters.roles.includes(role) }"
                                            @click="toggleFilter('roles', role)">
                                            <img :src="getRoleIcon('normal', role)" :alt="role" class="filter-icon" />
                                        </div>
                                    </div>
                                </transition>
                            </div>

                            <div class="filter-section">
                                <div class="section-title" @click="toggleSection('exRoles')">
                                    <span>EX體系 (EXRole)</span>
                                    <span class="arrow-icon" :class="{ rotated: sectionState.exRoles }">▼</span>
                                </div>
                                <transition name="collapse">
                                    <div v-show="sectionState.exRoles" class="options-grid roles">
                                        <div v-for="exrole in filteredExRoleOptions" :key="exrole"
                                            class="option-btn icon-btn"
                                            :class="{ active: tempFilters.exRoles.includes(exrole) }"
                                            @click="toggleFilter('exRoles', exrole)">
                                            <img :src="getRoleIcon('ex', exrole)" :alt="exrole" class="filter-icon" />
                                        </div>
                                    </div>
                                </transition>
                            </div>

                        </div>

                        <div v-show="activeMainTab === 'skills'" class="skill-filters-view">

                            <div class="skill-sub-tabs">
                                <button v-for="tab in skillSubTabs" :key="tab.key" class="skill-tab-pill"
                                    :class="{ active: activeSkillSubTab === tab.key }"
                                    @click="activeSkillSubTab = tab.key">

                                    <img :src="getUiIcon(tab.iconName)" class="pill-icon" />

                                    {{ tab.label }}
                                </button>
                            </div>

                            <div class="skill-options-container">
                                <transition name="fade" mode="out-in">
                                    <div class="text-options-grid" :key="activeSkillSubTab">
                                        <div v-for="tag in skillOptionsMap[activeSkillSubTab]" :key="tag"
                                            class="option-btn text-btn"
                                            :class="{ active: tempFilters.themes.includes(tag) }"
                                            @click="toggleFilter('themes', tag)">
                                            {{ tag }}
                                        </div>
                                    </div>
                                </transition>
                            </div>
                        </div>
                    </div>
                    <div class="filter-footer">
                        <button class="cancel-btn" @click="showFilterModal = false">取消</button>
                        <button class="confirm-btn" @click="applyFilters">確認</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import {
    BATTLE_REGIONS,
    POKEMON_TYPES,
    ROLE_TYPES,
    THEME_FASHION,
    THEME_OTHER,
    THEME_TRAINER_GROUP
} from "@/constances/battle";
import { ExclusivityMap, RoleMap, ThemeMap, TypeMap } from "@/constances/map";
import { useSyncCacheStore } from "@/stores/syncCache";
import { SyncMeta } from "@/types/cache";
import { getTrainerUrl } from '@/utils/format';
import { Converter } from 'opencc-js';
import { computed, reactive, ref, watch } from 'vue';


// --- 数据准备 ---
const syncCacheStore = useSyncCacheStore();
const metaTrainer = computed(() => syncCacheStore.getMeta);
const searchKey = ref('');
const emit = defineEmits(['select-trainer', 'close-modal']);

// --- 简繁转换 ---
const converter = Converter({ from: 'cn', to: 'tw' });
const toTraditional = (text: string) => text ? converter(text) : '';

// --- 排序 ---
const sortField = computed({
    get: () => syncCacheStore.sortField,
    set: (val) => syncCacheStore.updateSort(val, syncCacheStore.sortDesc)
});
const sortDesc = computed({
    get: () => syncCacheStore.sortDesc,
    set: (val) => syncCacheStore.updateSort(syncCacheStore.sortField, val)
});

// 切換升序/降序
const toggleSortOrder = () => {
    sortDesc.value = !sortDesc.value;
};

// --- 分页控制 ---
// 1. 控制“大分页”：'basic' (基础) vs 'skills' (技能)
const activeMainTab = ref<'basic' | 'skills'>('basic');

// 2. 控制“技能子分页”：默认显示 'region'
const activeSkillSubTab = ref('region');

const skillSubTabs = computed(() => {
    return Object.values(ThemeMap).map(item => ({
        key: item.key,
        label: item.cnName,
        iconName: `theme_${item.key.toLowerCase()}`
    }));
});

const skillOptionsMap: Record<string, readonly string[]> = {
    Region: BATTLE_REGIONS,
    TrainerGroup: THEME_TRAINER_GROUP,
    Fashion: THEME_FASHION,
    Other: THEME_OTHER
};

const exclusivityTabs = computed(() => {
    return Object.values(ExclusivityMap).map(item => ({
        key: item.key,
        label: item.cnName,
        iconName: `exclusivity_${item.key.toLowerCase()}`
    }));
});

// --- 选项配置 ---
const typeOptions = POKEMON_TYPES.filter(t => t !== '無');
const roleOptions = ROLE_TYPES;
const rarityOptions = [1, 2, 3, 4, 5, 6];

const filteredExRoleOptions = computed(() => {
    return roleOptions.filter(r => r !== '複合型');
});

// --- 图标获取逻辑 ---
const getUiIcon = (name: string) => new URL(`../assets/images/icon_${name}.png`, import.meta.url).href;

const getTypeIcon = (typeName: string) => {
    const entry = Object.values(TypeMap).find(t => t.cnName === typeName);
    const key = entry ? entry.key.toLowerCase() : 'normal';
    return getUiIcon(`type_${key}`);
};

const getRoleIcon = (type: 'normal' | 'ex', typeName: string) => {
    let t = type === 'ex' ? 'role_ex' : 'role';
    const entry = Object.values(RoleMap).find(t => t.cnName === typeName);
    let key = entry ? entry.key.toLowerCase() : 'strike';
    if (key.includes('_')) {
        key = key.split('_')[1];
    }
    return getUiIcon(`${t}_${key}`);
};

const getRarityIcon = (rarity: number) => {
    return new URL(`../assets/images/icon_rarity_${rarity}.png`, import.meta.url).href;
};

// --- 筛选状态 ---
const showFilterModal = ref(false);

const tempFilters = reactive(JSON.parse(JSON.stringify(syncCacheStore.savedFilters)));
watch(showFilterModal, (isOpen) => {
    if (isOpen) {
        const currentSaved = JSON.parse(JSON.stringify(syncCacheStore.savedFilters));
        // 逐个属性覆盖，保持 reactive 引用不变
        Object.assign(tempFilters, currentSaved);
        activeMainTab.value = 'basic';
    }
});

const sectionState = reactive<Record<string, boolean>>({
    exclusivity: true,
    variation: false,
    rarity: true,
    types: true,
    weaknesses: true,
    roles: true,
    exRoles: true,
});

const toggleSection = (key: string) => {
    sectionState[key] = !sectionState[key];
};

const activeFilterCount = computed(() => {
    const f = syncCacheStore.savedFilters;
    return f.exclusivity.length + f.types.length + f.weaknesses.length + f.roles.length + f.exRoles.length + (f.rarity?.length || 0);
});

const toggleFilter = (category: string, value: any) => {
    const list = tempFilters[category];
    const index = list.indexOf(value);
    if (index === -1) {
        list.push(value);
    } else {
        list.splice(index, 1);
    }
};

const resetFilters = () => {
    tempFilters.rarity = [];
    tempFilters.types = [];
    tempFilters.weaknesses = [];
    tempFilters.roles = [];
    tempFilters.exRoles = [];
    tempFilters.themes = [];
};

const applyFilters = () => {
    syncCacheStore.updateFilters(tempFilters);
    showFilterModal.value = false;
};

// --- 核心筛选逻辑 (包含复杂的星级/EX判断) ---
const filteredTrainers = computed(() => {
    let result = metaTrainer.value;
    const filters = syncCacheStore.savedFilters;
    const key = toTraditional(searchKey.value.trim().toLowerCase());

    if (key) {
        result = result.filter(t =>
            t.name.toLowerCase().includes(key) ||
            t.type.toLowerCase().includes(key)
        );
    }

    // 星级筛选逻辑：6星代表检查EX，1-5星代表检查基础星级
    if (filters.rarity.length > 0) {
        const requireEx = filters.rarity.includes(6);
        const selectedBaseRarities = filters.rarity.filter(r => r !== 6);

        result = result.filter(t => {
            // 如果选了6，必须有ex；没选6则忽略此条件
            const passEx = requireEx ? (t.ex === true) : true;

            // 如果选了基础星级，必须匹配其中之一；没选基础星级则忽略此条件
            const passRarity = selectedBaseRarities.length > 0
                ? selectedBaseRarities.includes(t.rarity)
                : true;

            return passEx && passRarity;
        });
    }

    if (filters.types.length > 0) {
        result = result.filter(t => filters.types.includes(t.type));
    }

    if (filters.weaknesses.length > 0) {
        result = result.filter(t => filters.weaknesses.includes(t.weakness));
    }

    if (filters.roles.length > 0) {
        result = result.filter(t => filters.roles.some(role => t.role.includes(role)));
    }

    if (filters.exRoles.length > 0) {
        result = result.filter(t => filters.exRoles.some(exrole => t.exRole.includes(exrole)));
    }

    if (filters.themes && filters.themes.length > 0) {
        result = result.filter(t => {
            if (!t.themes) return false;
            return filters.themes.every(tag => t.themes.includes(tag));
        });
    }
    if (filters.exclusivity.length > 0) {
        result = result.filter(t => filters.exclusivity.includes(t.exclusivity));
    }

    return result.sort((a: SyncMeta, b: SyncMeta) => {
        // 獲取比較的值
        const field = sortField.value;
        const valA = a[field];
        const valB = b[field];

        if (valA === valB) {
            const compare = a.id > b.id ? 1 : -1;
            return sortDesc.value ? -compare : compare;
        }
        const compare = (valA > valB) ? 1 : -1;
        return sortDesc.value ? -compare : compare;
    });
});

const handleSelect = (trainer: SyncMeta) => {
    emit('select-trainer', trainer.id);
    emit('close-modal');
};
</script>

<style scoped>
/* 根容器：Flex 纵向布局 */
.filter-container {
    block-size: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px;
    box-sizing: border-box;
    gap: 12px;
}

/* --- 搜索栏 --- */
.search-bar-container {
    flex-shrink: 0;
    display: flex;
    gap: 10px;
}

.input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
}

.sort-controls {
    display: flex;
    gap: 8px;
    align-items: center;
}

.sort-select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
    font-size: 13px;
    color: #333;
    cursor: pointer;
    outline: none;
}

.sort-direction-btn {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
}

.sort-direction-btn:hover,
.sort-select:hover {
    background-color: #f5f5f5;
    border-color: #ccc;
}

.filter-input {
    inline-size: 100%;
    padding: 10px 12px;
    padding-inline-end: 45px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.result-count {
    position: absolute;
    inset-inline-end: 10px;
    inset-block-start: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    font-weight: bold;
    color: #666;
    background-color: rgba(0, 0, 0, 0.06);
    padding: 2px 8px;
    border-radius: 12px;
    pointer-events: none;
    user-select: none;
}

.filter-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 16px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    color: #555;
    font-weight: 500;
    cursor: pointer;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.badge {
    background-color: #e74c3c;
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
    position: absolute;
    inset-block-start: -5px;
    inset-inline-end: -5px;
}

/* --- 列表容器：网格布局 --- */
.trainer-list {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: max-content;

    gap: 2px;
    padding: 2px;

    overflow-y: auto;
    flex: 1;
    min-block-size: 0;
}

/* --- 卡片项 (网格格子) --- */
.trainer-item {
    position: relative;
    inline-size: 100%;
    /* 强制正方形 */
    aspect-ratio: 1 / 1;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    background: transparent;
    /* border: 1px solid rgba(0, 0, 0, 0.1); */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.0);
    /* 确保内容居中撑满 */
    display: flex;
    align-items: center;
    justify-content: center;
    content-visibility: auto;
}

.trainer-item:active {
    transform: scale(0.95);
}

/* 图片容器 */
.image-wrapper {
    inline-size: 100%;
    block-size: 100%;
    position: relative;
}

/* 资源图片 */
.trainer-avatar {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
    display: block;
}

/* 悬浮图标 */
.trainer-meta-overlay {
    position: absolute;
    inset-block-end: 6px;
    inset-inline-end: 40px;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    pointer-events: none;
    z-index: 5;
}

.meta-icon {
    inline-size: 15px;
    block-size: 15px;
    object-fit: contain;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
}

/* .ex-icon {
    inline-size: 18px;
    block-size: 18px;
} */

/* --- 底部关闭按钮 --- */
.close-btn {
    flex-shrink: 0;
    inline-size: 100%;
    padding: 12px;
    background-color: #0b7a75;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    font-weight: bold;
}

.advanced-filter-modal {
    position: fixed;
    inset: 0;
    inline-size: 100vw;
    block-size: 100dvh;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-block-start: 5vh;

    backdrop-filter: blur(3px);
}

.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-active .filter-content,
.modal-leave-active .filter-content {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .filter-content,
.modal-leave-to .filter-content {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
}

.filter-content {
    inline-size: 90%;
    max-inline-size: 500px;
    max-block-size: 90dvh;
    display: flex;
    flex-direction: column;

    background-color: #f0f4f8;
    border-radius: 16px;
    overflow: hidden;

    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    background-image: url('../assets/images/bg2.png');
    background-size: cover;
    background-position: center;
}

.filter-header {
    padding: 16px 20px;
    border-block-end: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-image: url('../assets/images/bg2.png');
    background-size: cover;
}

.filter-header h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
    font-weight: 700;
}

.main-tabs-container {
    padding: 10px 16px;
    border-block-end: 1px solid rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
}

.segmented-control {
    display: flex;
    background-color: #e0e6ed;
    border-radius: 10px;
    padding: 4px;
    gap: 6px;

    inline-size: 100%;
}

.segment-btn {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #64748b;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;

    white-space: nowrap;
}

.segment-btn.active {
    background-color: white;
    color: #009688;
    /* 主题色 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.basic-filters-view {
    display: flex;
    flex-direction: column;
    gap: 13px;
    /* 每个大类（如星级、属性）之间的间距 */
    padding-block-end: 20px;
}

.mini-dot {
    display: inline-block;
    inline-size: 6px;
    block-size: 6px;
    background-color: #ff5252;
    border-radius: 50%;
    position: absolute;
    inset-block-start: 6px;
    inset-inline-end: 15%;
    /* 根据按钮宽度百分比定位 */
    box-shadow: 0 0 0 1px #fff;
    /* 加个白边增加对比度 */
}

.reset-icon-btn {
    background: transparent;
    border: none;
    padding: 8px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.reset-icon {
    inline-size: 22px;
    block-size: 22px;
    opacity: 0.75;
}

.skill-filters-view {
    display: flex;
    flex-direction: column;
    gap: 16px;
    block-size: 100%;
}

.skill-sub-tabs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(4, 1fr));
    gap: 8px;
    overflow-x: visible;
    padding: 0 16px 10px 16px;
    flex-shrink: 0;
}

.skill-sub-tabs::-webkit-scrollbar {
    display: none;
}

.skill-tab-pill {
    padding: 6px 14px 6px 10px;
    /* 左邊稍微少一點 padding，因為有圖標 */
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

    /* ✨ Flex 布局讓圖標和文字垂直居中 */
    display: flex;
    align-items: center;
    gap: 16px;
}

.skill-tab-pill.active {
    background-color: #009688;
    color: white;
    border-color: #009688;
    box-shadow: 0 2px 6px rgba(0, 150, 136, 0.3);
}

.pill-icon {
    inline-size: 20px;
    block-size: 20px;
    object-fit: contain;
}

.skill-tab-pill.active .pill-icon {
    opacity: 1;
}

/* 簡單的淡入淡出動畫，用於切換分類時 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* 技能文字按钮容器 */
.skill-options-container {
    flex: 1;
    overflow-y: auto;
}

.text-options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
    gap: 10px;
    padding: 5px 16px 40px 16px;
}

.option-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

    background-color: #fff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

    color: #334155;
    font-size: 13px;
    font-weight: 500;
}

.option-btn.active {
    background-color: #e0f2f1 !important;
    /* 淺青色背景 */
    border-color: #009688;
    /* 主題色邊框 */
    color: #00796b;
    /* 主題色文字 */
    font-weight: 700;
    box-shadow: inset 0 0 0 1px #009688;
    /* 模擬加粗邊框 */
}

/* 3. 交互反饋 (按下時縮放) */
.option-btn:active {
    transform: scale(0.96);
    background-color: #f8fafc;
}

.option-btn.icon-btn {
    flex-direction: column;
    /* 圖標可能需要垂直居中 */
    padding: 6px 0;
    min-block-size: 36px;
    border-radius: 18px;
    /* 膠囊形圓角 */
}

/* 變體 B: 圖標 + 文字按鈕 (用於特殊標籤) */
.option-btn.icon-text-btn {
    flex-direction: row;
    /* 水平排列 */
    gap: 8px;
    /* 圖標與文字間距 */
    padding: 8px 12px;
    min-block-size: 44px;
    border-radius: 12px;
    /* 圓角矩形 */
    inline-size: 100%;
}

/* 變體 C: 純文字按鈕 (用於隊伍技能 - 漣漪鎮等) */
.option-btn.text-btn {
    padding: 8px 12px;
    min-block-size: 36px;
    border-radius: 8px;
    line-height: 1.3;
    text-align: center;
    word-break: break-all;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.filter-body {
    /* ✨ 关键：自动占据剩余高度，且内容溢出时滚动 */
    flex: 1;
    min-block-size: 0;
    /* 防止被内容撑爆父容器 */

    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    /* iOS 丝滑滚动 */
    -webkit-overflow-scrolling: touch;
}


.trainer-list::-webkit-scrollbar,
.filter-body::-webkit-scrollbar {
    inline-size: 6px;
    block-size: 6px;
}

.trainer-list::-webkit-scrollbar-track,
.filter-body::-webkit-scrollbar-track {
    background: transparent;
}

.trainer-list::-webkit-scrollbar-thumb,
.filter-body::-webkit-scrollbar-thumb {
    background-color: rgba(0, 150, 136, 0.5);

    border-radius: 10px;

    border: 1px solid transparent;
    background-clip: content-box;
}

.trainer-list::-webkit-scrollbar-thumb:hover,
.filter-body::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 150, 136, 0.8);
    /* 变粗 */
    /* inline-size: 8px; */
}

/* --- Firefox 专用样式 (Firefox 不支持 -webkit- 前缀) --- */
.trainer-list,
.filter-body {
    /* auto: 默认粗细 | thin: 细滚动条 | none: 隐藏 */
    scrollbar-width: thin;

    /* 滑块颜色  轨道颜色 */
    scrollbar-color: rgba(0, 150, 136, 0.5) transparent;
}

.filter-section {
    display: flex;
    flex-direction: column;
    /* 防止内部折叠动画溢出 */
    overflow: visible;
}

.section-title {
    background: linear-gradient(90deg, #3b7c8e, #5daab8);
    color: white;
    padding: 6px 16px;
    font-size: 14px;
    font-weight: bold;
    border-radius: 20px;
    margin-block-end: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}

.arrow-icon {
    font-size: 12px;
    transition: transform 0.3s ease;
}

.arrow-icon.rotated {
    transform: rotate(180deg);
}

/* 折叠动画 */
.collapse-enter-active,
.collapse-leave-active {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    max-block-size: 500px;
    opacity: 1;
    overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
    max-block-size: 0;
    opacity: 0;
    margin: 0 !important;
    padding: 0 !important;
}

.filter-footer {
    flex-shrink: 0;
    padding: 16px;
    background-image: url('../assets/images/bg2.png');
    background-size: cover;
    border-block-start: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 12px;
}

.cancel-btn,
.confirm-btn {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    border: none;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
}

.cancel-btn {
    background-color: #f1f5f9;
    color: #64748b;
}

.confirm-btn {
    background-color: #0b7a75;
    color: white;
}

/* 筛选选项样式 */
.options-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    padding: 4px;
    /* 留出陰影空間 */
}

.options-grid.exclusivity,
.options-grid.wide {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
}

.filter-icon {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
    max-inline-size: 24px;
    max-block-size: 24px;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
}

.option-btn.icon-text-btn .filter-icon {
    max-inline-size: 15px;
    max-block-size: 15px;
}

@media (hover: hover) {
    .option-btn.icon-btn:hover {
        transform: translateY(-2px);
        background-color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
}

.option-btn.icon-btn:active {
    transform: scale(0.95);
    background-color: rgba(255, 255, 255, 0.9);
}
</style>