<template>
    <div class="info-panel">
        <!-- 形态切换 -->
        <div class="variation-switcher" v-if="props.variationList.length >= 2">
            <!-- 当前形态名称 -->
            <button class="variation-name-btn" @click="toggleVariation">{{
                props.variationList[internalSelectedPokemonIndex]
                }}</button>
        </div>
        <!-- 動態配置區域 -->
        <div class="config-row">
            <div class="config-item">
                <label>等級</label>
                <input type="number" v-model.number="internalLevelValue" class="level-input" @input="handleLevelInput"
                    min="1" max="200" />
            </div>
            <div class="config-item">
                <label>EX</label>
                <select v-model="internalCurrentRarityValue" class="config-select" @change="handleRarityChange">
                    <option :value="3" v-if="trainer.rarity <= 3">★★★</option>
                    <option :value="4" v-if="trainer.rarity <= 4">★★★★</option>
                    <option :value="5" v-if="trainer.rarity <= 5">★★★★★</option>
                    <option :value="6" v-if="trainer.ex">★★★★★EX</option>
                </select>
            </div>
            <div class="config-item">
                <label>潛力</label>
                <select v-model="internalPotentialValue" class="config-select"
                    :disabled="internalCurrentRarityValue === 6" @change="handlePotentialChange">
                    <option v-for="num in 21" :value="num - 1">{{ num - 1 }}</option>
                </select>
            </div>
            <div class="config-item" v-if="trainer.exRole !== 0">
                <label>EX體系</label>
                <select v-model="internalExRoleEnabledValue" class="config-select" @change="handleExRoleChange">
                    <option :value="false">-</option>
                    <option :value="true" v-if="trainer.exRole > -1">
                        {{ StatValueCalculator.getExRoleText(trainer.exRole) }}
                    </option>
                </select>
            </div>
        </div>

        <!-- 六维数据展示栏 -->
        <div class="stats-grid">
            <!-- HP列 -->
            <div class="stat-column hp">
                <div class="stat-header">HP</div>
                <div class="stat-value">{{ finalStats.hp }}</div>
            </div>
            <!-- 攻击列 -->
            <div class="stat-column atk">
                <div class="stat-header">攻擊</div>
                <div class="stat-value">{{ finalStats.atk }}</div>
            </div>
            <!-- 防御列 -->
            <div class="stat-column def">
                <div class="stat-header">防禦</div>
                <div class="stat-value">{{ finalStats.def }}</div>
            </div>
            <!-- 特攻列 -->
            <div class="stat-column spAtk">
                <div class="stat-header">特攻</div>
                <div class="stat-value">{{ finalStats.spa }}</div>
            </div>
            <!-- 特防列 -->
            <div class="stat-column spDef">
                <div class="stat-header">特防</div>
                <div class="stat-value">{{ finalStats.spd }}</div>
            </div>
            <!-- 速度列 -->
            <div class="stat-column spd">
                <div class="stat-header">速度</div>
                <div class="stat-value">{{ finalStats.spe }}</div>
            </div>
        </div>

        <div class="sync-page">
            <!-- 顶部切换栏 -->
            <div class="tab-bar">
                <button class="tab-btn" :class="{ active: activeTab === 'move' }" @click="activeTab = 'move'">
                    招式
                </button>
                <button class="tab-btn" :class="{ active: activeTab === 'passive' }" @click="activeTab = 'passive'">
                    被動技能
                </button>
                <button class="tab-btn" :class="{ active: activeTab === 'team' }" @click="activeTab = 'team'">
                    隊伍技能
                </button>
                <button class="tab-btn" :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">
                    資訊
                </button>
            </div>

            <!-- 内容区域：根据选中的tab显示对应内容 -->
            <div class="content-container">
                <!-- 招式tab内容（默认显示） -->
                <div v-if="activeTab === 'move'" class="moves-container">
                    <div class="move-card" :class="handleMoveBGColor(move.type)"
                        v-for="(move, index) in pokemon.moves ?? []" :key="index">
                        <div class="move-header">
                            <div class="move-title">
                                <span class="icon" :style="{
                                    backgroundImage: `var(--iconMove${getTypeInfo(move.type).typeSuffix})`,
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center'
                                }"></span>
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
                                <div class="move-uses" v-if="handleMoveUses(move.uses)">
                                    {{ handleMoveUses(move.uses) }}
                                </div>
                            </div>
                        </div>
                        <div class="move-info">
                            <div class=" info-col">
                                <div class="info-item">
                                    <span class="info-label">分類</span>
                                    <span class="info-value">
                                        <span class="icon" :style="{
                                            backgroundImage: `var(--icon${getCategoryInfo(move.category).typeSuffix})`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center'
                                        }"></span>
                                    </span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">威力</span>
                                    <span class="info-value">{{ handleMovePower(move, "move") }}</span>
                                </div>
                            </div>
                            <div class="info-col">
                                <div class="info-item">
                                    <span class="info-label">目標</span>
                                    <span class="info-value">{{ move.target }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">命中率</span>
                                    <span class="info-value">{{ handleMoveAccuracy(move) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="move-desc">
                            {{ move.description }}
                        </div>
                    </div>

                    <!-- 极巨化招式 -->
                    <div class="move-card" :class="handleMoveBGColor(moveMax.type)"
                        v-for="(moveMax, index) in pokemon.movesDynamax ?? []" :key="index">
                        <div class="move-header">
                            <div class="move-title">
                                <span class="icon" :style="{
                                    backgroundImage: `var(--iconMove${getTypeInfo(moveMax.type).typeSuffix})`,
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center'
                                }"></span>
                                {{ moveMax.name }}
                            </div>
                        </div>
                        <div class="move-info">
                            <div class=" info-col">
                                <div class="info-item">
                                    <span class="info-label">分類</span>
                                    <span class="info-value">
                                        <span class="icon" :style="{
                                            backgroundImage: `var(--icon${getCategoryInfo(moveMax.category).typeSuffix})`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center'
                                        }"></span>
                                    </span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">威力</span>
                                    <span class="info-value">{{ handleMovePower(moveMax, "dynamaxMove") }}</span>
                                </div>
                            </div>
                            <div class="info-col">
                                <div class="info-item">
                                    <span class="info-label">目標</span>
                                    <span class="info-value">{{ moveMax.target }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">命中率</span>
                                    <span class="info-value">{{ handleMoveAccuracy(moveMax) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="move-desc">
                            {{ moveMax.description }}
                        </div>
                    </div>

                    <!-- 太晶技能 -->
                    <div class="move-card" :class="handleMoveBGColor(pokemon.moveTera.type)" v-if="pokemon.moveTera">
                        <!-- 动态绑定同步技能颜色 -->
                        <div class="move-header">
                            <div class="move-title">
                                <span class="icon" :style="{
                                    backgroundImage: `var(--iconMove${getTypeInfo(pokemon.moveTera.type).typeSuffix})`,
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center'
                                }"></span>
                                {{ pokemon.moveTera.name }}
                            </div>
                            <div class="move-count">
                                <div class="count-blocks">
                                    <span class="count-block" :style="{
                                        backgroundImage: `var(--iconGauge)`,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center'
                                    }" v-for="i in pokemon.moveTera.gauge" :key="i"></span>
                                </div>
                                <div class="move-uses" v-if="handleMoveUses(pokemon.moveTera.uses)">
                                    {{ handleMoveUses(pokemon.moveTera.uses) }}
                                </div>
                            </div>
                        </div>
                        <div class="move-info">
                            <div class="info-col">
                                <div class="info-item">
                                    <span class="info-label">分類</span>
                                    <span class="info-value">
                                        <span class="icon" :style="{
                                            backgroundImage: `var(--icon${getCategoryInfo(pokemon.moveTera.category).typeSuffix})`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center'
                                        }"></span>
                                    </span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">威力</span>
                                    <span class="info-value">{{ handleMovePower(pokemon.moveTera, "none") }}</span>
                                </div>
                            </div>
                            <div class="info-col">
                                <div class="info-item">
                                    <span class="info-label">目標</span>
                                    <span class="info-value">{{ pokemon.moveTera.target }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">命中率</span>
                                    <span class="info-value"> {{ handleMoveAccuracy(pokemon.moveTera) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="move-desc">
                            {{ pokemon.moveTera.description }}
                        </div>
                    </div>

                    <!-- 拍招-->
                    <div class="move-card" :class="handleMoveBGColor(pokemon.syncMove.type)" v-if="pokemon.syncMove">
                        <!-- 动态绑定同步技能颜色 -->
                        <div class="move-header">
                            <div class="move-title">
                                <span class="icon" :style="{
                                    backgroundImage: `var(--iconMove${getTypeInfo(pokemon.syncMove.type).typeSuffix})`,
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center'
                                }"></span>
                                {{ pokemon.syncMove.name }}
                            </div>
                        </div>
                        <div class="move-info">
                            <div class="info-col">
                                <div class="info-item">
                                    <span class="info-label">分類</span>
                                    <span class="info-value">
                                        <span class="icon" :style="{
                                            backgroundImage: `var(--icon${getCategoryInfo(pokemon.syncMove.category).typeSuffix})`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center'
                                        }"></span>
                                    </span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">威力</span>
                                    <span class="info-value">{{ handleMovePower(pokemon.syncMove, "syncMove") }}</span>
                                </div>
                            </div>
                            <div class="info-col">
                                <div class="info-item">
                                    <span class="info-label">目標</span>
                                    <span class="info-value">{{ pokemon.syncMove.target }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">命中率</span>
                                    <span class="info-value"> {{ handleMoveAccuracy(pokemon.syncMove) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="move-desc">
                            {{ pokemon.syncMove.description }}
                        </div>
                    </div>
                </div>

                <!-- 被动技能区域 -->
                <div v-else-if="activeTab === 'passive'" class="passives-container">
                    <!-- 补充超觉醒 -->
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
                                @click="togglePassiveDetail(index)">
                                {{ '+' }}
                            </button>
                        </div>
                        <div class="passive-content">
                            <div class="passive-desc" v-if="!specialAwaking.detail || !expandedPassives[index]">
                                {{ specialAwaking.description }}
                            </div>
                            <div class="passive-detail" v-else>
                                <div class="passive-desc" v-for="(item, idx) in specialAwaking.detail" :key="idx">
                                    {{ item }}
                                </div>
                            </div>
                        </div>
                    </div>


                    <div class="passive-card" v-for="(passive, index) in pokemon.passives ?? []" :key="index" :style="{
                        backgroundImage: `var(--bgPassive${handlePassiveBGImage(index)})`,
                        backgroundSize: 'cover',   // 背景圖覆蓋整個卡片
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                    }">
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
                                    {{ item }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 组队技能区域 -->
                <div v-else-if="activeTab === 'team'" class="theme-container">
                    <!-- 循環渲染每個組隊技能卡片 -->
                    <div class="theme-card" :class="handleThemeBGColor(index, theme)" v-for="(theme, index) in themes"
                        :key="index">
                        <div class="theme-header">
                            <span class="icon" :style="{
                                backgroundImage: `var(--${handleThemeIcon(theme)})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center'
                            }"></span>
                            <h3 class="theme-title">{{ theme.tag }}</h3>
                        </div>

                        <!-- 組隊效果列表 -->
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
import { getCategoryInfo, getTypeInfo, getTypeInfoWithCNName } from '@/utils/assetsMap';
import { MovePowerCalculator } from '@/utils/powerValue';
import { StatValueCalculator } from '@/utils/statValue';
import { ref, watch } from 'vue';

const activeTab = ref('move');


// 切换形态的方法（循环切换）
const toggleVariation = () => {
    internalSelectedPokemonIndex.value = (internalSelectedPokemonIndex.value + 1) % props.variationList.length;
    emit('update:selectedPokemonIndex', internalSelectedPokemonIndex.value);
};

// 1. 定义组件需要接收的 Props（父组件传递过来的数据）
const props = defineProps({
    // 当前等级
    levelValue: {
        type: Number,
        required: true,
        default: 1
    },
    // 当前星级
    currentRarityValue: {
        type: Number,
        required: true,
        default: 3
    },
    // 当前潜力值
    potentialValue: {
        type: Number,
        required: true,
        default: 0
    },
    // 当前EX体系启用状态
    exRoleEnabledValue: {
        type: Boolean,
        required: true,
        default: false
    },
    // 当前宝数
    bonusLevel: {
        type: Number,
        required: true,
    },
    // 当前形态索引
    selectedPokemonIndex: {
        type: Number,
        required: true,
    },
    // 训练师信息
    trainer: {
        type: Object,
        required: true
    },
    // 组队技能
    themes: {
        type: Array,
        required: true
    },
    // 超觉醒被动信息
    specialAwaking: {
        type: Object,
        required: false
    },
    variationList: {
        type: Array,
        required: true,
        validator: (value) => {
            return value.every(item => typeof item === 'string');
        }
    },
    // 最终六维属性数据
    finalStats: {
        type: Object,
        required: true,
        default: () => ({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 })
    },
    pokemon: {
        type: Object,
        required: true
    }
});


// 2. 定义组件需要触发的事件（通知父组件数据变化）
const emit = defineEmits([
    'update:levelValue',
    'update:currentRarityValue',
    'update:potentialValue',
    'update:exRoleEnabledValue',
    'update:selectedPokemonIndex'
]);


// 内部状态（避免直接修改Props，通过内部变量中转）
const internalLevelValue = ref(props.levelValue);
const internalCurrentRarityValue = ref(props.currentRarityValue);
const internalPotentialValue = ref(props.potentialValue);
const internalExRoleEnabledValue = ref(props.exRoleEnabledValue);
const internalSelectedPokemonIndex = ref(props.selectedPokemonIndex);

// 监听Props变化，同步到内部状态（父组件数据更新时，子组件同步）
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

// 计算技能威力
const handleMovePower = (move, move_category) => {

    let power = move.power
    if (move.power <= 0) {
        return '-';
    }
    if (props.bonusLevel <= 5) {
        power = MovePowerCalculator.calculateLevelBonus(power, props.bonusLevel);
    } else if (props.bonusLevel > 5) {
        // 超觉醒....
        power = MovePowerCalculator.calculateAwakeningBonus(power, props.trainer.role, props.bonusLevel, move_category);
        power = Math.ceil(power + Math.floor(move.power * 0.2));
    }
    console.log(power);

    if (props.trainer.exRole === 3 && props.exRoleEnabledValue && move_category === "syncMove") {
        power = Math.ceil(power * 1.5)
    }

    return power
};

// 显示技能使用次数
const handleMoveUses = (uses) => {
    if (typeof uses !== 'number' || isNaN(uses)) {
        return '';
    }
    return `${uses}/${uses}`;
};

// 显示技能命中率
const handleMoveAccuracy = (move) => {
    if (move.accuracy != 0) {
        return move.accuracy;
    }
    if (move.group === "Sync" || move.tags === "SureHit") {
        return "必定命中"
    }

    return "-"
};

// 显示拍招效果
const handleSyncMoveEffect = (move) => {

};

// 技能背景色映射
const handleMoveBGColor = (type) => {
    return 'bg_' + getTypeInfo(type).typeSuffix.toLowerCase();
}

// 被動技能背景圖映射
const handlePassiveBGImage = (index) => {
    if (index === 1) {
        return props.trainer.exclusivity === "Arcsuit" ? props.trainer.exclusivity : "";
    } else if (index === 0) {
        if (["Arcsuit", "Master"].includes(props.trainer.exclusivity)) {
            return props.trainer.exclusivity;
        } else if (props.trainer.exclusivity === "MasterEX") {
            return "Master";
        } else {
            return "";
        }
    }
    return "";
};

// 被动技能细节展开项
const expandedPassives = ref({});
// 展开触发方法
const togglePassiveDetail = (index) => {
    expandedPassives.value[index] = !expandedPassives.value[index];
};

// 组队技能背景色映射
const handleThemeBGColor = (index, theme) => {
    if (index === 0) {
        // 第一个为属性
        return 'bg_' + getTypeInfoWithCNName(theme.tag).typeSuffix.toLowerCase();
    } else {
        return 'bg_trainer';
    }
}

// 组队技能图标映射
const handleThemeIcon = (theme) => {
    switch (theme.category) {
        // 属性
        case 1:
            return 'iconMove' + getTypeInfoWithCNName(theme.tag).typeSuffix;
        // 地区
        case 2:
            return 'iconThemeRegion';
        // 分类
        case 3:
            return 'iconThemeTrainerGroup';
        // 服装
        case 4:
            return 'iconThemeFashion';
        // 其他
        default:
            return 'iconThemeOther';
    }
}

// 等级输入验证
const handleLevelInput = () => {
    // 确保等级在1-200之间
    if (internalLevelValue.value < 1) internalLevelValue.value = 1;
    if (internalLevelValue.value > 200) internalLevelValue.value = 200;
    // 通知父组件更新等级值
    emit('update:levelValue', internalLevelValue.value);
};

// 星级变化
const handleRarityChange = () => {
    emit('update:currentRarityValue', internalCurrentRarityValue.value);
    // 若切换到EX（6），自动禁用潜力值并重置为0
    if (internalCurrentRarityValue.value === 6) {
        internalPotentialValue.value = 0;
        emit('update:potentialValue', 0);
    }
};

// 潜力值变化
const handlePotentialChange = () => {
    emit('update:potentialValue', internalPotentialValue.value);
};

// EX体系启用状态变化
const handleExRoleChange = () => {
    emit('update:exRoleEnabledValue', internalExRoleEnabledValue.value);
};
</script>

<style scoped>
.info-panel {
    /* padding: 16px; */
}

/* 形態切換區域 */
.variation-switcher {
    text-align: center;
}

/* 形態切換文字按鈕 */
.variation-name-btn {
    border: none;
    background: transparent;
    margin: 0;
    font-size: 13px;
    font-weight: bolder;
    color: #0066cc;
    cursor: pointer;
    text-decoration: underline;
    transition: all 0.2s;
}

/*  hover状态 */
.variation-name-btn:hover {
    color: #0096e0;
    /*  hover时加深颜色 */
    text-decoration: none;
}

/*  active状态 */
.variation-name-btn:active {
    transform: scale(0.98);
}


/* 让筛选行占满父容器宽度，子项自动四等分 */
.config-row {
    display: flex;
    width: 100%;
    gap: 8px;
}

/* 每个筛选项占1/4宽度，同时设置最小宽度防止过窄 */
.config-item {
    flex: 1;
    min-width: 50px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
}

/* 让label文字居中 */
.config-item label {
    font-size: 13px;
    text-align: center;
}

/* 4. 重新调整表单元素样式 */
.level-input,
.config-select {
    border: 1px solid #8cb3c9;
    border-radius: 8px;
    padding: 6px 6px;
    /* 上下padding大一点，给内容足够空间 */
    /* 去掉line-height: 26px，让文字自然居中 */
    background-color: #fff;
    font-size: 12px;
    width: 100%;
    box-sizing: border-box;
    outline: none;
    appearance: none;
    /* 调整下拉箭头位置，避免遮挡文字 */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%238cb3c9'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    /* 箭头往右挪一点，远离文字 */
    background-size: 12px;
    /* 强制文字垂直居中（兜底） */
    vertical-align: middle;
}

.level-input:hover,
.config-select:hover,
.level-input:focus,
.config-select:focus {
    border-color: #5a9bc0;
}

/* 六維區域 */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1px;
    /* 间隙略缩小，更紧凑 */
    width: 100%;
    margin-top: 6px;
    /* 和上方筛选栏的间距也缩小 */
}

/* 单个属性列：加圆角边框+缩小内边距 */
.stat-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2px 0;
    /* 内边距缩小，整体尺寸变小 */
    border: 1px solid #e0e0e0;
    /* 细微边框（可选，让轮廓更清晰） */
    border-radius: 6px;
    /* 圆角，让棱角更圆润 */
    overflow: hidden;
    /* 防止内容溢出圆角 */
}

/* 标题样式：字体缩小 */
.stat-header {
    font-weight: 500;
    font-size: 12px;
    /* 字体缩小（原14px） */
    width: 100%;
    text-align: center;
    padding: 2px 0;
    /* 内边距缩小 */
}

/* 数值样式：字体缩小 */
.stat-value {
    font-size: 12px;
    /* font-weight: bolder;
    color: white; */
    /* 字体缩小（原16px） */
    width: 100%;
    text-align: center;
    padding: 4px 0;
    font-family: "GameFont";
    -webkit-text-stroke: 0.2px #333;
    /* 描边宽度可按需调（0.5-1px），颜色选深灰/黑色 */
    text-stroke: 0.2px #333;
    /* 标准属性（部分浏览器需配合前缀） */
}

/* 每个属性的背景色+文字色 */
/* HP */
.stat-column.hp {
    background-color: #d4f1d4;
}

/* 攻击（Atk） */
.stat-column.atk {
    background-color: #fff3e0;
}

/* 防御（Def） */
.stat-column.def {
    background-color: #9de0a3;
}

/* 特攻 */
.stat-column.spAtk {
    background-color: #e1f5fe;
}

/* 特防 */
.stat-column.spDef {
    background-color: #97bdd8;
}

/* 速度 */
.stat-column.spd {
    background-color: #ede7f6;
}

/* 拍組信息區域*/
.sync-page {
    /* min-height: 100vh; */
}

/* 顶部切换栏 */
.tab-bar {
    display: flex;
    gap: 8px;
    padding: 12px;
}

.tab-btn {
    flex: 1;
    /* 按钮平分宽度 */
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
    /* 激活态背景（如“招式”按钮） */
}

.tab-btn:hover {
    background-color: #b8e0ed;
    /* hover效果（可选优化） */
}

/* 内容容器（包裹tab切换后的内容） */
.content-container {
    padding: 0 12px 12px;
    /* 限制内容容器高度（减去顶部tab栏的高度） */
    max-height: calc(100vh - 300px);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #a5d6e3 #d1e8f5;
}

/* 美化滚动条（Chrome/Safari） */
.content-container::-webkit-scrollbar {
    width: 8px;
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

/* 技能标题栏*/
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
    width: 20px;
    height: 20px;
}

/* 使用槽块 */
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
    width: 20px;
    height: 15px;
}

.move-uses {
    padding: 2px 6px;
    /* background-color: #000; */
    color: black;
    font-size: 14px;
    border-radius: 4px;
}

/* 技能信息栏 */
.move-info {
    display: flex;
    width: 100%;
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
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
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

/* 技能描述栏 */
.move-desc {
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 700;
    color: #000000ab;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    line-height: 1.4;
    white-space: pre-line;
}

/* 被動技能區域 */
.passives-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    /* 卡片之間的間距 */
    margin: 8px 0;
}

.passive-card {
    padding: 12px 16px;
    border-radius: 8px;
    overflow: hidden;
    /* 避免背景圖超出圓角 */
}

.passive-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

/* 被动技能名称 */
.passive-name {
    text-align: center;
    font-weight: 700;
    font-size: 15px;
    margin-bottom: 8px;
    color: #ffffffe5;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.passive-detail-btn {
    width: 24px;
    height: 24px;
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
    margin-bottom: 8px;
    padding-left: 8px;
    border-left: 2px solid #666;
}

.passive-detail .passive-detail-item:last-child {
    margin-bottom: 0;
}

/* 被動描述 */
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
    margin-bottom: 8px;
}

.theme-header .icon {
    width: 24px;
    height: 24px;
    display: inline-block;
}

/* 组队技能标签*/
.theme-title {
    color: #ffffffe5;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    margin: 0;
    font-weight: 700;
    font-size: 15px;
}

/* 组队技能效果 */
.theme-descr {
    font-size: 12px;
    line-height: 1.5;
    font-weight: 700;
    color: #242323da;
    white-space: pre-line;
}
</style>