<template>
    <div class="root-container">
        <!-- 左侧石盘区域 -->
        <div class="left-panel">
            <div class="bonus-container">
                <div class="info-bar">
                    <div class="info-item">
                        <span class="info-label">滴晶</span>
                        <span class="info-value">{{ finalGrid.costOrbs }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">剩餘力量</span>
                        <span class="info-value">{{ finalGrid.lastEnergy }} +{{ Math.min(2 * dynamicState.bonusLevel,
                            10) }}</span>
                    </div>
                </div>
                <div class="rating-section">
                    <!-- 移动端：信息切换按钮（默认隐藏，移动端显示） -->
                    <button class="info-toggle-btn" @click="showMobileInfo = !showMobileInfo">
                        {{ showMobileInfo ? '关闭信息' : '查看信息' }}
                    </button>
                    <Bonus v-model="dynamicState.bonusLevel" :star-size="20" :gap="5"
                        :max-rating="trainer.maxBonusLevel" />
                </div>
            </div>

            <div class="svg-container">
                <!-- SVG画布：宽高=左侧面板可用高度，中心点(centerX, centerY) -->
                <svg :width="svgWidth" :height="svgHeight">
                    <!-- 中心头像（固定在SVG中心点） -->
                    <image :href="getTrainerUrl(trainer.actorId, dynamicState.currentRarity === 6)"
                        :x="centerX - pokemonSize / 2 + 6" :y="centerY - pokemonSize / 2" :width="pokemonSize"
                        :height="pokemonSize" rx="50%" ry="50%"
                        style="border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);" />
                    <circle :cx="centerX - pokemonSize / 2 + 28" :cy="centerY - pokemonSize / 2 + 28"
                        :r="pokemonSize / 2" fill="transparent" style="cursor: pointer; pointer-events: auto;"
                        @click.stop="showFilterModal = true" />

                    <!-- 六边形石盘（基于SVG中心点计算位置，无重叠） -->
                    <template v-for="tile in finalGrid.gridData" :key="tile.id">
                        <!-- 计算石盘在SVG中的坐标 -->
                        <!-- 先注釋，看看設計後面有無問題
                        <polygon :points="hexPoints"
                            :transform="`translate(${calcHexSvgX(tile.x)}, ${calcHexSvgY(tile.x, tile.y)})`" :fill="syncMethods.isTileReachable(tile)
                                ? (tile.isActive ? `#${tile.color}` : 'transparent')
                                : 'rgba(160, 160, 160, 0.3)'"
                            :stroke="tile.isActive ? 'transparent' : `#${tile.color}`"
                            :stroke-width="tile.isActive ? 2.5 : 2"
                            :filter="tile.isActive ? 'drop-shadow(0 0 6px rgba(255,69,0,0.5))' : 'none'" :style="{
                                cursor: syncMethods.isTileReachable(tile) ? 'pointer' : 'not-allowed',
                                pointerEvents: syncMethods.isTileReachable(tile) ? 'auto' : 'none'
                            }" @click.stop="syncMethods.toggleTile(tile.id)" 
                        /> 
                        -->
                        <polygon :points="hexPoints"
                            :transform="`translate(${calcHexSvgX(tile.x)}, ${calcHexSvgY(tile.x, tile.y)})`" :style="{
                                cursor: syncMethods.isTileReachable(tile) ? 'pointer' : 'not-allowed',
                                // pointerEvents: syncMethods.isTileReachable(tile) ? 'auto' : 'none'
                            }" @click.stop="syncMethods.toggleTile(tile.id)" @mouseenter="hoveredTile = tile"
                            @mouseleave="hoveredTile = null" />

                        <image :href="syncMethods.getTileBorderUrl(tile)" :x="calcHexSvgX(tile.x) - 40"
                            :y="calcHexSvgY(tile.x, tile.y) - 40" width="80" height="80" pointer-events="none" />
                        <image :href="syncMethods.getTileFillUrl(tile)" :x="calcHexSvgX(tile.x) - 40"
                            :y="calcHexSvgY(tile.x, tile.y) - 40" width="80" height="80" pointer-events="none" />
                        <foreignObject v-if="hoveredTile" :x="calcTileWinX(hoveredTile.x)"
                            :y="calcTileWinY(hoveredTile.x, hoveredTile.y)" :width=tileWinWidth :height=tileWinHeight>
                            <div xmlns="http://www.w3.org/2000/svg" class="tile-window"
                                :style="{ borderColor: hoveredTile.color }">
                                <div class="tile-name" :style="{
                                    backgroundColor: hoveredTile.color,
                                }">
                                    {{ hoveredTile.name }}
                                </div>
                                <div class="tile-content">
                                    <p class="tile-descr">{{ hoveredTile.description }}</p>
                                    <p class="tile-other">
                                        滴晶：{{ hoveredTile.orb }}&nbsp&nbsp&nbsp&nbsp力量：{{ hoveredTile.energy }}
                                    </p>
                                </div>
                            </div>
                        </foreignObject>
                        <!-- 石盘文字 -->
                        <foreignObject v-if="hoveredTile != tile" :x="calcHexSvgX(tile.x) - 30"
                            :y="calcHexSvgY(tile.x, tile.y) - 28" width="80" height="80"
                            style="pointer-events: none; isolation: auto;">
                            <div xmlns="http://www.w3.org/2000/xhtml" class="tile-name-text">{{
                                syncMethods.fixTileName(tile) }}
                            </div>
                        </foreignObject>
                    </template>
                </svg>
            </div>

            <!-- 彈窗篩選拍組窗口 -->
            <div v-if="showFilterModal" class="modal-overlay" @click="showFilterModal = false">
                <div class="modal-content" @click.stop>
                    <h3 class="modal-title">选择拍组</h3>
                    <Filter @select-trainer="handleSelectTrainer" @close-modal="showFilterModal = false" />
                </div>
            </div>

            <div v-if="showMobileInfo" class="mobile-info-modal" @click="showMobileInfo = false">
                <!-- 弹窗内容区（点击内部不关闭） -->
                <div class="mobile-info-content" @click.stop>
                    <!-- 关闭按钮 -->
                    <button class="mobile-info-close" @click="showMobileInfo = false">×</button>
                    <!-- 拍组名称标题栏 -->
                    <div class="mobile-info-title">{{ syncMethods.getSyncName() }}</div>
                    <!-- 核心：Info组件（完整功能保留） -->
                    <Info :level-value="dynamicState.level" :current-rarity-value="dynamicState.currentRarity"
                        :potential-value="dynamicState.potential" :ex-role-enabled-value="dynamicState.exRoleEnabled"
                        :bonus-level="dynamicState.bonusLevel"
                        :selected-pokemon-index="dynamicState.selectedPokemonIndex" :trainer="syncMethods.getTrainer()"
                        :themes="syncMethods.getThemes()" :special-awaking="syncMethods.getSpecialAwaking()"
                        :variation-list="syncMethods.getvariationList()" :final-stats="finalStats" :pokemon="pokemon"
                        @update:levelValue="(val) => dynamicState.level = val"
                        @update:currentRarityValue="(val) => dynamicState.currentRarity = val"
                        @update:potentialValue="(val) => dynamicState.potential = val"
                        @update:exRoleEnabledValue="(val) => dynamicState.exRoleEnabled = val"
                        @update:selectedPokemonIndex="(val) => dynamicState.selectedPokemonIndex = val" />
                </div>
            </div>

        </div>

        <!-- 右侧信息区域（完全不变） -->
        <div class=" right-panel">

            <!-- 移动端：关闭按钮 -->
            <button class="mobile-close-btn" @click="showMobileInfo = false">×</button>

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
                    <div class="potential-title" @click="togglePotentialPanel">{{
                        finalGrid.potentialCookie ?
                            finalGrid.potentialCookie.cookieName : '潛能' }}</div>
                    <!-- 中间弹窗（全屏遮罩+窗口） -->
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
                    </transition>
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
                    :variation-list="syncMethods.getvariationList()" :final-stats="finalStats" :pokemon="pokemon"
                    @update:levelValue="(val) => dynamicState.level = val"
                    @update:currentRarityValue="(val) => dynamicState.currentRarity = val"
                    @update:potentialValue="(val) => dynamicState.potential = val"
                    @update:exRoleEnabledValue="(val) => dynamicState.exRoleEnabled = val"
                    @update:selectedPokemonIndex="(val) => dynamicState.selectedPokemonIndex = val" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { PotentialCookiesUrl, PotentialSkills } from '@/type/const';
import { useSyncElemStore } from "@/store/syncElem";
import Info from '@/components/Info.vue';
import Bonus from '@/components/Bonus.vue';
import Filter from '@/components/Filter.vue';
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { getTrainerUrl } from '@/utils/assetsMap';

// 缓存数据
const syncElemStore = useSyncElemStore();
const finalStats = computed(() => syncElemStore.currentFinalStats);
const finalGrid = computed(() => syncElemStore.currentGridInfo);
const syncMethods = computed(() => syncElemStore.exportMethods);
const dynamicState = computed(() => syncElemStore.currentSyncDynamicState);
const pokemon = computed(() => syncElemStore.currentPokemon);
const trainer = computed(() => {
    const res = syncMethods.value.getTrainer();
    return res;
});

const showFilterModal = ref(false);

// 设备移动端
const showMobileInfo = ref(false);
const isMobile = ref(window.innerWidth <= 1200);

// SVG基础配置（核心：画布尺寸和中心点）
const svgWidth = ref(0);
const svgHeight = ref(880); // SVG画布高度
const centerX = ref(0); // SVG中心点X
const centerY = ref(0); // SVG中心点Y
const pokemonSize = ref(55); // 拍组头像尺寸

// 六边形配置（SVG绘制正六边形，精准无偏差）
const hexRadius = ref(40); // 石盘块大小
const hexPoints = ref(''); // 石盘顶点坐标（动态计算）

// 石盘信息窗口的高度宽度
const tileWinWidth = ref(300);
const tileWinHeight = ref(150);

// 石盘间距配置（避免重叠，可微调）
const xSpacingRatio = ref(0.8); // 横向间距系数（0.8-0.95）
const ySpacingRatio = ref(1.1); // 纵向间距系数（1.0-1.2）

const hoveredTile = ref(null);

const curTab = ref('grid');
const currentType = ref(1);

const filteredPotentials = computed(() => {
    return PotentialSkills.filter(item => item.type === currentType.value);
});

const isPotentialWindowOpen = ref(false);

// 切换窗叶显示/隐藏（点击“潜能区域”或关闭按钮触发）
const togglePotentialPanel = () => {
    isPotentialWindowOpen.value = !isPotentialWindowOpen.value;
};

// 初始化SVG配置：画布尺寸、六边形顶点
const initSvgConfig = () => {
    const svgContainer = document.querySelector('.svg-container');
    if (svgContainer) {
        // SVG画布尺寸 = 容器尺寸（左侧面板除去顶部滴晶栏的高度）
        svgWidth.value = svgContainer.offsetWidth;
        // svgHeight.value = svgContainer.offsetHeight; // 保持原固定高度880

        // 计算正六边形的6个顶点（基于外接圆半径，精准无偏差）
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60) * Math.PI / 180; // 每个顶点间隔60度
            const x = hexRadius.value * Math.cos(angle);
            const y = hexRadius.value * Math.sin(angle);
            points.push(`${x},${y}`);
        }
        hexPoints.value = points.join(' '); // SVG polygon的points属性值
    }
};

// 计算SVG中心点（头像位置，也是石盘布局中心）
const calcSvgCenter = () => {
    centerX.value = svgWidth.value / 2; // SVG水平中心
    centerY.value = svgHeight.value / 2; // SVG垂直中心
};

// 计算石盘在SVG中的X坐标（以头像为中心）
const calcHexSvgX = (x) => {
    // 横向间距 = 六边形宽度（2×外接圆半径）× 间距系数
    const xSpacing = (hexRadius.value * 2) * xSpacingRatio.value;
    return centerX.value + x * xSpacing;
};

// 计算石盘在SVG中的Y坐标（以头像为中心，反转Y轴+蜂窝布局）
const calcHexSvgY = (x, y) => {
    // 纵向间距 = 六边形高度（√3×外接圆半径）× 间距系数
    const ySpacing = (hexRadius.value * Math.sqrt(3)) * ySpacingRatio.value;
    // 1. 反转Y轴（y越小越靠上）；2. 奇数列错位（蜂窝布局），但x轴方向错位相反
    const absX = Math.abs(x);
    let cof = absX;
    if (x > 0) {
        cof = (-1) * absX;
    }
    return centerY.value + (-y) * ySpacing + cof * (ySpacing / 2);
};

// 计算石盘信息显示窗口X坐标
const calcTileWinX = (x) => {
    const tileX = calcHexSvgX(x);

    // 优先尝试显示在六边形正中间位置
    let calcX = tileX - tileWinWidth.value / 2;
    if (calcX + tileWinWidth.value + 10 > svgWidth.value) {
        calcX = calcX - tileWinWidth.value / 2;
    }
    if (calcX < 0) {
        calcX = (svgWidth.value - tileWinWidth.value) / 2;
    }
    return calcX;
}

// 计算石盘信息显示窗口Y坐标
const calcTileWinY = (x, y) => {
    const tileY = calcHexSvgY(x, y);

    // 优先尝试显示在六边形正下方位置
    let calcY = tileY + hexRadius.value;
    if (calcY + tileWinHeight.value / 2 > svgHeight.value) {
        calcY = calcY - tileWinHeight.value * 1.5;
    }
    return calcY;
}

const handleSelectTrainer = (trainerId) => {
    try {
        if (!trainerId) {
            console.warn('选择失败：拍组 ID 无效');
            return;
        }
        // 调用 Pinia 的 action 选中拍        syncElemStore.selectCurrentSync(trainerId);
        syncElemStore.selectCurrentSync(trainerId);
        console.log(`成功选中拍组：${trainerId}`);
    } catch (error) {
        console.error('选中拍组失败：', error);
        // 可选：用户提示（如 ElMessage.error('选中失败，请重试')）
    }
};

// 窗口大小变化时，重新适配SVG尺寸
const handleResize = () => {
    initSvgConfig();
    calcSvgCenter();
};

onMounted(() => {
    nextTick(() => {
        initSvgConfig();
        calcSvgCenter();
        window.addEventListener('resize', handleResize);
    });
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
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
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.1);
}

.left-panel {
    width: 50vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #ddd;
}

/* 宝数及力量区域 */
/* 整体容器：固定宽度+居中，避免挤压 */
.bonus-container {
    width: 250px;
    /* 适配10星（20px*10 + 4px*9 = 236px），留余量 */
    margin: 8px auto;
    /* 整体在父容器中居中 */
    display: flex;
    flex-direction: column;
    gap: 6px;
}

/* 上层均分信息栏 */
.info-bar {
    display: flex;
    background-color: #0b7a75;
    border-radius: 8px;
    overflow: hidden;
}

.info-item {
    flex: 1;
    padding: 6px 0;
    text-align: center;
    color: #fff;
    font-size: 14px;
}

.info-label {
    margin-right: 4px;
    font-weight: 500;
}

.info-value {
    font-weight: bold;
}

/* 下层星级区域 */
.rating-section {
    /* background-color: #7ec8c5; */
    padding: 8px 12px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
}

/* 筛选弹窗区域  */
/* 弹窗遮罩（半透明背景，覆盖整个页面） */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    /* 确保在最上层 */
}

/* 弹窗内容容器 */
.modal-content {
    width: 80%;
    max-width: 500px;
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


/* SVG容器：占满左侧剩余高度，可滚动（如果石盘超出范围） */
.svg-container {
    flex: 1;
    overflow: auto;
    /* background-color: #f0f8ff; */
}

/* SVG画布：设置最小尺寸，避免过小 */
svg {
    min-width: 100%;
    min-height: 880px;
}

.right-panel {
    width: 50vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    /* background-color: #f8f9fa; */
    /* max-height: 880px; */
}

.tab-bar {
    display: flex;
    height: 40px;
    border-bottom: 1px solid #ddd;
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
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #ddd;
    font-size: 16px;
    font-weight: bold;
}

.info-content {
    flex: 1;
    width: 90%;
    height: 100%;
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
    /* height: calc(100% - 3vh); */
    /* 减去上下 padding（1.5vh*2），随视口缩放 */
    /* min-height: 20vh; */
    /* 兜底最小高度，随视口缩放 */
}

.potential-title {
    background-color: #568dd1cc;
    color: white;
    padding: 8px 8px;
    text-align: center;
    font-size: 14px;
    margin-bottom: 8px;
    border-radius: 10px;
}

.grid-panel {
    width: 100%;
    /* min-height: 100%; */
    /* 高度上限=视口高度的70%，缩放时到顶就停 */
    overflow: auto;
}

.selected-info {
    /* flex: 1; */
    min-height: 0;
    overflow: auto !important;
    /* padding-right: 0.5vw; */
}

/* 浏览器兼容：Webkit内核滚动条 */
.selected-info::-webkit-scrollbar {
    width: 5px;
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
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
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
    width: 80%;
    max-width: 700px;
    height: 100vh;
    /* max-height: 600px; */
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
    height: calc(100% - 40px);
    /* 减去头部高度 */
    display: flex;
    flex-direction: column;
}

/* 顶部标签栏容器 */
.window-top {
    padding: 8px;
    border-bottom: 1px solid #8b4513;
    width: 100%;
    /* 占满弹窗宽度 */
}

/* 图标容器：等分布局 */
.window-icons {
    display: flex;
    justify-content: space-between;
    /* 图标均匀分布 */
    width: 100%;
    /* 占满父容器宽度 */
}

/* 单个图标容器：固定宽度+居中 */
.icon-item {
    width: 50px;
    height: 50px;
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
    width: 100%;
    height: 100%;
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
    margin-bottom: 6px;
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
    width: 100%;
    margin-top: 4px;
}

/* 等级按钮：占满对应区域 */
.cookie-level-btn {
    flex: 1;
    /* 每个等级按钮平分宽度 */
    height: 30px;
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
    width: 100%;
    padding: 8px 0;
    background-color: #f39c12;
    border: 1px solid #8b4513;
    border-radius: 10px;
    cursor: pointer;
    color: #333;
    font-weight: bold;
}

/* tile悬停窗口样式 */
.tile-window {
    background: rgba(235, 230, 215, 0.6);
    border: 2px solid white;
    border-radius: 10px;
    /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); */
    padding: 0;
    font-size: 13px;
    line-height: 1.5;
    color: #000;
}

.tile-name {
    font-weight: bold;
    font-size: 14px;
    padding: 4px;
    text-align: center;
}

.tile-name-text {
    width: 60px;
    height: 55px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    font-weight: bolder;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
    line-height: 1.2;
}

.tile-content {
    padding: 6px 6px;
}

.tile-descr {
    /* text-indent: 2em; */
    /* 首行缩进2字符（还原示例格式） */
    font-weight: lighter;
    line-height: 1.6;
}

.tile-other {
    margin: 0;
    font-weight: 500;
    text-align: center;
}

/* 移动端信息显示 */
.mobile-info-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    /* 高于所有其他弹窗 */
    padding: 20px 15px;
}

.mobile-info-content {
    width: 100%;
    max-width: 800px;
    background-color: #fff;
    background-image: url('../assets/images/bg2.png');
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
    position: relative;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

.mobile-info-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
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
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #568dd1;
    color: white;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #eee;
}

/* Info组件容器：允许滚动 */
.mobile-info-content>div:last-child {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
}

@media (max-width: 1200px) {
    .left-panel {
        width: 100vw !important;
        /* 移动端占满屏幕 */
        border-right: none;
    }

    /* 显示移动端按钮 */
    .info-toggle-btn {
        display: none;
        position: absolute;
        left: 40px;
        top: 45px;
        background-image: url('../assets/images/bg1.png');
        padding: 6px 14px;
        color: black;
        border: none;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        transition: background-color 0.2s;
    }

    .mobile-close-btn {
        display: block;
    }

    /* 右侧信息区域：默认隐藏（平移出屏幕），显示时占满屏幕 */
    .right-panel {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 10000;
        transform: translateX(100%);
        /* 默认隐藏在右侧 */
        background-color: #fff;
    }

    .right-panel.mobile-show {
        transform: translateX(0);
        /* 显示时平移到屏幕内 */
    }

    /* 适配移动端元素尺寸 */
    .bonus-container {
        width: 90% !important;
        /* 占满左侧宽度 */
        margin: 8px auto;
    }

    .info-item {
        font-size: 13px !important;
        /* 缩小文字 */
        padding: 4px 0 !important;
    }

    .rating-section {
        padding: 6px 8px !important;
    }

    /* SVG容器适配 */
    .svg-container {
        padding: 10px 0;
    }

    svg {
        min-height: 600px !important;
        /* 移动端缩小SVG高度 */
    }

    /* 潜能弹窗适配 */
    .potential-window {
        width: 90vw !important;
        height: 80vh !important;
        top: 10vh !important;
    }

    .window-icons {
        flex-wrap: wrap;
        /* 图标换行显示 */
        gap: 8px;
        justify-content: center !important;
    }

    .icon-item {
        width: 40px !important;
        height: 40px !important;
    }

    /* 按钮触控优化（移动端最小点击区域44px） */
    .tab-btn {
        height: 44px !important;
        font-size: 15px !important;
    }

    .cookie-level-btn {
        height: 36px !important;
        font-size: 14px !important;
    }

    .cookie-select-btn {
        height: 36px !important;
        font-size: 14px !important;
    }

    .potential-title {
        padding: 10px 8px !important;
        font-size: 15px !important;
    }

    .pokemon-name {
        font-size: 15px !important;
        height: 44px !important;
    }

    /* 石盘信息窗口优化 */
    .tile-window {
        font-size: 12px !important;
    }

    .tile-name {
        font-size: 13px !important;
    }

    /* 筛选弹窗适配 */
    .modal-content {
        width: 90% !important;
        max-width: none !important;
    }
}

/* 小屏手机额外适配（375px以下） */
@media (max-width: 375px) {
    .hexRadius {
        ref: 28 !important;
        /* 进一步缩小石盘 */
    }

    .pokemonSize {
        ref: 40 !important;
        /* 进一步缩小头像 */
    }

    .tileWinHeight {
        ref: 140 !important;
        /* 缩小信息窗口高度 */
    }
}
</style>