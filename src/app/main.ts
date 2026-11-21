import '@/shared/styles/base.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { bootstrapGame, resolveSeed } from './bootstrap'

const pinia = createPinia()
bootstrapGame(pinia, resolveSeed(window.location.search))

createApp(App).use(pinia).mount('#app')
