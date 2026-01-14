<template>
    <div class="potential-select-container">

        <div class="current-status-bar">
            <div class="status-label">当前潜能：</div>
            <div class="current-skill" :class="{ 'is-empty': !modelValue }">
                <div v-if="modelValue" class="skill-content">
                    <span class="skill-name">{{ modelValue.name }}</span>
                    <button class="remove-btn" @click="handleRemove" title="移除潜能">×</button>
                </div>
                <div v-else class="empty-text">无潜能</div>
            </div>
        </div>

        <div class="tab-header">
            <button class="tab-btn" :class="{ 'active': activeTab === 'general' }" @click="activeTab = 'general'">
                <img src="@/assets/images/icon_cookie_purple.png" class="tab-icon" alt="通用" />
            </button>
            <button class="tab-btn" :class="{ 'active': activeTab === 'special' }" @click="activeTab = 'special'">
                <img src="@/assets/images/icon_cookie_special.png" class="tab-icon" alt="通用" />
            </button>
        </div>

        <div class="list-container bg-pattern">

            <div v-if="activeTab === 'general'" class="cookie-list">
                <div v-for="skill in STANDARD_COOKIES" :key="skill.name" class="cookie-card"
                    :class="{ 'is-selected': isSelected(skill) }" @click="handleSelect(skill)">
                    <div class="card-left">
                        <div class="skill-name">{{ skill.name }}</div>
                        <div class="skill-desc">{{ skill.description }}</div>
                    </div>
                    <div class="card-right">
                        <span class="select-tag">{{ isSelected(skill) ? '已选' : '选择' }}</span>
                    </div>
                </div>
            </div>

            <div v-if="activeTab === 'special'" class="cookie-list">
                <template v-if="specialCookies && specialCookies.length > 0">
                    <div v-for="(group, gIndex) in specialCookies" :key="gIndex" class="cookie-group">
                        <div class="group-title">{{ group.cookieName }}</div>

                        <div v-for="(skill, sIndex) in group.skills" :key="`${gIndex}-${sIndex}`"
                            class="cookie-card special-card" :class="{ 'is-selected': isSelected(skill) }"
                            @click="handleSelect(skill)">
                            <div class="card-left">
                                <div class="skill-name">{{ skill.name }}</div>
                                <div class="skill-desc">{{ skill.description }}</div>
                            </div>
                            <div class="card-right">
                                <span class="select-tag">{{ isSelected(skill) ? '已选' : '选择' }}</span>
                            </div>
                        </div>
                    </div>
                </template>
                <div v-else class="empty-tip">
                    <span class="empty-icon">📭</span>
                    <p>该拍组暂无推荐的专属潜能</p>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue';

// ... 接口定义保持不变 (LuckCookieSkill, Passive 等) ...
interface Detail { [key: string]: any; }
export interface LuckCookieSkill { name: string; description: string; detail?: Detail[]; rate: number; }
export interface LuckCookie { cookieName: string; skills: LuckCookieSkill[]; }
export interface Passive { name: string; description: string; detail: Detail[]; }

const props = defineProps({
    specialCookies: { type: Array as PropType<LuckCookie[]>, default: () => [] },
    modelValue: { type: Object as PropType<Passive | null>, default: null }
});

const emit = defineEmits(['update:modelValue']);

// ✨ 新增：Tab 状态 ('general' | 'special')
const activeTab = ref<'general' | 'special'>('general');

// 通用潜能数据 (保持不变)
const STANDARD_COOKIES: LuckCookieSkill[] = [
    { name: '效果絕佳時威力提升2', description: '當效果絕佳時，會提高該招式的威力。', rate: 100 },
    { name: '威力隨招式計量槽提升3', description: '選擇招式時，招式計量槽的剩餘量越多，招式的威力就提高得越多。', rate: 100 },
    { name: '異常狀態時威力提升3', description: '當自己陷入異常狀態時，會提高招式的威力。', rate: 100 },
    { name: '沙暴時威力提升3', description: '當天氣為沙暴時，會提高招式的威力。', rate: 100 },
    { name: '危機時威力提升2', description: '在陷入危機時，會提高招式的威力。', rate: 100 },
    { name: '擊中要害時威力提升2', description: '擊中對手要害時，會提高當下該攻擊的威力。', rate: 100 },
    { name: '天氣變化時寶可夢招式及拍組招式↑3', description: '只有在天氣變化時，會提高招式的威力。只有在天氣變化時，會提高拍組招式的威力。', rate: 100 },
    { name: '寶可夢招式及拍組招式效果絕佳時威力↑3', description: '當效果絕佳時，會提高該招式的威力。當效果絕佳時，會提高該拍組招式的威力。', rate: 100 },
];

const isSelected = (skill: LuckCookieSkill) => props.modelValue?.name === skill.name;

const handleSelect = (skill: LuckCookieSkill) => {
    const passive: Passive = {
        name: skill.name,
        description: skill.description,
        detail: skill.detail || []
    };
    emit('update:modelValue', passive);
};

const handleRemove = () => emit('update:modelValue', null);
</script>

<style scoped>
.potential-select-container {
    display: flex;
    flex-direction: column;
    block-size: 100%;
    background-color: #6b2323;
    border-radius: 8px;
    overflow: hidden;
}

/* 顶部状态栏 */
.current-status-bar {
    flex-shrink: 0;
    padding: 12px 16px;
    background: #f9f9f9;
    border-block-end: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 10px;
}

.status-label {
    font-weight: bold;
    color: #555;
    font-size: 14px;
}

.current-skill {
    flex: 1;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 14px;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-block-size: 34px;
}

.current-skill.is-empty {
    color: #999;
    background: #f5f5f5;
    border-style: dashed;
}

.skill-name {
    font-weight: bold;
    color: #e65100;
    /* 橙色高亮 */
}

.remove-btn {
    background: none;
    border: none;
    font-size: 18px;
    color: #999;
    cursor: pointer;
    line-height: 1;
    padding: 0 4px;
}

.remove-btn:hover {
    color: #ff4d4f;
}

.tab-header {
    flex-shrink: 0;
    display: flex;
    border-block-end: 1px solid #e0e0e0;
    background: #fff;
    block-size: 48px;
    /* 给 Header 一个固定高度 */
}

.tab-btn {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0;
    /* 清除默认内边距 */
    cursor: pointer;
    position: relative;

    /* ✨ 关键：Flex 居中三件套 */
    display: flex;
    align-items: center;
    justify-content: center;

    transition: background-color 0.2s;
}

.tab-btn:hover {
    background-color: #fcfcfc;
}

.tab-btn.active {
    background-color: #f0f7ff;
}

/* 图标基础样式 */
.tab-icon {
    inline-size: 50px;
    /* 设置合适的图标大小 */
    block-size: 50px;
    object-fit: contain;
    opacity: 0.5;
    /* 默认半透明（灰色态） */
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    /* 加个动画 */
}

/* ✨ 选中状态：图标高亮/放大 */
.tab-btn.active .tab-icon {
    opacity: 1;
    /* 恢复完全不透明 */
    transform: scale(1.1);
    /* 稍微放大一点点 */
    filter: drop-shadow(0 2px 4px rgba(86, 141, 209, 0.3));
    /* 加点发光阴影 */
}

/* 底部指示条 (保持不变) */
.tab-btn.active::after {
    content: '';
    position: absolute;
    inset-block-end: 0;
    inset-inline-start: 0;
    inline-size: 100%;
    block-size: 3px;
    background-color: #568dd1;
    border-radius: 3px 3px 0 0;
    /* 让条稍微圆润点 */
}

/* 列表容器 */
.list-container {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    background-color: #f7f8fa;
    /* 浅灰背景 */
}

/* 1. 滚动条整体尺寸 (必须用 width/height) */
.list-container::-webkit-scrollbar {
    width: 6px;
    /* 纵向滚动条的宽度 */
    height: 6px;
    /* 横向滚动条的高度 */
}

/* 2. 滚动条轨道背景 */
.list-container::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
}

/* 3. 滚动条滑块 (Thumb) */
.list-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    /* 默认淡灰色 */
    border-radius: 3px;
    border: 1px solid transparent;
    /* 增加透明边框让滑块变细 */
    background-clip: content-box;
    /* 让背景色只在内容区显示 */
}

/* 4. 鼠标悬停时加深 */
.list-container::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
}

.cookie-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* 饼干卡片样式 */
.cookie-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 12px 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    background-image: url('@/assets/images/bg1.png');
}

.cookie-card:hover {
    border-color: #568dd1;
    box-shadow: 0 4px 12px rgba(86, 141, 209, 0.15);
    transform: translateY(-1px);
}

.cookie-card.is-selected {
    background-color: #fffbf0;
    /* 选中底色 */
    border-color: #fa8c16;
    box-shadow: 0 0 0 1px #fa8c16 inset;
}

.special-card.is-selected {
    background-color: #e6fffb;
    border-color: #13c2c2;
    box-shadow: 0 0 0 1px #13c2c2 inset;
}

.card-left {
    flex: 1;
    margin-inline-end: 15px;
}

.skill-name {
    font-size: 15px;
    font-weight: bold;
    color: #333;
    margin-block-end: 4px;
}

.skill-desc {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
}

.card-right {
    flex-shrink: 0;
}

.select-tag {
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 12px;
    background: #f0f0f0;
    color: #999;
}

.is-selected .select-tag {
    background: #fa8c16;
    color: white;
}

.special-card.is-selected .select-tag {
    background: #13c2c2;
    color: white;
}

.group-title {
    font-size: 13px;
    color: #888;
    margin: 15px 0 8px 4px;
    font-weight: bold;
}

.group-title:first-child {
    margin-block-start: 0;
}

.empty-tip {
    text-align: center;
    color: #999;
    padding: 40px 0;
}

.empty-icon {
    font-size: 40px;
    display: block;
    margin-block-end: 10px;
    opacity: 0.5;
}

.bg-pattern {
    background-image: url('@/assets/images/bg2.png');
}
</style>