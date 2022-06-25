import { defineNuxtPlugin } from 'nuxt/app'
import PrimeVue from 'primevue/config'

import ToastService from 'primevue/toastservice'

import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true })
  nuxtApp.vueApp.use(ToastService)

  nuxtApp.vueApp.component('Button', Button)
  nuxtApp.vueApp.component('Card', Card)
  nuxtApp.vueApp.component('Tag', Tag)
  nuxtApp.vueApp.component('Textarea', Textarea)
  nuxtApp.vueApp.component('Toast', Toast)
  nuxtApp.vueApp.component('Dialog', Dialog)
})
