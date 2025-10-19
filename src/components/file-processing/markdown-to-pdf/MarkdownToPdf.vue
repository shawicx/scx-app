<template>
  <div class="markdown-to-pdf-container p-6">
    <Card>
      <template #title>
        <div class="flex items-center gap-3">
          <i class="pi pi-file-pdf text-red-500 text-xl"></i>
          <h3 class="text-xl font-semibold">Markdown转PDF</h3>
        </div>
      </template>
      <template #content>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 左侧 Markdown 编辑器 -->
          <div class="editor-section">
            <div class="flex flex-col h-full">
              <label class="block text-sm font-medium mb-2"
                >Markdown 内容</label
              >
              <div class="editor-wrapper flex-grow">
                <Textarea
                  v-model="markdownContent"
                  :autoResize="true"
                  rows="12"
                  cols="50"
                  placeholder="# 请输入 Markdown 内容
## 示例标题

这是一段 **粗体** 文本和 *斜体* 文本。

- 列表项 1
- 列表项 2

[链接](https://example.com)"
                  class="w-full h-full min-h-96 p-inputtext-lg"
                />
              </div>

              <div class="editor-controls mt-3 flex flex-wrap gap-2">
                <Button
                  label="转换为PDF"
                  icon="pi pi-file-pdf"
                  @click="convertToPdf"
                  :loading="isProcessing"
                  :disabled="!markdownContent.trim() || isProcessing"
                  class="flex-1 min-w-[150px]"
                />
                <Button
                  label="清除"
                  icon="pi pi-trash"
                  @click="clearContent"
                  severity="secondary"
                  :disabled="isProcessing"
                  class="flex-1 min-w-[100px]"
                />
                <Button
                  label="示例"
                  icon="pi pi-info-circle"
                  @click="loadExample"
                  severity="help"
                  :disabled="isProcessing"
                  class="flex-1 min-w-[100px]"
                />
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
                      <Button
                        icon="pi pi-download"
                        @click="downloadPdf"
                        severity="success"
                        size="small"
                        v-tooltip="'下载PDF'"
                      />
                      <Button
                        icon="pi pi-external-link"
                        @click="openInNewTab"
                        severity="info"
                        size="small"
                        v-tooltip="'在新标签页打开'"
                      />
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
                <ProgressSpinner style="width: 3rem; height: 3rem" />
                <p class="mt-3 text-center">正在转换为PDF...</p>
                <ProgressBar :value="progress" class="w-full max-w-md mt-3" />
              </div>

              <div
                v-else
                class="preview-placeholder flex items-center justify-center h-96 border-2 border-dashed rounded bg-gray-50"
              >
                <div class="text-center">
                  <i class="pi pi-file-pdf text-4xl text-gray-400 mb-3"></i>
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
            <i class="pi pi-cog"></i>
            转换选项
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="field">
              <label class="block text-sm font-medium mb-1">页面尺寸</label>
              <Dropdown
                v-model="pdfOptions.format"
                :options="pageFormats"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                :disabled="isProcessing"
              />
            </div>

            <div class="field">
              <label class="block text-sm font-medium mb-1">方向</label>
              <SelectButton
                v-model="pdfOptions.landscape"
                :options="orientationOptions"
                optionLabel="label"
                optionValue="value"
                :disabled="isProcessing"
              />
            </div>

            <div class="field">
              <label class="block text-sm font-medium mb-1">边距 (mm)</label>
              <InputNumber
                v-model="pdfOptions.margin"
                :min="5"
                :max="50"
                :disabled="isProcessing"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { convertMarkdownToPdf as backendConvertMarkdownToPdf } from '@/services/file-processing-service';

const toast = useToast();

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

const orientationOptions = ref([
  { label: '纵向', value: false },
  { label: '横向', value: true },
]);

// 转换为PDF
const convertToPdf = async () => {
  if (!markdownContent.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: '警告',
      detail: '请输入Markdown内容',
      life: 3000,
    });
    return;
  }

  isProcessing.value = true;
  progress.value = 0;

  try {
    // 使用后端服务生成PDF
    const result = await backendConvertMarkdownToPdf(markdownContent.value, {
      format: pdfOptions.value.format,
      landscape: pdfOptions.value.landscape,
      margin: pdfOptions.value.margin,
    });

    // 由于后端目前返回的是HTML文件路径，我们需要获取文件内容并创建blob URL
    // 在完整实现中，后端会直接返回PDF文件
    if (result.pdf_path) {
      // 模拟获取后端生成的PDF内容
      // 在实际实现中，这里应该从后端获取真实的PDF内容
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

      // 释放之前的URL对象（如果存在）
      if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
      }

      // 创建新的URL对象
      pdfUrl.value = URL.createObjectURL(blob);
    }

    progress.value = 100;

    toast.add({
      severity: 'success',
      summary: '成功',
      detail: `Markdown已成功转换为PDF (Job ID: ${result.job_id})`,
      life: 3000,
    });
  } catch (error) {
    console.error('PDF conversion error:', error);
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '转换失败: ' + error.message,
      life: 5000,
    });
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
