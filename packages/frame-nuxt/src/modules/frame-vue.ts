import { addComponent, addImports, defineNuxtModule } from '@nuxt/kit';
import type { NuxtModule } from '@nuxt/schema';

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
    addComponent({
      name: options.prefix ? `${options.prefix}SampleGreeting` : 'SampleGreeting',
      export: 'SampleGreeting',
      filePath: '@mtngtools/frame-vue',
    });
    addImports([
      { name: 'useCounter', from: '@mtngtools/frame-vue' },
    ]);
  },
});

export default mod;
