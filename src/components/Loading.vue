<template>
  <div v-if="visible" class="loading-overlay">
    <div class="loading-spinner">
      <ProgressSpinner
        :style="{ width: spinnerSize, height: spinnerSize }"
        :strokeWidth="strokeWidth"
      />
      <div v-if="text" class="loading-text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup>
import ProgressSpinner from "primevue/progressspinner";

// 定义props
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: "",
  },
  spinnerSize: {
    type: String,
    default: "50px",
  },
  strokeWidth: {
    type: [String, Number],
    default: 4,
  },
  overlayColor: {
    type: String,
    default: "rgba(255, 255, 255, 0.9)",
  },
  blur: {
    type: Boolean,
    default: true,
  },
});
</script>

<style lang="scss" scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: v-bind(overlayColor);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 0.5rem;

  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    border: 1px solid #e5e7eb;

    .loading-text {
      margin-top: 1rem;
      color: #606266;
      font-size: 0.9rem;
      font-weight: 500;
      text-align: center;
      white-space: nowrap;
    }
  }
}
</style>
