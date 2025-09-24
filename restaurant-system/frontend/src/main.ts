import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import router from './router'
import App from './App.vue'

// Styles
import './style.css'
import 'vue-toastification/dist/index.css'

// PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onRegistered() {
        console.log('Service Worker registered')
      },
      onOfflineReady() {
        console.log('App ready to work offline')
      }
    })
  })
}

const app = createApp(App)
const pinia = createPinia()

// Toast configuration
const toastOptions = {
  position: 'top-right',
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

app.mount('#app')