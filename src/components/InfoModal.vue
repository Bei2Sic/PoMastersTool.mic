<template>
    <transition name="fade">
        <div v-if="visible" class="modal-overlay" @click.self="handleClose">
            <div class="modal-content">
                <div class="modal-tabs">
                    <button :class="['tab-btn', { active: currentTab === 'update' }]" @click="currentTab = 'update'">
                        🔔 更新公告
                    </button>
                    <button :class="['tab-btn', { active: currentTab === 'credits' }]" @click="currentTab = 'credits'">
                        ❤️ 致谢名单
                    </button>
                    <button class="close-icon" @click="handleClose">×</button>
                </div>

                <div class="modal-body">
                    <div v-if="currentTab === 'update'" class="tab-content">
                        <p class="date">{{ CURRENT_VERSION }}</p>
                        <h4>✨ 最近更新：</h4>
                        <ul>
                            <li>优化了拍组筛选界面的网格布局。</li>
                        </ul>
                    </div>

                    <div v-else class="tab-content credits">
                        <h4>特别感谢 / Special Thanks</h4>
                        <div class="credit-list">
                            <div class="credit-item">
                                <span>技术支持</span><strong>Stdk, Xtraterrestre</strong>
                            </div>
                            <!-- <div class="credit-item">
                                <span>开发协力</span><strong>GitHub Copilot</strong>
                            </div> -->
                        </div>
                        <div class="divider"></div>
                        <p class="copyright">© 2024 Pokémon Masters Tool</p>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="confirm-btn" @click="handleClose">关闭</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

// ✨ 改动：删除了 Props 和 Emits 定义，因为我们用 ref 控制，不需要 v-model

// 控制显示逻辑
const visible = ref(false);
const currentTab = ref('update'); // 默认显示更新

// 自动检查版本号
const CURRENT_VERSION = 'v2.64.0';
onMounted(() => {
    const lastVersion = localStorage.getItem('app_version');
    if (lastVersion !== CURRENT_VERSION) {
        visible.value = true;
        currentTab.value = 'update'; // 有更新时强制看公告
    }
});

// 对外暴露 open 方法，供父组件手动打开
const open = (tab = 'update') => {
    currentTab.value = tab;
    visible.value = true;
};

const handleClose = () => {
    visible.value = false;
    // 关闭时记录已读
    localStorage.setItem('app_version', CURRENT_VERSION);
};

// 暴露给父组件
defineExpose({ open });
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(2px);
}

.modal-content {
    width: 90%;
    max-width: 400px;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 80vh;
}

.modal-tabs {
    display: flex;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
}

.tab-btn {
    flex: 1;
    padding: 12px;
    border: none;
    background: transparent;
    font-weight: bold;
    color: #666;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;
}

.tab-btn.active {
    color: #009688;
    border-bottom-color: #009688;
    background: white;
}

.close-icon {
    width: 40px;
    border: none;
    background: transparent;
    font-size: 20px;
    cursor: pointer;
    color: #999;
}

.modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
}

/* 简单的列表样式 */
.tab-content ul {
    padding-left: 20px;
    line-height: 1.6;
    color: #444;
}

.tab-content li {
    margin-bottom: 5px;
}

.date {
    color: #888;
    font-size: 12px;
    margin-bottom: 10px;
}

.divider {
    height: 1px;
    background: #eee;
    margin: 15px 0;
}

.copyright {
    font-size: 12px;
    color: #999;
    text-align: center;
}

.credit-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px dashed #eee;
    font-size: 14px;
}

.credit-item span {
    color: #666;
}

.credit-item strong {
    color: #333;
}

.modal-footer {
    padding: 16px;
    border-top: 1px solid #eee;
}

.confirm-btn {
    width: 100%;
    padding: 12px;
    background: #009688;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
}

.confirm-btn:hover {
    background: #00796b;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>