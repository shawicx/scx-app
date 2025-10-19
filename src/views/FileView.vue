<script setup>
import { ref } from 'vue';
import PdfToPng from './components/files/PdfToPng.vue';
import MarkdownToPdf from '@/components/file-processing/markdown-to-pdf/MarkdownToPdf.vue';
</script>

<template>
  <div class="file-view">
    <TabView>
      <TabPanel header="PDF转图片">
        <div class="p-4">
          <PdfToPng />
        </div>
      </TabPanel>
      <TabPanel header="Markdown转PDF">
        <div class="p-4">
          <MarkdownToPdf />
        </div>
      </TabPanel>
      <TabPanel header="其他文件处理">
        <div class="p-4 text-center text-gray-500">
          更多文件处理功能即将推出...
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped>
.file-view {
  @apply bg-gray-50 min-h-screen;
}
</style>

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
