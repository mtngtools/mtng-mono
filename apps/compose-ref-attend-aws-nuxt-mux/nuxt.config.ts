// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@mtngtools/frame-nuxt/modules/frame-vue'],

  // frame-vue module options (optional)
  frameVue: {
    prefix: '',
  },

  devtools: { enabled: true },

  compatibilityDate: '2026-01-01',
});
