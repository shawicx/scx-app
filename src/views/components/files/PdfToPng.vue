<script setup>
import { ref } from "vue";
import * as pdfjsLib from "pdfjs-dist";
import { useToast } from "primevue/usetoast";
import JSZip from "jszip";
import FileSaver from "file-saver";
import Lodaing from "^/components/Loading.vue";

// 初始化 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.mjs",
).toString();

// 响应式状态定义
const ConvertStatus = {
  NotStarted: 0,
  Processing: 1,
  Success: 2,
  Failed: 3,
};

const toast = useToast();
const fileInfo = ref(null);
const images = ref([]);
const status = ref(ConvertStatus.NotStarted);

// 轮播图响应式配置
const responsiveOptions = ref([
  {
    breakpoint: "1400px",
    numVisible: 12,
    numScroll: 1,
  },
  {
    breakpoint: "1200px",
    numVisible: 8,
    numScroll: 1,
  },
  {
    breakpoint: "992px",
    numVisible: 6,
    numScroll: 1,
  },
  {
    breakpoint: "768px",
    numVisible: 4,
    numScroll: 1,
  },
  {
    breakpoint: "576px",
    numVisible: 2,
    numScroll: 1,
  },
]);

// 文件大小格式化函数
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 文件选择处理
const onFileChange = (event) => {
  const file = event.files?.[0];
  if (file && file.type === "application/pdf") {
    fileInfo.value = {
      name: file.name,
      size: file.size,
      file: file,
    };
    status.value = ConvertStatus.NotStarted;
  } else {
    toast.add({
      severity: "error",
      summary: "错误",
      detail: "请选择一个有效的 PDF 文件",
      life: 3000,
    });
  }
};

// 超时控制函数
const timeoutPromise = (timeout) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("转换超时，请检查文件大小或重试"));
    }, timeout);
  });
};

// PDF转PNG转换函数
const convertPdfToPng = async () => {
  if (!fileInfo.value) return;
  status.value = ConvertStatus.Processing;
  images.value = [];

  try {
    const timeout = 300000;

    await Promise.race([
      (async () => {
        const arrayBuffer = await fileInfo.value.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const totalPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          const imageUrl = canvas.toDataURL("image/png");
          images.value.push({
            itemImageSrc: imageUrl,
            alt: `第 ${pageNum} 页`,
            title: `第 ${pageNum} 页`,
          });
        }
      })(),
      timeoutPromise(timeout),
    ]);

    status.value = ConvertStatus.Success;
    toast.add({
      severity: "success",
      summary: "转换成功",
      detail: `成功转换 ${images.value.length} 页PDF`,
      life: 3000,
    });
  } catch (error) {
    status.value = ConvertStatus.Failed;
    toast.add({
      severity: "error",
      summary: "转换失败",
      detail: error.message || "转换过程中发生错误",
      life: 5000,
    });
  }
};

// 图片下载函数
const downloadImages = async () => {
  if (images.value.length === 0) return;

  try {
    const baseFileName = fileInfo.value
      ? fileInfo.value.name.replace(/\.pdf$/i, "")
      : "pdf";

    if (images.value.length <= 5) {
      images.value.forEach((image, index) => {
        const link = document.createElement("a");
        link.href = image.itemImageSrc;
        link.download = `${baseFileName}_${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } else {
      const zip = new JSZip();
      const promises = images.value.map((image, index) => {
        return fetch(image.itemImageSrc)
          .then((response) => response.blob())
          .then((blob) => {
            zip.file(`${baseFileName}_${index + 1}.png`, blob);
          });
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: "blob" });
      FileSaver.saveAs(content, `${baseFileName}_images.zip`);
    }

    toast.add({
      severity: "success",
      summary: "下载成功",
      detail: "图片已成功下载",
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "下载失败",
      detail: "图片下载过程中发生错误",
      life: 5000,
    });
  }
};
</script>

<template>
  <div class="pdf-to-png-container">
    <Toast />
    <Loading
      :visible="status === ConvertStatus.Processing"
      text="正在转换文件..."
    />
    <div class="content-layout">
      <!-- 上部分:文件信息和按钮 -->
      <div class="top-section">
        <!-- 左列 -->
        <div class="column">
          <FileUpload
            ref="fileupload"
            :auto="true"
            :maxFileSize="2589600000"
            :showCancelButton="false"
            :showUploadButton="false"
            accept="application/pdf"
            chooseLabel="选择PDF文件"
            mode="basic"
            name="pdfToPng"
            @select="onFileChange"
            @upload="onUpload"
          />

          <!-- 文件信息展示 -->
          <div v-if="fileInfo" class="file-info">
            <div class="info-item">
              <i class="pi pi-file-pdf" />
              <span class="label">文件名称:</span>
              <span class="value">{{ fileInfo.name }}</span>
            </div>
            <div class="info-item">
              <i class="pi pi-database" />
              <span class="label">文件大小:</span>
              <span class="value">{{ formatFileSize(fileInfo.size) }}</span>
            </div>
          </div>
        </div>

        <!-- 右列 -->
        <div class="column">
          <div class="button-container">
            <Button
              :disabled="
                status === ConvertStatus.Processing ||
                !fileInfo ||
                status === ConvertStatus.Success
              "
              icon="pi pi-images"
              label="开始转换"
              @click="convertPdfToPng"
            />
            <Button
              :disabled="
                status !== ConvertStatus.Success ||
                status === ConvertStatus.Processing
              "
              icon="pi pi-download"
              label="下载图片"
              @click="downloadImages"
            />
          </div>
        </div>
      </div>

      <!-- 下部分:预览区域 -->
      <div class="preview-section">
        <!-- 未开始转换或无内容状态 -->
        <div v-if="!images.length" class="preview-state empty">
          <i class="pi pi-image"></i>
          <span>暂无预览内容</span>
        </div>

        <!-- 转换结果展示 -->
        <div v-else class="preview-state">
          <Carousel
            :circular="true"
            :numScroll="1"
            :numVisible="8"
            :responsiveOptions="responsiveOptions"
            :showIndicators="false"
            :value="images"
            class="custom-carousel"
          >
            <template #item="slotProps">
              <div class="carousel-item">
                <Image
                  :alt="slotProps.data.alt"
                  :src="slotProps.data.itemImageSrc"
                  imageClass="carousel-image"
                  preview
                />
                <div class="carousel-item-content">
                  <span>{{ slotProps.data.title }}</span>
                </div>
              </div>
            </template>
          </Carousel>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pdf-to-png-container {
  padding: 20px;

  .content-layout {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    // 上部分布局
    .top-section {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin: 0 auto;
      min-width: 520px;

      .column {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
      }

      .file-info {
        width: 100%;
        padding: 1rem;
        border-radius: 8px;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        animation: slideDown 0.3s ease-out;

        .info-item {
          display: flex;
          align-items: center;
          margin: 0.5rem 0;
          gap: 0.5rem;

          i {
            color: #666;
            font-size: 1.2rem;
          }

          .label {
            color: #666;
            min-width: 80px;
          }

          .value {
            color: #333;
            font-weight: 500;
          }
        }
      }

      .button-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
      }
    }

    // 预览区域
    .preview-section {
      width: 100%;
      min-height: 300px;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

      .preview-state {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        &.loading {
          gap: 1rem;

          .loading-text {
            color: #666;
            font-size: 1rem;
          }
        }

        &.empty {
          color: #999;
          gap: 1rem;

          i {
            font-size: 3rem;
          }
        }
      }
    }
  }
}
</style>
