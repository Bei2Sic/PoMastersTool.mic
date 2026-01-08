<template>
    <div class="root-container">
        <!-- 左侧石盘区域 -->
        <div class="left-panel">
            <button v-show="isSingleView" class="floating-btn menu-pos" @click="showMobilePanel = !showMobilePanel">
                <img src="@/assets/images/bg_pokeball.png" class="btn-icon" alt="Menu" />
            </button>

            <Grid v-model:bonusLevel="dynamicState.bonusLevel" :grid-data="finalGrid.gridData" :trainer="trainer"
                :current-rarity="dynamicState.currentRarity" :bonus-level="dynamicState.bonusLevel"
                :cost-orbs="finalGrid.costOrbs" :last-energy="finalGrid.lastEnergy"
                :cost-fiery-orbs="finalGrid.costFieryOrbs" :cost-leaf-orbs="finalGrid.costLeafOrbs"
                :cost-bubbly-orbs="finalGrid.costBubblyOrbs" :cost-sparky-orbs="finalGrid.costSparkyOrbs"
                :cost-t-m-orbs="finalGrid.costTMOrbs" :is-tile-reachable="syncMethods.isTileReachable"
                :get-tile-border-url="syncMethods.getTileBorderUrl" :get-tile-fill-url="syncMethods.getTileFillUrl"
                :get-trainer-avatar-url="getTrainerUrl" :fix-tile-name="syncMethods.fixTileName"
                :toggle-tile="syncMethods.toggleTile" :check-selected-tiles="syncMethods.checkSelectedTiles"
                :on-trainer-click="toggleTrainerSelect" />

            <!-- 彈窗篩選拍組窗口 -->
            <transition name="modal">
                <div v-if="showFilterModal" class="modal-overlay" @click="showFilterModal = false">
                    <div class="modal-content" @click.stop>
                        <h3 class="modal-title">选择拍组</h3>
                        <Filter class="filter-component-wrapper" @select-trainer="handleSelectTrainer"
                            @close-modal="showFilterModal = false" />
                    </div>
                </div>
            </transition>
        </div>

        <div class="right-panel" :class="{ 'mobile-show': showMobilePanel }">
            <button v-if="isSingleView" class="mobile-panel-close" @click="showMobilePanel = false">
                ×
            </button>
            <div class="tab-bar segmented-bar">
                <div class="tab-inner">
                    <button class="tab-btn" :class="{ active: curTab === 'grid' }" @click="curTab = 'grid'">
                        石盤一覽
                    </button>
                    <button class="tab-btn" :class="{ active: curTab === 'info' }" @click="curTab = 'info'">
                        拍組信息
                    </button>
                    <button class="tab-btn" :class="{ active: curTab === 'calc' }" @click="curTab = 'calc'">
                        傷害計算
                    </button>
                </div>
            </div>
            <div class="pokemon-name">{{ syncMethods.getSyncName() }}</div>
            <div class="info-content">
                <div v-if="curTab === 'grid'" class="grid-panel">
                    <div class="selected-info">
                        <div class="selected-content">
                            <div v-for="tile in sortSelectedTiles" :key="tile.id" class="selected-item">

                                <div class="selected-header" :style="{
                                    backgroundColor: tile.color,
                                    borderColor: tile.color
                                }">
                                    {{ tile.name }}
                                </div>

                                <div class="selected-description" :style="{ borderColor: tile.color }">
                                    {{ tile.description }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Info v-else-if="curTab === 'info'" :level-value="dynamicState.level"
                    :current-rarity-value="dynamicState.currentRarity" :potential-value="dynamicState.potential"
                    :ex-role-enabled-value="dynamicState.exRoleEnabled" :bonus-level="dynamicState.bonusLevel"
                    :selected-pokemon-index="dynamicState.selectedPokemonIndex" :trainer="syncMethods.getTrainer()"
                    :themes="syncMethods.getThemes()" :special-awaking="syncMethods.getSpecialAwaking()"
                    :variation-list="syncMethods.getvariationList()" :final-stats="finalStats" :final-moves="finalMoves"
                    :pokemon="pokemon" @update:levelValue="(val) => dynamicState.level = val"
                    @update:currentRarityValue="(val) => dynamicState.currentRarity = val"
                    @update:potentialValue="(val) => dynamicState.potential = val"
                    @update:exRoleEnabledValue="(val) => dynamicState.exRoleEnabled = val"
                    @update:selectedPokemonIndex="(val) => dynamicState.selectedPokemonIndex = val" />
            </div>
        </div>

        <Damage :visible="showDamageCalc" :targetSync="activeSync" :teamSyncs="null" @close="handleCloseCalc" />

    </div>
</template>

<script setup>
import Damage from '@/components/Damage.vue';
import Filter from '@/components/Filter.vue';
import Grid from '@/components/Grid.vue';
import Info from '@/components/Info.vue';
import { useSyncElemStore } from "@/stores/syncElem";
// import { PotentialSkills } from '@/type/const';
import { getTrainerUrl } from '@/utils/format';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

// 缓存数据
const syncElemStore = useSyncElemStore();
const finalStats = computed(() => syncElemStore.currentFinalStats);
const finalMoves = computed(() => syncElemStore.currentFinalMoves);
const finalGrid = computed(() => syncElemStore.currentGridInfo);
const syncMethods = computed(() => syncElemStore.exportMethods);
const dynamicState = computed(() => syncElemStore.currentDynamicState);
const pokemon = computed(() => syncElemStore.currentPokemon);
const trainer = computed(() => {
    const res = syncMethods.value.getTrainer();
    return res;
});
// 筛选拍组
const showFilterModal = ref(false);
// 设备移动端
// const showInfo = ref(false);
const isSingleView = ref(window.innerWidth <= 900);
const showMobilePanel = ref(false);
// 信息切换页
const curTab = ref('grid');

const showDamageCalc = ref(false);

const { activeSync } = storeToRefs(syncElemStore);
// const { themeSnapshot, passiveSnapshot, statSnapshot, finalDamageResult } = useDamageCalculator(singleSync);

// 潜能相关
// const currentType = ref(1);
// const filteredPotentials = computed(() => {
//     return PotentialSkills.filter(item => item.type === currentType.value);
// });
// const isPotentialWindowOpen = ref(false);
// // 切换窗叶显示/隐藏（点击“潜能区域”或关闭按钮触发）
// const togglePotentialPanel = () => {
//     isPotentialWindowOpen.value = !isPotentialWindowOpen.value;
// };

const toggleTrainerSelect = () => {
    showFilterModal.value = true;
}

const handleSelectTrainer = (trainerId) => {
    try {
        if (!trainerId) {
            console.warn('选择失败：拍组 ID 无效');
            return;
        }
        // 调用 Pinia 的 action 选中拍        syncElemStore.selectSingleSync(trainerId);
        syncElemStore.selectSyncToActiveSlot(trainerId);
        console.log(`成功选中拍组：${trainerId}`);
    } catch (error) {
        console.error('选中拍组失败：', error);
        // 提示错误
    }
};

const handleCloseCalc = () => {
    showDamageCalc.value = false;
    curTab.value = 'grid';
};

const sortSelectedTiles = computed(() => {
    const colorPriority = {
        "#FF80BF": 1,
        "#779EFF": 2,
        "#47D147": 3,
        "#BF80FF": 4,
        "#FF0066": 5,
        "#FFC266": 6,
    };
    return [...finalGrid.value.selectedTiles].sort((a, b) => {
        // 獲取優先級，如果顏色不在列表裡，給一個很大的數字 (999) 讓它排在最後
        const priorityA = colorPriority[a.color] ?? 999;
        const priorityB = colorPriority[b.color] ?? 999;

        return priorityA - priorityB;
    });
})

watch(curTab, (newTab) => {
    if (newTab === 'calc') {
        showDamageCalc.value = true;
    }
});

// watch(themeSnapshot, (newValue) => {
//     if (newValue) {
//         console.log("✅ 計算器成功算出組隊技能:", newValue);
//     } else {
//         console.log("⏳ 計算結果為空 (可能數據尚未加載)");
//     }
// }, { immediate: true });

// watch(passiveSnapshot, (newValue) => {
//     if (newValue && newValue.length > 0) {
//         console.log("✅ 計算器成功算出被動技能:", newValue);
//     } else {
//         console.log("⏳ 計算結果為空 (可能數據尚未加載)");
//     }
// }, { immediate: true });

// watch(statSnapshot, (newValue) => {
//     if (newValue && newValue.length > 0) {
//         console.log("✅ 計算器成功算出白值數據:", newValue);
//     } else {
//         console.log("⏳ 計算結果為空 (可能數據尚未加載)");
//     }
// }, { immediate: true });

// watch(finalDamageResult, (newValue) => {
//     if (newValue && newValue.length > 0) {
//         console.log("✅ 計算器成功算出普通技能傷害加成:", newValue);
//     } else {
//         console.log("⏳ 計算結果為空 (可能數據尚未加載)");
//     }
// }, { immediate: true });

onMounted(() => {
});

onUnmounted(() => {
});
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Microsoft YaHei", sans-serif;
}

.root-container {
    display: flex;
    inline-size: 100vw;
    block-size: 100vh;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.1);
}

.left-panel {
    inline-size: 50vw;
    block-size: 100vh;
    display: flex;
    flex-direction: column;
    border-inline-end: 1px solid #ddd;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    inline-size: 100vw;
    block-size: 100dvh;
    z-index: 20000 !important;
    background-color: rgba(0, 0, 0, 0.5);

    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-block-start: 5vh;

    backdrop-filter: blur(2px);
}

.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from,
.modal-leave-to {
    /* 背景透明 */
    opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
}

/* 弹窗内容容器 */
.modal-content {
    inline-size: 90%;
    max-inline-size: 500px;
    block-size: 88dvh;
    display: flex;
    flex-direction: column;

    border-radius: 12px;
    /* padding: 10px; */
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    background-image: url('../assets/images/bg1.png');
    background-position: center;
}

/* 弹窗标题 */
.modal-title {
    font-size: 18px;
    text-align: center;
    color: #fff;
    padding-block-start: 10px;
    text-shadow:
        1px 1px 0 #555,
        -1px 1px 0 #555,
        1px -1px 0 #555,
        -1px -1px 0 #555;
}

.filter-component-wrapper {
    flex: 1;
    /* 自动占据剩余高度 */
    block-size: 100%;
    min-block-size: 0;
    /* 允许 Flex 子元素滚动 */
    display: flex;
    flex-direction: column;
}

.right-panel {
    inline-size: 50vw;
    block-size: 100vh;
    display: flex;
    flex-direction: column;
    /* max-block-size: 880px; */
}

.tab-bar.segmented-bar {
    display: flex;
    align-items: center;
    padding: 5px;
    background-color: #f5f7fa;
    /* 淺灰背景 */
    border-block-end: 1px solid #e2e8f0;
}

/* 內部膠囊槽 */
.tab-inner {
    display: flex;
    background-color: #e2e8f0;
    /* 槽位顏色 */
    padding: 4px;
    border-radius: 8px;
    /* 圓角 */
    flex: 1;
    /* 佔滿剩餘空間 */
    margin-inline-end: 10px;
    /* 給關閉按鈕留空隙 */
}

.tab-btn {
    flex: 1;
    border: none;
    background: transparent;
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    /* 未選中文字顏色 */
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
    white-space: nowrap;
}

/* 選中狀態：變成白色卡片，浮起來 */
.tab-btn.active {
    background-color: #fff;
    color: #568dd1;
    /* 主題藍色 */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    /* 柔和陰影 */
}

.tab-btn:hover:not(.active) {
    color: #334155;
    background-color: rgba(255, 255, 255, 0.5);
}

/* 獨立的關閉按鈕樣式 */
.close-icon-btn {
    inline-size: 32px;
    block-size: 32px;
    border-radius: 50%;
    border: none;
    background-color: #e2e8f0;
    color: #64748b;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.close-icon-btn:hover {
    background-color: #cbd5e1;
    color: #ef4444;
    /* 紅色 */
}

.pokemon-name {
    block-size: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 18px;
    font-weight: bold;
    font-size: 15px;
    font-weight: 900;
    color: #fff;
    /* ✨ 关键：文字描边效果 */
    text-shadow:
        -1px -1px 0 #004d40,
        1px -1px 0 #004d40,
        -1px 1px 0 #004d40,
        1px 1px 0 #004d40;
    letter-spacing: 1.5px;
}

.info-content {
    flex: 1;
    inline-size: 90%;
    block-size: 100%;
    /* 相对父容器宽度，已适配 */
    display: flex;
    flex-direction: column;
    padding: 1.5vh;
    /* 用 vh 替代 px，随视口缩放 */
    gap: 1vh;
    /* 间距随视口缩放 */
    overflow: hidden;
    background-image: url('../assets/images/bg1.png');
    align-self: center;
}

.potential-title {
    background-color: #568dd1cc;
    color: white;
    padding: 8px 8px;
    text-align: center;
    font-size: 14px;
    margin-block-end: 8px;
    border-radius: 10px;
}

.grid-panel {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #568dd1 #f0f4f8;
}

/* Chrome, Safari, Edge 專用樣式 (Webkit 內核) */
.grid-panel::-webkit-scrollbar {
    inline-size: 8px;
    block-size: 8px;
}

.grid-panel::-webkit-scrollbar-track {
    background-color: #f0f4f8;
    border-radius: 4px;
}

.grid-panel::-webkit-scrollbar-thumb {
    background-color: #568dd1;
    border-radius: 4px;
    border: 2px solid #f0f4f8;
}

.grid-panel::-webkit-scrollbar-thumb:hover {
    background-color: #4a7bb3;
}


.selected-info {
    /* flex: 1; */
    min-block-size: 0;
    overflow: auto !important;
    /* padding-inline-end: 0.5vw; */
}

/* 浏览器兼容：Webkit内核滚动条 */
.selected-info::-webkit-scrollbar {
    inline-size: 5px;
}

.selected-info::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
}

.selected-info::-webkit-scrollbar-track {
    background-color: #f5f5f5;
}

.selected-content {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.selected-item {
    padding: 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    color: #fff;
    font-size: 14px;
    margin-block-end: 5px;
}

.selected-header {
    padding: 8px 12px;

    font-weight: bold;
    font-size: 13px;
    line-height: 1.2;

    text-shadow:
        -1px -1px 0 #004d40,
        1px -1px 0 #004d40,
        -1px 1px 0 #004d40,
        1px 1px 0 #004d40;
}

.selected-description {
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.4);
    font-size: 12px;
    line-height: 1.5;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
    color: #fff;
    white-space: normal;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

@media (max-width: 1000px) {
    .left-panel {
        inline-size: 100vw !important;
        border-inline-end: none;
    }

    .floating-btn {
        /* 固定定位 */
        position: fixed;
        z-index: 2000;
        /* 确保层级够高，和返回按钮一样 */

        /* 尺寸和形状 */
        inline-size: 40px;
        block-size: 40px;
        border-radius: 50%;
        border: 1px solid #ddd;
        background-image: url('../assets/images/bg1.png');
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

        /* 内容居中 */
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        /* 控制图标大小 */
        cursor: pointer;
        transition: transform 0.2s;
    }

    .floating-btn:active {
        transform: scale(0.9);
    }

    /* 图标图片通用样式 */
    .btn-icon {
        inline-size: 100%;
        block-size: 100%;
        object-fit: contain;
        display: block;
    }

    .menu-pos {
        inset-block-end: 10px;
        inset-inline-end: 10px;
    }

    .right-panel {
        position: fixed;
        inset-block-start: 0;
        inset-inline-start: 0;
        inline-size: 100vw !important;
        block-size: 100vh !important;
        z-index: 10000;
        background-color: white;
        background-image: url('../assets/images/bg2.png');
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    }

    .right-panel.mobile-show {
        transform: translateX(0);
    }

    .mobile-panel-close {
        position: absolute;
        inset-block-start: 5px;
        inset-inline-end: 10px;
        inline-size: 30px;
        block-size: 30px;
        background: rgba(0, 0, 0, 0.1);
        border: none;
        border-radius: 50%;
        color: #333;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10001;
        /* 确保在 Tab 之上 */
    }

    /* 稍微调整 Tab Bar 给关闭按钮留位置 */
    .tab-bar {
        padding-inline-end: 40px;
    }

    /* 筛选弹窗适配 */
    .modal-content {
        inline-size: 90% !important;
        max-inline-size: none !important;
    }
}
</style>