<script setup lang="ts">

// useCounter is auto-imported by @mtngtools/frame-nuxt/modules/frame-vue
const { count, increment, decrement } = useCounter(0)
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-8">
    <h1 class="text-3xl font-bold text-slate-800 tracking-tight">
      Example page
    </h1>

    <!-- SampleGreeting is auto-imported by the frame-vue Nuxt module -->
    <div class="mt-6">
      <SampleGreeting name="Attendee" />
    </div>

    <section class="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-slate-700">
        Counter (useCounter composable)
      </h2>
      <p class="mt-2 text-2xl font-mono text-indigo-600">
        Count: {{ count }}
      </p>
      <div class="mt-4 flex gap-2">
        <button
          type="button"
          class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          @click="decrement"
        >
          -
        </button>
        <button
          type="button"
          class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          @click="increment"
        >
          +
        </button>
      </div>
    </section>
  </div>
</template>
