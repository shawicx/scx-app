<template>
  <div class="file-processing-view p-4">
    <TabView>
      <TabPanel header="PDF转图片">
        <PdfToImage />
      </TabPanel>
      <TabPanel header="Markdown转PDF">
        <MarkdownToPdf />
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup>
import PdfToImage from '@/components/file-processing/pdf-to-image/PdfToImage.vue';
import MarkdownToPdf from '@/components/file-processing/markdown-to-pdf/MarkdownToPdf.vue';
</script>

<style scoped>
.file-processing-view {
  @apply bg-gray-50 min-h-screen;
}
</style>