<script setup lang="ts">
import { computed, ref, toValue } from 'vue';
import { ofetch } from 'ofetch';

import type { FetchCardProps } from './types';

const props = defineProps<FetchCardProps>();

const emit = defineEmits<{
  fetching: [props: FetchCardProps]
  onResult: [props: FetchCardProps, response: any]
  onSuccess: [props: FetchCardProps, response: any]
  onError: [props: FetchCardProps, response: any]
}>();

const isEnabled = ref(false);
const isLoading = ref(false);
const responseData = ref<any>(null);
const responseStatus = ref<number | null>(null);
const errorData = ref<any>(null);

const requireCheckbox = computed(() => toValue(props.requireCheckboxToEnable) ?? false);
const fetchOpts = computed(() => toValue(props.fetchOptions) ?? {});
const displayTimeout = computed(() => toValue(props.responseDisplayTimeout) ?? 20000);
const fetchOnMountVal = computed(() => toValue(props.fetchOnMount) ?? false);
const btnText = computed(() => toValue(props.fetchButtonText) ?? 'Fetch');
const btnClass = computed(() => toValue(props.fetchButtonClass) ?? '');
const resClass = computed(() => toValue(props.responseClass));
const resMaxHeight = computed(() => toValue(props.responseMaxHeight) ?? '40vh');
const httpMethod = computed(() => fetchOpts.value.method || 'GET');

const computedUrl = computed(() => {
  if (props.url !== undefined) {
    return toValue(props.url);
  }
  if (props.urlParts !== undefined) {
    return toValue(props.urlParts).join('');
  }
  return '';
});

const isActionDisabled = computed(() => {
  if (requireCheckbox.value && !isEnabled.value) return true;
  return isLoading.value || !computedUrl.value;
});

// UI states for Response styling
const statusCodeStyle = ref<'neutral' | 'yellow' | 'green' | 'red'>('neutral');
let timeoutId: ReturnType<typeof setTimeout> | null = null;

const resetStylingTimeout = () => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    statusCodeStyle.value = 'neutral';
  }, displayTimeout.value);
};

const executeFetch = async () => {
  if (isActionDisabled.value) return;

  isLoading.value = true;
  statusCodeStyle.value = 'yellow';
  responseData.value = null;
  errorData.value = null;
  responseStatus.value = null;

  // Uncheck the enable box to enforce a two-step process on the next attempt
  if (requireCheckbox.value) {
    isEnabled.value = false;
  }

  emit('fetching', props);

  try {
    const response = await ofetch.raw(computedUrl.value, fetchOpts.value);
    responseData.value = response._data;
    responseStatus.value = response.status;
    statusCodeStyle.value = 'green';
    
    emit('onResult', props, response);
    emit('onSuccess', props, response);
  } catch (err: any) {
    errorData.value = err.data || err.message || 'Unknown error';
    responseStatus.value = err.status || 500;
    statusCodeStyle.value = 'red';
    
    emit('onResult', props, err);
    emit('onError', props, err);
  } finally {
    isLoading.value = false;
    resetStylingTimeout();
  }
};

const statusClasses = computed(() => {
  switch (statusCodeStyle.value) {
    case 'yellow': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50';
    case 'green': return 'text-green-400 bg-green-900/30 border-green-700/50';
    case 'red': return 'text-red-400 bg-red-900/30 border-red-700/50';
    default: return 'text-neutral-500 bg-neutral-800/50 border-neutral-700';
  }
});

import { onMounted } from 'vue';
import { useClipboard } from '@vueuse/core';

// Clipboard Logic
const { copy, copied, isSupported } = useClipboard({ legacy: true });

const copyPayload = () => {
  const payloadToCopy = responseData.value || errorData.value;
  if (payloadToCopy) {
    copy(JSON.stringify(payloadToCopy, null, 2));
  }
};

// Evaluate exactly once on mount for the auto-fetch opportunity
onMounted(() => {
  if (computedUrl.value && fetchOnMountVal.value) {
    if (!requireCheckbox.value || isEnabled.value) {
       executeFetch();
    }
  }
});
</script>

<template>
  <div class="border border-neutral-300 rounded-lg bg-white shadow-sm grid grid-rows-[min-content_auto_min-content] overflow-hidden">
    
    <!-- Top Row: Inverse Coloring -->
    <div class="flex items-center justify-between px-3 py-1 bg-neutral-900 border-b border-neutral-800">
      <!-- Left: HTTP Method -->
      <span class="px-2 py-0.5 bg-neutral-800 text-neutral-300 font-mono text-[10px] uppercase font-bold rounded">
        {{ httpMethod }}
      </span>

      <!-- Right: Enable Checkbox -->
      <div v-if="requireCheckbox" class="flex items-center gap-2">
        <label for="enable-fetch" class="text-xs font-medium text-neutral-300 cursor-pointer select-none">
          Enable Request
        </label>
        <input 
          id="enable-fetch" 
          type="checkbox" 
          v-model="isEnabled"
          class="w-3.5 h-3.5 rounded border-neutral-600 bg-neutral-800 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
        >
      </div>
    </div>

    <!-- Middle Row: HTTP URL & Action Button -->
    <div class="flex items-center gap-4 px-4 py-3 bg-white">
      <div class="flex-1 min-w-0" :class="toValue(props.urlCommonClass)">
        <!-- Continuous URL -->
        <span 
          v-if="props.url !== undefined" 
          class="font-mono text-sm break-all text-neutral-600"
          :class="toValue(props.urlClass)"
        >
          {{ computedUrl }}
        </span>
        
        <!-- URL Parts -->
        <div 
          v-else-if="props.urlParts !== undefined" 
          class="flex flex-wrap font-mono break-all text-neutral-800"
          :class="toValue(props.urlPartsDirection) === 'column' ? 'flex-col items-start gap-1' : 'flex-row items-baseline'"
        >
          <div 
            v-for="(part, index) in toValue(props.urlParts)" 
            :key="index"
            :class="toValue(props.urlPartsClasses)?.[index] ?? (
              toValue(props.urlParts).length > 2 ? 
                (index === 0 ? 'hidden' : index === 1 ? 'text-sm font-medium mr-1' : 'text-2xl font-bold') :
              toValue(props.urlParts).length > 1 ? 
                (index === 0 ? 'hidden' : 'text-sm font-medium') : 
              'text-sm'
            )"
          >
            {{ part }}
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        @click="executeFetch"
        :disabled="isActionDisabled"
        :class="[
          'shrink-0 px-4 py-2 text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          btnClass || 'bg-indigo-600 text-white hover:bg-indigo-700'
        ]"
      >
        <span v-if="isLoading">Fetching...</span>
        <span v-else>{{ btnText }}</span>
      </button>
    </div>

    <!-- Bottom Row: Response Display (Grid layout, Inverse Coloring, Always Visible) -->
    <div class="grid grid-cols-[10rem_1fr] bg-neutral-900 border-t border-neutral-800 group h-auto">
      
      <!-- Left: Status Box (Fixed size 4rem x 10rem implicitly via grid, dynamically colored) -->
      <div 
        class="flex items-center justify-center font-mono text-2xl font-black shadow-sm transition-colors duration-300 h-16"
        :class="statusClasses"
      >
        {{ responseStatus || '---' }}
      </div>

      <!-- Right: Response Body -->
      <div class="flex flex-col w-full min-w-0 p-3 relative h-max">
        
        <!-- Hover Copy Button (Pinned top right, above scrollbar content) -->
        <div class="absolute top-2 right-2 flex justify-end z-10">
          <button 
            v-if="(responseData || errorData) && isSupported"
            @click.prevent="copyPayload"
            class="px-2.5 py-1.5 rounded-md text-xs font-bold font-mono border backdrop-blur-sm transition-all duration-200 opacity-0 transform -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 shadow shadow-neutral-900"
            :class="copied ? 'bg-emerald-900/80 text-emerald-300 border-emerald-700/50' : 'bg-neutral-800/90 text-neutral-300 border-neutral-700 hover:bg-neutral-700'"
          >
            {{ copied ? 'COPIED!' : 'COPY' }}
          </button>
        </div>

        <div 
          class="w-full overflow-y-auto transition-all duration-300 custom-scrollbar mt-1 overflow-x-hidden pr-16"
          :class="resClass ? resClass : 'max-h-12 hover:max-h-[var(--hover-max-h)]'"
          :style="{ '--hover-max-h': resMaxHeight }"
        >
          <pre class="text-sm text-neutral-300 font-mono m-0 whitespace-pre-wrap break-words" v-if="responseData">{{ JSON.stringify(responseData, null, 2) }}</pre>
          <pre class="text-sm text-neutral-300 font-mono m-0 whitespace-pre-wrap break-words" v-else-if="errorData">{{ JSON.stringify(errorData, null, 2) }}</pre>
          <div v-else class="text-sm text-neutral-500 font-mono italic h-full flex items-center">Awaiting request...</div>
        </div>
      </div>

    </div>
  </div>
</template>
