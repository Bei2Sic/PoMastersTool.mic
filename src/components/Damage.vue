<script setup lang="ts">
import { useDamageCalculator } from "@/composables/useDamageCalculator";
import { useDamageCalcStore } from "@/stores/damageCalc";
import * as cond from "@/types/conditions";
import type { Sync } from "@/types/syncModel";
import { computed } from "vue";

// --- Props & Emits ---
const props = defineProps<{
    targetSync: Sync | null;
    teamSyncs?: Sync[];
    visible: boolean;
}>();

const emit = defineEmits(["close"]);

// --- Store & Logic ---
const store = useDamageCalcStore();

const targetSyncRef = computed(() => props.targetSync);
const teamSyncsRef = props.teamSyncs
    ? props.teamSyncs.map((s) => computed(() => s))
    : [];

const { finalDamageResult } = useDamageCalculator(targetSyncRef, teamSyncsRef);

// --- 常量定义 ---
const statsKeys: (keyof cond.PokemonStats)[] = ["atk", "def", "spa", "spd", "spe"];
const rankOptions = Array.from({ length: 13 }, (_, i) => i - 7); // -6 ~ +6

// 异常状态列表 (互斥)
const abnormalOptions: cond.AbnormalType[] = ["無", "灼傷", "麻痺", "冰凍", "中毒", "劇毒", "睡眠"];

// 妨害状态列表 (可多选) - 对应 store.user.hindrance 的 key
const hindranceKeys = cond.HINDRANCE_STATUSES;

// 天气/场地/领域
const weatherOptions: cond.WeatherType[] = ["無", "晴天", "下雨", "沙暴", "冰雹"];
const terrainOptions: cond.TerrainType[] = ["無", "電氣場地", "青草場地", ];
const zoneOptions: cond.ZoneType[] = ["無", "妖怪領域", "龍之領域", "鋼鐵領域", "大地領域", "妖精領域"];

// --- 辅助函数 ---
const handleRankChange = (target: "user" | "target", stat: keyof cond.PokemonStats, event: Event) => {
    const val = parseInt((event.target as HTMLSelectElement).value);
    if (target === "user") store.user.ranks[stat] = val as cond.StatRank;
    else store.target.ranks[stat] = val as cond.StatRank;
};

// 地区颜色
const getRegionClass = (region: string) => {
    const map: Record<string, string> = {
        "关都": "region-kanto", "城都": "region-johto", "丰缘": "region-hoenn",
        "神奥": "region-sinnoh", "合众": "region-unova", "卡洛斯": "region-kalos",
        "阿罗拉": "region-alola", "伽勒尔": "region-galar", "帕底亚": "region-paldea", "帕希欧": "region-pasio",
    };
    return map[region] || "region-default";
};
</script>

<template>
    <div v-if="visible" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-window">

            <div class="window-header">
                <h2>伤害计算器</h2>
                <button class="close-btn" @click="emit('close')">×</button>
            </div>

            <div class="window-content">

                <div class="section-group">
                    <div class="section-title">1. 我方状态 (User)</div>

                    <div class="panel-card">
                        <div class="sub-section">
                            <div class="sub-title">基础与装备加成</div>
                            <div class="stats-grid-row header-row">
                                <span>属性</span>
                                <span>装备(Gear)</span>
                                <span>能力等级</span>
                            </div>
                            <div v-for="stat in statsKeys" :key="stat" class="stats-grid-row">
                                <span class="stat-label">{{ stat.toUpperCase() }}</span>
                                <input type="number" v-model.number="store.user.gear[stat]" placeholder="0"
                                    class="input-cell">
                                <select :value="store.user.ranks[stat]" @change="handleRankChange('user', stat, $event)"
                                    class="select-cell">
                                    <option v-for="r in rankOptions" :key="r" :value="r">{{ r > 0 ? '+' + r : r }}
                                    </option>
                                </select>
                            </div>
                            <div class="extra-ranks">
                                <label>命中 <select v-model.number="store.user.ranks.acc">
                                        <option v-for="r in rankOptions" :value="r">{{ r }}</option>
                                    </select></label>
                                <label>闪避 <select v-model.number="store.user.ranks.eva">
                                        <option v-for="r in rankOptions" :value="r">{{ r }}</option>
                                    </select></label>
                                <label>击中要害 <select v-model.number="store.user.ranks.ct">
                                        <option v-for="r in [0, 1, 2, 3]" :value="r">{{ r }}</option>
                                    </select></label>
                            </div>
                        </div>

                        <div class="divider"></div>

                        <div class="grid-2-col">
                            <div class="sub-section">
                                <div class="sub-title">异常与妨害</div>
                                <div class="form-row">
                                    <label>异常状态</label>
                                    <select v-model="store.user.abnormal" class="full-width">
                                        <option v-for="ab in abnormalOptions" :key="ab" :value="ab">{{ ab }}</option>
                                    </select>
                                </div>
                                <div class="hindrance-group">
                                    <label>妨害:</label>
                                    <div class="tags-container">
                                        <button v-for="h in hindranceKeys" :key="h" class="tag-btn"
                                            :class="{ active: store.user.hindrance[h] }"
                                            @click="store.user.hindrance[h] = !store.user.hindrance[h]">
                                            {{ h }}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="sub-section">
                                <div class="sub-title">其他加成</div>
                                <div class="form-grid-compact">
                                    <label>剩余HP%</label> <input type="number"
                                        v-model.number="store.user.currentHPPercent" min="0" max="100">
                                    <label>拍组强化(Buff)</label> <input type="number" v-model.number="store.user.syncBuff"
                                        min="0">
                                    <label>物理威力增强</label> <input type="number"
                                        v-model.number="store.user.boosts.physical" min="0">
                                    <label>特殊威力增强</label> <input type="number"
                                        v-model.number="store.user.boosts.special" min="0">
                                    <label>拍招威力增强</label> <input type="number" v-model.number="store.user.boosts.sync"
                                        min="0">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section-group">
                    <div class="section-title">2. 目标状态 (Target)</div>
                    <div class="panel-card">

                        <div class="grid-2-col">
                            <div class="sub-section">
                                <div class="sub-title">面板数值</div>
                                <div class="stats-grid-row header-row">
                                    <span>属性</span>
                                    <span>数值</span>
                                    <span>能力等级</span>
                                </div>
                                <div v-for="stat in statsKeys" :key="'t-' + stat" class="stats-grid-row">
                                    <span class="stat-label">{{ stat.toUpperCase() }}</span>
                                    <input type="number" v-model.number="store.target.stats[stat]"
                                        class="input-cell bg-red-50">
                                    <select :value="store.target.ranks[stat]"
                                        @change="handleRankChange('target', stat, $event)" class="select-cell">
                                        <option v-for="r in rankOptions" :key="r" :value="r">{{ r > 0 ? '+' + r : r }}
                                        </option>
                                    </select>
                                </div>
                                <div class="extra-ranks">
                                    <label>闪避 <select v-model.number="store.target.ranks.eva">
                                            <option v-for="r in rankOptions" :value="r">{{ r }}</option>
                                        </select></label>
                                    <label>命中 <select v-model.number="store.target.ranks.acc">
                                            <option v-for="r in rankOptions" :value="r">{{ r }}</option>
                                        </select></label>
                                </div>
                            </div>

                            <div class="sub-section">
                                <div class="sub-title">异常与妨害</div>
                                <div class="form-row">
                                    <label>异常状态</label>
                                    <select v-model="store.target.abnormal" class="full-width">
                                        <option v-for="ab in abnormalOptions" :key="ab" :value="ab">{{ ab }}</option>
                                    </select>
                                </div>
                                <div class="hindrance-group">
                                    <label>妨害:</label>
                                    <div class="tags-container">
                                        <button v-for="h in hindranceKeys" :key="h" class="tag-btn"
                                            :class="{ active: store.target.hindrance[h] }"
                                            @click="store.target.hindrance[h] = !store.target.hindrance[h]">
                                            {{ h }}
                                        </button>
                                    </div>
                                </div>

                                <div class="divider"></div>

                                <div class="sub-title">其他</div>
                                <div class="form-grid-compact">
                                    <label>剩余HP%</label> <input type="number"
                                        v-model.number="store.target.currentHPPercent" min="0" max="100">
                                    <label>拍组Buff</label> <input type="number" v-model.number="store.target.syncBuff"
                                        min="0">
                                    <label>伤害场</label>
                                    <select v-model="store.target.damageField">
                                        <option value="无">无</option>
                                        <option value="物理">物理伤害场</option>
                                        <option value="特殊">特殊伤害场</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section-group">
                    <div class="section-title">3. 环境配置</div>

                    <div class="panel-card mb-4">
                        <div class="env-row">
                            <div class="env-group">
                                <label>天气</label>
                                <select v-model="store.weather">
                                    <option v-for="w in weatherOptions" :key="w" :value="w">{{ w }}</option>
                                </select>
                                <label class="check-box"><input type="checkbox" v-model="store.isEXWeather">EX</label>
                            </div>
                            <div class="env-group">
                                <label>场地</label>
                                <select v-model="store.terrain">
                                    <option v-for="t in terrainOptions" :key="t" :value="t">{{ t }}</option>
                                </select>
                                <label class="check-box"><input type="checkbox" v-model="store.isEXTerrain">EX</label>
                            </div>
                            <div class="env-group">
                                <label>领域</label>
                                <select v-model="store.zone">
                                    <option v-for="z in zoneOptions" :key="z" :value="z">{{ z }}</option>
                                </select>
                                <label class="check-box"><input type="checkbox" v-model="store.isEXZone">EX</label>
                            </div>
                        </div>
                    </div>

                    <div class="circle-scroll-wrapper">
                        <div class="circle-track">
                            <div v-for="(data, region) in store.battleCircles" :key="region" class="circle-item">
                                <div class="circle-header" :class="getRegionClass(region as string)">
                                    {{ region }}
                                </div>

                                <div class="circle-toggles">
                                    <button class="toggle-circle-btn" :class="{ active: data.actives['物理'] }"
                                        @click="data.actives['物理'] = !data.actives['物理']">物</button>
                                    <button class="toggle-circle-btn" :class="{ active: data.actives['特殊'] }"
                                        @click="data.actives['特殊'] = !data.actives['特殊']">特</button>
                                    <button class="toggle-circle-btn" :class="{ active: data.actives['防禦'] }"
                                        @click="data.actives['防禦'] = !data.actives['防禦']">防</button>
                                </div>

                                <div class="circle-level-display">
                                    Lv. {{ data.level }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section-group">
                    <div class="section-title">4. 计算结果</div>

                    <div v-if="!finalDamageResult || finalDamageResult.length === 0" class="empty-tip">
                        暂无数据，请检查拍组数据
                    </div>

                    <div v-else>
                        <div v-for="(formResult, idx) in finalDamageResult" :key="idx" class="result-card">
                            <div class="form-name">{{ formResult.formName }}</div>

                            <table class="result-table">
                                <thead>
                                    <tr>
                                        <th style="width: 35%">招式</th>
                                        <th>类型</th>
                                        <th>威力</th>
                                        <th>伤害区间</th>
                                        <th>倍率</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template v-for="(res, mIdx) in formResult?.moves" :key="'move-'+mIdx">
                                        <tr v-if="res">
                                            <td class="move-name">
                                                {{ res.move.name }}
                                                <span class="sub-text">{{ res.move.type }}</span>
                                            </td>
                                            <td>
                                                <span class="tag"
                                                    :class="res.move.category === 1 ? 'tag-phy' : 'tag-sp'">
                                                    {{ res.move.category === 1 ? '物' : '特' }}
                                                </span>
                                            </td>
                                            <td>{{ res.movePower }}</td>
                                            <td class="damage-val">
                                                {{ Math.min(...res.moveDamage) }} ~ {{ Math.max(...res.moveDamage) }}
                                            </td>
                                            <td class="details">
                                                <div>E:x{{ res.envBoost / 100 }}</div>
                                                <div>M:x{{ res.moveBoost / 100 }}</div>
                                            </td>
                                        </tr>
                                    </template>

                                    <tr v-if="formResult.syncMove" class="row-sync">
                                        <td class="move-name">[拍] {{ formResult.syncMove.move.name }}</td>
                                        <td>
                                            <span class="tag"
                                                :class="formResult.syncMove.move.category === 1 ? 'tag-phy' : 'tag-sp'">
                                                {{ formResult.syncMove.move.category === 1 ? '物' : '特' }}
                                            </span>
                                        </td>
                                        <td>{{ formResult.syncMove.movePower }}</td>
                                        <td class="damage-val sync-val">
                                            {{ Math.min(...formResult.syncMove.moveDamage) }} ~ {{
                                                Math.max(...formResult.syncMove.moveDamage) }}
                                        </td>
                                        <td class="details">
                                            <div>气: {{ store.user.syncBuff }}</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

            <div class="window-footer">
                <button class="btn btn-primary" @click="emit('close')">关闭</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* --- 模态框基础 --- */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-window {
    background: white;
    width: 90vw;
    height: 95vh;
    max-width: 1000px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.window-header {
    padding: 10px 20px;
    background: #009688;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.window-header h2 {
    margin: 0;
    font-size: 1.1rem;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
}

.window-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #f2f2f2;
}

.window-footer {
    padding: 10px 20px;
    background: white;
    border-top: 1px solid #ddd;
    text-align: right;
}

/* --- 通用布局组件 --- */
.section-group {
    margin-bottom: 20px;
}

.section-title {
    font-size: 1rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
    padding-left: 8px;
    border-left: 4px solid #009688;
}

.panel-card {
    background: white;
    padding: 15px;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.sub-title {
    font-size: 0.85rem;
    font-weight: bold;
    color: #666;
    margin-bottom: 8px;
    border-bottom: 1px solid #eee;
    padding-bottom: 4px;
}

.grid-2-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.divider {
    height: 1px;
    background: #eee;
    margin: 15px 0;
}

.full-width {
    width: 100%;
}

/* --- 表单样式 --- */
.stats-grid-row {
    display: grid;
    grid-template-columns: 80px 1fr 1fr;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
}

.header-row {
    font-size: 0.75rem;
    color: #888;
    font-weight: bold;
    text-align: center;
}

.stat-label {
    font-weight: bold;
    font-size: 0.8rem;
    color: #555;
    text-align: center;
}

.input-cell,
.select-cell {
    width: 100%;
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: center;
}

.extra-ranks {
    display: flex;
    gap: 10px;
    margin-top: 8px;
    font-size: 0.8rem;
}

.extra-ranks select {
    margin-left: 4px;
    border: 1px solid #ddd;
    border-radius: 3px;
}

.form-grid-compact {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 10px;
    align-items: center;
    font-size: 0.85rem;
}

.form-grid-compact input,
.form-grid-compact select {
    width: 100%;
    padding: 3px;
    border: 1px solid #ccc;
    border-radius: 3px;
}

.form-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    font-size: 0.9rem;
}

/* 状态Tag按钮 */
.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
}

.tag-btn {
    font-size: 0.75rem;
    padding: 2px 8px;
    border: 1px solid #ccc;
    border-radius: 12px;
    background: #fff;
    cursor: pointer;
}

.tag-btn.active {
    background: #ff9800;
    color: white;
    border-color: #f57c00;
}

/* --- 环境与斗阵 --- */
.env-row {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
}

.env-group {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
}

.check-box {
    font-size: 0.8rem;
    display: flex;
    align-items: center;
}

/* 斗阵样式 */
.circle-scroll-wrapper {
    background: white;
    padding: 10px;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.circle-track {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 5px;
}

.circle-item {
    flex: 0 0 90px;
    border: 1px solid #ddd;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.circle-header {
    color: white;
    text-align: center;
    font-size: 0.8rem;
    font-weight: bold;
    padding: 3px 0;
}

.circle-toggles {
    display: flex;
    justify-content: space-between;
    padding: 4px;
    background: #f9f9f9;
    border-bottom: 1px solid #eee;
}

.toggle-circle-btn {
    font-size: 0.7rem;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid #ccc;
    background: white;
    color: #999;
    cursor: pointer;
    padding: 0;
}

.toggle-circle-btn.active {
    background: #2196f3;
    color: white;
    border-color: #1976d2;
}

.circle-level-display {
    text-align: center;
    font-size: 0.9rem;
    font-weight: bold;
    padding: 4px;
    color: #444;
}

/* 地区颜色 */
.region-kanto {
    background: #4caf50;
}

.region-johto {
    background: #cddc39;
    color: #333;
}

.region-hoenn {
    background: #f44336;
}

.region-sinnoh {
    background: #9c27b0;
}

.region-unova {
    background: #607d8b;
}

.region-kalos {
    background: #2196f3;
}

.region-alola {
    background: #ff9800;
}

.region-galar {
    background: #e91e63;
}

.region-paldea {
    background: #3f51b5;
}

.region-pasio {
    background: #00bcd4;
}

.region-default {
    background: #999;
}

/* --- 结果表格 --- */
.result-card {
    background: white;
    margin-bottom: 15px;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.form-name {
    background: #444;
    color: white;
    padding: 5px 15px;
    font-weight: bold;
    font-size: 0.85rem;
}

.result-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
}

.result-table th {
    background: #eee;
    padding: 6px;
    text-align: left;
    color: #555;
}

.result-table td {
    padding: 6px;
    border-bottom: 1px solid #f0f0f0;
}

.tag {
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 0.7rem;
}

.tag-phy {
    background: #ffe0b2;
    color: #e65100;
}

.tag-sp {
    background: #bbdefb;
    color: #0d47a1;
}

.damage-val {
    font-family: monospace;
    font-weight: bold;
    color: #d32f2f;
}

.sync-val {
    font-size: 1rem;
}

.row-sync {
    background: #fffde7;
}

.details {
    font-size: 0.7rem;
    color: #777;
}

.btn {
    padding: 6px 16px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: bold;
}

.btn-primary {
    background: #009688;
    color: white;
}

/* 滚动条 */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
}
</style>