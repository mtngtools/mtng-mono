<template>
  <main class="min-h-screen bg-neutral-950 p-8 text-neutral-100">
    <h1 class="text-2xl font-semibold">develop-attend-nuxt</h1>
    <p class="mt-2 text-sm text-neutral-300">
      Playground routes for local component checks.
    </p>
    <NuxtLink class="mt-6 inline-block rounded-md border border-neutral-700 px-4 py-2 hover:border-neutral-500" to="/live-frame-test">
      LiveFrame test page
    </NuxtLink>
    <NuxtLink class="mt-6 inline-block rounded-md border border-neutral-700 px-4 py-2 hover:border-neutral-500" to="/logged-in-test">
      LoggedInOut test page
    </NuxtLink>
    <NuxtLink class="mt-6 inline-block rounded-md border border-neutral-700 px-4 py-2 hover:border-neutral-500 ml-4" to="/control-button-test">
      SidePanelControlButton test page
    </NuxtLink>
    <NuxtLink class="mt-6 inline-block rounded-md border border-neutral-700 px-4 py-2 hover:border-neutral-500 ml-4" to="/logged-in-wait-test">
      LoggedInOut waitBehavior test page
    </NuxtLink>
    <NuxtLink class="mt-6 inline-block rounded-md border border-neutral-700 px-4 py-2 hover:border-neutral-500 ml-4" to="/vanilla-if-test">
      VanillaIf Window Injection test page
    </NuxtLink>

    <section class="mt-12">
      <h2 class="text-xl font-semibold mb-4">Exported Icons</h2>
      <div class="flex gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded">
        <IconPanelRight class="w-4 h-4" />
        <IconPanelBottom class="w-4 h-4" />
        <IconPanelFull class="w-4 h-4" />
        <IconClose class="w-4 h-4" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { IconPanelRight, IconPanelBottom, IconPanelFull, IconClose } from '@mtngtools/frame-vue/icons'
</script>
