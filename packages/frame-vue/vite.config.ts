import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { playwright } from '@vitest/browser-playwright';

const browserScreenshotRoot = process.env.VITEST_BROWSER_SCREENSHOT_ROOT?.trim();
const browserScreenshotsEnabled = Boolean(browserScreenshotRoot);

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['vue'],
    },
    outDir: 'dist',
  },
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    environment: 'happy-dom',
    browser: {
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
      ],
      screenshotFailures: browserScreenshotsEnabled,
      ...(browserScreenshotRoot ? { screenshotDirectory: browserScreenshotRoot } : {}),
    },
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'dist/**', '**/*.test.ts', '**/*.spec.ts', '**/*.d.ts'],
    },
  },
});
