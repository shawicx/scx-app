<!--
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2025-03-02 12:39:39
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-03-02 12:40:12
 * @Description: 数据视图
-->
<script setup>
import ChinaRegions from "./components/data/ChinaRegions.vue";
import RandomData from "./components/data/RandomData.vue";
</script>

<template>
  <Tabs value="0">
    <TabList>
      <Tab value="0">中国行政区边界数据</Tab>
      <Tab value="1">随机数据</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="0">
        <ChinaRegions />
      </TabPanel>
      <TabPanel value="1">
        <RandomData />
      </TabPanel>
    </TabPanels>
  </Tabs>
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
