<script setup>
import { ref } from 'vue';
import PdfToPng from './components/files/PdfToPng.vue';
import MarkdownToPdf from '@/components/file-processing/markdown-to-pdf/MarkdownToPdf.vue';

const activeTab = ref('pdf');
</script>

<template>
  <div class="file-view">
    <v-tabs v-model="activeTab">
      <v-tab value="pdf">PDF转图片</v-tab>
      <v-tab value="md">Markdown转PDF</v-tab>
      <v-tab value="other">其他文件处理</v-tab>
    </v-tabs>
    <v-window v-model="activeTab">
      <v-window-item value="pdf">
        <div class="p-4">
          <PdfToPng />
        </div>
      </v-window-item>
      <v-window-item value="md">
        <div class="p-4">
          <MarkdownToPdf />
        </div>
      </v-window-item>
      <v-window-item value="other">
        <div class="p-4 text-center text-gray-500">
          更多文件处理功能即将推出...
        </div>
      </v-window-item>
    </v-window>
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
