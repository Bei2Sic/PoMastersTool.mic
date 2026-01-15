<template>
    <div class="home-container">    
        <div class="logo-area">
            <img src="@/assets/icons/2.64.0.png" class="logo" />
            <h1>寶可夢大師EX計算器</h1>
            <p class="subtitle">拍組篩選 · 石盤點選 · 傷害計算</p>
        </div>

        <div class="menu-grid">
            <div class="menu-card primary" @click="$emit('navigate', 'sync')">
                <img src="@/assets/st/ch0101_10_mei_st_1003_128.png" class="menu-icon" alt="单人" />
                <div class="text">
                    <h3>单人模式</h3>
                    <p>石盘点选 & 伤害计算</p>
                </div>
            </div>

            <div class="menu-card primary" @click="$emit('navigate', 'team')">
                <img src="@/assets/st/ch0101_42_mei_st_1004_128.png" class="menu-icon" alt="多人" />
                <div class="text">
                    <h3>组队模式</h3>
                    <p>组队伤害计算</p>
                </div>
            </div>
        </div>

        <div class="footer-links">
            <button class="link-btn" @click="openInfo('update')">更新日志</button>
            <span class="divider">|</span>
            <button class="link-btn" @click="openInfo('credits')">致谢名单</button>
        </div>

        <InfoModal ref="infoModalRef" />
    </div>
</template>

<script setup lang="ts">
import InfoModal from '@/components/InfoModal.vue';
import { ref } from 'vue';

defineEmits(['navigate']);
const infoModalRef = ref();

const openInfo = (tab: string) => {
    infoModalRef.value?.open(tab);
};
</script>

<style scoped>
.home-container {
    block-size: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-image: url('@/assets/images/bg2.png');
    padding: 20px;
}

.logo-area {
    text-align: center;
    margin-block-end: 40px;
}

.logo {
    inline-size: 80px;
    block-size: 80px;
    border-radius: 16px;
    margin-block-end: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

h1 {
    color: #333;
    margin: 0;
    font-size: 24px;
}

.subtitle {
    color: #666;
    margin-block-start: 5px;
    font-size: 14px;
}

.menu-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
    inline-size: 100%;
    max-inline-size: 320px;
}

.menu-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: transform 0.1s;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.menu-card:active {
    transform: scale(0.98);
}

.menu-card.primary {
    border-inline-start: 5px solid #009688;
}

.menu-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    filter: grayscale(1);
}

.menu-icon {
    inline-size: 48px;
    block-size: 48px;
    object-fit: contain;
    /* 保持图片比例 */
    margin-inline-end: 10px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));

    /* 防止被压缩 */
    flex-shrink: 0;
}

/* 针对禁用状态的图标处理 */
.menu-card.disabled .menu-icon {
    filter: grayscale(1);
    /* 自动变黑白 */
    opacity: 0.6;
}

.menu-card h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
}

.menu-card p {
    margin: 4px 0 0;
    font-size: 12px;
    color: #888;
}

.footer-links {
    margin-block-start: 40px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.link-btn {
    background: none;
    border: none;
    color: #009688;
    font-weight: bold;
    cursor: pointer;
}

.divider {
    color: #ccc;
}
</style>