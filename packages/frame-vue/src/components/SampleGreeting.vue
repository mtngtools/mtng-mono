<script setup lang="ts">
defineProps<{
  name?: string;
}>();
</script>

<template>
  <p class="sample-greeting">Hello, {{ name ?? 'World' }}!</p>
</template>

