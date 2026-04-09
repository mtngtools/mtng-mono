// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@mtngtools/frame-nuxt/modules/frame-vue'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // frame-vue module options (optional)
  frameVue: {
    prefix: '',
  },

  devtools: { enabled: true },

  compatibilityDate: '2026-01-01',
})
