<script setup>
import PdfToPng from "./components/files/PdfToPng.vue";
</script>

<template>
  <Tabs value="0">
    <TabList>
      <Tab value="0">PDF转PNG</Tab>
      <Tab value="1">其他文件处理</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="0">
        <PdfToPng />
      </TabPanel>
      <TabPanel value="1">
        <!-- 其他内容 -->
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<style lang="scss" scoped>
.file-view {
  width: 100%;
  min-height: 100%;
  background: #fff;
  padding: 1.5rem;
}

// 响应式设计
@media screen and (max-width: 768px) {
  .file-view {
    padding: 0.75rem;
  }
}
</style>
