// import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/main.css';

import { useSyncCacheStore } from "@/stores/syncCache";
import { useSyncElemStore } from "@/stores/syncElem";
import { createPinia } from "pinia";
import { createApp } from 'vue';
import App from './App.vue';
import VConsole from 'vconsole';

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

if (import.meta.env.MODE === 'development' || window.location.host.includes('dev')) {
    new VConsole();
}

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)
app.use(pinia);

// 初始化拍组缓存（网页加载时执行）
const syncCacheStore = useSyncCacheStore();
// 等待所以json文件加载完毕
await syncCacheStore.initSyncCache();
const syncElemStore = useSyncElemStore();
// 默认初始化最新拍组
syncElemStore.initActiveSync()

app.mount("#app");
