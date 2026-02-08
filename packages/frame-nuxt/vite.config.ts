import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/modules/**/*.ts'],
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      outDir: 'dist',
    }),
  ],
  build: {
    lib: {
      entry: {
        'modules/frame-vue': resolve(__dirname, 'src/modules/frame-vue.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['nuxt', '@nuxt/kit', '@nuxt/schema', 'vue'],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
