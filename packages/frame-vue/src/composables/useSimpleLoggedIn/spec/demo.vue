<script setup lang="ts">
import { useSimpleLoggedIn } from '../useSimpleLoggedIn'

const { loggedIn, setToLoggedIn, setToLoggedOut, toggleLoggedIn } = useSimpleLoggedIn()
</script>

<template>
  <div class="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 border border-slate-200">
    <div class="flex items-center space-x-4">
      <div class="shrink-0">
        <div 
          :class="[
            'size-12 rounded-full flex items-center justify-center transition-colors duration-300',
            loggedIn ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
          ]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>
      <div>
        <div class="text-xl font-medium text-black">Login Status</div>
        <p class="text-slate-500">
          User is currently <span :class="loggedIn ? 'text-green-600 font-bold' : 'text-slate-600 font-bold'">{{ loggedIn ? 'Logged In' : 'Logged Out' }}</span>
        </p>
      </div>
    </div>
    
    <div class="flex flex-wrap gap-2 pt-2">
      <button 
        @click="setToLoggedIn" 
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
        :disabled="loggedIn"
      >
        Log In
      </button>
      <button 
        @click="setToLoggedOut" 
        class="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
        :disabled="!loggedIn"
      >
        Log Out
      </button>
      <button 
        @click="toggleLoggedIn" 
        class="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
      >
        Toggle
      </button>
    </div>

    <div class="text-xs text-slate-400 italic">
      This state is shared across all components using useSimpleLoggedIn.
    </div>
  </div>
</template>
