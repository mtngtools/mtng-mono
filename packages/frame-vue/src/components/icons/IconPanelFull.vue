<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="icon-panel-full"
  >
    <rect x="2" y="2" width="20" height="20" rx="3" :fill="foregroundColor" />
    <rect x="2" y="2" width="20" height="20" rx="3" :stroke="borderColor" :stroke-width="borderSize" />
  </svg>
</template>

<script setup lang="ts">
import { type IconProps, defaultIconProps } from './style'

withDefaults(defineProps<IconProps>(), defaultIconProps)
</script>
