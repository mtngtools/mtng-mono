<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="icon-panel-bottom"
  >
    <rect x="2" y="2" width="20" height="20" rx="3" :fill="backgroundColor" />
    <path d="M2 15H22V19C22 20.6569 20.6569 22 19 22H5C3.34315 22 2 20.6569 2 19V15Z" :fill="foregroundColor" />
    <rect x="2" y="2" width="20" height="20" rx="3" :stroke="borderColor" :stroke-width="borderSize" />
    <line x1="2" y1="15" x2="22" y2="15" :stroke="borderColor" :stroke-width="borderSize" />
  </svg>
</template>

<script setup lang="ts">
import { type IconProps, defaultIconProps } from './style'

withDefaults(defineProps<IconProps>(), defaultIconProps)
</script>
