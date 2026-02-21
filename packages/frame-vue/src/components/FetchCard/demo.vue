<script setup lang="ts">
import { ref } from 'vue';
import FetchCard from './FetchCard.vue';

const enableAuthCheck = ref(true);
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto flex flex-col gap-8 bg-gray-50 min-h-screen">
    <div>
      <h1 class="text-2xl font-bold mb-2 text-gray-800">FetchCard Demo</h1>
      <p class="text-gray-600 mb-4">Showcasing the multi-prop discriminated union with dynamic visual state representation.</p>
    </div>

    <!-- Example 1: Contiguous URL + Auto Trigger -->
    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-semibold text-gray-700">1. Standard URL (Auto fetches on mount)</h2>
      <FetchCard 
        url="https://jsonplaceholder.typicode.com/todos/1"
        url-class="text-blue-600 underline"
        url-common-class="bg-blue-50 p-2 rounded"
      />
    </div>

    <!-- Example 2: URL Parts + Checkbox Trigger -->
    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-semibold text-gray-700">2. URL Parts (Requires Checkbox)</h2>
      <div class="mb-2">
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" v-model="enableAuthCheck" class="rounded border-gray-300 text-purple-600" />
          Toggle Checkbox Requirement Programmatically
        </label>
      </div>

      <FetchCard 
        :require-checkbox-to-enable="enableAuthCheck"
        :url-parts="['https://jsonplaceholder.typicode.com', '/posts', '/1']"
        :url-parts-classes="[
          'text-gray-500 font-medium',
          'text-purple-600 font-bold',
          'text-green-600 font-bold'
        ]"
        url-common-class="bg-purple-50 p-2 rounded border border-purple-100"
        :fetch-options="{ method: 'GET', headers: { 'Authorization': 'Bearer 123' } }"
      />
    </div>

    <!-- Example 3: Deliberate Error -->
    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-semibold text-gray-700">3. 404 Error (Short timeout 5s)</h2>
      <FetchCard 
        url="https://jsonplaceholder.typicode.com/not-a-real-endpoint"
        :response-display-timeout="5000"
        url-class="text-red-500"
      />
    </div>
  </div>
</template>
