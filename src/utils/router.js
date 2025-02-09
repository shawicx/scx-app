import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import FileView from '../views/FileView.vue'
import DataView from '../views/DataView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/file', component: FileView },
  { path: '/data', component: DataView },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})