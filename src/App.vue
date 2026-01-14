<template>
  <div class="app-root">
    <transition name="fade" mode="out-in">
      <Home v-if="currentPage === 'home'" @navigate="goToPage" />

      <div v-else-if="currentPage === 'sync'" class="tool-wrapper">
        <div v-if="syncStore.activeSync">
          <Sync />
        </div>

        <button class="back-home-btn home-pos" @click="currentPage = 'home'" title="返回目录">
          <img src="@/assets/images/icon_remove.png" class="home-icon" alt="Home" />
        </button>
      </div>

      <div v-else-if="currentPage === 'team'" class="tool-wrapper">
        <Team />

        <button class="back-home-btn home-pos" @click="currentPage = 'home'" title="返回目录">
          <img src="@/assets/images/icon_remove.png" class="home-icon" alt="Home" />
        </button>
      </div>

    </transition>
  </div>
</template>

<script setup lang="ts">
import Home from '@/components/Home.vue';
import Sync from '@/components/Sync.vue';
import { ref, onMounted } from 'vue';
import Team from './components/Team.vue';
import { useSyncElemStore } from "@/stores/syncElem";

const syncStore = useSyncElemStore();

// 状态：当前显示哪个页面
const currentPage = ref('home');

const goToPage = (pageName: string) => {
  currentPage.value = pageName;
};

onMounted(() => {
  syncStore.initMode(false);
});
</script>

<style scoped>
.app-root {
  inline-size: 100vw;
  block-size: 100vh;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.back-home-btn {
  position: fixed;
  z-index: 2000;

  inline-size: 40px;
  block-size: 40px;
  border-radius: 50%;
  border: 1px solid #ddd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  background-image: url('@/assets/images/bg1.png');
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;

  transition: transform 0.2s, background-color 0.2s;
}

.back-home-btn:hover {
  background: #f0f0f0;
  transform: scale(1.1);
}

.home-icon {
  inline-size: 100%;
  block-size: 100%;
  object-fit: contain;
  display: block;
}

.home-pos {
  inset-block-end: 10px;
  inset-inline-start: 10px;
}
</style>