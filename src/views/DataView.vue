<!--
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2025-03-02 12:39:39
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-03-02 12:40:12
 * @Description: 数据视图
-->
<script setup>
import ChinaRegions from './components/data/ChinaRegions.vue';
import RandomData from './components/data/RandomData.vue';
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

  // PrimeVue TabView 样式覆盖
  :deep {
    .p-tabview {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }

    .p-tabview-nav {
      border-bottom: 1px solid #ebeef5;
      padding: 0 1rem;
    }

    .p-tabview-nav-link {
      padding: 1rem 1.5rem;
      color: #606266;
      font-weight: 500;
    }

    .p-tabview-selected {
      .p-tabview-nav-link {
        color: #409eff;
      }
    }

    .p-tabview-panels {
      padding: 1.5rem;
      background: #fff;
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .data-view {
    padding: 0.75rem;

    :deep {
      .p-tabview-panels {
        padding: 1rem;
      }

      .p-tabview-nav-link {
        padding: 0.75rem 1rem;
      }
    }
  }
}
</style>