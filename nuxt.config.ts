import { defineNuxtConfig } from 'nuxt'
import eslintPlugin from 'vite-plugin-eslint'

const isProduct = process.env.NODE_ENV === 'production'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  srcDir: 'src/',
  ssr: false,
  target: 'static',

  app: {
    head: {
      script: [
        !isProduct && { src: 'http://localhost:8098' }, // vue devtools
      ],
    },
  },

  css: [
    '@/assets/css/index.scss',
  ],

  components: [
    {
      path: '@/components/',
      pathPrefix: false,
    },
  ],

  vite: {
    plugins: [eslintPlugin({
      fix: true,
    })],
  },

  build: {
    transpile: [
      'primevue',
      'kysely',
      'better-sqlite3',
    ],
  },
})
