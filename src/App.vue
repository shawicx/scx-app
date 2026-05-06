<script setup>
import { RouterLink, RouterView } from "vue-router";
import { useTheme } from "vuetify";
import SnackbarHost from "@/components/SnackbarHost.vue";

const theme = useTheme();
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
theme.global.name.value = prefersDark.matches ? "dark" : "light";
prefersDark.addEventListener("change", (e) => {
  theme.global.name.value = e.matches ? "dark" : "light";
});
</script>

<template>
  <v-app>
    <div class="scx-container">
      <header class="scx-header">
        <nav>
          <RouterLink to="/">首页</RouterLink>
          <RouterLink to="/file">文件</RouterLink>
          <RouterLink to="/data">数据</RouterLink>
          <!-- <RouterLink to="/audio">录音</RouterLink> -->
        </nav>
      </header>
      <main class="scx-content">
        <RouterView v-slot="{ Component }">
          <transition mode="out-in" name="slide-fade">
            <component :is="Component"/>
          </transition>
        </RouterView>
      </main>
    </div>
    <SnackbarHost />
  </v-app>
</template>

<style lang="scss" scoped>
.scx-container {
  display: flex;
  flex-direction: column;
}

.scx-header {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);

  nav {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    gap: 2rem;
    justify-content: center;
    align-items: center;
  }

  a {
    color: #666;
    text-decoration: none;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      color: #333;
      background: rgba(0, 0, 0, 0.05);
    }

    &.router-link-active {
      color: #3498db;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 2px;
        background: #3498db;
        border-radius: 2px;
        animation: navIndicator 0.3s ease forwards;
      }
    }
  }
}

.scx-content {
  /* 减去菜单栏的高度 */
  height: calc(100vh - 88px);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

@keyframes navIndicator {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 20px;
    opacity: 1;
  }
}

/* 路由切换动画 */
.router-view-transition {
  position: relative;
}

.slide-fade {
  &-enter-active,
  &-leave-active {
    transition: all 0.3s ease;
  }

  &-enter-from {
    opacity: 0;
    transform: translateX(20px);
  }

  &-leave-to {
    opacity: 0;
    transform: translateX(-20px);
  }
}
</style>
