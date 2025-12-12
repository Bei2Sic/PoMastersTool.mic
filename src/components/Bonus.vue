<template>
    <div class="custom-rating" :style="{ gap: `${gap}px` }" @mousemove="handleMouseMove">
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
    modelValue: { // 实时绑定, 滑动即更新
        type: Number,
        default: 1 // 最低1星
    },
    starSize: {
        type: Number,
        default: 20
    },
    gap: {
        type: Number,
        default: 5
    },
    maxRating: {
        type: Number,
        default: 5,
        validator: (val) => [5, 10].includes(val)
    }
});

const emit = defineEmits(['update:modelValue']);

const currentBonus = ref(Math.max(1, Math.round(props.modelValue)));

// 初始化+监听父组件传入的modelValue变化
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

const handleMouseMove = (e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    // 计算鼠标相对位置（0~1）
    const relativeX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    // 转换为整数评分（1~maxRating）
    let rating = Math.ceil(relativeX * props.maxRating);
    // 强制最低1星、最高maxRating
    rating = Math.min(props.maxRating, Math.max(1, rating));

    // 评分变化时，同步更新并通知父组件（滑动即确认）
    if (rating !== currentBonus.value) {
        currentBonus.value = rating;
        emit('update:modelValue', rating); // 实时同步给v-model
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
    padding: 2px 0;
    flex-wrap: nowrap;
    /* 强制一条直线 */
}

.custom-star {
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    transition: background-image 0.1s ease, transform 0.1s ease;
}

.custom-star:hover {
    transform: scale(1.1);
}
</style>