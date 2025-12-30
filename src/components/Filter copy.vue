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
            <button class="filter-toggle-btn" @click="showFilterModal = true">
                <span class="icon-filter">≡</span> 篩選
                <span v-if="activeFilterCount > 0" class="badge">{{ activeFilterCount }}</span>
            </button>
        </div>

        <div class="trainer-list">
            <div v-if="filteredTrainers.length === 0" class="no-result">
                未找到匹配的拍組，請更換關鍵詞或篩選條件～
            </div>
            <div v-for="trainer in filteredTrainers" :key="trainer.id" class="trainer-item"
                :class="'bg_' + getTypeInfoWithCnName(trainer.type).key.toLowerCase()" @click="handleSelect(trainer)">
                <img :src="getTrainerUrl(trainer.enActor, trainer.dexNumber, trainer.rarity, trainer.count)" alt="trainer" class="trainer-avatar" />
                <div class="trainer-info">
                    <div class="trainer-name">{{ trainer.name }}</div>
                    <div class="trainer-meta">
                        <img :src="getRoleIcon('normal', trainer.role)" :alt="trainer.role" class="meta-icon" />
                        <!-- <img :src="getTypeIcon(trainer.type)" :alt="trainer.type" class="meta-icon" /> -->
                        <img v-if="trainer.exRole" :src="getRoleIcon('ex', trainer.exRole)" :alt="trainer.exRole"
                            class="meta-icon" />
                    </div>
                </div>
            </div>
        </div>

        <button class="close-btn" @click="emit('close-modal')">關閉窗口</button>

        <div v-if="showFilterModal" class="advanced-filter-modal" @click.self="showFilterModal = false">
            <div class="filter-content">
                <div class="filter-header">
                    <h3>筛选条件</h3>
                    <button class="reset-icon-btn" @click="resetFilters" title="重置筛选">
                        <img :src="getUiIcon('rotate')" alt="重置" class="reset-icon" />
                    </button>
                </div>

                <div class="filter-body">
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
                                <div v-for="exrole in filteredExRoleOptions" :key="exrole" class="option-btn icon-btn"
                                    :class="{ active: tempFilters.exRoles.includes(exrole) }"
                                    @click="toggleFilter('exRoles', exrole)">
                                    <img :src="getRoleIcon('ex', exrole)" :alt="exrole" class="filter-icon" />
                                </div>
                            </div>
                        </transition>
                    </div>
                </div>

                <div class="filter-footer">
                    <button class="cancel-btn" @click="showFilterModal = false">取消</button>
                    <button class="confirm-btn" @click="applyFilters">確認</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    POKEMON_TYPES,
    ROLE_TYPES
} from "@/constances/battle";
import { RoleMap, TypeMap } from "@/constances/map";
import { getTypeInfoWithCnName } from '@/core/exporter/map';
import { useSyncCacheStore } from "@/stores/syncCache";
import { SyncMeta } from "@/types/syncModel";
import { getTrainerUrl } from '@/utils/format';
import { Converter } from 'opencc-js';
import { computed, reactive, ref } from 'vue';

// --- 基础数据 ---
const syncCacheStore = useSyncCacheStore();
const metaTrainer = computed(() => syncCacheStore.getMeta);
const searchKey = ref('');
const emit = defineEmits(['select-trainer', 'close-modal']);

// --- 简繁转换 ---
const converter = Converter({ from: 'cn', to: 'tw' });
const toTraditional = (text: string) => text ? converter(text) : '';

// --- 高级筛选配置数据 ---
const typeOptions = POKEMON_TYPES.filter(t => t !== '無');
const roleOptions = ROLE_TYPES;
const rarityOptions = [1, 2, 3, 4, 5, 6];

const filteredExRoleOptions = computed(() => {
    return roleOptions.filter(r => r !== '複合型');
});

// --- 获取icon ---
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

// --- 筛选状态管理 ---
const showFilterModal = ref(false);

const tempFilters = reactive({
    types: [],
    weaknesses: [],
    rarity: [],
    roles: [],
    exRoles: [],
    regions: []
});

const sectionState = reactive<Record<string, boolean>>({
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
    return f.types.length + f.weaknesses.length + f.roles.length + f.exRoles.length + (f.rarity?.length || 0);
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
    tempFilters.regions = [];
};

const applyFilters = () => {
    // 调用 Store 的 action 保存状态
    syncCacheStore.updateFilters(tempFilters);

    showFilterModal.value = false;
};

// --- 核心筛选逻辑 ---
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

    if (filters.rarity.length > 0) {
        const requireEx = filters.rarity.includes(6);
        const selectedBaseRarities = filters.rarity.filter(r => r !== 6);

        result = result.filter(t => {
            const passEx = requireEx ? (t.ex === true) : true;

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

    return result;
});

const handleSelect = (trainer: SyncMeta) => {
    emit('select-trainer', trainer.id);
    emit('close-modal');
};
</script>

<style scoped>
.filter-container {
    block-size: 100%;
    /* 撑满父级 .modal-content */
    display: flex;
    flex-direction: column;
    padding: 16px;
    /* 原本在 modal-content 里的 padding 移到这里 */
    box-sizing: border-box;
}

/* ... (搜索栏和列表样式保持不变) ... */
.search-bar-container {
    flex-shrink: 0;
    display: flex;
    gap: 10px;
    margin-block-end: 10px;
}

.input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
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

.filter-toggle-btn:hover {
    background-color: #f9f9f9;
}

.icon-filter {
    font-size: 18px;
    font-weight: bold;
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

.trainer-list {
    flex: 1;
    min-block-size: 0;
    /* 防止内容撑破 flex 容器 */

    overflow-y: auto;
    gap: 8px;
    display: flex;
    flex-direction: column;
    margin-block-end: 10px;
    padding-inline-end: 4px;

    /* iOS 滚动优化 */
    -webkit-overflow-scrolling: touch;
}

.trainer-list::-webkit-scrollbar {
    inline-size: 6px;
    block-size: 6px;
}

.trainer-list::-webkit-scrollbar-track,
.filter-body::-webkit-scrollbar-track {
    background: transparent;
}

.trainer-list::-webkit-scrollbar-thumb,
.filter-body::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    border: 1px solid transparent;
    background-clip: content-box;
}

.trainer-list::-webkit-scrollbar-thumb:hover,
.filter-body::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.4);
}

.trainer-list,
.filter-body {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.trainer-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    background-color: #fff;
    border: 1px solid #eee;
    cursor: pointer;
    transition: all 0.2s;
}

.trainer-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.trainer-avatar {
    inline-size: 48px;
    block-size: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.trainer-name {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-block-end: 4px;
}

.trainer-meta {
    display: flex;
    gap: 6px;
}

.meta-icon {
    inline-size: 15px;
    block-size: 15px;
    object-fit: contain;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
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

.filter-content {
    inline-size: 90%;
    /* 宽度占屏幕 90% */
    max-inline-size: 500px;
    max-block-size: 90dvh;
    /* 2. 必须是 flex 布局，才能让中间 body 滚动 */
    display: flex;
    flex-direction: column;

    background-color: #f0f4f8;
    border-radius: 16px;
    overflow: hidden;
    /* 圆角裁切 */

    /* 阴影和背景 */
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
    background-position: center;
}

.filter-header h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
    font-weight: 700;
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
    transition: background-color 0.2s, transform 0.2s;
}

.reset-icon-btn:hover {
    background-color: rgba(0, 0, 0, 0.08);
}

.reset-icon-btn:active {
    transform: rotate(-60deg) scale(0.9);
}

.reset-icon {
    inline-size: 22px;
    block-size: 22px;
    object-fit: contain;
    opacity: 0.75;
    transition: opacity 0.2s;
}

.reset-icon-btn:hover .reset-icon {
    opacity: 1;
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

/* ✨✨✨ 修改点：标题样式，添加小箭头支持 ✨✨✨ */
.section-title {
    background: linear-gradient(90deg, #3b7c8e, #5daab8);
    color: white;
    padding: 6px 16px;
    font-size: 14px;
    font-weight: bold;
    border-radius: 20px;
    margin-block-end: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    align-self: center;
    min-inline-size: 120px;

    /* 增加交互 */
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
}

/* 小箭头样式 */
.arrow-icon {
    font-size: 12px;
    margin-inline-start: 8px;
    transition: transform 0.3s ease;
}

.arrow-icon.rotated {
    transform: rotate(180deg);
}

/* ✨✨✨ 新增：折叠动画 ✨✨✨ */
.collapse-enter-active,
.collapse-leave-active {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    max-block-size: 500px;
    /* 足够大即可 */
    opacity: 1;
    overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
    max-block-size: 0;
    opacity: 0;
    /* 确保收起时没有 residual spacing */
    margin-block-start: 0 !important;
    margin-block-end: 0 !important;
    padding-block-start: 0 !important;
    padding-block-end: 0 !important;
}

.filter-footer {
    /* 防止被压缩 */
    flex-shrink: 0;

    padding: 16px;
    /* ✨ 因为悬浮在中间，不需要 safe-area padding 了，普通的 padding 就够 */

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

.close-btn {
    flex-shrink: 0;
    /* margin-block-start: 10px; */
    /* 确保按钮高度不会被挤压 */

    inline-size: 100%;
    padding: 8px;
    background-color: #0b7a75;
    /* 这里您之前写了颜色，我保留了 */
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;

    /* margin-block-start: auto; // 有了 flex:1 后，这个其實可有可無，但留着也没事 */
    margin-block-start: auto;
}

.options-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
}

.option-btn.icon-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6px;
    /* ✨ 修改 3: 增加圆角，让它变得更圆润 (可以根据喜好调整数值，比如 16px, 20px 或 50%) */
    border-radius: 30px;
    min-block-size: 44px;
    background-color: rgba(230, 224, 224, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.filter-icon {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
    max-inline-size: 32px;
    max-block-size: 32px;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
}

.option-btn.active {
    background-color: #e0f7fa !important;
    border-color: #00bcd4;
    box-shadow: 0 0 0 2px #00bcd4, 0 4px 8px rgba(0, 188, 212, 0.2);
    transform: none;
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