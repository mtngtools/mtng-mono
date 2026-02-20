<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="icon-close"
  >
    <rect v-if="backgroundColor !== 'transparent'" x="2" y="2" width="20" height="20" rx="3" :fill="backgroundColor" />
    <path d="M16 8L8 16M8 8L16 16" :stroke="foregroundColor" :stroke-width="Number(borderSize) * 1.25" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
import { type IconProps, defaultIconProps } from './style'

withDefaults(defineProps<IconProps>(), defaultIconProps)
</script>
