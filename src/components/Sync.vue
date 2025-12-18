<template>
    <div class="root-container">
        <!-- 左侧石盘区域 -->
        <div class="left-panel">
            <Grid v-model:bonusLevel="dynamicState.bonusLevel" :grid-data="finalGrid.gridData" :trainer="trainer"
                :current-rarity="dynamicState.currentRarity" :bonus-level="dynamicState.bonusLevel"
                :cost-orbs="finalGrid.costOrbs" :last-energy="finalGrid.lastEnergy"
                :is-tile-reachable="syncMethods.isTileReachable" :get-tile-border-url="syncMethods.getTileBorderUrl"
                :get-tile-fill-url="syncMethods.getTileFillUrl" :get-trainer-avatar-url="getTrainerUrl"
                :fix-tile-name="syncMethods.fixTileName" :toggle-tile="syncMethods.toggleTile"
                :check-selected-tiles="syncMethods.checkSelectedTiles" :on-trainer-click="toggleTrainerSelect" />

            <!-- 彈窗篩選拍組窗口 -->
            <div v-if="showFilterModal" class="modal-overlay" @click="showFilterModal = false">
                <div class="modal-content" @click.stop>
                    <h3 class="modal-title">选择拍组</h3>
                    <Filter @select-trainer="handleSelectTrainer" @close-modal="showFilterModal = false" />
                </div>
            </div>

            <!-- 移动端：信息切换按钮（默认隐藏，移动端显示） -->
            <button v-show="isSingleView" class="floating-btn" @click="showInfo = !showInfo">
                {{ '信息' }}
            </button>

            <div v-if="showInfo" class="mobile-info-modal" @click="showInfo = false">
                <div class="mobile-info-content" @click.stop>
                    <!-- 关闭按钮 -->
                    <button class="mobile-info-close" @click="showInfo = false">×</button>
                    <!-- 拍组名称标题栏 -->
                    <div class="mobile-info-title">{{ syncMethods.getSyncName() }}</div>
                    <!-- 核心：Info组件（完整功能保留） -->
                    <Info :level-value="dynamicState.level" :current-rarity-value="dynamicState.currentRarity"
                        :potential-value="dynamicState.potential" :ex-role-enabled-value="dynamicState.exRoleEnabled"
                        :bonus-level="dynamicState.bonusLevel"
                        :selected-pokemon-index="dynamicState.selectedPokemonIndex" :trainer="syncMethods.getTrainer()"
                        :themes="syncMethods.getThemes()" :special-awaking="syncMethods.getSpecialAwaking()"
                        :variation-list="syncMethods.getvariationList()" :final-stats="finalStats"
                        :final-moves="finalMoves" :pokemon="pokemon"
                        @update:levelValue="(val) => dynamicState.level = val"
                        @update:currentRarityValue="(val) => dynamicState.currentRarity = val"
                        @update:potentialValue="(val) => dynamicState.potential = val"
                        @update:exRoleEnabledValue="(val) => dynamicState.exRoleEnabled = val"
                        @update:selectedPokemonIndex="(val) => dynamicState.selectedPokemonIndex = val" />
                </div>
            </div>
        </div>

        <div class="right-panel">
            <div class="tab-bar">
                <button class="tab-btn" :class="{ active: curTab === 'grid' }" @click="curTab = 'grid'">
                    石盤一覽
                </button>
                <button class="tab-btn" :class="{ active: curTab === 'info' }" @click="curTab = 'info'">
                    拍組信息
                </button>
            </div>
            <div class="pokemon-name">{{ syncMethods.getSyncName() }}</div>
            <div class="info-content">
                <div v-if="curTab === 'grid'" class="grid-panel">
                    <!-- 潜能区域移除 -->
                    <!-- <div class="potential-title" @click="togglePotentialPanel">{{
                        finalGrid.potentialCookie ?
                            finalGrid.potentialCookie.cookieName : '潛能' }}</div>
                    <transition name="slide-window" appear>
                        <div class="modal-backdrop" v-if="isPotentialWindowOpen" @click="togglePotentialPanel">
                            <div class="potential-window" @click.stop>
                                <div class="window-header">
                                    <div class="window-title">潛能</div>
                                    <button class="window-close" @click="togglePotentialPanel">×</button>
                                </div>
                                <div class="window-content">
                                    <div class="window-top">
                                        <div class="window-icons">
                                            <div v-for="t in [1, 2, 3, 4, 5, 6]" :key="t" class="icon-item"
                                                :class="{ active: currentType === t }" @click="currentType = t">
                                                <img :src="PotentialCookiesUrl[t - 1]" alt="潜能类型{{ t }}"
                                                    class="cookie-type-icon">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="potential-list">
                                        <div v-for="item in filteredPotentials" :key="item.id" class="potential-item">
                                            <div class="cookie-name">{{ item.cookieName }}</div>
                                            <div class="cookie-desc">{{ item.desc }}</div>
                                            <div class="cookie-item-action">
                                                <template v-if="Array.isArray(item.level)">
                                                    <div v-for="l in item.level" :key="l" class="cookie-level-btn"
                                                        @click="async () => {
                                                            syncMethods.updatePotentialCookieWithLevel(item, l);
                                                            await nextTick();
                                                            togglePotentialPanel();
                                                        }">
                                                        {{ l }}
                                                    </div>
                                                </template>
<template v-else>
                                                    <button class="cookie-select-btn"
                                                        @click="syncMethods.updatePotentialCookie(item); togglePotentialPanel()">選擇</button>
                                                </template>
</div>
</div>
</div>
</div>
</div>
</div>
</transition> -->
                    <div class="selected-info">
                        <div class="selected-content">
                            <div v-for="tile in finalGrid.selectedTiles" :key="tile.id" class="selected-item" :style="{
                                backgroundColor: `${tile.color}`,
                                filter: 'saturate(0.7)',
                            }">
                                {{ tile.name }}<br>{{ tile.description }}
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
    </div>
</template>

<script setup>
// import Bonus from '@/components/Bonus.vue';
import Filter from '@/components/Filter.vue';
import Grid from '@/components/Grid.vue';
import Info from '@/components/Info.vue';
import { useSyncElemStore } from "@/stores/syncElem";
// import { PotentialSkills } from '@/type/const';
import { useDamageCalculator } from '@/composables/useDamageCalculator';
import { getTrainerUrl } from '@/utils/format';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

// 缓存数据
const syncElemStore = useSyncElemStore();
const finalStats = computed(() => syncElemStore.currentFinalStats);
const finalMoves = computed(() => syncElemStore.currentFinalMoves);
const finalGrid = computed(() => syncElemStore.currentGridInfo);
const syncMethods = computed(() => syncElemStore.exportMethods);
const dynamicState = computed(() => syncElemStore.singleSyncDynamicState);
const pokemon = computed(() => syncElemStore.currentPokemon);
const trainer = computed(() => {
    const res = syncMethods.value.getTrainer();
    return res;
});
// 筛选拍组
const showFilterModal = ref(false);
// 设备移动端
const showInfo = ref(false);
const isSingleView = ref(window.innerWidth <= 900);
// 信息切换页
const curTab = ref('grid');

const { singleSync } = storeToRefs(syncElemStore);
const { themeSnapshot, passiveSnapshot, finalDamageResult } = useDamageCalculator(singleSync);

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
        // 调用 Pinia 的 action 选中拍        syncElemStore.selectsingleSync(trainerId);
        syncElemStore.selectsingleSync(trainerId);
        console.log(`成功选中拍组：${trainerId}`);
    } catch (error) {
        console.error('选中拍组失败：', error);
        // 提示错误
    }
};
watch(themeSnapshot, (newValue) => {
    if (newValue) {
        console.log("✅ 計算器成功算出組隊技能:", newValue);
    } else {
        console.log("⏳ 計算結果為空 (可能數據尚未加載)");
    }
}, { immediate: true });

watch(passiveSnapshot, (newValue) => {
    if (newValue && newValue.length > 0) {
        console.log("✅ 計算器成功算出被動技能:", newValue);
    } else {
        console.log("⏳ 計算結果為空 (可能數據尚未加載)");
    }
}, { immediate: true });

watch(finalDamageResult, (newValue) => {
    if (newValue && newValue.length > 0) {
        console.log("✅ 計算器成功算出普通技能傷害加成:", newValue);
    } else {
        console.log("⏳ 計算結果為空 (可能數據尚未加載)");
    }
}, { immediate: true });

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


/* 筛选弹窗区域  */
/* 弹窗遮罩（半透明背景，覆盖整个页面） */
.modal-overlay {
    position: fixed;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: 100vw;
    block-size: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    /* 确保在最上层 */
}

/* 弹窗内容容器 */
.modal-content {
    inline-size: 80%;
    max-inline-size: 500px;
    background-color: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

/* 弹窗标题 */
.modal-title {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 18px;
    text-align: center;
}

.right-panel {
    inline-size: 50vw;
    block-size: 100vh;
    display: flex;
    flex-direction: column;
    /* max-block-size: 880px; */
}

.tab-bar {
    display: flex;
    block-size: 40px;
    border-block-end: 1px solid #ddd;
}

.tab-btn {
    flex: 1;
    border: none;
    background-color: #f8f9fa;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.tab-btn.active {
    background-color: #568dd1;
    color: white;
}

.tab-btn:hover:not(.active) {
    background-color: #eee;
}

.pokemon-name {
    block-size: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-block-end: 1px solid #ddd;
    font-size: 16px;
    font-weight: bold;
    color: white;
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
    background-image: url('../assets/images/bg2.png');
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
    inline-size: 100%;
    /* min-block-size: 100%; */
    /* 高度上限=视口高度的70%，缩放时到顶就停 */
    overflow: auto;
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
    gap: 2px;
}

.selected-item {
    padding: 10px 5px;
    font-size: 12px;
    line-height: 1.1;
    white-space: normal;
    text-overflow: ellipsis;
    color: rgba(255, 255, 255, 0.9);
    font-weight: bold;
}

/* 潜能弹窗 */
/* 遮罩动画：从透明到半透明 */
.slide-window-enter-from .modal-backdrop,
.slide-window-leave-to .modal-backdrop {
    background-color: rgba(0, 0, 0, 0);
    /* 初始/结束透明 */
}

.slide-window-enter-active .modal-backdrop,
.slide-window-leave-active .modal-backdrop {
    transition: background-color 0.4s ease;
    /* 遮罩透明度过渡 */
}

/* 弹窗动画：滑入（上→下）、滑出（下→上） */
.slide-window-enter-from .potential-window {
    transform: translateY(-100%);
    /* 初始位置：在屏幕上方（完全看不到） */
    opacity: 0;
    /* 初始透明 */
}

.slide-window-leave-to .potential-window {
    transform: translateY(-100%);
    /* 结束位置：回到屏幕上方 */
    opacity: 0;
    /* 结束透明 */
}

.slide-window-enter-active .potential-window,
.slide-window-leave-active .potential-window {
    transition: transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 1s ease;
    /* cubic-bezier 曲线：滑入时先慢后快，更自然；0.4s 动画时长可调整 */
}

.modal-backdrop {
    position: fixed;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: 100vw;
    block-size: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    /* 确保在最上层 */
}

/* 中间弹窗 */
.potential-window {
    position: fixed;
    inline-size: 80%;
    max-inline-size: 700px;
    block-size: 100vh;
    /* max-block-size: 600px; */
    background-color: #f5d76e;
    border: 2px solid #8b4513;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

/* 弹窗头部 */
.window-header {
    background-color: #2980b9;
    color: white;
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.window-title {
    font-weight: bold;
    font-size: 16px;
}

.window-close {
    background: transparent;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0 8px;
}

/* 弹窗内容 */
.window-content {
    block-size: calc(100% - 40px);
    /* 减去头部高度 */
    display: flex;
    flex-direction: column;
}

/* 顶部标签栏容器 */
.window-top {
    padding: 8px;
    border-block-end: 1px solid #8b4513;
    inline-size: 100%;
    /* 占满弹窗宽度 */
}

/* 图标容器：等分布局 */
.window-icons {
    display: flex;
    justify-content: space-between;
    /* 图标均匀分布 */
    inline-size: 100%;
    /* 占满父容器宽度 */
}

/* 单个图标容器：固定宽度+居中 */
.icon-item {
    inline-size: 50px;
    block-size: 50px;
    background-color: #e0e0e0;
    border: 1px solid #8b4513;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    flex-shrink: 0;
    /* 禁止缩小，保持固定尺寸 */
}

/* 图标图片：占满容器 */
.cookie-type-icon {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
}

.potential-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
}

/* 潜能条目：设置为网格布局，让名称、描述、等级栏自动排版 */
.potential-item {
    background-color: #f5d76e;
    border: 1px solid #8b4513;
    margin-block-end: 6px;
    padding: 8px;
    display: grid;
    grid-template-areas:
        "name name"
        "desc desc"
        "level level";
    /* 等级栏占满整行 */
}

.cookie-name {
    grid-area: name;
    font-weight: bold;
    color: #333;
}

.cookie-desc {
    grid-area: desc;
    font-size: 12px;
    color: #555;
    margin: 4px 0;
}

/* 等级/选择按钮容器：横向占满+等分布局 */
.cookie-item-action {
    grid-area: level;
    display: flex;
    justify-content: space-between;
    /* 等级按钮均匀分布 */
    inline-size: 100%;
    margin-block-start: 4px;
}

/* 等级按钮：占满对应区域 */
.cookie-level-btn {
    flex: 1;
    /* 每个等级按钮平分宽度 */
    block-size: 30px;
    background-color: #f39c12;
    border: 2px solid #8b4513;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin: 0 2px;
    /* 按钮之间留空隙 */
}

.cookie-level-btn.active {
    background-color: #e74c3c;
    color: white;
}

/* 选择按钮：占满整行 */
.cookie-select-btn {
    inline-size: 100%;
    padding: 8px 0;
    background-color: #f39c12;
    border: 1px solid #8b4513;
    border-radius: 10px;
    cursor: pointer;
    color: #333;
    font-weight: bold;
}

/* 移动端信息显示 */
.mobile-info-modal {
    position: fixed;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: 100vw;
    block-size: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    /* 高于所有其他弹窗 */
    padding: 20px 15px;
}

.mobile-info-content {
    inline-size: 100%;
    max-inline-size: 800px;
    background-color: #fff;
    background-image: url('../assets/images/bg_tera.png');
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
    position: relative;
    block-size: 100vh;
    display: flex;
    flex-direction: column;
}

.mobile-info-close {
    position: absolute;
    inset-block-start: 12px;
    inset-inline-end: 12px;
    inline-size: 36px;
    block-size: 36px;
    border-radius: 50%;
    background-color: #ff4500;
    color: white;
    border: none;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.mobile-info-title {
    block-size: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #568dd1;
    color: white;
    font-size: 18px;
    font-weight: bold;
    border-block-end: 1px solid #eee;
}

/* Info组件容器：允许滚动 */
.mobile-info-content>div:last-child {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
}

@media (max-width: 1000px) {
    .left-panel {
        inline-size: 100vw !important;
        /* 移动端占满屏幕 */
        border-inline-end: none;
    }

    /* 悬浮按钮基础样式 */
    .floating-btn {
        position: fixed;
        /* 固定定位，脱离文档流 */
        inset-inline-end: 20px;
        inset-block-end: 20px;
        inline-size: 50px;
        block-size: 50px;
        border-radius: 50%;
        background-image: url('../assets/images/bg2.png');
        /* 主题色 */
        color: black;
        border: none;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        /* 阴影增强悬浮感 */
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
        /* 保证在其他元素上方 */
        transition: background-color 0.2s;
        /*  hover动画 */
    }

    /*  hover效果 */
    .floating-btn:hover {
        background-color: #337ECC;
    }

    /* 右侧信息区域：默认隐藏（平移出屏幕），显示时占满屏幕 */
    .right-panel {
        position: fixed;
        inset-block-start: 0;
        inset-inline-start: 0;
        inline-size: 100vw !important;
        block-size: 100vh !important;
        z-index: 10000;
        transform: translateX(100%);
        /* 默认隐藏在右侧 */
        background-color: #fff;
    }

    .right-panel.mobile-show {
        transform: translateX(0);
        /* 显示时平移到屏幕内 */
    }

    /* 筛选弹窗适配 */
    .modal-content {
        inline-size: 90% !important;
        max-inline-size: none !important;
    }
}
</style>