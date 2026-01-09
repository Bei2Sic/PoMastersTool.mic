<template>
    <div class="custom-rating" :style="{ gap: `${gap}px` }" @mousemove="handleInteract"
        @touchmove.passive="handleInteract" @click="handleInteract">
        <div v-for="index in maxRating" :key="index" class="custom-star" :style="{
            inlineSize: `${starSize}px`,
            blockSize: `${starSize}px`,
            backgroundImage: getStarBg(index),
            cursor: 'pointer'
        }"></div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: { type: Number, default: 1 },
    starSize: { type: Number, default: 20 },
    gap: { type: Number, default: 5 },
    maxRating: {
        type: Number,
        default: 5,
        validator: (val) => [5, 10].includes(val)
    }
});

const emit = defineEmits(['update:modelValue']);

const currentBonus = ref(Math.max(1, Math.round(props.modelValue)));

watch(() => props.modelValue, (val) => {
    const validRating = Math.min(props.maxRating, Math.max(1, Math.round(val)));
    currentBonus.value = validRating;
}, { immediate: true });

const getStarBg = (index) => {
    const isFullStar = index <= currentBonus.value;
    return index <= 5
        ? (isFullStar ? 'var(--iconSyncLevelOn)' : 'var(--iconSyncLevelOff)')
        : (isFullStar ? 'var(--iconAwakeningLevelOn)' : 'var(--iconAwakeningLevelOff)');
};

// ✨✨✨ 核心修改：统一处理鼠标和触摸事件 ✨✨✨
const handleInteract = (e) => {
    // 1. 获取容器 DOM
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();

    // 2. 兼容获取 X 轴坐标
    let clientX;

    if (e.type.startsWith('touch')) {
        // 移动端：从 touches 数组中获取第一根手指的位置
        // 如果是 touchend 事件，可能需要从 changedTouches 获取，但这里主要处理 touchmove
        clientX = e.touches[0].clientX;
    } else {
        // PC端：直接获取
        clientX = e.clientX;
    }

    // 3. 计算逻辑（保持不变）
    const relativeX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    let rating = Math.ceil(relativeX * props.maxRating);
    rating = Math.min(props.maxRating, Math.max(1, rating));

    // 4. 更新
    if (rating !== currentBonus.value) {
        currentBonus.value = rating;
        emit('update:modelValue', rating);
    }
};
</script>

<style scoped>
.custom-rating {
    display: flex;
    align-items: center;
    user-select: none;
    position: relative;
    z-index: 999;
    /* padding: 2px 0; */
    flex-wrap: nowrap;
    /* 增加触摸区域，防止手指太粗遮挡或者点不到 */
    touch-action: none;

    -webkit-tap-highlight-color: transparent;
}

.custom-star {
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    transition: background-image 0.1s ease, transform 0.1s ease;
    /* 移除移动端点击时的高亮背景色 */
    -webkit-tap-highlight-color: transparent;
}

.custom-star:hover {
    transform: scale(1.1);
}
</style>