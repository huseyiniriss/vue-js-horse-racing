import '@/shared/styles/base.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { bootstrapGame, keepSeedInUrl, resolveSession } from './bootstrap'

const session = resolveSession(window.location.search)
keepSeedInUrl(session, window.location, window.history)

const pinia = createPinia()
bootstrapGame(pinia, session)

createApp(App).use(pinia).mount('#app')
