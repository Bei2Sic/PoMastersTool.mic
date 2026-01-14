<template>
    <div class="sync-grid-container">

        <div class="bonus-header">
            <div class="info-bar">
                <div class="info-item">
                    <span class="info-label">滴晶</span>
                    <span class="info-value">{{ costOrbs }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">剩餘力量</span>
                    <span class="info-value">{{ lastEnergy }} +{{ Math.min(2 * localBonusLevel, 10) }}</span>
                </div>
            </div>
            <div class="rating-section">
                <Bonus :model-value="localBonusLevel" @update:model-value="handleBonusUpdate" :star-size="18" :gap="5"
                    :max-rating="maxBonusLevel" />
            </div>
        </div>

        <div v-if="trainer.exclusivity === 'Academy'" class="academy-resources">
            <div v-for="(item, index) in academyResourceList" :key="index" class="academy-item">
                <img :src="getAcademyItemIcon(index)" alt="item" class="academy-icon" />
                <span class="academy-count">x{{ item.count }}</span>
            </div>
        </div>



        <div class="svg-scroll-area" @click="handleBackgroundClick">

            <svg :viewBox="viewBox" :preserveAspectRatio="isMobile ? 'xMidYMin meet' : 'xMidYMid meet'" class="main-svg" ">
                <image :href="trainerAvatarUrl" :x="-CONST_TRAINER_SIZE / 2" :y="-CONST_TRAINER_SIZE / 2"
                :width="CONST_TRAINER_SIZE" :height="CONST_TRAINER_SIZE" rx="50%" ry="50%" class="center-avatar" />
            <circle cx="0" cy="0" :r="CONST_TRAINER_SIZE / 2" fill="transparent"
                :style="{ cursor: onTrainerClick ? 'pointer' : 'default', pointerEvents: onTrainerClick ? 'auto' : 'none' }"
                @click.stop="handleTrainerClick" />

            <template v-for="tile in gridData" :key="tile.id">
                <g :transform="`translate(${calcHexSvgX(tile.x)}, ${calcHexSvgY(tile.x, tile.y)})`" class="tile-group"
                    @click.stop="handleTileClick(tile.id, $event)" :class="{ 'tile-locked': !isTileReachable(tile) }"
                    @mouseenter="handleTileHover(tile, $event)" @mouseleave="handleTileHover(null, null)">

                    <polygon :points="hexPoints" :style="{ cursor: isTileReachable(tile) ? 'pointer' : 'not-allowed' }"
                        fill="transparent" />

                    <image :href="getTileBorderUrl(tile)" :x="-CONST_TILE_SIZE / 2" :y="-CONST_TILE_SIZE / 2"
                        :width="CONST_TILE_SIZE" :height="CONST_TILE_SIZE" pointer-events="none" />
                    <image :href="getTileFillUrl(tile)" :x="-CONST_TILE_SIZE / 2" :y="-CONST_TILE_SIZE / 2"
                        :width="CONST_TILE_SIZE" :height="CONST_TILE_SIZE" pointer-events="none" />

                    <polygon v-if="!isTileReachable(tile)" :points="hexPoints" fill="rgba(0, 0, 0, 0.6)"
                        pointer-events="none" />

                    <text text-anchor="middle" dominant-baseline="middle" pointer-events="none" class="grid-text">
                        <template v-for="(line, index) in normalizeTileName(tile)" :key="index">
                            <tspan x="0"
                                :dy="index === 0 ? (-0.6 * (normalizeTileName(tile).length - 1)) + 'em' : '1.2em'">
                                {{ line }}
                            </tspan>
                        </template>
                    </text>
                </g>
            </template>
            </svg>
        </div>

        <transition name="fade">
            <div v-if="hoveredTile" class="tile-window"
                :class="{ 'mobile-popup': isMobile, 'desktop-popup': !isMobile }"
                :style="!isMobile ? dynamicPopupStyle : {}" @click.stop>
                <div class="tile-window-header" :style="{ backgroundColor: hoveredTile.color }">
                    {{ hoveredTile.name }}
                </div>
                <div class="tile-content">
                    <p class="tile-descr">{{ hoveredTile.description }}</p>
                    <p class="tile-other">
                        滴晶：{{ hoveredTile.orb }}&nbsp;&nbsp;力量：{{ hoveredTile.energy }}
                    </p>
                    <div v-if="trainer.exclusivity === 'Academy' && hoveredTile.requiredItems"
                        class="tile-other academy-reqs">
                        <span v-if="hoveredTile.requiredItems.fieryOrb" class="orb-tag">
                            <img :src="getAcademyItemIcon(0)" class="mini-orb" />
                            {{ hoveredTile.requiredItems.fieryOrb }}
                        </span>

                        <span v-if="hoveredTile.requiredItems.leafyOrb" class="orb-tag">
                            <img :src="getAcademyItemIcon(1)" class="mini-orb" />
                            {{ hoveredTile.requiredItems.leafyOrb }}
                        </span>

                        <span v-if="hoveredTile.requiredItems.bubblyOrb" class="orb-tag">
                            <img :src="getAcademyItemIcon(2)" class="mini-orb" />
                            {{ hoveredTile.requiredItems.bubblyOrb }}
                        </span>

                        <span v-if="hoveredTile.requiredItems.sparkyOrb" class="orb-tag">
                            <img :src="getAcademyItemIcon(3)" class="mini-orb" />
                            {{ hoveredTile.requiredItems.sparkyOrb }}
                        </span>

                        <span v-if="hoveredTile.requiredItems.tmOrb" class="orb-tag">
                            <img :src="getAcademyItemIcon(4)" class="mini-orb" />
                            {{ hoveredTile.requiredItems.tmOrb }}
                        </span>
                    </div>
                </div>
            </div>
        </transition>

    </div>
</template>

<script setup lang="ts">
import Bonus from '@/components/Bonus.vue';
import { Tile, Trainer } from "@/types/syncModel";
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const CONST_HEX_RADIUS = 50;
const CONST_TRAINER_SIZE = 78;
const CONST_TILE_SIZE = 100;
const X_SPACING_RATIO = 0.75;
const Y_SPACING_RATIO = 1.00;

const props = defineProps({
    gridData: { type: Array as () => Tile[], required: true },
    trainer: { type: Object as () => Trainer, required: true },
    currentRarity: { type: Number, required: true },
    bonusLevel: { type: Number, required: true },
    costOrbs: { type: Number, required: true },
    costFieryOrbs: { type: Number, required: true },
    costLeafOrbs: { type: Number, required: true },
    costBubblyOrbs: { type: Number, required: true },
    costSparkyOrbs: { type: Number, required: true },
    costTMOrbs: { type: Number, required: true },
    lastEnergy: { type: Number, required: true },
    fixTileName: { type: Function, required: true },
    isTileReachable: { type: Function, required: true },
    getTileBorderUrl: { type: Function, required: true },
    getTileFillUrl: { type: Function, required: true },
    getTrainerAvatarUrl: { type: Function, required: true },
    checkSelectedTiles: { type: Function, required: true },
    toggleTile: { type: Function, required: true },
    onTrainerClick: { type: Function, required: false },
});

// 學院拍的模板
const academyResourceList = computed(() => [
    { count: props.costFieryOrbs, icon: 'orb_red', color: '#ff7070' },
    { count: props.costLeafOrbs, icon: 'orb_green', color: '#70ff70' },
    { count: props.costBubblyOrbs, icon: 'orb_blue', color: '#7070ff' },
    { count: props.costSparkyOrbs, icon: 'orb_yellow', color: '#ffff70' },
    { count: props.costTMOrbs, icon: 'orb_purple', color: '#d070ff' },
]);

const emit = defineEmits(['update:bonusLevel']);
const localBonusLevel = ref(props.bonusLevel);

// 状态
const hoveredTile = ref<Tile | null>(null);
const popupPosition = ref({ top: 0, left: 0, bottom: 0, placeAbove: false });
const isMobile = ref(false);

// 坐标与 viewBox 计算 
const calcHexSvgX = (x: number) => x * (CONST_HEX_RADIUS * 2 * X_SPACING_RATIO);
const calcHexSvgY = (x: number, y: number) => {
    const ySpacing = CONST_HEX_RADIUS * Math.sqrt(3) * Y_SPACING_RATIO;
    const absX = Math.abs(x);
    const cof = x > 0 ? (-1) * absX : absX;
    return (-y) * ySpacing + cof * (ySpacing / 2);
};

const viewBox = computed(() => {
    if (!props.gridData || props.gridData.length === 0) return '-500 -500 1000 1000';

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    const validTiles = props.gridData.filter(t => 
        typeof t.x === 'number' && !isNaN(t.x) && 
        typeof t.y === 'number' && !isNaN(t.y)
    );

    validTiles.forEach(tile => {
        const cx = calcHexSvgX(tile.x);
        const cy = calcHexSvgY(tile.x, tile.y);
        minX = Math.min(minX, cx - CONST_HEX_RADIUS);
        maxX = Math.max(maxX, cx + CONST_HEX_RADIUS);
        minY = Math.min(minY, cy - CONST_HEX_RADIUS);
        maxY = Math.max(maxY, cy + CONST_HEX_RADIUS);
    });

    if (isNaN(minX) || isNaN(maxX) || isNaN(minY) || isNaN(maxY)) {
        return '-500 -500 1000 1000';
    }

    // 留白
    const padding = 10;

    const x = minX - padding;
    const y = minY - padding;
    const w = (maxX - minX) + padding * 2;
    const h = (maxY - minY) + padding * 2;

    return `${x} ${y} ${w} ${h}`;
});

const trainerAvatarUrl = computed(() => {
    return props.getTrainerAvatarUrl(props.trainer.enActor, props.trainer.dexNumber, props.currentRarity, props.trainer.count);
});

const maxBonusLevel = computed(() => props.trainer.maxBonusLevel || 5);

const updateWindowWidth = () => {
    isMobile.value = window.innerWidth <= 768;
};

// 点击空白区域关闭弹窗
const handleBackgroundClick = () => {
    hoveredTile.value = null;
};

// 点击格子：既要触发选中，也要触发弹窗显示
const handleTileClick = (id: number, event: MouseEvent) => {
    // 选中/取消选中
    props.toggleTile(id);

    // 设置当前悬停Tile（移动端也需要这个来显示弹窗）
    const tile = props.gridData.find(t => t.id === id);
    if (tile) {
        updatePopupPosition(event); // 计算位置（桌面端用）
        hoveredTile.value = tile;   // 触发弹窗显示
    }
};

// 鼠标悬停 (仅桌面端)
const handleTileHover = (tile: Tile, event: MouseEvent) => {
    if (isMobile.value) return;

    hoveredTile.value = tile;
    if (tile && event) {
        updatePopupPosition(event);
    }
};

const updatePopupPosition = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const screenHeight = window.innerHeight;

    popupPosition.value = {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left + rect.width / 2,
        placeAbove: rect.top > (screenHeight / 2)
    };
};

// 桌面端动态样式
const dynamicPopupStyle = computed(() => {
    if (isMobile.value || !popupPosition.value.left) return {};

    const { top, bottom, left, placeAbove } = popupPosition.value;
    const popupWidth = 260;
    const halfWidth = popupWidth / 2;
    const screenWidth = window.innerWidth;
    const EDGE_PADDING = 10;

    let finalLeft = left;
    if (finalLeft - halfWidth < EDGE_PADDING) {
        finalLeft = halfWidth + EDGE_PADDING;
    } else if (finalLeft + halfWidth > screenWidth - EDGE_PADDING) {
        finalLeft = screenWidth - halfWidth - EDGE_PADDING;
    }

    const style = {
        position: 'fixed',
        zIndex: 9999,
        'inset-inline-start': `${finalLeft}px`,
        borderColor: hoveredTile.value?.color,
        transform: `translate(-50%, ${placeAbove ? 'calc(-100% - 15px)' : '15px'})`,
    };

    if (placeAbove) style['inset-block-start'] = `${top}px`;
    else style['inset-block-start'] = `${bottom}px`;

    return style;
});


const hexPoints = computed(() => {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (i * 60) * Math.PI / 180;
        const x = CONST_HEX_RADIUS * Math.cos(angle);
        const y = CONST_HEX_RADIUS * Math.sin(angle);
        points.push(`${x},${y}`);
    }
    return points.join(' ');
});

const normalizeTileName = (tile) => {
    const result = props.fixTileName(tile);
    if (typeof result === 'string') return [result];
    if (Array.isArray(result)) return result;
    return [tile.name || ''];
};

const handleBonusUpdate = (v) => { localBonusLevel.value = v; emit('update:bonusLevel', v); };
const handleTrainerClick = () => { if (props.onTrainerClick) props.onTrainerClick(); };

watch(() => props.bonusLevel, (v) => localBonusLevel.value = v, { immediate: true });
watch(localBonusLevel, (n, o) => { if (n !== o) props.checkSelectedTiles(); });

const getAcademyItemIcon = (index: number) => {
    const colors = ['fiery', 'leafy', 'bubbly', 'sparky', 'tm'];
    const color = colors[index] || 'fiery';
    console.log(color)
    return new URL(`../assets/sync-grids/icon_orb_${color}.png`, import.meta.url).href;
};

onMounted(() => {
    updateWindowWidth();
    window.addEventListener('resize', updateWindowWidth);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth);
});
</script>

<style scoped>
.sync-grid-container {
    inline-size: 100%;
    block-size: 100%;
    display: flex;
    flex-direction: column;
    background: transparent;
}

/* 顶部信息栏 */
.bonus-header {
    flex-shrink: 0;
    inline-size: 100%;
    max-inline-size: 320px;
    margin: 10px auto;
    display: flex;
    flex-direction: column;
    /* gap: px; */
    z-index: 10;
    position: relative;
}

.info-bar,
.rating-section {
    pointer-events: auto;
}

.info-bar {
    display: flex;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    background-image: url('../assets/images/bg_btn.png');
    background-size: cover;
    background-position: center;
}

.info-item {
    flex: 1;
    padding: 4px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-family: "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
    line-height: 1.2;
}

.info-label {
    font-size: 12px;
    font-weight: 600;
    color: #212129;
    letter-spacing: 0.5px;
}

.info-value {
    font-family: "Roboto", "Helvetica Neue", "Microsoft YaHei", sans-serif;
    font-size: 12px;
    font-weight: 800;
    color: #677785;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
    font-variant-numeric: tabular-nums;
}

.rating-section {
    padding: 5px 10px;
    display: flex;
    justify-content: center;
    /* border-radius: 8px; */
    /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); */
}

/* Academy 資源列表容器 */
.academy-resources {
    position: absolute;
    left: 10px;
    /* 固定在右側 */
    top: 20%;
    transform: translateY(-50%);
    /* 垂直居中 */

    display: flex;
    flex-direction: column;
    /* 垂直排列 */
    gap: 4px;

    background-color: rgba(116, 115, 115, 0.6);
    /* 深色半透明背景 */
    padding: 8px 12px;
    border-radius: 12px;
    /* 圓角 */

    /* 防止在小屏幕遮擋中間內容，可以設個最大高度讓它滾動，或者調整z-index */
    z-index: 10;
    max-height: 90%;
    overflow-y: auto;
}

/* 單個資源行 */
.academy-item {
    display: flex;
    align-items: center;
    gap: 6px;
}

/* 圖片樣式 */
.academy-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
}

/* 文字樣式 */
.academy-count {
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    /* 增加文字可讀性 */
    font-family: monospace;
    /* 讓數字對齊更好看 */
}

/* 滚动区域 */
.svg-scroll-area {
    flex: 1;
    inline-size: 100%;
    overflow: auto;
    position: relative;
    -webkit-overflow-scrolling: touch;

    scrollbar-width: thin;
    scrollbar-color: #568dd1 #f0f4f8;

    display: flex;
    justify-content: center;
    align-items: center;

    touch-action: manipulation;

    -webkit-tap-highlight-color: transparent;
}

.svg-scroll-area::-webkit-scrollbar {
    inline-size: 8px;
    block-size: 8px;
}

.svg-scroll-area::-webkit-scrollbar-track {
    background-color: #f0f4f8;
}

.svg-scroll-area::-webkit-scrollbar-thumb {
    background-color: #568dd1;
    border-radius: 4px;
}

.svg-scroll-area::-webkit-scrollbar-thumb:hover {
    background-color: #4a7bb3;
}

/* SVG 本体 */
.main-svg {
    display: block;
    /* 桌面端：自适应 */
    inline-size: 100%;
    block-size: 100%;
    max-block-size: 100%;

    -webkit-tap-highlight-color: transparent;
}

.center-avatar {
    border: 2px solid white;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}


.tile-group {
    transition: filter 0.3s ease;

    cursor: pointer;
    /* 去除高亮 */
    -webkit-tap-highlight-color: transparent;
}

.tile-locked .grid-text {
    fill: #666;
}

.grid-text {
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    font-weight: 800;
    font-size: clamp(12px, 2.5vw, 13px);
    fill: white;
    stroke: #333;
    stroke-width: 3px;
    paint-order: stroke fill;
    filter: drop-shadow(0px 2px 1px rgba(0, 0, 0, 0.1));
    user-select: none;
    pointer-events: none;
}

/* ================== 移动端关键样式 ================== */
@media (max-width: 768px) {

    .main-svg {
        inline-size: 100%;
        block-size: 100%;
        /* min-inline-size: 150%; */
        min-block-size: 80vh;
    }

    .svg-scroll-area {
        align-items: flex-start;
        padding-block-start: 20px;
    }

    .academy-resources {
        top: 10%;
        transform: none;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 3px;
        padding: 4px 6px;
        background-color: rgba(0, 0, 0, 0.5);
        max-width: 70%;
    }

    .academy-icon {
        width: 16px;
        height: 16px;
    }

    .academy-count {
        font-size: 12px;
    }
}

/* ================== 弹窗样式 ================== */
.tile-window {
    inline-size: 260px;
    background: rgba(235, 230, 215, 0.98);
    border: 2px solid #fff;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    pointer-events: auto;
}

.tile-window-header {
    font-weight: bold;
    font-size: 14px;
    padding: 6px;
    text-align: center;
    color: #fff;
    border-start-start-radius: 8px;
    border-start-end-radius: 8px;
    text-shadow:
        1px 1px 0 #555,
        -1px 1px 0 #555,
        1px -1px 0 #555,
        -1px -1px 0 #555;
}

.tile-content {
    padding: 10px;
}

.tile-descr {
    margin: 0 0 8px 0;
    font-size: 13px;
    line-height: 1.5;
    color: #333;
}

.tile-other {
    margin: 0;
    font-size: 12px;
    color: #666;
    text-align: center;
    font-weight: bold;
}

.academy-reqs {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    /* 每個項目之間的間距 */
    margin-top: 4px;
    /* 與上一行的距離 */
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    /* 可選：加條分隔線 */
    padding-top: 4px;
}

.orb-tag {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 13px;
    line-height: 1.5;
    /* font-size: 12px; */
    /* color: #ffd700; */
    /* 用金色或亮色突出顯示特殊需求 */
}

.mini-orb {
    width: 15px;
    height: 15px;
    object-fit: contain;
}

/* 移动端顶部显示逻辑 */
.mobile-popup {
    position: fixed !important;
    inset-inline-start: 50% !important;

    inset-block-start: 0% !important;
    inset-block-end: auto !important;

    transform: translateX(-50%) !important;
    inline-size: 90vw;
    max-inline-size: 260px;
    z-index: 10000 !important;

    /* 向下滑入动画 */
    animation: slideDown 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

@keyframes slideDown {
    from {
        transform: translate(-50%, -100%);
        opacity: 0;
    }

    to {
        transform: translate(-50%, 0);
        opacity: 1;
    }
}

.desktop-popup {
    transition: top 0.15s ease-out, left 0.15s ease-out;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>