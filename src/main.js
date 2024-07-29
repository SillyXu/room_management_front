import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementPlus from 'element-plus'
// import 'element-plus/theme-chalk/index.css'
import 'element-plus/dist/index.css'

const vue3App = createApp(App)
vue3App.use(ElementPlus)

vue3App.use(store)
vue3App.use(router)
vue3App.mount('#app')


// createApp(App).use(store).use(router).mount('#app')