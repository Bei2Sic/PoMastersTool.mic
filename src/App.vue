<template>
  <div class="app-root">
    <transition name="fade" mode="out-in">
      <Home v-if="currentPage === 'home'" @navigate="goToPage" />

      <div v-else-if="currentPage === 'sync'" class="tool-wrapper">
        <Sync />

        <button class="back-home-btn" @click="currentPage = 'home'" title="返回目录">
          🏠
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Home from '@/components/Home.vue'; // 刚才建的目录
import Sync from '@/components/Sync.vue'; // 你现在的工具主组件

// 状态：当前显示哪个页面
const currentPage = ref('home'); // 默认进目录

const goToPage = (pageName: string) => {
  currentPage.value = pageName;
};
</script>

<style scoped>
.app-root {
  inline-size: 100vw;
  block-size: 100vh;
  overflow: hidden;
}

/* 简单的页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 悬浮返回按钮 */
.back-home-btn {
  position: fixed;
  inset-block-start: 10px;
  /* 放在左上角 */
  inset-inline-start: 10px;
  z-index: 2000;
  /* 确保层级够高 */
  inline-size: 40px;
  block-size: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-home-btn:hover {
  background: #f0f0f0;
}
</style>