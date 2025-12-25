<template>
    <div class="info-root">

        <div class="controls-header">

            <div v-if="props.variationList.length >= 2" class="variation-banner" :class="{ 'switching': isSwitching }"
                @click="toggleVariation">
                <div class="banner-content">
                    <span class="banner-text">
                        {{ props.variationList[internalSelectedPokemonIndex] }}
                    </span>
                </div>
            </div>

            <div class="config-row">
                <div class="config-box">
                    <span class="config-label">等級</span>
                    <input type="number" v-model.number="internalLevelValue" class="config-input"
                        @input="handleLevelInput" min="1" max="200" />
                </div>

                <div class="config-box">
                    <span class="config-label">星數</span>
                    <select v-model="internalCurrentRarityValue" class="config-input" @change="handleRarityChange">
                        <option :value="3" v-if="trainer.rarity <= 3">★★★</option>
                        <option :value="4" v-if="trainer.rarity <= 4">★★★★</option>
                        <option :value="5" v-if="trainer.rarity <= 5">★★★★★</option>
                        <option :value="6" v-if="trainer.ex">EX</option>
                    </select>
                </div>

                <div class="config-box">
                    <span class="config-label">潛力</span>
                    <select v-model="internalPotentialValue" class="config-input"
                        :disabled="internalCurrentRarityValue === 6" @change="handlePotentialChange">
                        <option v-for="num in 21" :value="num - 1">{{ num - 1 }}</option>
                    </select>
                </div>

                <div class="config-box" v-if="trainer.exRole !== -1">
                    <span class="config-label">EX體系</span>
                    <select v-model="internalExRoleEnabledValue" class="config-input" @change="handleExRoleChange">
                        <option :value="false">-</option>
                        <option :value="true" v-if="trainer.exRole > -1">
                            {{ StatValueCalculator.getExRoleText(trainer.exRole) }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-column hp">
                <div class="stat-header">HP</div>
                <div class="stat-value">{{ finalStats.hp }}</div>
            </div>
            <div class="stat-column atk">
                <div class="stat-header">攻擊</div>
                <div class="stat-value">{{ finalStats.atk }}</div>
            </div>
            <div class="stat-column def">
                <div class="stat-header">防禦</div>
                <div class="stat-value">{{ finalStats.def }}</div>
            </div>
            <div class="stat-column spAtk">
                <div class="stat-header">特攻</div>
                <div class="stat-value">{{ finalStats.spa }}</div>
            </div>
            <div class="stat-column spDef">
                <div class="stat-header">特防</div>
                <div class="stat-value">{{ finalStats.spd }}</div>
            </div>
            <div class="stat-column spd">
                <div class="stat-header">速度</div>
                <div class="stat-value">{{ finalStats.spe }}</div>
            </div>
        </div>

        <div class="tab-section">
            <div class="tab-bar">
                <button class="tab-btn" :class="{ active: activeTab === 'move' }" @click="activeTab = 'move'">
                    招式
                </button>
                <button class="tab-btn" :class="{ active: activeTab === 'passive' }" @click="activeTab = 'passive'">
                    被動
                </button>
                <button class="tab-btn" :class="{ active: activeTab === 'team' }" @click="activeTab = 'team'">
                    隊伍
                </button>
                <button class="tab-btn" :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">
                    資訊
                </button>
            </div>

            <div class="content-container">
                <div v-if="activeTab === 'move'" class="moves-container">
                    <div class="move-card" :class="getMoveBackgroundColorClass(move.type)"
                        v-for="(move, index) in finalMoves.moves ?? []" :key="index">
                        <div class="move-header">
                            <div class="move-title">
                                <span class="icon" :style="getTypeIconStyle(move.type)"></span>
                                {{ move.name }}
                            </div>
                            <div class="move-count">
                                <div class="count-blocks">
                                    <span class="count-block" :style="{
                                        backgroundImage: `var(--iconGauge)`,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center'
                                    }" v-for="i in move.gauge" :key="i"></span>
                                </div>
                                <div class="move-uses" v-if="formatMoveUses(move.uses)">
                                    {{ formatMoveUses(move.uses) }}
                                </div>
                            </div>
                        </div>
                        <div class="move-info">
                            <div class=" info-col">
                                <div class="info-item">
                                    <span class="info-label">分類</span>
                                    <span class="info-value">
                                        <span class="icon" :style="getCategoryIconStyle(move.category)"></span>
                                    </span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">威力</span>
                                    <span class="info-value">{{ move.finalPower }}</span>
                                </div>
                            </div>
                            <div class="info-col">
                                <div class="info-item">
                                    <span class="info-label">目標</span>
                                    <span class="info-value">{{ move.target }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">命中率</span>
                                    <span class="info-value">{{ formatMoveAccuracy(move) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="move-desc">
                            {{ move.description }}
                        </div>
                    </div>

                    <div class="move-card" :class="getMoveBackgroundColorClass(moveMax.type)"
                        v-for="(moveMax, index) in finalMoves.movesDynamax ?? []" :key="index">
                        <div class="move-header">
                            <div class="move-title">
                                <span class="icon" :style="getTypeIconStyle(moveMax.type)"></span>
                                {{ moveMax.name }}
                            </div>
                        </div>
                        <div class="move-info">
                            <div class=" info-col">
                                <div class="info-item">
                                    <span class="info-label">分類</span>
                                    <span class="info-value">
                                        <span class="icon" :style="getCategoryIconStyle(moveMax.category)"></span>
                                    </span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">威力</span>
                                    <span class="info-value">{{ moveMax.finalPower }}</span>
                                </div>
                            </div>
                            <div class="info-col">
                                <div class="info-item">
                                    <span class="info-label">目標</span>
                                    <span class="info-value">{{ moveMax.target }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">命中率</span>
                                    <span class="info-value">{{ formatMoveAccuracy(moveMax) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="move-desc">
                            {{ moveMax.description }}
                        </div>
                    </div>

                    <div class="move-card" :class="getMoveBackgroundColorClass(finalMoves.moveTera.type)"
                        v-if="finalMoves.moveTera">
                        <div class="move-header">
                            <div class="move-title">
                                <span class="icon" :style="getTypeIconStyle(finalMoves.moveTera.type)"></span>
                                {{ finalMoves.moveTera.name }}
                            </div>
                            <div class="move-count">
                                <div class="count-blocks">
                                    <span class="count-block" :style="{
                                        backgroundImage: `var(--iconGauge)`,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center'
                                    }" v-for="i in finalMoves.moveTera.gauge" :key="i"></span>
                                </div>
                                <div class="move-uses" v-if="formatMoveUses(finalMoves.moveTera.uses)">
                                    {{ formatMoveUses(finalMoves.moveTera.uses) }}
                                </div>
                            </div>
                        </div>
                        <div class="move-info">
                            <div class="info-col">
                                <div class="info-item">
                                    <span class="info-label">分類</span>
                                    <span class="info-value">
                                        <span class="icon"
                                            :style="getCategoryIconStyle(finalMoves.moveTera.category)"></span>
                                    </span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">威力</span>
                                    <span class="info-value">{{ finalMoves.moveTera.finalPower }}</span>
                                </div>
                            </div>
                            <div class="info-col">
                                <div class="info-item">
                                    <span class="info-label">目標</span>
                                    <span class="info-value">{{ finalMoves.moveTera.target }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">命中率</span>
                                    <span class="info-value"> {{ formatMoveAccuracy(finalMoves.moveTera) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="move-desc">
                            {{ finalMoves.moveTera.description }}
                        </div>
                    </div>

                    <div class="move-card" :class="getMoveBackgroundColorClass(finalMoves.syncMove.type)"
                        v-if="finalMoves.syncMove">
                        <div class="move-header">
                            <div class="move-title">
                                <span class="icon" :style="getTypeIconStyle(finalMoves.syncMove.type)"></span>
                                {{ finalMoves.syncMove.name }}
                            </div>
                        </div>
                        <div class="move-info">
                            <div class="info-col">
                                <div class="info-item">
                                    <span class="info-label">分類</span>
                                    <span class="info-value">
                                        <span class="icon"
                                            :style="getCategoryIconStyle(finalMoves.syncMove.category)"></span>
                                    </span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">威力</span>
                                    <span class="info-value">{{ finalMoves.syncMove.finalPower }}</span>
                                </div>
                            </div>
                            <div class="info-col">
                                <div class="info-item">
                                    <span class="info-label">目標</span>
                                    <span class="info-value">{{ finalMoves.syncMove.target }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">命中率</span>
                                    <span class="info-value"> {{ formatMoveAccuracy(finalMoves.syncMove) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="move-desc">
                            {{ finalMoves.syncMove.description }}
                        </div>
                    </div>
                </div>

                <div v-else-if="activeTab === 'passive'" class="passives-container">
                    <div class="passive-card" v-if="specialAwaking?.name !== ''" :style="{
                        backgroundImage: bonusLevel === 10 ? `var(--bgPassiveSuperawakening)` : 'none',
                        backgroundColor: bonusLevel === 10 ? 'transparent' : 'var(--textGray',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                    }">
                        <div class="passive-header">
                            <div class="passive-name">{{ specialAwaking.name }}</div>
                            <button class="passive-detail-btn" v-if="specialAwaking.detail?.length > 0"
                                @click="togglePassiveDetail('awaking')">
                                {{ '+' }}
                            </button>
                        </div>
                        <div class="passive-content">
                            <div class="passive-desc" v-if="!specialAwaking.detail || !expandedPassives['awaking']">
                                {{ specialAwaking.description }}
                            </div>
                            <div class="passive-detail" v-else>
                                <div class="passive-desc" v-for="(item, idx) in specialAwaking.detail" :key="idx">
                                    {{ item.name }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="passive-card" v-for="(passive, index) in pokemon.passives ?? []" :key="index"
                        :style="getPassiveBackgroundStyle(index, trainer.exclusivity)">
                        <div class="passive-header">
                            <div class="passive-name">{{ passive.name }}</div>
                            <button class="passive-detail-btn" v-if="passive.detail?.length > 0"
                                @click="togglePassiveDetail(index)">
                                {{ '+' }}
                            </button>
                        </div>
                        <div class="passive-content">
                            <div class="passive-desc" v-if="!passive.detail || !expandedPassives[index]">
                                {{ passive.description }}
                            </div>
                            <div class="passive-detail" v-else>
                                <div class="passive-desc" v-for="(item, idx) in passive.detail" :key="idx">
                                    {{ item.name }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else-if="activeTab === 'team'" class="theme-container">
                    <div class="theme-card" :class="getThemeBackgroundColorClass(index, theme.tag)"
                        v-for="(theme, index) in themes" :key="index">
                        <div class="theme-header">
                            <span class="icon" :style="getThemeIconStyle(theme)"></span>
                            <h3 class="theme-title">{{ theme.tag }}</h3>
                        </div>
                        <div class="theme-descr">
                            {{ theme.description }}
                        </div>
                    </div>
                </div>

                <div v-else-if="activeTab === 'info'" class="tab-content">
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { StatValueCalculator } from '@/core/calculators/stat';
import { formatMoveAccuracy, formatMoveUses, getCategoryIconStyle, getMoveBackgroundColorClass, getPassiveBackgroundStyle, getThemeBackgroundColorClass, getThemeIconStyle, getTypeIconStyle } from '@/utils/format';
import { ref, watch } from 'vue';

const activeTab = ref('move');
const isSwitching = ref(false);

const toggleVariation = () => {
    isSwitching.value = true;
    setTimeout(() => {
        isSwitching.value = false;
    }, 300);
    internalSelectedPokemonIndex.value = (internalSelectedPokemonIndex.value + 1) % props.variationList.length;
    emit('update:selectedPokemonIndex', internalSelectedPokemonIndex.value);
};

const props = defineProps({
    levelValue: { type: Number, required: true, default: 1 },
    currentRarityValue: { type: Number, required: true, default: 3 },
    potentialValue: { type: Number, required: true, default: 0 },
    exRoleEnabledValue: { type: Boolean, required: true, default: false },
    bonusLevel: { type: Number, required: true },
    selectedPokemonIndex: { type: Number, required: true },
    trainer: { type: Object, required: true },
    themes: { type: Array, required: true },
    specialAwaking: { type: Object, required: false },
    variationList: {
        type: Array, required: true,
        validator: (value) => value.every(item => typeof item === 'string')
    },
    finalStats: { type: Object, required: true, default: () => ({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }) },
    finalMoves: { type: Object, required: true, default: () => ({ moves: [], movesDynamax: [], moveTera: {}, syncMove: {} }) },
    pokemon: { type: Object, required: true },
});

const emit = defineEmits([
    'update:levelValue',
    'update:currentRarityValue',
    'update:potentialValue',
    'update:exRoleEnabledValue',
    'update:selectedPokemonIndex'
]);

const internalLevelValue = ref(props.levelValue);
const internalCurrentRarityValue = ref(props.currentRarityValue);
const internalPotentialValue = ref(props.potentialValue);
const internalExRoleEnabledValue = ref(props.exRoleEnabledValue);
const internalSelectedPokemonIndex = ref(props.selectedPokemonIndex);

watch(
    () => [props.levelValue, props.currentRarityValue, props.potentialValue, props.exRoleEnabledValue, props.selectedPokemonIndex],
    ([newLevel, newRarity, newPotential, newExEnabled, newSelectedPokemonIndex]) => {
        internalLevelValue.value = newLevel;
        internalCurrentRarityValue.value = newRarity;
        internalPotentialValue.value = newPotential;
        internalExRoleEnabledValue.value = newExEnabled;
        internalSelectedPokemonIndex.value = newSelectedPokemonIndex;
    },
    { deep: true }
);

const expandedPassives = ref({});
const togglePassiveDetail = (index) => {
    expandedPassives.value[index] = !expandedPassives.value[index];
};

const handleLevelInput = () => {
    if (internalLevelValue.value < 1) internalLevelValue.value = 1;
    if (internalLevelValue.value > 200) internalLevelValue.value = 200;
    emit('update:levelValue', internalLevelValue.value);
};

const handleRarityChange = () => {
    emit('update:currentRarityValue', internalCurrentRarityValue.value);
    if (internalCurrentRarityValue.value === 6) {
        internalPotentialValue.value = 0;
        emit('update:potentialValue', 0);
    }
};

const handlePotentialChange = () => {
    emit('update:potentialValue', internalPotentialValue.value);
};

const handleExRoleChange = () => {
    emit('update:exRoleEnabledValue', internalExRoleEnabledValue.value);
};
</script>

<style scoped>
.info-root {
    display: flex;
    flex-direction: column;
    block-size: 100%;
    overflow: hidden;
}

.controls-header {
    /* padding: 8px 8px 0 8px; */
    flex-shrink: 0;
}

.variation-banner {
    background: linear-gradient(180deg, #c4d7ddf1 0%, #53accf 100%);
    border: 2px solid #004d40;
    border-radius: 6px;
    margin-block-end: 6px;
    padding: 2px 0;
    text-align: center;
    cursor: pointer;
    user-select: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s;
}

.variation-banner:active {
    transform: scale(0.98);
}

/* 点击时的闪烁反馈 */
.variation-banner.switching {
    filter: brightness(1.2);
    /* 瞬间变亮 */
    transform: scale(0.97);
}

.banner-content {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
}

.banner-text {
    font-size: 15px;
    font-weight: 900;
    color: #fff;
    /* ✨ 关键：文字描边效果 */
    text-shadow:
        -1px -1px 0 #004d40,
        1px -1px 0 #004d40,
        -1px 1px 0 #004d40,
        1px 1px 0 #004d40;
    letter-spacing: 0.5px;
}

.switch-icon {
    font-size: 16px;
    color: #b2dfdb;
    font-weight: bold;
}

/* ✨✨✨ 嵌入式配置框（Merge Design）✨✨✨ */
.config-row {
    display: flex;
    inline-size: 100%;
    gap: 6px;
    flex-shrink: 0;
}

/* 每一个配置项变成一个独立的白盒子 */
.config-box {
    flex: 1;
    position: relative;
    /* 为了放置绝对定位的 label */
    background-color: #fff;
    border: 1px solid #8cb3c9;
    border-radius: 6px;
    block-size: 44px;
    /* 固定高度，确保对齐 */
    overflow: hidden;

    /* 交互反馈 */
    transition: border-color 0.2s;
}

.config-box:hover {
    border-color: #5a9bc0;
}

/* 标签：小字体，绝对定位在顶部中央 */
.config-label {
    position: absolute;
    inset-block-start: 2px;
    inset-inline-start: 0;
    inline-size: 100%;
    text-align: center;
    font-size: 10px;
    font-weight: bold;
    color: #607d8b;
    /* 蓝灰色 */
    pointer-events: none;
    /* 让点击穿透给 input */
    z-index: 1;
}

/* 输入控件：填满盒子，背景透明，文字居中偏下 */
.config-input {
    inline-size: 100%;
    block-size: 100%;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;

    text-align: center;

    text-align-last: center;
    -moz-text-align-last: center;


    font-size: 14px;
    font-weight: bold;
    color: #333;

    padding-block-start: 14px;

    /* 去除默认样式 */
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    border-radius: 0;

    -webkit-border-radius: 0;
}

/* 针对 Select 加上自定义箭头（可选，这里用背景图放在右下角比较合适） */
select.config-input {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='%238cb3c9'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 2px bottom 4px;
    /* 放在右下角 */
    background-size: 10px;
}

/* --- 下面保持原有的六维图和Tab样式 --- */

.stats-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1px;
    inline-size: 100%;
    margin-block-start: 8px;
    padding: 0 8px;
    flex-shrink: 0;
}

.stat-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2px 0;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    overflow: hidden;
}

.stat-header {
    font-weight: 500;
    font-size: 12px;
    color: black;
    inline-size: 100%;
    text-align: center;
    padding: 2px 0;
}

.stat-value {
    font-size: 12px;
    color: black;
    inline-size: 100%;
    text-align: center;
    padding: 4px 0;
    font-family: "GameFont";
    -webkit-text-stroke: 0.2px #333;
}

.stat-column.hp {
    background-color: #d4f1d4;
}

.stat-column.atk {
    background-color: #fff3e0;
}

.stat-column.def {
    background-color: #9de0a3;
}

.stat-column.spAtk {
    background-color: #e1f5fe;
}

.stat-column.spDef {
    background-color: #97bdd8;
}

.stat-column.spd {
    background-color: #ede7f6;
}

.tab-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-block-size: 0;
    overflow: hidden;
    margin-block-start: 8px;
}

.tab-bar {
    display: flex;
    gap: 8px;
    padding: 0 12px 12px 12px;
    flex-shrink: 0;
}

.tab-btn {
    flex: 1;
    padding: 8px 0;
    background-color: #a5d6e3;
    border: 2px solid #4a9ab0;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    color: #000;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.tab-btn.active {
    background-color: #d9f0f7;
}

.tab-btn:hover {
    background-color: #b8e0ed;
}

.content-container {
    flex: 1;
    overflow-y: auto;
    min-block-size: 0;
    padding: 0 12px;
    padding-block-end: calc(30px + env(safe-area-inset-bottom));
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: #a5d6e3 #d1e8f5;
}

.content-container::-webkit-scrollbar {
    inline-size: 8px;
}

.tab-content {
    padding: 16px;
    background-color: #fff;
    border-radius: 8px;
    font-size: 14px;
    color: #333;
}

/* 技能通用样式 */
.moves-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.move-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.move-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    font-weight: bolder;
    font-size: 16px;
    color: #000000dc;
}

.move-title {
    display: flex;
    align-items: center;
    font-weight: 700;
    gap: 8px;
}

.icon {
    inline-size: 20px;
    block-size: 20px;
}

.move-count {
    display: flex;
    align-items: center;
    gap: 8px;
}

.count-blocks {
    display: flex;
    gap: 4px;
}

.count-block {
    inline-size: 20px;
    block-size: 15px;
}

.move-uses {
    padding: 2px 6px;
    color: black;
    font-size: 14px;
    border-radius: 4px;
}

.move-info {
    display: flex;
    inline-size: 100%;
}

.info-col {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.info-item {
    display: flex;
    justify-content: space-between;
    padding: 4px 8px;
    font-size: 14px;
    border-block-end: 1px solid rgba(0, 0, 0, 0.08);
    background-color: rgba(255, 255, 255, 0.3);
}

.info-label {
    color: #f0eeeee1;
    font-weight: 700;
}

.info-value {
    display: inline-flex;
    align-items: center;
    font-weight: 700;
    color: #000000b0;
}

.move-desc {
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 700;
    color: #000000ab;
    border-block-start: 1px solid rgba(0, 0, 0, 0.1);
    line-height: 1.4;
    white-space: pre-line;
}

/* 被動技能區域 */
.passives-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 8px 0;
}

.passive-card {
    padding: 12px 16px;
    border-radius: 8px;
    overflow: hidden;
}

.passive-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-block-end: 8px;
}

.passive-name {
    text-align: center;
    font-weight: 700;
    font-size: 15px;
    margin-block-end: 8px;
    color: #ffffffe5;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.passive-detail-btn {
    inline-size: 24px;
    block-size: 24px;
    border: none;
    border-radius: 4px;
    background-color: #ffffff;
    color: rgb(2, 2, 2);
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    z-index: 10;
    position: relative;
}

.passive-content {
    font-size: 14px;
    line-height: 1.5;
    color: #222;
    white-space: pre-line;
}

.passive-detail .passive-detail-item {
    margin-block-end: 8px;
    padding-inline-start: 8px;
    border-inline-start: 2px solid #666;
}

.passive-detail .passive-detail-item:last-child {
    margin-block-end: 0;
}

.passive-desc {
    font-size: 12px;
    line-height: 1.5;
    font-weight: 700;
    color: #242323cc;
    white-space: pre-line;
}

/* 组队技能 */
.theme-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 8px 0;
}

.theme-card {
    padding: 12px 16px;
    border: 2px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
}

.theme-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-block-end: 8px;
}

.theme-header .icon {
    inline-size: 24px;
    block-size: 24px;
    display: inline-block;
}

.theme-title {
    color: #ffffffe5;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    margin: 0;
    font-weight: 700;
    font-size: 15px;
}

.theme-descr {
    font-size: 12px;
    line-height: 1.5;
    font-weight: 700;
    color: #242323da;
    white-space: pre-line;
}
</style>