<template>
  <div class="file-processing-view p-4">
    <v-tabs v-model="activeTab">
      <v-tab value="pdf">PDF转图片</v-tab>
      <v-tab value="md">Markdown转PDF</v-tab>
    </v-tabs>
    <v-window v-model="activeTab">
      <v-window-item value="pdf">
        <PdfToImage />
      </v-window-item>
      <v-window-item value="md">
        <MarkdownToPdf />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PdfToImage from '@/components/file-processing/pdf-to-image/PdfToImage.vue';
import MarkdownToPdf from '@/components/file-processing/markdown-to-pdf/MarkdownToPdf.vue';

const activeTab = ref('pdf');
</script>

<style scoped>
.file-processing-view {
  @apply bg-gray-50 min-h-screen;
}
</style>
