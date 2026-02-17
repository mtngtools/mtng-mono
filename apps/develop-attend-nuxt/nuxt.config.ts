// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()] as any,
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
})
