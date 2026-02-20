<script setup lang="ts">
import { onMounted } from 'vue'
import { LoggedInOut } from '@mtngtools/frame-vue'
</script>

<template>
  <main class="min-h-screen bg-neutral-950 p-8 text-neutral-100">
    <NuxtLink class="mb-6 inline-block text-neutral-400 hover:text-white" to="/">
      &larr; Back to Index
    </NuxtLink>

    <h1 class="text-2xl font-semibold mb-4">Wait Behavior Demo</h1>

    <p class="text-sm text-neutral-400 max-w-2xl mb-8">
      This page demonstrates the <code>waitBehavior</code> of the <code>LoggedInOut</code> component. 
      The component below is configured to initialize from <code>window.delayedLoggedIn</code>.
      A vanilla script on this page waits 2 seconds before injecting the property. You should not see either the <code>loggedIn</code> or <code>loggedOut</code> slots until the 2 seconds have passed.
    </p>

    <!-- Vanilla script simulation -->
    <component :is="'script'">
      console.log('Vanilla script loaded. Waiting 2 seconds to set window.delayedLoggedIn...');
      setTimeout(() => {
        console.log('Setting window.delayedLoggedIn = true');
        window.delayedLoggedIn = true;
      }, 2000);
    </component>

    <div class="p-6 border border-neutral-800 rounded-lg bg-neutral-900 shadow-xl max-w-lg">
      <h2 class="text-lg font-medium mb-4">Protected Area</h2>

      <div class="p-4 border border-dashed border-neutral-700 bg-black/20 rounded min-h-[100px] flex items-center justify-center">
        <LoggedInOut
          initialize-from-window-access-object
          initialize-window-access-object-name="delayedLoggedIn"
        >
          <template #loggedIn>
            <div class="text-green-400 font-medium">
              ✅ Logged In! (Initialized from window object)
            </div>
          </template>
          
          <template #loggedOut>
            <div class="text-neutral-400">
              🔒 Logged Out.
            </div>
          </template>
        </LoggedInOut>
      </div>
    </div>
  </main>
</template>
