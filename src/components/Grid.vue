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
                <Bonus :model-value="localBonusLevel" @update:model-value="handleBonusUpdate" :star-size="20" :gap="5"
                    :max-rating="maxBonusLevel" />
            </div>
        </div>

        <div class="svg-scroll-area" @click.self="handleBackgroundClick">

            <svg :viewBox="viewBox" preserveAspectRatio="xMidYMid meet" class="main-svg">
                <image :href="trainerAvatarUrl" :x="-CONST_TRAINER_SIZE / 2 + 10" :y="-CONST_TRAINER_SIZE / 2"
                    :width="CONST_TRAINER_SIZE" :height="CONST_TRAINER_SIZE" rx="50%" ry="50%" class="center-avatar" />
                <circle cx="0" cy="0" :r="CONST_TRAINER_SIZE / 2" fill="transparent"
                    :style="{ cursor: onTrainerClick ? 'pointer' : 'default', pointerEvents: onTrainerClick ? 'auto' : 'none' }"
                    @click.stop="handleTrainerClick" />

                <template v-for="tile in gridData" :key="tile.id">
                    <g :transform="`translate(${calcHexSvgX(tile.x)}, ${calcHexSvgY(tile.x, tile.y)})`"
                        class="tile-group" @click.stop="handleTileClick(tile.id, $event)"
                        :class="{ 'tile-locked': !isTileReachable(tile) }" @mouseenter="handleTileHover(tile, $event)"
                        @mouseleave="handleTileHover(null)">

                        <polygon :points="hexPoints"
                            :style="{ cursor: isTileReachable(tile) ? 'pointer' : 'not-allowed' }" fill="transparent" />

                        <image :href="getTileBorderUrl(tile)" :x="-CONST_TILE_SIZE / 2" :y="-CONST_TILE_SIZE / 2"
                            :width="CONST_TILE_SIZE" :height="CONST_TILE_SIZE" pointer-events="none" />
                        <image :href="getTileFillUrl(tile)" :x="-CONST_TILE_SIZE / 2" :y="-CONST_TILE_SIZE / 2"
                            :width="CONST_TILE_SIZE" :height="CONST_TILE_SIZE" pointer-events="none" />

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
                </div>
            </div>
        </transition>

    </div>
</template>

<script setup>
import Bonus from '@/components/Bonus.vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const CONST_HEX_RADIUS = 50;
const CONST_TRAINER_SIZE = 70;
const CONST_TILE_SIZE = 100;
const X_SPACING_RATIO = 0.8;
const Y_SPACING_RATIO = 1.05;

const props = defineProps({
    gridData: { type: Array, required: true },
    trainer: { type: Object, required: true },
    currentRarity: { type: Number, required: true },
    bonusLevel: { type: Number, required: true },
    costOrbs: { type: Number, required: true },
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

const emit = defineEmits(['update:bonusLevel']);
const localBonusLevel = ref(props.bonusLevel);

// 状态
const hoveredTile = ref(null);
const popupPosition = ref({ 'inset-block-start': 0, 'inset-inline-start': 0, placeAbove: false });
const isMobile = ref(false);

// 坐标与 viewBox 计算 
const calcHexSvgX = (x) => x * (CONST_HEX_RADIUS * 2 * X_SPACING_RATIO);
const calcHexSvgY = (x, y) => {
    const ySpacing = CONST_HEX_RADIUS * Math.sqrt(3) * Y_SPACING_RATIO;
    const absX = Math.abs(x);
    const cof = x > 0 ? (-1) * absX : absX;
    return (-y) * ySpacing + cof * (ySpacing / 2);
};

const viewBox = computed(() => {
    if (!props.gridData || props.gridData.length === 0) return '-500 -500 1000 1000';

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    props.gridData.forEach(tile => {
        const cx = calcHexSvgX(tile.x);
        const cy = calcHexSvgY(tile.x, tile.y);
        minX = Math.min(minX, cx - CONST_HEX_RADIUS);
        maxX = Math.max(maxX, cx + CONST_HEX_RADIUS);
        minY = Math.min(minY, cy - CONST_HEX_RADIUS);
        maxY = Math.max(maxY, cy + CONST_HEX_RADIUS);
    });

    // 留白
    const padding = 10;

    const x = minX - padding;
    const y = minY - padding;
    const w = (maxX - minX) + padding * 2;
    const h = (maxY - minY) + padding * 2;

    return `${x} ${y} ${w} ${h}`;
});

const trainerAvatarUrl = computed(() => {
    return props.getTrainerAvatarUrl(props.trainer.actorId, props.currentRarity === 6);
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
const handleTileClick = (id, event) => {
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
const handleTileHover = (tile, event) => {
    if (isMobile.value) return;
    hoveredTile.value = tile;
    if (tile && event) {
        updatePopupPosition(event);
    }
};

const updatePopupPosition = (event) => {
    const target = event.currentTarget;
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

    if (placeAbove) style.top = `${top}px`;
    else style.top = `${bottom}px`;

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
    gap: 8px;
    z-index: 10;
    position: relative;
}

.info-bar,
.rating-section {
    pointer-events: auto;
}

.info-bar {
    display: flex;
    background-color: #0b7a75;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.info-item {
    flex: 1;
    padding: 6px 0;
    text-align: center;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
}

.info-value {
    font-weight: bold;
    margin-inline-start: 4px;
}

.rating-section {
    padding: 6px 12px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    display: flex;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
}

.center-avatar {
    border: 2px solid white;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}


.tile-group {
    transition: filter 0.3s ease;
}

.tile-locked {

    filter: grayscale(0.8) brightness(0.5) contrast(0.8);
    cursor: not-allowed !important;
}

.tile-locked .grid-text {
    fill: #aaa;
    /* 文字变灰 */
    stroke: #333;
    /* 描边变淡 */
}

.grid-text {
    font-size: clamp(12px, 2vw, 13px);
    font-weight: 800;
    fill: white;
    /* stroke: black;
    stroke-width: 2.5px;
    stroke-linejoin: round; */
    paint-order: stroke;
    user-select: none;
    text-shadow:
        1px 1px 0 #555,
        -1px 1px 0 #555,
        1px -1px 0 #555,
        -1px -1px 0 #555;
}

/* ================== 移动端关键样式 ================== */
@media (max-width: 768px) {

    /* 强制放大画布，使其可滚动，解决文字过小问题 */
    .main-svg {
        inline-size: 100%;
        block-size: 100%;
        /* min-inline-size: 150%; */
        min-block-size: 80vh;
    }

    .svg-scroll-area {
        display: block;
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