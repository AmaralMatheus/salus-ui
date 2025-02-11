import './bootstrap'
import '@mdi/font/css/materialdesignicons.css' 
import 'vue3-toastify/dist/index.css'

import { createApp } from "vue"

import router from "./router"
import store from "./store"
import vuetify from "./vuetify"
import App from "./App.vue"

createApp(App).use(vuetify, {
  iconfont: 'mdi'
}).use(router).use(store).mount('#app')
