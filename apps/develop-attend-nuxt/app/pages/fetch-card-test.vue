<script setup lang="ts">
import { ref } from 'vue';
import { FetchCard } from '@mtngtools/frame-vue';

const enableAuthCheck = ref(true);
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto flex flex-col gap-8 bg-neutral-950 min-h-screen text-neutral-100">
    <div>
      <h1 class="text-2xl font-bold mb-2">FetchCard Demo</h1>
      <p class="text-neutral-400 mb-4">Showcasing the multi-prop discriminated union with dynamic visual state representation.</p>
      
      <NuxtLink class="inline-block rounded-md border border-neutral-700 px-4 py-2 hover:border-neutral-500 mb-8" to="/">
        Back to Index
      </NuxtLink>
    </div>

    <!-- Example 1: Contiguous URL + Manual Trigger -->
    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-semibold text-neutral-200">1. Standard URL (Requires Manual Click)</h2>
      <FetchCard 
        url="https://jsonplaceholder.typicode.com/todos/1"
        url-class="text-blue-600 font-medium"
        fetch-button-text="Load Data"
        fetch-button-class="bg-emerald-600 hover:bg-emerald-700 text-white"
      />
    </div>

    <!-- Example 2: URL Parts + Checkbox Trigger + fetchOnMount -->
    <div class="flex flex-col gap-2 mt-8">
      <h2 class="text-lg font-semibold text-neutral-200">2. URL Parts (Checkbox required, fetchOnMount=true default styling)</h2>
      <div class="mb-2">
        <label class="flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" v-model="enableAuthCheck" class="rounded border-neutral-600 bg-neutral-800 text-purple-600 focus:ring-purple-500" />
          Toggle Checkbox Requirement Programmatically
        </label>
      </div>

      <FetchCard 
        :fetch-on-mount="true"
        :require-checkbox-to-enable="enableAuthCheck"
        :url-parts="['https://jsonplaceholder.typicode.com', '/posts', '/1']"
        :fetch-options="{ method: 'GET', headers: { 'Authorization': 'Bearer 123' } }"
      />
    </div>

    <!-- Example 3: Deliberate Error -->
    <div class="flex flex-col gap-2 mt-8">
      <h2 class="text-lg font-semibold text-neutral-200">3. 404 Error (Short timeout 5s)</h2>
      <FetchCard 
        url="https://jsonplaceholder.typicode.com/not-a-real-endpoint"
        :response-display-timeout="5000"
        url-class="text-red-600 font-medium"
      />
    </div>

    <!-- Example 4: Vertical URL Parts -->
    <div class="flex flex-col gap-2 mt-8">
      <h2 class="text-lg font-semibold text-neutral-200">4. Vertical URL Parts (urlPartsDirection="column")</h2>
      <FetchCard 
        :url-parts="['https://api.example.com', '/v1', '/users', '/search']"
        url-parts-direction="column"
        :url-parts-classes="['text-xs text-neutral-400', 'text-sm font-semibold', 'text-lg font-bold text-indigo-600', 'text-sm text-neutral-500']"
        fetch-button-text="Search"
      />
    </div>
  </div>
</template>
