
<script setup lang="ts">
import { LoggedInOut } from '@mtngtools/frame-vue'
</script>

<template>
    <div class="p-4 border rounded mb-4">
        <h2 class="text-xl font-bold mb-2">Vanilla JS interaction</h2>
        <p class="mb-4 text-sm text-gray-600">These buttons use `window.loggedInOut` directly (Vanilla JS style).</p>
        <div class="flex gap-2">
            <button onclick="window.loggedInOut.setToLoggedIn()" class="bg-blue-500 text-white px-4 py-2 rounded">JS: Log In</button>
            <button onclick="window.loggedInOut.setToLoggedOut()" class="bg-red-500 text-white px-4 py-2 rounded">JS: Log Out</button>
            <button onclick="alert('Logged In: ' + window.loggedInOut.getLoggedIn())" class="bg-gray-500 text-white px-4 py-2 rounded">JS: Check Status</button>
        </div>
    </div>

    <LoggedInOut add-window-access>
        <template #loggedIn>
            <div class="p-4 bg-green-100 border border-green-500 rounded">
                <p>You are logged in (Vue component state)</p>
            </div>
        </template>
        <template #loggedOut>
            <div class="p-4 bg-red-100 border border-red-500 rounded">
                <p>You are logged out (Vue component state)</p>
            </div>
        </template>
    </LoggedInOut>
</template>