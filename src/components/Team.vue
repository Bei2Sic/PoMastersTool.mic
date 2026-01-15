<template>
    <div class="team-dashboard-root">

        <div class="team-header-bar">
            <div v-for="(index) in 3" :key="`header-${index}`" class="header-slot-wrapper">
                <div class="header-slot" :class="{
                    'is-active': activeSlotIndex === (index - 1),
                    'is-filled': !!team[index - 1]
                }" @click="handleSlotClick(index - 1)">
                    <div v-if="!team[index - 1]" class="header-empty" @click.stop="openFilter(index - 1)">
                        <img src="@/assets/images/none_pair.png" class="empty-bg" />
                    </div>

                    <div v-else class="header-filled">
                        <div class="role-bg"></div>

                        <img :src="getAvatar(team[index - 1])" class="header-avatar" />
                        <button class="header-remove-btn" @click.stop="handleRemove(index - 1)">×</button>
                    </div>

                    <div class="team-header-btn" @click.="handleMobileBtnClick(index - 1);">
                        {{ '选择' }}
                    </div>
                </div>
            </div>
        </div>

        <div class="columns-wrapper">
            <div v-for="(index) in 3" :key="index" class="column-slot" :class="{
                'is-active': activeSlotIndex === (index - 1),
                'is-empty': !team[index - 1]
            }" @click="handleSlotClick(index - 1)">

                <div v-if="team[index - 1]" class="action-drawer" :class="{ 'is-open': menuState[index - 1] }"
                    @click.stop>
                    <div class="drawer-handle" @click="toggleMenu(index - 1)" title="展开/收起菜单">
                        <span class="handle-icon" :class="{ 'rotate': menuState[index - 1] }">▼</span>
                    </div>

                    <div class="drawer-content">
                        <button class="action-btn" @click="openModal('info', index - 1)">
                            拍组信息
                        </button>
                        <div class="divider"></div>
                        <button class="action-btn" @click="openModal('calc', index - 1)">
                            伤害计算
                        </button>
                    </div>
                </div>

                <div v-if="!team[index - 1]" class="empty-state">
                    <button class="add-btn" @click.stop="openFilter(index - 1)">
                        <div class="add-icon-circle">+</div>
                        <span class="add-text">点击添加</span>
                    </button>
                </div>

                <div v-else class="scroll-container">
                    <div class="potential-trigger-bar"
                        :class="{ 'is-selected': getSlotState(index - 1).potentialCookie }"
                        @click.stop="openPotentialModal(index - 1)">

                        <template v-if="getSlotState(index - 1).potentialCookie">
                            <span class="current-cookie-name">
                                {{ getSlotState(index - 1).potentialCookie?.name }}
                            </span>
                        </template>

                        <template v-else>
                            <span class="placeholder-icon">+</span>
                            <span class="label">潜能饼干</span>
                        </template>
                    </div>


                    <div class="grid-viewport" @mousedown="handleSlotClick(index - 1)">
                        <Grid :key="team[index - 1].rawData.trainer.id" class="responsive-grid" :is-mini="true"
                            :grid-data="getSlotGridData(index - 1)" :trainer="getSlotTrainer(index - 1)"
                            :bonus-level="getSlotState(index - 1).bonusLevel"
                            @update:bonus-level="(val: any) => updateSlotState(index - 1, 'bonusLevel', val)"
                            :current-rarity="getSlotState(index - 1).currentRarity"
                            @update:current-rarity="(val: any) => updateSlotState(index - 1, 'currentRarity', val)"
                            :cost-orbs="getSlotGridInfo(index - 1).costOrbs"
                            :last-energy="getSlotGridInfo(index - 1).lastEnergy"
                            :cost-fiery-orbs="getSlotGridInfo(index - 1).costFieryOrbs"
                            :cost-leaf-orbs="getSlotGridInfo(index - 1).costLeafOrbs"
                            :cost-bubbly-orbs="getSlotGridInfo(index - 1).costBubblyOrbs"
                            :cost-sparky-orbs="getSlotGridInfo(index - 1).costSparkyOrbs"
                            :cost-t-m-orbs="getSlotGridInfo(index - 1).costTMOrbs"
                            :is-tile-reachable="getSlotExportMethod(index - 1).isTileReachable"
                            :check-selected-tiles="getSlotExportMethod(index - 1).checkSelectedTiles"
                            :get-tile-border-url="getSlotExportMethod(index - 1).getTileBorderUrl"
                            :get-tile-fill-url="getSlotExportMethod(index - 1).getTileFillUrl"
                            :fix-tile-name="getSlotExportMethod(index - 1).fixTileName"
                            :toggle-tile="getSlotExportMethod(index - 1).toggleTile"
                            :reset-selected-tiles="getSlotExportMethod(index - 1).resetSelectedTiles"
                            :get-trainer-avatar-url="getTrainerUrl" :on-trainer-click="toggleTrainerSelect" />
                    </div>
                </div>
            </div>
        </div>

        <transition name="modal-fade">
            <div v-if="showPotentialModal" class="modal-overlay" @click="showPotentialModal = false">
                <div class="modal-window potential-window" @click.stop>
                    <div class="modal-header">
                        <div class="pokemon-name">{{ exportMethods.getSyncName() }}</div>
                        <button class="close-icon" @click="showPotentialModal = false">×</button>
                    </div>
                    <Lucky :special-cookies="getSlotLuckCookies(activePotentialSlotIndex)"
                        :model-value="getSlotState(activePotentialSlotIndex).potentialCookie"
                        @update:model-value="handlePotentialSelect" />
                </div>
            </div>
        </transition>

        <transition name="modal-fade">
            <div v-if="showFilterModal" class="modal-overlay" @click="showFilterModal = false">
                <div class="modal-window filter-window" @click.stop>
                    <div class="modal-header">
                        <div class="pokemon-name">选择拍组 {{ activeSlotIndex + 1 }}号位</div>
                        <button class="close-icon" @click="showFilterModal = false">×</button>
                    </div>
                    <div class="filter-wrapper">
                        <Filter :occupied-ids="occupiedTrainerIds" @select-trainer="handleSelectTrainer"
                            @close-modal="showFilterModal = false" />
                    </div>
                </div>
            </div>
        </transition>

        <transition name="modal-fade">
            <div v-if="showInfoModal" class="modal-overlay" @click="showInfoModal = false">
                <div class="modal-window info-window" @click.stop>
                    <div class="modal-header">
                        <div class="pokemon-name">{{ exportMethods.getSyncName() }}</div>
                        <button class="close-icon" @click="showInfoModal = false">×</button>
                    </div>
                    <Info :level-value="currentDynamicState.level"
                        :current-rarity-value="currentDynamicState.currentRarity"
                        :potential-value="currentDynamicState.potential"
                        :ex-role-enabled-value="currentDynamicState.exRoleEnabled"
                        :bonus-level="currentDynamicState.bonusLevel"
                        :selected-pokemon-index="currentDynamicState.selectedPokemonIndex"
                        :trainer="exportMethods.getTrainer()" :themes="exportMethods.getThemes()"
                        :special-awaking="exportMethods.getSpecialAwaking()"
                        :variation-list="exportMethods.getvariationList()" :final-stats="currentFinalStats"
                        :final-moves="currentFinalMoves" :pokemon="currentPokemon"
                        @update:levelValue="(val) => currentDynamicState.level = val"
                        @update:currentRarityValue="(val) => currentDynamicState.currentRarity = val"
                        @update:potentialValue="(val) => currentDynamicState.potential = val"
                        @update:exRoleEnabledValue="(val) => currentDynamicState.exRoleEnabled = val"
                        @update:selectedPokemonIndex="(val) => currentDynamicState.selectedPokemonIndex = val" />
                </div>
            </div>
        </transition>

        <transition name="modal-fade">
            <div v-if="showCalcModal" class="modal-overlay" @click="showCalcModal = false">
                <div class="modal-window calc-window" @click.stop>
                    <Damage :visible="true" :is-team="true" @close="showCalcModal = false" />
                </div>
            </div>
        </transition>

    </div>
</template>

<script setup lang="ts">
import { useSyncElemStore } from '@/stores/syncElem';
import { LuckCookie, Passive, Sync, SyncComputed, SyncDynamicState, SyncMethods, Trainer } from '@/types/syncModel';
import { getTrainerUrl } from '@/utils/format';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import Damage from '@/components/Damage.vue';
import Filter from '@/components/Filter.vue';
import Grid from '@/components/Grid.vue';
import Info from '@/components/Info.vue';
import { RoleIndex } from '@/types/indices';
import Lucky from './Lucky.vue';

const syncStore = useSyncElemStore();
const { team, activeSlotIndex, activeSync, currentDynamicState, currentFinalStats, currentFinalMoves, currentPokemon, exportMethods, occupiedTrainerIds } = storeToRefs(syncStore);

const showFilterModal = ref(false);
const showInfoModal = ref(false);
const showCalcModal = ref(false);
const showPotentialModal = ref(false);
const activePotentialSlotIndex = ref(0);
const openPotentialModal = (index: number) => {
    activePotentialSlotIndex.value = index;
    showPotentialModal.value = true;
};
const handlePotentialSelect = (passive: Passive | null) => {
    // 更新对应槽位的数据
    updateSlotState(activePotentialSlotIndex.value, 'potentialCookie', passive);
    // 选完后关闭弹窗
    showPotentialModal.value = false;
};
const menuState = ref<boolean[]>([false, false, false]);

const handleMobileBtnClick = (index: number) => {
    syncStore.switchActiveSlot(index);

    if (!team.value[index]) {
        openFilter(index);
    }
};

// --- 辅助函数 ---
const getSlotState = (index: number): SyncDynamicState => {
    const sync = team.value[index];
    if (!sync) return {} as SyncDynamicState;
    return sync.state;
}
const updateSlotState = (index: number, key: string, value: any) => {
    const sync = team.value[index];
    if (sync && sync.state) { sync.state[key] = value; }
};
const getSlotGridData = (index: number) => {
    const sync = team.value[index];
    return sync ? sync.state.gridData : [];
}
const getSlotGridInfo = (index: number): SyncComputed => {
    const sync = team.value[index];
    return sync ? sync.computed : {} as SyncComputed;
}
const getSlotTrainer = (index: number): Trainer => {
    const sync = team.value[index];
    return sync ? sync.rawData.trainer : {} as Trainer;
}
const getSlotLuckCookies = (index: number): LuckCookie[] => {
    const sync = team.value[index];
    return sync ? sync.rawData.luckCookies : {} as LuckCookie[];
}
const getSlotExportMethod = (index: number): SyncMethods => {
    const sync = team.value[index];
    return sync ? sync.methods : {} as SyncMethods;
}
const getAvatar = (sync: Sync) => {
    if (!sync || !sync.rawData) return '';
    return getTrainerUrl(sync.rawData.trainer.enActor, sync.rawData.trainer.dexNumber, sync.state.currentRarity, sync.rawData.trainer.count);
};
const getRoleStyle = (sync: Sync) => {
    const role = sync?.rawData?.trainer.role || 0;
    const colors: Record<RoleIndex, string> = {
        0: 'linear-gradient(to right, #ff5f6d, #ffc371)',
        1: 'linear-gradient(to right, #ff5f6d, #ffc371)',
        2: 'linear-gradient(to right, #11998e, #38ef7d)',
        3: 'linear-gradient(to right, #2193b0, #6dd5ed)',
        4: 'linear-gradient(to right, #fc4a1a, #f7b733)',
        5: 'linear-gradient(to right, #834d9b, #d04ed6)',
        6: 'linear-gradient(to right, #cf8412, #e3f304)'
    };
    return { background: colors[role] || '#999' };
};

// --- 交互逻辑 ---

// 点击槽位：激活该列，同时收起其他列的菜单（可选）
const handleSlotClick = (index: number) => {
    syncStore.switchActiveSlot(index);
    // 如果希望点击列空白处就收起菜单，取消注释下面这行
    // menuState.value = [false, false, false];
};

// 切换菜单展开/收起
const toggleMenu = (index: number) => {
    // 切换当前状态
    const isOpen = menuState.value[index];
    // 先关闭所有，实现手风琴效果（互斥）
    menuState.value = [false, false, false];
    // 如果之前是关的，现在打开
    if (!isOpen) {
        menuState.value[index] = true;
    }
    // 同时也激活该列
    syncStore.switchActiveSlot(index);
};

const openFilter = (index: number) => {
    syncStore.switchActiveSlot(index);
    showFilterModal.value = true;
};

const openModal = (type: 'info' | 'calc', index: number) => {
    syncStore.switchActiveSlot(index);
    if (type === 'info') showInfoModal.value = true;
    if (type === 'calc') showCalcModal.value = true;
    // 打开弹窗后，自动收起底部菜单
    menuState.value[index] = false;
};

const handleSelectTrainer = (id: string) => {
    // 检查这个 ID 是否已经在队伍里了
    const existingSlotIndex = team.value.findIndex(
        slot => slot?.rawData?.trainer?.id === id
    );
    // 如果找到了，且不在当前正在操作的槽位上
    if (existingSlotIndex !== -1 && existingSlotIndex !== activeSlotIndex.value) {
        syncStore.swapTeamSlots(existingSlotIndex, activeSlotIndex.value);
    } else {
        // 正常逻辑：没有重复，直接选中
        syncStore.selectSyncToActiveSlot(id);
    }

    showFilterModal.value = false;
};
const toggleTrainerSelect = () => { showFilterModal.value = true; };
const handleRemove = (index: number) => { syncStore.updateTeamSlot(index, null); };

onMounted(async () => {

    // syncStore.initMode(true);
});

</script>

<style scoped>
/* 全局容器 */
.team-dashboard-root {
    inline-size: 100vw;
    block-size: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: #f0f2f5;
}

/* 1. 顶部队伍栏 (Team Header) */
.team-header-bar {
    flex: 0 0 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    /* 居中显示 */
    background-image: url('../assets/images/bg3.png');
    /* 底部装饰线 */
    overflow-y: hidden;
    padding: 0 8px;
    z-index: 10;
}

.team-header-btn {
    display: none;
}

.header-slot-wrapper {
    display: flex;
    align-items: center;
}

.header-slot {
    inline-size: 100px;
    block-size: 100px;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s;
    padding: 10px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

@media (hover: hover) {
    .header-slot:hover {
        transform: scale(1.05);
    }
}

/* 选中状态 */
.header-slot.is-active {
    /* 选中时加个发光效果 */
    filter: drop-shadow(0 0 10px #568dd1);
    z-index: 2;
    /* 浮起 */
}

.header-empty {
    inline-size: 100%;
    block-size: 100%;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-bg {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
    opacity: 1;
}

.header-filled {
    inline-size: 100%;
    block-size: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: transparent;
}

.role-bg {
    position: absolute;
    inset: 0;
    opacity: 0.3;
    z-index: 0;
    /* background: linear-gradient(to right, #ff5f6d, #ffc371); */
    background-size: 200% 100%;
    /* transition: linear-gradient(to right, #cf8412, #e3f304) */
}

.header-avatar {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
    position: relative;
    z-index: 1;
    transform: scale(1.3);
}

.level-badge {
    position: absolute;
    inset-block-start: 2px;
    inset-inline-end: 15px;
    /* 因为是六边形，靠右可能会被切掉，往中间挪一点 */
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 10px;
    font-weight: bold;
    padding: 1px 4px;
    border-radius: 4px;
    z-index: 3;
    pointer-events: none;
}

/* 移除按钮 */
.header-remove-btn {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 75%;
    /* 左上角 */
    inline-size: 16px;
    block-size: 16px;
    background: #ff4d4f;
    border: none;
    color: white;
    font-size: 12px;
    line-height: 1;
    border-radius: 50%;
    display: none;
    /* 默认隐藏 */
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
}

/* 只有悬停且已填充时显示移除按钮 */
.header-slot.is-filled:hover .header-remove-btn {
    display: flex;
}

.header-remove-btn:hover {
    background: #ff4d4f;
}

/* 2. 下方内容区 */
.columns-wrapper {
    flex: 1;
    display: flex;
    min-block-size: 0;
    overflow: auto;
}

.column-slot {
    flex: 1;
    /* border-inline-end: 1px solid #e0e0e0; */
    display: flex;
    flex-direction: column;
    position: relative;
    background: #fcfcfc;
    min-block-size: 0;
    overflow: hidden;
}

.column-slot:last-child {
    border-inline-end: none;
}

.column-slot.is-active {
    background: #fff;
}

/* 空状态 */
.empty-state {
    block-size: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: url('../assets/images/bg1.png');
}

.add-btn {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #94a3b8;
    transition: transform 0.2s;
}

.add-btn:hover {
    transform: scale(1.05);
    color: #568dd1;
}

.add-icon-circle {
    inline-size: 60px;
    block-size: 60px;
    border-radius: 50%;
    border: 2px dashed #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    margin-block-end: 10px;
}

.add-btn:hover .add-icon-circle {
    border-color: #568dd1;
    color: #568dd1;
}

.scroll-container {
    flex: 1;
    inline-size: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background-image: url('../assets/images/bg3.png');
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;

}

.scroll-container::-webkit-scrollbar {
    inline-size: 6px;
}

.scroll-container::-webkit-scrollbar-track {
    background: transparent;
}

.scroll-container::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

/* Grid Viewport - 撑满高度 */
.grid-viewport {
    flex: 1;
    overflow: auto;
    inline-size: 100%;
    block-size: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: url('../assets/images/bg3.png');
}

/* 为了美观，可以自定义滚动条样式（隐形或细条） */
.grid-viewport::-webkit-scrollbar {
    inline-size: 6px;
    block-size: 6px;
}

.grid-viewport::-webkit-scrollbar-track {
    background: transparent;
}

.grid-viewport::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

.grid-viewport::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
}

.responsive-grid {
    inline-size: 100%;
    block-size: 100%;
}

.potential-trigger-bar {
    inline-size: fit-content;
    max-inline-size: 85%;
    max-block-size: 4%;
    /* 防止名字太长撑爆屏幕 */
    margin: 10px auto 5px;
    /* 2. 外观：胶囊圆角 */
    background: transparent;
    border: 1px solid #e0e0e0;
    border-radius: 24px;
    /* 更大的圆角，形成胶囊形状 */
    padding: 6px 16px;
    /* 稍微紧凑的内边距 */

    display: flex;
    align-items: center;
    justify-content: center;
    gap: px;

    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    /* 轻微浮起阴影 */
    z-index: 5;
    flex-shrink: 0;
    transition: all 0.2s ease;
}

/* 悬停效果 */
.potential-trigger-bar:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: #568dd1;
}

/* 选中状态下的特殊样式 (可选：加个边框颜色区分) */
.potential-trigger-bar.is-selected {
    border-color: #ffd591;
    /* 淡橙色边框 */
    background: #fffbf0;
    /* 极淡的暖色背景 */
}

/* 饼干图标 */
.cookie-icon {
    font-size: 14px;
}

/* 加号图标 */
.placeholder-icon {
    font-size: 16px;
    font-weight: bold;
    color: #999;
    line-height: 1;
}

/* “潜能技能” 占位文字 */
.label {
    font-size: 11px;
    color: #ebe7e7;
    font-weight: 600;
}

/* 选中后的饼干名称 */
.current-cookie-name {
    color: #d46b08;
    font-weight: bold;
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.action-drawer {
    position: absolute;
    inset-block-start: 0;
    inset-block-end: auto;
    inline-size: 100%;
    z-index: 20;

    transform: translateY(calc(-100% + 24px));

    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    display: flex;
    flex-direction: column-reverse;
    align-items: flex-start;
}

/* 展开状态 */
.action-drawer.is-open {
    transform: translateY(0);
}

/* 把手 */
.drawer-handle {
    block-size: 24px;
    inline-size: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    margin: 0 20px;
}

.handle-icon {
    font-size: 12px;
    color: #ec0808;
    transition: transform 0.3s;
    display: block;
}

/* 展开时图标旋转 */
.handle-icon.rotate {
    transform: rotate(180deg);
}

/* 抽屉内容区 */
.drawer-content {
    block-size: 60px;
    /* 按钮区域高度 */
    display: flex;
    align-items: center;
    border-block-start: 1px solid #f0f0f0;
    padding: 0 10px;
}

.action-btn {
    flex: 1;
    block-size: 40px;
    border: none;
    background-image: url('@/assets/images/bg3.png');
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: #e2e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
}

.action-btn:hover {
    background: #e6f0ff;
    color: #568dd1;
}

.v-divider {
    inline-size: 1px;
    block-size: 20px;
    background-color: #eee;
    margin: 0 10px;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    padding: 10px;
    background: rgba(0, 0, 0, 0.6);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(4px);
}

.modal-window {
    background: rgb(252, 252, 252);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-block-size: 100vh;
}

/* 弹窗尺寸定义 */
.potential-window {
    inline-size: 500px;
    block-size: 95dvh;
}

.filter-window {
    inline-size: 90%;
    max-inline-size: 500px;
    block-size: 88dvh;
}

.filter-wrapper {
    flex: 1;
    min-block-size: 0;
    display: flex;
    flex-direction: column;
}

.info-window {
    inline-size: 500px;
    block-size: 95dvh;
}

.calc-window {
    inline-size: 900px;
    block-size: 85vh;
    background: transparent;
    box-shadow: none;
}

.modal-header {
    block-size: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    background: #f9f9f9;
    border-block-end: 1px solid #eee;
}

.pokemon-name {
    block-size: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    font-weight: bold;
    font-size: 14px;
    font-weight: 900;
    color: #fff;
    text-shadow:
        -1px -1px 0 #004d40,
        1px -1px 0 #004d40,
        -1px 1px 0 #004d40,
        1px 1px 0 #004d40;
    letter-spacing: 1.5px;
}

.modal-header h3 {
    font-size: 16px;
    margin: 0;
    color: #333;
}

.close-icon {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
}

.close-icon:hover {
    color: #333;
}

.bg-pattern {
    background-image: url('@/assets/images/bg1.png');
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
}


@media (max-width: 768px) {

    /* 1. 调整根容器高度，去除固定高度，允许浏览器原生滚动条 (可选，防止 Safari 底部工具栏遮挡) */
    .team-dashboard-root {
        block-size: 100vh;
        /* 使用 dvh (dynamic viewport height) 体验更好，如果浏览器支持 */
        block-size: 100dvh;
    }

    .team-header-bar {
        overflow: hidden !important;
        display: flex;
        justify-content: space-between;
        padding: 0 10px;
        gap: 10px;
        min-block-size: 140px;
        align-items: flex-start;
    }

    .header-slot-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        position: relative;
    }

    .header-slot {
        inline-size: 100px;
        block-size: 100px;
        -webkit-tap-highlight-color: transparent;
    }

    .team-header-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-block-start: 8px;
        z-index: 20;
        color: #666;
        font-size: 12px;
        font-weight: bold;
        padding: 4px 14px;
        border-radius: 12px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        border: 1px solid #eee;
        white-space: nowrap;
        transition: all 0.2s;

        background-image: url('../assets/images/bg_btn.png');
        background-size: cover;
        background-position: center;

        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;

        -webkit-tap-highlight-color: transparent;
    }

    .column-slot {
        /* 默认隐藏所有列 */
        display: none;
        /* 移除边框，因为现在只有一列 */
        border-inline-end: none;
        border-inline-end: none;
    }

    .column-slot.is-active {
        display: flex;
        flex: 1;
        inline-size: 100%;
        /* 独占全屏宽度 */
        block-size: 100%;
    }

    /* 4. 调整石盘视口 */
    .grid-viewport {
        /* 移动端不需要那么宽的内边距 */
        padding: 10px;
    }

    /* 5. 调整下拉菜单位置 */
    .action-drawer {
        /* 移动端可能需要更大的把手方便手指点击 */
    }

    .drawer-handle {
        /* 增加触摸区域 */
        min-inline-size: 60px;
        block-size: 30px;
    }
}
</style>