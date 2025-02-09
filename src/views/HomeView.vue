<script setup>
// 可以在这里添加组件逻辑
</script>

<template>
  <div class="scx-home">
    <div class="scx-welcome-text">欢迎使用</div>
  </div>
</template>

<style lang="scss" scoped>
.scx-home {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.scx-welcome-text {
  font-size: 3rem;
  font-weight: bold;
  color: #2c3e50;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  animation: welcomeAnimation 1.5s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes welcomeAnimation {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>