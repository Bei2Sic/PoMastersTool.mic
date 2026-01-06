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
                        <div class="latest-version">
                            <div class="version-header">
                                <span class="tag-new">LATEST</span>
                                <span class="v-num">{{ latestLog.version }}</span>
                                <span class="v-date">{{ latestLog.date }}</span>
                            </div>
                            <h4 v-if="latestLog.title">{{ latestLog.title }}</h4>
                            <ul>
                                <li v-for="(line, idx) in latestLog.content" :key="idx">{{ line }}</li>
                            </ul>
                        </div>

                        <div class="divider"><span>歷史更新</span></div>

                        <div class="history-list">
                            <div v-for="log in historyLogs" :key="log.version" class="history-item">
                                <div class="h-header">
                                    <span class="h-ver">{{ log.version }}</span>
                                    <span class="h-date">{{ log.date }}</span>
                                </div>
                                <ul>
                                    <li v-for="(line, lIdx) in log.content" :key="lIdx">{{ line }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div v-else class="credit-list">
                        <div class="credit-item" v-for="(group, gIndex) in creditList" :key="gIndex">
                            <span class="role">{{ group.role }}</span>

                            <div class="members-wrapper">
                                <template v-for="(member, mIndex) in group.members" :key="mIndex">

                                    <!-- <div v-if="member.avatar" class="avatar-item" :title="member.name">
                                        <img :src="getAvatarUrl(member.avatar)" :alt="member.name"
                                            class="credit-avatar" />
                                    </div>

                                    <a v-else-if="member.link" :href="member.link" target="_blank"
                                        rel="noopener noreferrer" class="credit-link">
                                        {{ member.name }}
                                        <span class="link-icon">↗</span>
                                    </a>

                                    <span v-else class="credit-text">{{ member.name }}</span> -->

                                    <div v-if="member.avatar" class="avatar-item" :title="member.name">
                                        <img :src="getAvatarUrl(member.avatar)" :alt="member.name"
                                            class="credit-avatar" />
                                    </div>

                                    <a v-else-if="member.link" :href="member.link"
                                        :target="member.link.startsWith('http') ? '_blank' : undefined"
                                        class="credit-link">

                                        <template v-if="member.value">
                                            <span class="link-label">{{ member.name }}</span>
                                            <span class="link-number">{{ member.value }}</span>
                                        </template>
                                        <template v-else>
                                            {{ member.name }}
                                            <span class="link-icon">↗</span>
                                        </template>
                                    </a>

                                    <span v-else>
                                        <template v-if="member.value">
                                            <span class="text-label">{{ member.name }}</span>
                                            <span class="text-number">{{ member.value }}</span>
                                        </template>
                                        <template v-else>
                                            {{ member.name }}
                                        </template>
                                    </span>

                                    <span v-if="!member.avatar &&
                                        group.members[mIndex + 1] &&
                                        !group.members[mIndex + 1].avatar &&
                                        mIndex < group.members.length - 1" class="separator">, </span>
                                </template>
                            </div>
                        </div>
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
import { changelogs } from '@/constances/changlog';
import { APP_VERSION_KEY } from '@/constances/key';
import { onMounted, ref } from 'vue';

// --- 數據處理 ---
// 取出第一個作為最新
const latestLog = changelogs[0];
// 取出剩下的作為歷史
const historyLogs = changelogs.slice(1);

// 控制显示逻辑
const visible = ref(false);
const currentTab = ref('update'); // 默认显示更新

// 自动检查版本号
const GAME_VERSION = 'v2.64.0';
const MY_VERSION = '4'
onMounted(() => {
    const lastVersion = localStorage.getItem(APP_VERSION_KEY);
    if (lastVersion !== GAME_VERSION + '_' + MY_VERSION) {
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
    localStorage.setItem(APP_VERSION_KEY, GAME_VERSION + '_' + MY_VERSION);
};

// 暴露给父组件
defineExpose({ open });

const getAvatarUrl = (name: string) => {
    return new URL(`../assets/credit/${name}`, import.meta.url).href;
};

const creditList = [
    {
        role: '技术参考',
        members: [
            { name: 'Stdk', link: 'https://pomatools.github.io/', avatar: '' },
            { name: 'Brybry', link: 'https://pokemon.brybry.ch/masters/programme.html', avatar: '' },
        ]
    },
    {
        role: '资源支持',
        members: [
            { name: 'u/Xtraterrestre', link: 'https://pomasters.github.io/SyncPairsTracker/', avatar: '' },
        ]
    },
    {
        role: '数据校对',
        members: [
            { name: '天空寺翔', avatar: 'wag.png', link: '' },
            { name: 'Route No.4', avatar: 'r4.png', link: '' },
        ]
    },
    {
        role: '特别鸣谢',
        members: [
            { name: 'iko', avatar: 'iko.png', link: '' },
            { name: '钳子', avatar: 'qak.png', link: '' },
            { name: '蘑菇头', avatar: 'wenzi.png', link: '' },
            { name: '爪哥', avatar: 'zclaw.png', link: '' },
            { name: '竹兰粉', avatar: 'ag.png', link: '' },
            { name: '白朗', avatar: 'bl.png', link: '' },
        ]
    },
    {
        role: '问题反馈',
        members: [
            { name: 'bei2sic@gmail.com', avatar: '', link: 'mailto:bei2sic@gmail.com' },
            { name: '宝大师贴吧群', avatar: '', link: '', value: '788951151', },
        ]
    },
];

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
    inline-size: 90%;
    max-inline-size: 400px;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-block-size: 80vh;
}

.modal-tabs {
    display: flex;
    background: #f5f5f5;
    border-block-end: 1px solid #ddd;
}

.tab-btn {
    flex: 1;
    padding: 12px;
    border: none;
    background: transparent;
    font-weight: bold;
    color: #666;
    cursor: pointer;
    border-block-end: 3px solid transparent;
    transition: all 0.2s;
}

.tab-btn.active {
    color: #009688;
    border-block-end-color: #009688;
    background: white;
}

.close-icon {
    inline-size: 40px;
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
    padding-inline-start: 20px;
    line-height: 1.3;
    font-size: 14px;
    color: #444;
}

.tab-content li {
    margin-block-end: 5px;
}

/* 分隔線 */
.divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 20px 0;
    color: #999;
    font-size: 12px;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    border-block-end: 1px dashed #ddd;
}

.divider span {
    padding: 0 10px;
}

/* 歷史版本列表 - 稍微淡一點 */
.history-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.history-item {
    padding-inline-start: 10px;
    border-inline-start: 3px solid #eee;
}

.h-header {
    display: flex;
    gap: 10px;
    margin-block-end: 4px;
}

.h-ver {
    font-weight: bold;
    color: #555;
}

.h-date {
    color: #999;
    font-size: 12px;
}

.history-item ul {
    margin: 0;
    padding-inline-start: 18px;
    color: #666;
    font-size: 13px;
    line-height: 1.5;
}

.copyright {
    font-size: 12px;
    color: #999;
    text-align: center;
}

.latest-version {
    background-color: #e0f2f1;
    /* 淡綠色背景 */
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #b2dfdb;
}

.version-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-block-end: 10px;
}

.tag-new {
    background: #ff5252;
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
}

.v-num {
    font-size: 18px;
    font-weight: bold;
    color: #00695c;
}

.v-date {
    font-size: 12px;
    color: #666;
    margin-inline-start: auto;
}

.latest-version h4 {
    margin: 5px 0 10px;
    color: #004d40;
}

.latest-version ul {
    margin: 0;
    padding-inline-start: 20px;
    color: #333;
    line-height: 1.6;
}

.members-wrapper {
    flex: 1;
    /* 占据剩余空间 */
    display: flex;
    flex-wrap: wrap;
    /* 允许换行 */
    justify-content: flex-end;
    /* 靠右对齐 */
    align-items: center;
    gap: 4px;
    /* 成员之间的间距 */
    text-align: end;
    padding-inline-start: 10px;
    /* 防止和左侧太近 */
    align-items: center;
    /* 确保文字和头像垂直居中 */
    line-height: 1;
    /* 防止头像把行高撑得太乱 */
}

.credit-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-block-end: 1px dashed #eee;
    font-size: 14px;
}

.credit-item span {
    color: #666;
}

.credit-item strong {
    color: #333;
}

.credit-link {
    color: #009688;
    text-decoration: none;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    transition: opacity 0.2s;
}

.credit-link:hover {
    opacity: 0.8;
}

.link-label,
.text-label {
    color: #718096;
    margin-inline-end: 8px;
    display: inline-block;
    vertical-align: middle;
    position: relative;
    inset-block-start: 1px;
}

.link-number,
.text-number {
    font-family: "SF Mono", "Roboto Mono", Consolas, monospace;
    font-weight: 600;
    color: #2d3748;
    background-color: #edf2f7;
    padding: 1px 6px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    font-size: 0.9em;
    display: inline-block;
    vertical-align: middle;
    display: inline-block;
    vertical-align: middle;
}

/* 鼠标移上去时的效果 */
.credit-link:hover .link-number {
    background-color: #e2e8f0;
    border-color: #cbd5e0;
    color: #000;
}

.avatar-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-inline-start: 6px;
    /* 头像之间稍微多点间距 */
    cursor: help;
    /* 鼠标放上去显示问号/提示，表示可以查看名字 */
}

/* 头像图片本身 */
.credit-avatar {
    inline-size: 32px;
    /* 大小根据需要调整 */
    block-size: 32px;
    border-radius: 50%;
    /* 圆形 */
    object-fit: cover;
    border: 2px solid #fff;
    /* 加个白边更好看 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    /* 淡淡的阴影 */
    transition: transform 0.2s;
}

.credit-avatar:hover {
    transform: scale(1.1);
    /* 悬停放大一点点 */
    z-index: 1;
}

.link-icon {
    font-size: 12px;
    /* 小箭头稍微小一点 */
    margin-inline-start: 2px;
}

/* 针对左侧 Role 的微调 (可选) */
.role {
    color: #666;
    font-size: 13px;
}

.modal-footer {
    padding: 16px;
    border-block-start: 1px solid #eee;
}

.confirm-btn {
    inline-size: 100%;
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