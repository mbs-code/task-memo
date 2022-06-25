import { defineNuxtPlugin } from 'nuxt/app'
import PrimeVue from 'primevue/config'

import ToastService from 'primevue/toastservice'

import Button from 'primevue/button'
import Toast from 'primevue/toast'

import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true })
  nuxtApp.vueApp.use(ToastService)

  nuxtApp.vueApp.component('Button', Button)
  nuxtApp.vueApp.component('Toast', Toast)
})
