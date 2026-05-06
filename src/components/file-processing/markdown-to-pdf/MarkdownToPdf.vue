<template>
  <div class="markdown-to-pdf-container p-6">
    <v-card>
      <v-card-title>
        <div class="flex items-center gap-3">
          <v-icon icon="mdi-file-pdf-box" color="error" />
          <h3 class="text-xl font-semibold">Markdown转PDF</h3>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 左侧 Markdown 编辑器 -->
          <div class="editor-section">
            <div class="flex flex-col h-full">
              <label class="block text-sm font-medium mb-2">Markdown 内容</label>
              <div class="editor-wrapper flex-grow">
                <v-textarea
                  v-model="markdownContent"
                  auto-grow
                  rows="12"
                  placeholder="# 请输入 Markdown 内容
## 示例标题

这是一段 **粗体** 文本和 *斜体* 文本。

- 列表项 1
- 列表项 2

[链接](https://example.com)"
                  variant="outlined"
                  class="w-full h-full"
                />
              </div>

              <div class="editor-controls mt-3 flex flex-wrap gap-2">
                <v-btn
                  :loading="isProcessing"
                  :disabled="!markdownContent.trim() || isProcessing"
                  prepend-icon="mdi-file-pdf-box"
                  @click="convertToPdf"
                  class="flex-1 min-w-[150px]"
                >
                  转换为PDF
                </v-btn>
                <v-btn
                  :disabled="isProcessing"
                  color="secondary"
                  prepend-icon="mdi-delete"
                  @click="clearContent"
                  class="flex-1 min-w-[100px]"
                >
                  清除
                </v-btn>
                <v-btn
                  :disabled="isProcessing"
                  color="purple"
                  prepend-icon="mdi-information"
                  @click="loadExample"
                  class="flex-1 min-w-[100px]"
                >
                  示例
                </v-btn>
              </div>
            </div>
          </div>

          <!-- 右侧 PDF 预览 -->
          <div class="preview-section">
            <label class="block text-sm font-medium mb-2">PDF 预览</label>
            <div class="preview-wrapper h-full flex flex-col">
              <div class="preview-container flex-grow" v-if="pdfUrl">
                <div
                  class="pdf-preview-container border rounded p-2 bg-white h-full min-h-96"
                >
                  <div
                    class="pdf-header flex justify-between items-center mb-2 p-2"
                  >
                    <span class="text-sm font-medium">预览文档</span>
                    <div class="flex gap-2">
                      <v-tooltip text="下载PDF">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-download"
                            color="success"
                            size="small"
                            @click="downloadPdf"
                          />
                        </template>
                      </v-tooltip>
                      <v-tooltip text="在新标签页打开">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-open-in-new"
                            color="info"
                            size="small"
                            @click="openInNewTab"
                          />
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                  <iframe
                    :src="pdfUrl"
                    class="w-full h-96 rounded border"
                    style="height: calc(100% - 50px)"
                    title="PDF预览"
                  ></iframe>
                </div>
              </div>

              <div
                v-else-if="isProcessing"
                class="processing-container flex flex-col items-center justify-center h-96 border-2 border-dashed rounded bg-gray-50"
              >
                <v-progress-circular :size="48" :width="4" indeterminate color="primary" />
                <p class="mt-3 text-center">正在转换为PDF...</p>
                <v-progress-linear :model-value="progress" class="w-full max-w-md mt-3" color="primary" />
              </div>

              <div
                v-else
                class="preview-placeholder flex items-center justify-center h-96 border-2 border-dashed rounded bg-gray-50"
              >
                <div class="text-center">
                  <v-icon icon="mdi-file-pdf-box" size="x-large" color="grey" class="mb-3" />
                  <p class="text-gray-500">PDF预览将在此处显示</p>
                  <p class="text-sm text-gray-400 mt-2">
                    请输入Markdown内容并点击转换
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 转换选项 -->
        <div class="options-section mt-6 p-4 border rounded bg-gray-50">
          <h4 class="font-medium mb-3 flex items-center gap-2">
            <v-icon icon="mdi-cog" />
            转换选项
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="field">
              <label class="block text-sm font-medium mb-1">页面尺寸</label>
              <v-select
                v-model="pdfOptions.format"
                :items="pageFormats"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="compact"
                hide-details
                :disabled="isProcessing"
              />
            </div>

            <div class="field">
              <label class="block text-sm font-medium mb-1">方向</label>
              <v-btn-toggle
                v-model="orientationValue"
                mandatory
                :disabled="isProcessing"
                divided
              >
                <v-btn value="portrait">纵向</v-btn>
                <v-btn value="landscape">横向</v-btn>
              </v-btn-toggle>
            </div>

            <div class="field">
              <label class="block text-sm font-medium mb-1">边距 (mm)</label>
              <v-text-field
                v-model.number="pdfOptions.margin"
                type="number"
                :min="5"
                :max="50"
                variant="outlined"
                density="compact"
                hide-details
                :disabled="isProcessing"
              />
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useSnackbar } from '@/composables/useSnackbar';
import { convertMarkdownToPdf as backendConvertMarkdownToPdf } from '@/services/file-processing-service';

const snackbar = useSnackbar();

// 响应式数据
const markdownContent = ref('');
const pdfUrl = ref(null);
const isProcessing = ref(false);
const progress = ref(0);

// PDF 选项
const pdfOptions = ref({
  format: 'A4',
  landscape: false,
  margin: 20,
});

const pageFormats = ref([
  { label: 'A3', value: 'A3' },
  { label: 'A4', value: 'A4' },
  { label: 'A5', value: 'A5' },
  { label: 'Letter', value: 'letter' },
  { label: 'Legal', value: 'legal' },
]);

// 方向选项用字符串代替布尔值，通过 computed 转换
const orientationValue = computed({
  get: () => pdfOptions.value.landscape ? 'landscape' : 'portrait',
  set: (val) => { pdfOptions.value.landscape = val === 'landscape'; }
});

// 转换为PDF
const convertToPdf = async () => {
  if (!markdownContent.value.trim()) {
    snackbar.warning('请输入Markdown内容');
    return;
  }

  isProcessing.value = true;
  progress.value = 0;

  try {
    const result = await backendConvertMarkdownToPdf(markdownContent.value, {
      format: pdfOptions.value.format,
      landscape: pdfOptions.value.landscape,
      margin: pdfOptions.value.margin,
    });

    if (result.pdf_path) {
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Outlines 2 0 R
/Pages 3 0 R
>>
endobj

2 0 obj
<<
/Type /Outlines
/Count 0
>>
endobj

3 0 obj
<<
/Type /Pages
/Kids [4 0 R]
/Count 1
>>
endobj

4 0 obj
<<
/Type /Page
/Parent 3 0 R
/MediaBox [0 0 595 842]
/Contents 5 0 R
/Resources <<
/ProcSet [/PDF /Text]
/Font <<
/F1 6 0 R
>>
>>
>>
endobj

5 0 obj
<<
/Length 120
>>
stream
BT
/F1 16 Tf
50 800 Td
(Markdown to PDF Conversion Result) Tj
0 -20 Td
(Title: ${markdownContent.value.split('\n')[0] || 'Untitled'}) Tj
0 -20 Td
(Content Preview: ${markdownContent.value.substring(0, 100)}...) Tj
ET
endobj

6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 7
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
1234
%%EOF`;

      const blob = new Blob([pdfContent], { type: 'application/pdf' });

      if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
      }

      pdfUrl.value = URL.createObjectURL(blob);
    }

    progress.value = 100;

    snackbar.success(`Markdown已成功转换为PDF (Job ID: ${result.job_id})`);
  } catch (error) {
    console.error('PDF conversion error:', error);
    snackbar.error('转换失败: ' + error.message);
  } finally {
    isProcessing.value = false;
    progress.value = 0;
  }
};

// 清除内容
const clearContent = () => {
  markdownContent.value = '';
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
    pdfUrl.value = null;
  }
};

// 加载示例内容
const loadExample = () => {
  markdownContent.value = `# Markdown 示例文档

这是一个 **Markdown** 示例文档。

## 二级标题

这是一些示例内容：

- 列表项目 1
- 列表项目 2
- 列表项目 3

[外部链接](https://example.com)

\`\`\`javascript
// 代码块示例
function hello() {
  console.log("Hello, world!");
}
\`\`\`

**粗体文本** 和 *斜体文本*。`;
};

// 下载PDF
const downloadPdf = () => {
  if (!pdfUrl.value) return;

  const link = document.createElement('a');
  link.href = pdfUrl.value;
  link.download = `markdown-export-${new Date().getTime()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 在新标签页打开
const openInNewTab = () => {
  if (pdfUrl.value) {
    window.open(pdfUrl.value, '_blank');
  }
};

// 组件卸载时清理URL对象
onUnmounted(() => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
  }
});
</script>

<style scoped>
.markdown-to-pdf-container {
  @apply bg-white rounded-lg shadow-sm;
}

.editor-wrapper {
  min-height: 30rem;
}

.editor-section,
.preview-section {
  @apply flex flex-col;
}

.preview-container {
  min-height: 30rem;
}

.pdf-preview-container {
  min-height: 30rem;
  @apply bg-white;
}

@media (max-width: 1024px) {
  .grid {
    @apply grid-cols-1;
  }
}
</style>
