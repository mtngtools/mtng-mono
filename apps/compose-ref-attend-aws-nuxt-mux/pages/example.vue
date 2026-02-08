<script setup lang="ts">
// useCounter is auto-imported by @mtngtools/frame-nuxt/modules/frame-vue
const { count, increment, decrement } = useCounter(0);
</script>

<template>
  <div>
    <h1>Example page</h1>

    <!-- SampleGreeting is auto-imported by the frame-vue Nuxt module -->
    <SampleGreeting name="Attendee" />

    <section>
      <h2>Counter (useCounter composable)</h2>
      <p>Count: {{ count }}</p>
      <button @click="decrement">-</button>
      <button @click="increment">+</button>
    </section>
  </div>
</template>
