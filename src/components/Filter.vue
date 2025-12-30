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
import { POKEMON_TYPES, ROLE_TYPES } from "@/constances/battle";
import { RoleMap, TypeMap } from "@/constances/map";
import { useSyncCacheStore } from "@/stores/syncCache";
import { SyncMeta } from "@/types/syncModel";
import { getTrainerUrl } from '@/utils/format';
import { Converter } from 'opencc-js';
import { computed, reactive, ref } from 'vue';

// --- 数据准备 ---
const syncCacheStore = useSyncCacheStore();
const metaTrainer = computed(() => syncCacheStore.getMeta);
const searchKey = ref('');
const emit = defineEmits(['select-trainer', 'close-modal']);

// --- 简繁转换 ---
const converter = Converter({ from: 'cn', to: 'tw' });
const toTraditional = (text: string) => text ? converter(text) : '';

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

    return result;
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
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    grid-auto-rows: max-content;

    /* gap: 2px; */
    /* padding: 2px; */

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
    background-color: #f0f0f0;
    /* border: 1px solid rgba(0, 0, 0, 0.1); */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    /* 确保内容居中撑满 */
    display: flex;
    align-items: center;
    justify-content: center;
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

/* --- 通用滚动条美化 (Webkit内核: Chrome, Safari, Edge) --- */

/* 1. 滚动条整体宽度 */
.trainer-list::-webkit-scrollbar,
.filter-body::-webkit-scrollbar {
    inline-size: 6px;
    /* 纵向滚动条宽度 (更细一点显得精致) */
    block-size: 6px;
    /* 横向滚动条高度 */
}

/* 2. 滚动条轨道 (Track) */
.trainer-list::-webkit-scrollbar-track,
.filter-body::-webkit-scrollbar-track {
    background: transparent;
    /* 完全透明，显得更现代 */
    /* 或者极其淡的背景: background: rgba(0, 0, 0, 0.02); */
}

/* 3. 滚动条滑块 (Thumb) */
.trainer-list::-webkit-scrollbar-thumb,
.filter-body::-webkit-scrollbar-thumb {
    /* 使用半透明的主题色，更有质感 */
    background-color: rgba(0, 150, 136, 0.5);
    /* 对应 #009688 的半透明版 */

    border-radius: 10px;
    /* 完全圆角 */

    /* 增加透明边框，制造一种“悬浮”的视觉效果 */
    border: 1px solid transparent;
    background-clip: content-box;
}

/* 4. 滑块悬停状态 (Hover) */
.trainer-list::-webkit-scrollbar-thumb:hover,
.filter-body::-webkit-scrollbar-thumb:hover {
    /* 鼠标移上去变深，提示可点击 */
    background-color: rgba(0, 150, 136, 0.8);

    /* 或者变粗一点点 */
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
    gap: 10px;
}

.option-btn.icon-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6px;
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
    box-shadow: 0 0 0 2px #00bcd4;
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