<script setup lang="ts">
import { ref } from 'vue'
import LoggedInOut from './LoggedInOut.vue'

const authRef = ref<InstanceType<typeof LoggedInOut> | null>(null)

const toggleViaRef = () => {
  authRef.value?.toggleLoggedIn()
}
</script>

<template>
  <div class="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 border border-slate-200">
    <h2 class="text-xl font-bold">LoggedInOut Component Demo</h2>
    
    <LoggedInOut ref="authRef">
      <template #loggedIn>
        <div class="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <p class="font-bold">Welcome back!</p>
          <p class="text-sm">You are currently seeing the #loggedIn slot.</p>
          <button 
            @click="authRef?.setToLoggedOut()" 
            class="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Log Out (via ref)
          </button>
        </div>
      </template>
      
      <template #loggedOut>
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
          <p class="font-bold">Guest Access</p>
          <p class="text-sm">You are currently seeing the #loggedOut slot.</p>
          <button 
            @click="authRef?.setToLoggedIn()" 
            class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Log In (via ref)
          </button>
        </div>
      </template>
    </LoggedInOut>

    <div class="pt-4 border-t border-slate-100">
      <p class="text-sm text-slate-500 mb-2">External Control (using template ref):</p>
      <button 
        @click="toggleViaRef" 
        class="w-full px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 transition"
      >
        Toggle Status via Ref
      </button>
    </div>
  </div>
</template>
