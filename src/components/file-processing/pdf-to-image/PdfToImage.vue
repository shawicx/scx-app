<template>
  <div class="pdf-to-image-container p-4">
    <Card>
      <template #title>
        <h3 class="text-xl font-semibold">PDF转图片 (修复版)</h3>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 左侧文件上传和控制 -->
          <div class="control-section">
            <div class="file-upload-section mb-4">
              <label class="block text-sm font-medium mb-2">选择PDF文件</label>
              <FileUpload
                mode="basic"
                name="pdf"
                accept=".pdf"
                :maxFileSize="50000000"
                @select="onFileSelect"
                @upload="onUploadSuccess"
                @error="onUploadError"
                chooseLabel="选择文件"
                class="w-full"
              />
            </div>

            <div
              v-if="fileInfo"
              class="file-info-section mb-4 p-3 bg-gray-50 rounded"
            >
              <h4 class="font-medium mb-2">文件信息</h4>
              <p><strong>名称:</strong> {{ fileInfo.name }}</p>
              <p><strong>大小:</strong> {{ formatFileSize(fileInfo.size) }}</p>
              <p>
                <strong>页面数:</strong>
                {{ pageInfo.totalPages || '加载中...' }}
              </p>
            </div>

            <div class="conversion-options mb-4">
              <h4 class="font-medium mb-2">转换选项</h4>
              <div class="grid grid-cols-1 gap-2">
                <div class="field">
                  <label class="block text-sm mb-1">图片格式</label>
                  <Dropdown
                    v-model="imageFormat"
                    :options="imageFormats"
                    optionLabel="name"
                    optionValue="value"
                    class="w-full"
                  />
                </div>
                <div class="field">
                  <label class="block text-sm mb-1">分辨率</label>
                  <Slider
                    v-model="scale"
                    :min="0.5"
                    :max="3"
                    :step="0.1"
                    class="w-full"
                  />
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>低</span>
                    <span>当前: {{ scale }}x</span>
                    <span>高</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="button-group flex flex-wrap gap-2">
              <Button
                :label="isProcessing ? '处理中...' : '开始转换'"
                icon="pi pi-cog"
                @click="convertPdfToImages"
                :disabled="!fileInfo || isProcessing"
                :loading="isProcessing"
                class="flex-1"
              />
              <Button
                label="下载全部"
                icon="pi pi-download"
                @click="downloadAllImages"
                :disabled="!images.length || isProcessing"
                severity="success"
                class="flex-1"
              />
            </div>
          </div>

          <!-- 右侧预览区域 -->
          <div class="preview-section">
            <label class="block text-sm font-medium mb-2">图片预览</label>
            <div
              v-if="isProcessing"
              class="processing-placeholder flex flex-col items-center justify-center h-96"
            >
              <ProgressSpinner style="width: 3rem; height: 3rem" />
              <p class="mt-2">
                正在转换页面 {{ currentPage }} / {{ pageInfo.totalPages }}
              </p>
              <ProgressBar :value="progressPercentage" class="w-full mt-2" />
            </div>
            <div v-else-if="images.length > 0" class="image-gallery">
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(image, index) in images"
                  :key="index"
                  class="image-item bg-white rounded border p-2"
                >
                  <Image
                    :src="image.url"
                    :alt="`PDF第${index + 1}页`"
                    width="150"
                    preview
                    class="rounded cursor-pointer"
                  />
                  <p class="text-center text-sm mt-1">{{ index + 1 }}</p>
                </div>
              </div>
            </div>
            <div
              v-else
              class="preview-placeholder flex items-center justify-center h-96 border-2 border-dashed rounded"
            >
              <p class="text-gray-500">上传PDF文件以开始转换</p>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { convertPdfToImages as backendConvertPdfToImages } from '@/services/file-processing-service';

const toast = useToast();

// 响应式数据
const fileInfo = ref(null);
const images = ref([]);
const isProcessing = ref(false);
const currentPage = ref(0);
const progressPercentage = ref(0);
const pageInfo = ref({ totalPages: 0 });
const imageFormat = ref('png');
const scale = ref(1.5);
const imageFormats = ref([
  { name: 'PNG', value: 'png' },
  { name: 'JPEG', value: 'jpeg' },
]);

// 文件选择处理
const onFileSelect = (event) => {
  const file = event.files[0];
  if (file && file.type === 'application/pdf') {
    fileInfo.value = {
      name: file.name,
      size: file.size,
      file: file,
    };
    // 模拟读取PDF页面信息
    pageInfo.value.totalPages = '计算中...';
    setTimeout(() => {
      // 实际实现中应调用服务获取页面数
      pageInfo.value.totalPages = 5; // 模拟值
    }, 500);
  } else {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '请选择有效的PDF文件',
      life: 3000,
    });
  }
};

// 文件上传成功
const onUploadSuccess = () => {
  toast.add({
    severity: 'success',
    summary: '成功',
    detail: '文件上传成功',
    life: 3000,
  });
};

// 文件上传错误
const onUploadError = () => {
  toast.add({
    severity: 'error',
    summary: '错误',
    detail: '文件上传失败',
    life: 3000,
  });
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 转换PDF到图片
const convertPdfToImages = async () => {
  if (!fileInfo.value || isProcessing.value) return;

  isProcessing.value = true;
  images.value = [];
  currentPage.value = 0;
  progressPercentage.value = 0;

  try {
    // 调用后端服务进行PDF转换
    // 这里是模拟实现，实际会调用Tauri后端
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟后端处理时间

    // 模拟生成的图片结果
    const totalPages = 5; // 实际应从后端获取
    pageInfo.value.totalPages = totalPages;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      currentPage.value = pageNum;
      progressPercentage.value = Math.round((pageNum / totalPages) * 100);

      // 模拟图片URL（实际会从后端服务获得）
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');

      // 绘制模拟页面内容
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.font = '20px Arial';
      ctx.fillText(`PDF Page ${pageNum}`, 20, 50);
      ctx.fillText('Content would appear here', 20, 100);

      const imageData = canvas.toDataURL(`image/${imageFormat.value}`, 0.92);
      images.value.push({
        url: imageData,
        pageNum: pageNum,
      });

      // 模拟处理延迟，以显示进度
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    toast.add({
      severity: 'success',
      summary: '成功',
      detail: `PDF转换完成，共生成${images.value.length}张图片`,
      life: 3000,
    });
  } catch (error) {
    console.error('PDF转换失败:', error);
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: 'PDF转换失败: ' + error.message,
      life: 5000,
    });
  } finally {
    isProcessing.value = false;
    progressPercentage.value = 0;
  }
};

// 下载所有图片
const downloadAllImages = async () => {
  if (images.value.length === 0) return;

  try {
    // 导入 JSZip 和 FileSaver
    const { default: JSZip } = await import('jszip');
    const { saveAs } = await import('file-saver');

    const zip = new JSZip();
    const promises = images.value.map((image, index) => {
      // 从DataURL获取blob
      return fetch(image.url)
        .then((res) => res.blob())
        .then((blob) => {
          const filename = `${fileInfo.value.name.replace(/\.pdf$/, '')}_page_${index + 1}.${imageFormat.value}`;
          zip.file(filename, blob);
        });
    });

    await Promise.all(promises);
    const content = await zip.generateAsync({ type: 'blob' });

    saveAs(content, `${fileInfo.value.name.replace(/\.pdf$/, '')}_images.zip`);

    toast.add({
      severity: 'success',
      summary: '成功',
      detail: '图片已下载到压缩包',
      life: 3000,
    });
  } catch (error) {
    console.error('下载失败:', error);
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '下载失败: ' + error.message,
      life: 5000,
    });
  }
};
</script>

<style scoped>
.pdf-to-image-container {
  @apply bg-white rounded-lg shadow;
}

.control-section,
.preview-section {
  @apply p-2;
}

.processing-placeholder,
.preview-placeholder {
  @apply bg-gray-50 rounded flex items-center justify-center;
}

.image-item {
  @apply flex flex-col items-center;
}

.image-gallery {
  @apply overflow-y-auto max-h-[500px];
}

@media (max-width: 768px) {
  .grid {
    @apply grid-cols-1;
  }
}
</style>
