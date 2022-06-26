import { defineNuxtPlugin } from 'nuxt/app'
import PrimeVue from 'primevue/config'

import ToastService from 'primevue/toastservice'

import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Tree from 'primevue/tree'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import AutoComplete from 'primevue/autocomplete'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true })
  nuxtApp.vueApp.use(ToastService)

  nuxtApp.vueApp.component('Button', Button)
  nuxtApp.vueApp.component('Card', Card)
  nuxtApp.vueApp.component('Tag', Tag)
  nuxtApp.vueApp.component('Tree', Tree)
  nuxtApp.vueApp.component('InputText', InputText)
  nuxtApp.vueApp.component('Textarea', Textarea)
  nuxtApp.vueApp.component('AutoComplete', AutoComplete)
  nuxtApp.vueApp.component('Toast', Toast)
  nuxtApp.vueApp.component('Dialog', Dialog)
})
