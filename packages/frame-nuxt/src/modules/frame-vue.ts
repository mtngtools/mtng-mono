import { addComponent, addImports, defineNuxtModule } from '@nuxt/kit';
import type { NuxtModule } from '@nuxt/schema';

import * as frameComponents from '@mtngtools/frame-vue/components';
import * as frameComposables from '@mtngtools/frame-vue/composables';

export interface ModuleOptions {
  /** Optional prefix for auto-imported component names. */
  prefix?: string;
}

const mod: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@mtngtools/frame-nuxt:frame-vue',
    configKey: 'frameVue',
  },
  defaults: {
    prefix: '',
  },
  setup(options) {
    // Register all components dynamically
    for (const key of Object.keys(frameComponents)) {
      if (key.startsWith('_')) continue;
      
      addComponent({
        name: options.prefix ? `${options.prefix}${key}` : key,
        export: key,
        filePath: '@mtngtools/frame-vue/components',
      });
    }

    // Register all composables dynamically
    const composableKeys = Object.keys(frameComposables).filter(key => !key.startsWith('_'));
    if (composableKeys.length > 0) {
      addImports(
        composableKeys.map((name) => ({
          name,
          from: '@mtngtools/frame-vue/composables',
        }))
      );
    }
  },
});

export default mod;
