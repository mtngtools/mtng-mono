import { ref } from 'vue'

// Manual global state implementation to avoid adding @vueuse/core dependency
const loggedIn = ref(false)

/**
 * Shared state for simple logged in status.
 */
export function useSimpleLoggedIn(initialValue?: boolean) {
    if (initialValue !== undefined) {
        loggedIn.value = initialValue
    }

    const setToLoggedIn = () => {
        loggedIn.value = true
    }

    const setToLoggedOut = () => {
        loggedIn.value = false
    }

    const toggleLoggedIn = () => {
        loggedIn.value = !loggedIn.value
    }

    return {
        loggedIn,
        setToLoggedIn,
        setToLoggedOut,
        toggleLoggedIn,
    }
}
