import { createApp } from "vue";
import PrimeVue from "primevue/config";
import ToastService from 'primevue/toastservice';
import Material from '@primevue/themes/material';
import { router } from "./utils/router";
import App from "./App.vue";

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
      preset: Material,
      options: {
        prefix: 'scx',
        darkModeSelector: 'system',
        cssLayer: false
      }
    }
  })
  .use(ToastService)
  .use(router)
  .mount("#app");
