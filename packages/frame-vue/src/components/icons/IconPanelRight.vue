<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="icon-panel-right"
  >
    <rect x="2" y="2" width="20" height="20" rx="3" :fill="backgroundColor" />
    <path d="M17 2H19C20.6569 2 22 3.34315 22 5V19C22 20.6569 20.6569 22 19 22H17V2Z" :fill="foregroundColor" />
    <rect x="2" y="2" width="20" height="20" rx="3" :stroke="borderColor" :stroke-width="borderSize" />
    <line x1="17" y1="2" x2="17" y2="22" :stroke="borderColor" :stroke-width="borderSize" />
  </svg>
</template>

<script setup lang="ts">
import { type IconProps, defaultIconProps } from './style'

withDefaults(defineProps<IconProps>(), defaultIconProps)
</script>
