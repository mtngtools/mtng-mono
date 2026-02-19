<script setup lang="ts">
import { LiveFrame, type SidePanelModeSelectable } from '@mtngtools/frame-vue';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

definePageMeta({
  layout: 'live',
});

const route = useRoute();
const hasSidePanel = computed(() => route.query.hasSidePanel !== 'false');

const sidePanelPosition = ref<SidePanelModeSelectable>('minimized');
const sidePanelModeResolved = ref<string>('none');
const availableStates = ref<SidePanelModeSelectable[]>([]);
const overlayOnly = ref(false);
const disableSidePanel = ref(false);
const transitions = ref<string[]>([]);

const transitionLog = computed(() => transitions.value.slice(0, 10));

type BorderColors = {
  top: string;
  right: string;
  bottom: string;
  left: string;
};

const defaultContentBorderColors: BorderColors = {
  top: '#ff2d55',
  right: '#7c3aed',
  bottom: '#00c2ff',
  left: '#22c55e',
};

const sidePanelContentBorderColors: BorderColors = {
  top: '#f59e0b',
  right: '#ef4444',
  bottom: '#14b8a6',
  left: '#3b82f6',
};

function buildBorderFixtureStyle(borderColors: BorderColors, backgroundColor: string) {
  return {
    width: '100%',
    boxSizing: 'border-box',
    borderTop: `8px solid ${borderColors.top}`,
    borderRight: `8px solid ${borderColors.right}`,
    borderBottom: `8px solid ${borderColors.bottom}`,
    borderLeft: `8px solid ${borderColors.left}`,
    padding: '1rem',
    backgroundColor,
  } as const;
}

const defaultContentStyle = buildBorderFixtureStyle(defaultContentBorderColors, '#333300');
const sidePanelContentStyle = buildBorderFixtureStyle(sidePanelContentBorderColors, '#111827');

function onTransition(payload: { from: string; to: string; reason: string }) {
  transitions.value.unshift(`${payload.from} -> ${payload.to} (${payload.reason})`);
}

function onAvailableStates(payload: {
  availableStates: SidePanelModeSelectable[];
  sidePanelModeResolved: string;
  overlayOnly: boolean;
}) {
  availableStates.value = payload.availableStates;
  sidePanelModeResolved.value = payload.sidePanelModeResolved;
  overlayOnly.value = payload.overlayOnly;
}
</script>

<template>
  <LiveFrame
    v-model:side-panel-position="sidePanelPosition"
    controls-overlay-only="0"
    :auto-hide-timeout="3000"
    :disable-side-panel="disableSidePanel"
    @side-panel-transition="onTransition"
    @side-panel-available-states="onAvailableStates"
  >
    <template #header>
      <div
        class="border-neutral-700 bg-neutral-900"
        :style="{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
        }"
      >
        <h1 class="text-sm font-semibold text-accent">LiveFrame Playground</h1>
        <NuxtLink to="/" class="
        text-xs text-accent-400/80 bg-accent/20 hover:bg-accent/90
        py-1 px-2 
        border border-accent-900/10 rounded-lg hover:text-white hover:border-white">Back</NuxtLink>
      </div>
    </template>

    <div
      class="bg-neutral-950"
      :style="defaultContentStyle"
    >
      <h2 class="text-lg font-semibold">Default Slot Content</h2>
      <p class="text-sm text-neutral-300" :style="{ marginTop: '0.5rem' }">
        Resize the viewport and use side panel controls to observe selected/resolved mode behavior.
      </p>

      <div
        class="text-xs"
        :style="{
          marginTop: '1rem',
          display: 'grid',
          maxWidth: '42rem',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
        }"
      >
        <div class="border-neutral-800" :style="{ borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem', padding: '0.5rem' }">
          <div class="text-neutral-400">Selected mode</div>
          <div>{{ sidePanelPosition }}</div>
        </div>
        <div class="border-neutral-800" :style="{ borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem', padding: '0.5rem' }">
          <div class="text-neutral-400">Resolved mode</div>
          <div>{{ sidePanelModeResolved }}</div>
        </div>
        <div class="border-neutral-800" :style="{ borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem', padding: '0.5rem' }">
          <div class="text-neutral-400">Overlay only</div>
          <div>{{ overlayOnly }}</div>
        </div>
        <div class="border-neutral-800" :style="{ borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem', padding: '0.5rem' }">
          <div class="text-neutral-400">Available states</div>
          <div>{{ availableStates.join(', ') || '(none)' }}</div>
        </div>
      </div>

      <div
        class="border-neutral-800 text-xs"
        :style="{
          marginTop: '1rem',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '0.25rem',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }"
      >
        <input id="disable-side-panel" v-model="disableSidePanel" type="checkbox">
        <label for="disable-side-panel" class="text-neutral-400">Disable Side Panel</label>
      </div>

      <div
        class="border-neutral-800 text-xs"
        :style="{
          marginTop: '1rem',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '0.25rem',
          padding: '0.75rem',
        }"
      >
        <div class="text-neutral-400" :style="{ marginBottom: '0.5rem' }">Transition log (latest first)</div>
        <ul :style="{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }">
          <li v-for="item in transitionLog" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>

    <template v-if="hasSidePanel" #sidePanelContent>
      <div
        class="text-xs text-neutral-200"
        :style="sidePanelContentStyle"
      >
        <div class="font-semibold">Side Panel Content</div>
      </div>
    </template>

  </LiveFrame>
</template>
