<!--
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2025-03-02 12:39:39
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-03-02 12:40:12
 * @Description: 数据视图
-->
<script setup>
import { ref } from 'vue';
import ChinaRegions from "./components/data/ChinaRegions.vue";
import RandomData from "./components/data/RandomData.vue";

const activeTab = ref('regions');
</script>

<template>
  <div class="data-view">
    <v-tabs v-model="activeTab">
      <v-tab value="regions">中国行政区边界数据</v-tab>
      <v-tab value="random">随机数据</v-tab>
    </v-tabs>
    <v-window v-model="activeTab">
      <v-window-item value="regions">
        <ChinaRegions />
      </v-window-item>
      <v-window-item value="random">
        <RandomData />
      </v-window-item>
    </v-window>
  </div>
</template>

<style lang="scss" scoped>
.data-view {
  width: 100%;
  min-height: 100%;
  background: #fff;
  padding: 1.5rem;
}

// 响应式设计
@media screen and (max-width: 768px) {
  .data-view {
    padding: 0.75rem;
  }
}
</style>
