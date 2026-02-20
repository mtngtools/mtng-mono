<template>
  <main class="min-h-screen bg-neutral-950 p-8 text-neutral-100">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">SidePanelControlButton Playground</h1>
        <p class="mt-2 text-sm text-neutral-300">
          Showing default SVG icons natively composed inside control buttons.
        </p>
      </div>
      <NuxtLink 
        to="/" 
        class="text-xs text-accent-400/80 bg-accent/20 hover:bg-accent/90 py-1 px-3 border border-accent-900/10 rounded-lg hover:text-white hover:border-white transition-colors"
      >
        Back to Index
      </NuxtLink>
    </div>

    <section class="max-w-2xl border border-neutral-800 rounded-lg bg-neutral-900 p-6">
      <div class="flex items-center gap-4 flex-wrap">
        <SidePanelControlButton
          v-for="state in states"
          :key="state"
          :state="state"
          :active="activeState === state"
          :active-resolved="resolvedState === state"
          @click="handleClick"
        />
      </div>

      <div class="mt-8 pt-6 border-t border-neutral-800 grid grid-cols-2 gap-4 text-sm">
        <div>
          <h3 class="text-neutral-500 mb-2">Selected Intent State</h3>
          <div class="flex gap-2">
            <button 
              v-for="s in states" 
              :key="'active-' + s"
              class="px-2 py-1 rounded border text-xs"
              :class="activeState === s ? 'bg-blue-900 border-blue-500 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'"
              @click="activeState = s"
            >
              {{ s }}
            </button>
          </div>
        </div>
        <div>
          <h3 class="text-neutral-500 mb-2">Resolved Display State</h3>
          <div class="flex gap-2">
            <button 
              v-for="s in states" 
              :key="'res-' + s"
              class="px-2 py-1 rounded border text-xs"
              :class="resolvedState === s ? 'bg-green-900 border-green-500 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'"
              @click="resolvedState = s"
            >
              {{ s }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SidePanelControlButton } from '@mtngtools/frame-vue'
import type { SidePanelModeSelectable } from '@mtngtools/frame-vue'

const states: SidePanelModeSelectable[] = ['auto', 'right', 'bottom', 'full', 'minimized']

const activeState = ref<SidePanelModeSelectable>('right')
const resolvedState = ref<SidePanelModeSelectable>('right')

function handleClick(payload: SidePanelModeSelectable) {
  activeState.value = payload
}
</script>
