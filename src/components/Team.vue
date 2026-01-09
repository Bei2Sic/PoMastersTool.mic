<template>
    <div class="team-builder-root">
        <div class="team-dock">
            <div v-for="(slot, index) in 3" :key="index" class="dock-slot"
                :class="{ 'is-active': activeSlotIndex === index }" @click="handleSlotClick(index)">
                <div v-if="!team[index]" class="empty-slot">
                    <div class="add-icon">+</div>
                    <span class="slot-label">添加</span>
                </div>

                <div v-else class="filled-slot">
                    <img :src="getTrainerAvatar(team[index])" class="slot-avatar" />

                    <div class="role-badge" :class="getRoleClass(team[index])">
                        {{ getRoleLabel(team[index]) }}
                    </div>

                    <button class="remove-btn" @click.stop="handleRemoveTeammate(index)">×</button>
                </div>

                <div v-if="activeSlotIndex === index" class="active-indicator"></div>
            </div>
        </div>

        <div class="main-content">

            <div class="left-stage">
                <button v-show="isMobileView" class="floating-btn menu-pos" @click="showMobilePanel = !showMobilePanel">
                    <img src="@/assets/images/bg_pokeball.png" class="btn-icon" alt="Menu" />
                </button>

                <div v-if="activeSync" class="grid-wrapper">
                    <Grid :key="activeSlotIndex" :grid-data="currentGridInfo.gridData" :trainer="currentTrainer"
                        :current-rarity="currentDynamicState.currentRarity"
                        :bonus-level="currentDynamicState.bonusLevel" :cost-orbs="currentGridInfo.costOrbs"
                        :last-energy="currentGridInfo.lastEnergy" :cost-fiery-orbs="currentGridInfo.costFieryOrbs"
                        :cost-leaf-orbs="currentGridInfo.costLeafOrbs"
                        :cost-bubbly-orbs="currentGridInfo.costBubblyOrbs"
                        :cost-sparky-orbs="currentGridInfo.costSparkyOrbs" :cost-t-m-orbs="currentGridInfo.costTMOrbs"
                        :is-tile-reachable="exportMethods.isTileReachable"
                        :get-tile-border-url="exportMethods.getTileBorderUrl"
                        :get-tile-fill-url="exportMethods.getTileFillUrl" :get-trainer-avatar-url="getTrainerUrl"
                        :fix-tile-name="exportMethods.fixTileName" :toggle-tile="exportMethods.toggleTile"
                        :check-selected-tiles="exportMethods.checkSelectedTiles"
                        :on-trainer-click="toggleTrainerSelect" />
                </div>

                <div v-else class="empty-stage-guide">
                    <p>👈 请先在顶部选择一个拍组</p>
                    <button class="btn-primary" @click="showFilterModal = true">打开拍组列表</button>
                </div>
            </div>

            <div class="right-stage" :class="{ 'mobile-show': showMobilePanel }">
                <button v-if="isMobileView" class="mobile-panel-close" @click="showMobilePanel = false">×</button>

                <div class="tab-bar segmented-bar">
                    <div class="tab-inner">
                        <button class="tab-btn" :class="{ active: curTab === 'info' }" @click="curTab = 'info'">
                            配置信息
                        </button>
                        <button class="tab-btn" :class="{ active: curTab === 'grid-list' }"
                            @click="curTab = 'grid-list'">
                            石盘列表
                        </button>
                        <button class="tab-btn" :class="{ active: curTab === 'calc' }" @click="curTab = 'calc'">
                            伤害计算
                        </button>
                    </div>
                </div>

                <div class="pokemon-name" v-if="activeSync">
                    {{ exportMethods.getSyncName() }}
                </div>

                <div class="info-content" v-if="activeSync">

                    <Info v-show="curTab === 'info'" :level-value="currentDynamicState.level"
                        :current-rarity-value="currentDynamicState.currentRarity"
                        :potential-value="currentDynamicState.potential"
                        :ex-role-enabled-value="currentDynamicState.exRoleEnabled"
                        :bonus-level="currentDynamicState.bonusLevel"
                        :selected-pokemon-index="currentDynamicState.selectedPokemonIndex"
                        :trainer="exportMethods.getTrainer()" :themes="exportMethods.getThemes()"
                        :special-awaking="exportMethods.getSpecialAwaking()"
                        :variation-list="exportMethods.getvariationList()" :final-stats="currentFinalStats"
                        :final-moves="currentFinalMoves" :pokemon="currentPokemon"
                        @update:levelValue="(val) => currentDynamicState.level = val"
                        @update:currentRarityValue="(val) => currentDynamicState.currentRarity = val"
                        @update:potentialValue="(val) => currentDynamicState.potential = val"
                        @update:exRoleEnabledValue="(val) => currentDynamicState.exRoleEnabled = val"
                        @update:selectedPokemonIndex="(val) => currentDynamicState.selectedPokemonIndex = val" />

                    <div v-show="curTab === 'grid-list'" class="grid-list-panel">
                        <div class="selected-info">
                            <div class="selected-content">
                                <div v-for="tile in sortSelectedTiles" :key="tile.id" class="selected-item">
                                    <div class="selected-header"
                                        :style="{ backgroundColor: tile.color, borderColor: tile.color }">
                                        {{ tile.name }}
                                    </div>
                                    <div class="selected-description" :style="{ borderColor: tile.color }">
                                        {{ tile.description }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="curTab === 'calc'" class="calc-panel-wrapper">
                        <Damage :visible="true" :targetSync="null" :teamSyncs="null" @close="() => { }" />
                    </div>

                </div>

                <div v-else class="info-empty">
                    请选择拍组以查看详情
                </div>
            </div>

        </div>

        <transition name="modal">
            <div v-if="showFilterModal" class="modal-overlay" @click="showFilterModal = false">
                <div class="modal-content" @click.stop>
                    <h3 class="modal-title">为位置 {{ activeSlotIndex + 1 }} 选择拍组</h3>
                    <Filter class="filter-component-wrapper" @select-trainer="handleSelectTrainer"
                        @close-modal="showFilterModal = false" />
                </div>
            </div>
        </transition>

    </div>
</template>

<script setup lang="ts">
import { useSyncElemStore } from '@/stores/syncElem';
import { Sync } from '@/types/syncModel';
import { getTrainerUrl } from '@/utils/format';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

// 组件引入
import Damage from '@/components/Damage.vue';
import Filter from '@/components/Filter.vue';
import Grid from '@/components/Grid.vue';
import Info from '@/components/Info.vue';

// --- Store ---
const syncStore = useSyncElemStore();
const {
    team,
    activeSlotIndex,
    activeSync,
    // 以下是 getter 映射，确保 store 里有对应的 getter
    currentGridInfo,
    currentDynamicState,
    currentFinalStats,
    currentFinalMoves,
    currentPokemon,
    exportMethods
} = storeToRefs(syncStore);

// --- State ---
const showFilterModal = ref(false);
const showMobilePanel = ref(false);
const curTab = ref('info');
const isMobileView = ref(window.innerWidth <= 900);

// --- Computed Helpers ---
const currentTrainer = computed(() => exportMethods.value?.getTrainer?.());

// 石盘排序逻辑 (复用)
const sortSelectedTiles = computed(() => {
    if (!currentGridInfo.value?.selectedTiles) return [];

    const colorPriority: Record<string, number> = {
        "#FF80BF": 1, "#779EFF": 2, "#47D147": 3,
        "#BF80FF": 4, "#FF0066": 5, "#FFC266": 6,
    };
    return [...currentGridInfo.value.selectedTiles].sort((a, b) => {
        const priorityA = colorPriority[a.color] ?? 999;
        const priorityB = colorPriority[b.color] ?? 999;
        return priorityA - priorityB;
    });
});

// --- Methods ---

// 点击槽位：切换当前编辑的拍组
const handleSlotClick = (index: number) => {
    // 如果点击的是当前已选中的，且为空，打开筛选器
    if (activeSlotIndex.value === index && !team.value[index]) {
        showFilterModal.value = true;
        return;
    }

    // 切换 activeSlotIndex
    syncStore.switchActiveSlot(index);

    // 如果切换过去是空的，自动打开筛选器 (可选体验优化)
    if (!team.value[index]) {
        // showFilterModal.value = true; 
    }
};

// 选择拍组回调
const handleSelectTrainer = (trainerId: string) => {
    try {
        // 直接调用 action：将 trainerId 加载到当前 activeSlotIndex
        syncStore.selectSyncToActiveSlot(trainerId);
        showFilterModal.value = false;
    } catch (e) {
        console.error(e);
    }
};

// 移除队员
const handleRemoveTeammate = (index: number) => {
    syncStore.updateTeamSlot(index, null);
};

// 辅助：获取头像 (简单示意，需要根据你的数据结构调整)
const getTrainerAvatar = (sync: Sync) => {
    if (!sync) return '';
    // 假设 sync 对象里有 helper 方法或者 rawData
    // 这里复用 getTrainerUrl 工具
    const trainer = sync.rawData.trainer;
    return getTrainerUrl(trainer.enActor, trainer.dexNumber, trainer.rarity, trainer.count)
};

// 辅助：获取 Role 样式
const getRoleClass = (sync: any) => {
    // 根据 sync.rawData.role 返回对应的颜色类
    // 比如 'bg-red-500', 'bg-blue-500', 'bg-green-500'
    return 'bg-gray-400'; // 默认
};
const getRoleLabel = (sync: any) => {
    // 返回 '攻', '技', '辅'
    return 'S';
};

const toggleTrainerSelect = () => {
    showFilterModal.value = true;
};

// 监听窗口大小
window.addEventListener('resize', () => {
    isMobileView.value = window.innerWidth <= 900;
});

</script>

<style scoped>
/* 全局容器 */
.team-builder-root {
    display: flex;
    flex-direction: column;
    block-size: 100vh;
    inline-size: 100vw;
    background-color: #f0f2f5;
    overflow: hidden;
}

/* --- 1. Team Dock (顶部悬浮栏) --- */
.team-dock {
    flex: 0 0 70px;
    /* 固定高度 */
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 50;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 0 10px;
}

.dock-slot {
    inline-size: 50px;
    block-size: 50px;
    border-radius: 50%;
    background: #e2e8f0;
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
}

/* 选中状态 */
.dock-slot.is-active {
    transform: scale(1.1);
    border-color: #568dd1;
    box-shadow: 0 0 0 3px rgba(86, 141, 209, 0.2);
}

/* 选中下面的小点指示器 */
.active-indicator {
    position: absolute;
    inset-block-end: -8px;
    inset-inline-start: 50%;
    transform: translateX(-50%);
    inline-size: 6px;
    block-size: 6px;
    background: #568dd1;
    border-radius: 50%;
}

.empty-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    block-size: 100%;
    color: #94a3b8;
}

.add-icon {
    font-size: 20px;
    line-height: 1;
    font-weight: bold;
}

.slot-label {
    font-size: 10px;
}

.filled-slot {
    inline-size: 100%;
    block-size: 100%;
    position: relative;
}

.slot-avatar {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
    border-radius: 50%;
    border: 2px solid white;
}

.role-badge {
    position: absolute;
    inset-block-end: -2px;
    inset-inline-end: -2px;
    inline-size: 16px;
    block-size: 16px;
    background: #64748b;
    color: white;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid white;
}

.remove-btn {
    position: absolute;
    inset-block-start: -5px;
    inset-inline-end: -5px;
    inline-size: 16px;
    block-size: 16px;
    border-radius: 50%;
    background: #ef4444;
    color: white;
    border: none;
    font-size: 12px;
    display: none;
    /* 默认隐藏 */
    align-items: center;
    justify-content: center;
}

.dock-slot:hover .remove-btn {
    display: flex;
}

/* --- 2. Main Content (主舞台) --- */
.main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
    background-color: rgba(255, 255, 255, 0.1);
}

/* 左侧：石盘区 */
.left-stage {
    flex: 1;
    /* 占据剩余空间 */
    position: relative;
    display: flex;
    flex-direction: column;
    border-inline-end: 1px solid #ddd;
    background-image: url('../assets/images/bg1.png');
    /* 复用背景 */
}

.grid-wrapper {
    flex: 1;
    overflow: hidden;
}

.empty-stage-guide {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    block-size: 100%;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.btn-primary {
    margin-block-start: 10px;
    padding: 8px 16px;
    background: #568dd1;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

/* 右侧：配置/计算区 */
.right-stage {
    inline-size: 450px;
    /* 固定宽度，或者 flex-basis */
    display: flex;
    flex-direction: column;
    background: white;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.05);
    z-index: 40;
}

/* 复用原有的样式 */
.tab-bar {
    /* ... */
}

.pokemon-name {
    /* ... */
}

.info-content {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
}

/* --- Mobile Response --- */
@media (max-width: 900px) {
    .team-dock {
        flex: 0 0 60px;
        /* 稍微变小 */
    }

    .left-stage {
        inline-size: 100vw;
        border-inline-end: none;
    }

    .right-stage {
        position: fixed;
        inset-block-start: 60px;
        /* 留出 Dock 的位置 */
        inset-block-end: 0;
        inset-inline-start: 0;
        inline-size: 100vw;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 100;
        box-shadow: none;
        /* 移动端不需要侧边阴影 */
    }

    .right-stage.mobile-show {
        transform: translateX(0);
    }

    /* 浮动按钮样式 (复用) */
    .floating-btn {
        /* ... */
    }

    .mobile-panel-close {
        /* ... */
    }
}

/* 复用原有的滚动条、弹窗样式等 */
.modal-overlay {
    /* ... */
}
</style>