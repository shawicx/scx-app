/*
 * @Author: shawicx d35f3153@proton.me
 * @Description: 路由
*/
import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import FileView from '../views/FileView.vue'
import DataView from '../views/DataView.vue'
// import AudioView from '../views/AudioView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/file', component: FileView },
  { path: '/data', component: DataView },
  // { path: '/audio', component: AudioView },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})