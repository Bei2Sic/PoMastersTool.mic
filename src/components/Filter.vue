<template>
    <!-- 筛选输入框 -->
    <div class="filter-input-container">
        <input v-model="searchKey" placeholder="搜索拍组名称/类型..." class="filter-input" />
    </div>

    <!-- 筛选结果列表 -->
    <div class="trainer-list">
        <div v-if="filteredTrainers.length === 0" class="no-result">
            未找到匹配的拍组，请更换关键词～
        </div>
        <div v-for="trainer in filteredTrainers" :key="trainer.id" class="trainer-item" :class="'bg_' + getTypeInfoWithCnName(trainer.type).key.toLowerCase()" @click="handleSelect(trainer)">
            <!-- 拍组头像 -->
            <img :src="getTrainerUrl(trainer.actorId, false)" alt="trainer" class="trainer-avatar" />
            <!-- 拍组信息 -->
            <div class="trainer-info">
                <div class="trainer-name">{{ trainer.name }}</div>
                <div class="trainer-type">{{ trainer.role }}</div>
            </div>
        </div>
    </div>

    <!-- 关闭按钮 -->
    <button class="close-btn" @click="emit('close-modal')">关闭</button>
</template>

<script setup>
import { getTypeInfoWithCnName } from '@/core/exporter/map';
import { useSyncCacheStore } from "@/stores/syncCache";
import { getTrainerUrl } from '@/utils/format';
import { Converter } from 'opencc-js';
import { computed, ref } from 'vue';

const syncCacheStore = useSyncCacheStore();
const metaTrainer = computed(() => syncCacheStore.getMeta);
const searchKey = ref('');
const filteredTrainers = computed(() => {
    const key = toTraditional(searchKey.value.trim().toLowerCase());
    if (!key) return metaTrainer.value;
    return metaTrainer.value.filter(
        (trainer) =>
            trainer.name.toLowerCase().includes(key) ||
            trainer.type.toLowerCase().includes(key)
    );
});

// 初始化简体转繁体转换器（s2t = simplified to traditional）
const converter = Converter({ from: 'cn', to: 'tw' });
// 可选配置：
// from: 'cn'（简体）, to: 'tw'（台湾繁体）/ 'hk'（香港繁体）/ 'twp'（台湾繁体+注音）
// 常用：cn→tw（最通用）

// 封装转换函数（简化调用）
const toTraditional = (text) => {
    if (!text) return '';
    return converter(text); // 简体转繁体
};

const emit = defineEmits([
    'select-trainer',
    'close-modal',
]);



// 4. 选中拍组，传递给父组件
const handleSelect = (trainer) => {
    emit('select-trainer', trainer.id);
    emit('close-modal'); // 关闭弹窗
};
</script>

<style scoped>
/* 筛选输入框 */
.filter-input-container {
    margin-block-end: 16px;
}

.filter-input {
    inline-size: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
}

/* 拍组列表 */
.trainer-list {
    max-block-size: 400px;
    overflow-y: auto;
    gap: 8px;
    display: flex;
    flex-direction: column;
    margin-block-end: 16px;
}

/* 拍组项 */
.trainer-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 8px;
    background-color: #f5f5f5;
    cursor: pointer;
    transition: background-color 0.2s;
}

.trainer-item:hover {
    background-color: #e8f4f8;
}

/* 拍组头像 */
.trainer-avatar {
    inline-size: 40px;
    block-size: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #eee;
}

/* 拍组信息 */
.trainer-info {
    flex: 1;
}

.trainer-name {
    font-size: 15px;
    font-weight: 500;
    color: #333;
}

.trainer-type {
    font-size: 12px;
    color: #131212c5;
}

/* 关闭按钮 */
.close-btn {
    inline-size: 100%;
    padding: 10px;
    background-color: #0b7a75;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.close-btn:hover {
    background-color: #096460;
}
</style>