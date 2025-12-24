<!-- components/SyncGrid.vue -->
<template>
    <div class="sync-grid-container">
        <!-- 顶层容器：透明背景，bonus-container 和 SVG 同层 -->
        <div class="top-container">
            <!-- 滴晶+星级区域（透明背景，和SVG同层） -->
            <div class="bonus-container">
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
                    <Bonus :model-value="localBonusLevel" @update:model-value="handleBonusUpdate" :star-size="20"
                        :gap="5" :max-rating="maxBonusLevel" />
                </div>
            </div>

            <!-- SVG石盘容器 -->
            <div class="svg-wrapper" ref="svgWrapperRef">
                <!-- SVG画布 -->
                <svg :width="svgWidth" :height="svgHeight">
                    <image :href="trainerAvatarUrl" :x="centerX - pokemonSize / 2 + 6" :y="centerY - pokemonSize / 2"
                        :width="pokemonSize" :height="pokemonSize" rx="50%" ry="50%"
                        style="border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);" />
                    <circle :cx="centerX" :cy="centerY" :r="pokemonSize / 2" fill="transparent"
                        :style="{ cursor: onTrainerClick ? 'pointer' : 'default', pointerEvents: onTrainerClick ? 'auto' : 'none' }"
                        @click.stop="handleTrainerClick" />

                    <!-- 六边形石盘 -->
                    <template v-for="tile in gridData" :key="tile.id">
                        <polygon :points="hexPoints"
                            :transform="`translate(${calcHexSvgX(tile.x)}, ${calcHexSvgY(tile.x, tile.y)})`" :style="{
                                cursor: isTileReachable(tile) ? 'pointer' : 'not-allowed',
                            }" @click.stop="handleTileClick(tile.id)" @mouseenter="handleTileHover(tile)"
                            @mouseleave="handleTileHover(null)" />

                        <image :href="getTileBorderUrl(tile)" :x="calcHexSvgX(tile.x) - tileUrlWidth / 2"
                            :y="calcHexSvgY(tile.x, tile.y) - tileUrlHeight / 2" :width="tileUrlWidth"
                            :height="tileUrlHeight" pointer-events="none" />
                        <image :href="getTileFillUrl(tile)" :x="calcHexSvgX(tile.x) - tileUrlWidth / 2"
                            :y="calcHexSvgY(tile.x, tile.y) - tileUrlHeight / 2" :width="tileUrlWidth"
                            :height="tileUrlHeight" pointer-events="none" />
                        <text :x="calcHexSvgX(tile.x)" :y="calcHexSvgY(tile.x, tile.y)" text-anchor="middle"
                            dominant-baseline="middle" pointer-events="none">
                            <tspan v-for="(line, index) in fixTileName(tile)" :key="index" :x="calcHexSvgX(tile.x)" :dy="index === 0
                                ? (-0.6 * (fixTileName(tile).length - 1)) + 'em'
                                : '1.2em'" class="tile-text">
                                {{ line }}
                            </tspan>
                        </text>
                    </template>
                </svg>

                <!-- Tile信息悬浮窗（使用你的位置计算逻辑，相对SVG容器定位） -->
                <div v-if="hoveredTile" class="tile-window" :style="{
                    borderColor: hoveredTile.color,
                }">
                    <div class="tile-name" :style="{ backgroundColor: hoveredTile.color }">
                        {{ hoveredTile.name }}
                    </div>
                    <div class="tile-content">
                        <p class="tile-descr">{{ hoveredTile.description }}</p>
                        <p class="tile-other">
                            滴晶：{{ hoveredTile.orb }}&nbsp;&nbsp;力量：{{ hoveredTile.energy }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Bonus from '@/components/Bonus.vue';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

// ====================== Props ======================
const props = defineProps({
    // 基础数据（石盘渲染必需）
    gridData: { type: Array, required: true }, // 石盘数据
    trainer: { type: Object, required: true }, // 训练家信息（含actorId、maxBonusLevel）

    // 动态状态（单向绑定，子组件通过事件更新）
    currentRarity: { type: Number, required: true },
    bonusLevel: { type: Number, required: true }, // 星级props（不可直接修改）

    // 计算属性值（直接接收结果，避免子组件计算）
    costOrbs: { type: Number, required: true }, // 滴晶消耗
    lastEnergy: { type: Number, required: true }, // 剩余力量

    // 方法
    isTileReachable: { type: Function, required: true }, // 石盘是否可达
    getTileBorderUrl: { type: Function, required: true }, // 石盘边框图
    getTileFillUrl: { type: Function, required: true }, // 石盘填充图
    getTrainerAvatarUrl: { type: Function, required: true }, // 训练家头像URL
    fixTileName: { type: Function, required: true }, // 石盘名称格式化
    toggleTile: { type: Function, required: true }, // 石盘点击核心方法（父组件传递）
    checkSelectedTiles: { type: Function, required: true }, // 已选实盘检查方法
    onTrainerClick: { type: Function, required: false }, // 筛选拍组点击事件（可选）

});

// ====================== Emits ======================
const emit = defineEmits([
    'update:bonusLevel', // 星级更新事件（通知父组件修改props）
]);

// ====================== 内部状态 ======================
const isSingleView = ref(window.innerWidth <= 900);
const hoveredTile = ref(null); // 当前hover的石盘
const svgWrapperRef = ref(null); // SVG容器ref（用于悬浮窗定位）
const localBonusLevel = ref(props.bonusLevel); // 本地状态中转星级

// SVG配置（沿用你的原始尺寸逻辑）
const svgWidth = ref(0);
const svgHeight = ref(0);
const svgHeightOffset = ref(0);
const bonusContainerHeight = ref(0);
const centerX = ref(0); // SVG中心点X
const centerY = ref(0); // SVG中心点Y
const centerOffsetX = ref(0);
const pokemonSize = ref(55); // 中心头像尺寸
const hexRadius = ref(40); // 石盘大小
const hexPoints = ref(''); // 六边形顶点
const tileUrlWidth = ref(80); // 石盘资源宽度
const tileUrlHeight = ref(80); // 石盘资源高度
const tileWinWidth = ref(260); // 悬浮窗宽度
const tileWinHeight = ref(120); // 悬浮窗高度
const xSpacingRatio = ref(0.8); // 横向间距系数
const ySpacingRatio = ref(1.05); // 纵向间距系数

// 训练家头像URL（依赖currentRarity判断是否EX）
const trainerAvatarUrl = computed(() => {
    return props.getTrainerAvatarUrl(props.trainer.actorId, props.currentRarity === 6);
});
// 最大星级（从trainer获取）
const maxBonusLevel = computed(() => props.trainer.maxBonusLevel || 5);

const handleBonusUpdate = (newLevel) => {
    localBonusLevel.value = newLevel;
    emit('update:bonusLevel', newLevel);
};

watch(
    () => localBonusLevel.value, // 监听星级变化
    (newBonusLevel, oldBonusLevel) => {
        if (newBonusLevel !== oldBonusLevel) {
            props.checkSelectedTiles();
            // console.log('星级更新：', newBonusLevel, '→ 触发检查选中石盘');
        }
    },
    {
        immediate: false
    }
);
watch(
    () => [props.bonusLevel],
    ([newBonusLevel]) => {
        localBonusLevel.value = newBonusLevel;
    },
    { immediate: true }
);

/**
 * 初始化SVG配置：画布尺寸、六边形顶点
 */
const initSvgConfig = () => {
    const svgWrapper = svgWrapperRef.value;
    if (!svgWrapper) return;

    // SVG画布尺寸 = 容器尺寸
    svgWidth.value = svgWrapper.offsetWidth;
    const containerHeight = svgWrapper.offsetHeight;
    const bonusContainer = document.querySelector('.bonus-container');
    bonusContainerHeight.value = bonusContainer ? bonusContainer.offsetHeight : 0;
    svgHeight.value = containerHeight - bonusContainerHeight.value + svgHeightOffset.value;
    // svgHeight.value = svgWrapper.offsetHeight;

    // 计算正六边形6个顶点（精准无偏差）
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (i * 60) * Math.PI / 180;
        const x = hexRadius.value * Math.cos(angle);
        const y = hexRadius.value * Math.sin(angle);
        points.push(`${x},${y}`);
    }
    hexPoints.value = points.join(' ');

    // 计算SVG中心点（和你的原始布局一致）
    calcSvgCenter();
};

/**
 * 计算SVG中心点
 */
const calcSvgCenter = () => {
    centerX.value = svgWidth.value / 2 + centerOffsetX.value;
    centerY.value = svgHeight.value / 2;
};

/**
 * 计算石盘在SVG中的X坐标
 */
const calcHexSvgX = (x) => {
    const xSpacing = (hexRadius.value * 2) * xSpacingRatio.value;
    return centerX.value + x * xSpacing;
};

/**
 * 计算石盘在SVG中的Y坐标
 */
const calcHexSvgY = (x, y) => {
    const ySpacing = (hexRadius.value * Math.sqrt(3)) * ySpacingRatio.value;
    const absX = Math.abs(x);
    const cof = x > 0 ? (-1) * absX : absX; // 右列向左错位，左列向右错位
    return centerY.value + (-y) * ySpacing + cof * (ySpacing / 2);
};

// /**
//  * 计算石盘信息显示窗口X坐标
//  */
// const calcTileWinX = (x) => {
//     if (isSingleView.value) {
//         return (svgWidth.value - tileWinWidth.value) / 2 + centerOffsetX.value;
//     }

//     const tileX = calcHexSvgX(x);

//     // 优先尝试显示在六边形正中间位置
//     let calcX = tileX - tileWinWidth.value / 2;
//     if (calcX + tileWinWidth.value + 10 > svgWidth.value) {
//         calcX = calcX - tileWinWidth.value / 2;
//     }
//     if (calcX < 0) {
//         calcX = (svgWidth.value - tileWinWidth.value) / 2;
//     }
//     return calcX;
// };

// /**
//  * 计算石盘信息显示窗口Y坐标
//  */
// const calcTileWinY = (x, y) => {
//     if (isSingleView.value) {
//         const screenHeight = window.innerHeight;
//         const windowHeight = tileWinHeight.value;
//         const scrollY = window.scrollY;

//         const bottomY = scrollY + screenHeight - windowHeight * 1.5 - 10;
//         if (y < 0) {
//             return scrollY + 50;
//         } else if (y > 0) {
//             return bottomY;
//         }
//     }

//     const tileY = calcHexSvgY(x, y);

//     // 优先尝试显示在六边形正下方位置
//     let calcY = tileY + hexRadius.value;
//     if (calcY + tileWinHeight.value > svgHeight.value) {
//         calcY = calcY - tileWinHeight.value * 2;
//     }

//     return calcY;
// };

/**
 * 屏幕适配：根据窗口大小调整石盘、SVG尺寸
 */
const adjustSizeByScreen = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // console.log(screenWidth, screenHeight)
    const isSmallScreen = screenWidth <= 390 || screenHeight < 700;
    const isMediumScreen = screenWidth < 700 || (screenHeight >= 700 && screenHeight <= 900);

    // 尺寸适配逻辑
    if (isSmallScreen) {
        hexRadius.value = 25;
        pokemonSize.value = 35;
        tileUrlWidth.value = 50;
        tileUrlHeight.value = 50;
        ySpacingRatio.value = 1.00;
        centerOffsetX.value = 15;
        tileWinWidth.value = 240;
        tileWinHeight.value = 110;
    } else if (isMediumScreen) {
        hexRadius.value = 30;
        pokemonSize.value = 40;
        tileUrlWidth.value = 60;
        tileUrlHeight.value = 60;
        ySpacingRatio.value = 1.00;
        centerOffsetX.value = 20;
    } else {
        hexRadius.value = 40;
        pokemonSize.value = 55;
        tileUrlWidth.value = 80;
        tileUrlHeight.value = 80;
        ySpacingRatio.value = 1.05;
        centerOffsetX.value = 0;
    }

    if (screenHeight >= 900 && !isSingleView.value) {
        svgHeightOffset.value = 200;
    } else if (screenHeight < 900 && screenHeight > 650) {
        svgHeightOffset.value = 100;
    } else if (screenHeight <= 650) {
        svgHeightOffset.value = 300;
    }

    // 重新初始化SVG配置
    initSvgConfig();
};

// ====================== 事件处理 ======================
/**
 * 石盘点击：直接调用父组件传递的toggleTile方法
 */
const handleTileClick = (tileId) => {
    props.toggleTile(tileId);
};

/**
 * 石盘hover：使用你的位置计算逻辑显示悬浮窗
 */
const handleTileHover = (tile) => {
    hoveredTile.value = tile;
    // 无需额外计算，悬浮窗样式直接绑定calcTileWinX/calcTileWinY
};

/**
 * 中心头像点击：可选功能（父组件传递方法则生效）
 */
const handleTrainerClick = () => {
    if (props.onTrainerClick) {
        props.onTrainerClick();
    }
};

// ====================== 生命周期与监听 ======================
/**
 * 窗口大小变化：重新适配
 */
const handleResize = () => {
    adjustSizeByScreen();
};

/**
 * 组件挂载：初始化尺寸
 */
onMounted(() => {
    nextTick(() => {
        initSvgConfig();
        adjustSizeByScreen();
        window.addEventListener('resize', handleResize);
    });
});

/**
 * 组件卸载：移除监听
 */
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.sync-grid-container {
    inline-size: 100%;
    block-size: 100%;
    display: flex;
    flex-direction: column;
    contain: paint;
}

.top-container {
    inline-size: 100%;
    block-size: 100%;
    position: relative;
    background: transparent;
}

.bonus-container {
    position: absolute;
    inset-block-start: 10px;
    inset-inline-start: 50%;
    transform: translateX(-50%);
    z-index: 99;
    background: transparent;
    /* 透明背景，和SVG同层 */
    inline-size: 280px;
    display: flex;
    flex-direction: column;
    gap: 8px;
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
    padding: 7px 0;
    text-align: center;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
}

.info-label {
    margin-inline-end: 4px;
    opacity: 0.9;
}

.info-value {
    font-weight: bold;
    opacity: 1;
}

.rating-section {
    padding: 8px 12px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    display: flex;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.svg-wrapper {
    inline-size: 100%;
    block-size: 100%;
    overflow: auto;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    position: relative;
    background: transparent;

    scrollbar-width: thin;
    scrollbar-color: #568dd1 #f0f4f8;
}

.svg-wrapper::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.svg-wrapper::-webkit-scrollbar-track {
    background-color: #f0f4f8;
    border-radius: 4px;
}

.svg-wrapper::-webkit-scrollbar-thumb {
    background-color: #568dd1;
    border-radius: 4px;
    border: 2px solid #f0f4f8;
}

.svg-wrapper::-webkit-scrollbar-thumb:hover {
    background-color: #4a7bb3;
}


svg {
    min-inline-size: 100%;
    min-block-size: 700px;
    display: block;
    margin: 0 auto;
    background: transparent;
}

.tile-text {
    font-size: clamp(7px, 2vw, 10px);
    font-weight: bold;
    /* color: white; */
    text-shadow:
        1px 1px 0 #555,
        -1px 1px 0 #555,
        1px -1px 0 #555,
        -1px -1px 0 #555;
    /* 加粗 */
    fill: white;
    /* 文字描边：黑色，让文字在亮色背景也能看清 */
    /* stroke: black; */
    stroke-width: 1.2px;
    stroke-linejoin: round;
    paint-order: stroke;
    user-select: none;
    /* filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1)); */
}

.tile-window {
    position: fixed;
    inset-block-start: 10%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    pointer-events: none;
    inline-size: v-bind('tileWinWidth + "px"');
    background: rgba(235, 230, 215, 0.98);
    border: 2px solid #fff;
    border-radius: 10px;
    padding: 0;
    font-size: 12px;
    line-height: 1.5;
    color: #333;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    opacity: 0.95;
}

.tile-window:hover {
    opacity: 1;
}

.tile-name {
    font-weight: bold;
    font-size: 14px;
    padding: 5px;
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
    padding: 8px;
}

.tile-descr {
    margin: 0 0 6px 0;
    font-weight: 400;
    line-height: 1.6;
    color: #444;
}

.tile-other {
    margin: 0;
    font-weight: 500;
    text-align: center;
    color: #222;
    font-size: 11px;
}

@media (max-width: 1000px) {
    .bonus-container {
        inline-size: 90%;
        max-inline-size: 300px;
    }

    .info-item {
        font-size: 13px;
        padding: 6px 0;
    }

    svg {
        min-block-size: 600px;
    }
}

@media (max-width: 480px) {
    .bonus-container {
        gap: 6px;
        margin: 8px auto;
        inset-block-start: 5px;
    }

    .info-bar {
        gap: 1px;
        background-color: transparent;
    }

    .info-item {
        background-color: #0b7a75;
        border-radius: 4px;
    }

    .rating-section {
        padding: 6px 8px;
    }

    svg {
        min-block-size: 500px;
    }
}
</style>