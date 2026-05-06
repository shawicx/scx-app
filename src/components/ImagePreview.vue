<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  images: {
    type: Array,
    default: () => [],
  },
  initialIndex: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue'])

const currentIndex = ref(0)
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const currentImage = computed(() => props.images[currentIndex.value])
const isFirst = computed(() => currentIndex.value === 0)
const isLast = computed(() => currentIndex.value === props.images.length - 1)
const totalImages = computed(() => props.images.length)

const resetTransform = () => {
  scale.value = 1
  offsetX.value = 0
  offsetY.value = 0
}

const close = () => {
  emit('update:modelValue', false)
}

const goTo = (index) => {
  if (index >= 0 && index < totalImages.value) {
    currentIndex.value = index
    resetTransform()
  }
}

const prev = () => goTo(currentIndex.value - 1)
const next = () => goTo(currentIndex.value + 1)

const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.25, 5)
}

const zoomOut = () => {
  const newScale = scale.value / 1.25
  if (newScale < 0.25) return
  scale.value = newScale
}

const handleWheel = (e) => {
  e.preventDefault()
  if (e.deltaY < 0) zoomIn()
  else zoomOut()
}

const onDragStart = (e) => {
  if (scale.value <= 1) return
  isDragging.value = true
  const point = e.touches ? e.touches[0] : e
  dragStart.value = { x: point.clientX - offsetX.value, y: point.clientY - offsetY.value }
}

const onDragMove = (e) => {
  if (!isDragging.value) return
  const point = e.touches ? e.touches[0] : e
  offsetX.value = point.clientX - dragStart.value.x
  offsetY.value = point.clientY - dragStart.value.y
}

const onDragEnd = () => {
  isDragging.value = false
}

const handleKeydown = (e) => {
  if (!props.modelValue) return
  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      prev()
      break
    case 'ArrowRight':
      next()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case '0':
      resetTransform()
      break
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      currentIndex.value = props.initialIndex
      resetTransform()
    }
  },
)

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    fullscreen
    :scrim="'transparent'"
    class="image-preview-dialog"
    @update:model-value="(val) => !val && close()"
  >
    <div class="preview-overlay" @wheel="handleWheel">
      <!-- Toolbar -->
      <div class="preview-toolbar">
        <div class="toolbar-left">
          <v-btn icon variant="text" @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <span v-if="currentImage" class="image-name">{{ currentImage.title }}</span>
        </div>

        <div class="toolbar-center">
          <v-btn icon variant="text" :disabled="scale <= 0.25" @click="zoomOut">
            <v-icon>mdi-magnify-minus</v-icon>
          </v-btn>
          <v-btn icon variant="text" @click="resetTransform">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
          <v-btn icon variant="text" :disabled="scale >= 5" @click="zoomIn">
            <v-icon>mdi-magnify-plus</v-icon>
          </v-btn>
        </div>

        <div class="toolbar-right">
          <span class="page-indicator">{{ currentIndex + 1 }} / {{ totalImages }}</span>
        </div>
      </div>

      <!-- Navigation: Previous -->
      <v-btn
        v-if="totalImages > 1"
        class="nav-btn nav-prev"
        :disabled="isFirst"
        icon
        variant="tonal"
        @click="prev"
      >
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <!-- Image Display -->
      <div
        class="image-container"
        @mousedown="onDragStart"
        @mousemove="onDragMove"
        @mouseup="onDragEnd"
        @mouseleave="onDragEnd"
        @touchstart="onDragStart"
        @touchmove="onDragMove"
        @touchend="onDragEnd"
      >
        <v-img
          v-if="currentImage"
          :src="currentImage.itemImageSrc"
          :alt="currentImage.alt"
          class="preview-image"
          :style="{
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
            cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default',
          }"
          @click="scale <= 1 && close()"
        />
      </div>

      <!-- Navigation: Next -->
      <v-btn
        v-if="totalImages > 1"
        class="nav-btn nav-next"
        :disabled="isLast"
        icon
        variant="tonal"
        @click="next"
      >
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>
  </v-dialog>
</template>

<style lang="scss" scoped>
.preview-overlay {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.preview-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.5);

  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .image-name {
    color: #fff;
    font-size: 0.9rem;
  }

  .page-indicator {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
    min-width: 60px;
    text-align: center;
  }
}

.nav-btn {
  position: absolute;
  z-index: 10;
  top: 50%;
  transform: translateY(-50%);

  &.nav-prev {
    left: 16px;
  }

  &.nav-next {
    right: 16px;
  }
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 60px 64px 16px;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.15s ease-out;
  :deep(.v-img__img) {
    object-fit: contain;
  }
}
</style>
