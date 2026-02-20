<script setup lang="ts">
import { VanillaIf } from '@mtngtools/frame-vue'

const isExternalLoaded = () => (window as any).myDelayedVanillaFunc()
</script>

<template>
  <main class="min-h-screen bg-neutral-950 p-8 text-neutral-100">
    <div class="mb-8">
      <NuxtLink to="/" class="text-sm text-neutral-400 hover:text-white">&larr; Back to Navigation</NuxtLink>
    </div>

    <!-- This script executes natively in the browser outside of the Vue lifecycle -->
    <component :is="'script'">
      console.log('Vanilla script started, waiting 2 seconds...');
      setTimeout(() => {
        console.log('Attaching myDelayedVanillaFunc to window');
        window.myDelayedVanillaFunc = () => true;
      }, 2000);
    </component>

    <h1 class="text-xl font-semibold mb-6">VanillaIf Native Window Demonstration</h1>
    
    <p class="mb-4 max-w-2xl text-neutral-300">
      This page injects a pure vanilla <code>&lt;script&gt;</code> tag that waits 2 seconds before creating <code>window.myDelayedVanillaFunc</code>. 
      The <strong>VanillaIf</strong> component below is configured to poll it.
      While it throws <code>TypeError: window.myDelayedVanillaFunc is not a function</code>, the component will swallow the error and mount nothing.
    </p>

    <div class="p-6 border border-neutral-800 rounded-lg bg-neutral-900 mt-8">
      <VanillaIf :show="isExternalLoaded">
        <div class="flex items-center space-x-3 text-green-400 font-medium">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Success! The VanillaIf wrapper has resolved <code>window.myDelayedVanillaFunc</code> and mounted this content.</span>
        </div>
        
        <template #else>
          <div class="text-red-400">
            This else block shouldn't show in this demo, because the function returns true.
          </div>
        </template>
      </VanillaIf>
    </div>
  </main>
</template>
