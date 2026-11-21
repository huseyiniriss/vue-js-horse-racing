import '@/shared/styles/base.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { bootstrapGame, resolveSession } from './bootstrap'

const pinia = createPinia()
bootstrapGame(pinia, resolveSession(window.location.search))

createApp(App).use(pinia).mount('#app')
