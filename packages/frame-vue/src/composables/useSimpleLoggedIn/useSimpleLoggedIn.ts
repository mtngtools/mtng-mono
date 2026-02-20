import { ref } from 'vue'

export interface UseSimpleLoggedInOptions {
    initialValue?: boolean
    addWindowAccess?: boolean
    windowAccessObjectName?: string
    initializeFromWindowAccessObject?: boolean
    initializeWindowAccessObjectName?: string
}

// Manual global state implementation to avoid adding @vueuse/core dependency for shared state
const loggedIn = ref(false)
const isInitialized = ref(false)

// For unit testing environments only
export function __resetStateForTesting() {
    loggedIn.value = false
    isInitialized.value = false
}

/**
 * Shared state for simple logged in status.
 */
export function useSimpleLoggedIn(options: UseSimpleLoggedInOptions = {}) {
    const {
        initializeFromWindowAccessObject = false,
        initializeWindowAccessObjectName = 'initialLoggedIn',
    } = options

    if (!isInitialized.value) {
        if (initializeFromWindowAccessObject && typeof window !== 'undefined') {
            const windowInitValue = (window as any)[initializeWindowAccessObjectName]
            if (windowInitValue !== undefined) {
                loggedIn.value = Boolean(windowInitValue)
                isInitialized.value = true
            } else {
                // Poll for the window object
                const pollInterval = setInterval(() => {
                    const polledValue = (window as any)[initializeWindowAccessObjectName]
                    if (polledValue !== undefined) {
                        loggedIn.value = Boolean(polledValue)
                        isInitialized.value = true
                        clearInterval(pollInterval)
                    }
                }, 50)
            }
        } else {
            if (options.initialValue !== undefined) {
                loggedIn.value = options.initialValue
            }
            isInitialized.value = true
        }
    } else if (options.initialValue !== undefined && !initializeFromWindowAccessObject) {
        // Fallback if re-called and init value passed again (though shared state usually only inits once)
        loggedIn.value = options.initialValue
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

    const getLoggedIn = () => loggedIn.value
    const setLoggedIn = (val: boolean) => { loggedIn.value = val }

    const setupWindowAccess = (name: string) => {
        if (typeof window !== 'undefined') {
            (window as any)[name] = {
                setToLoggedIn,
                setToLoggedOut,
                toggleLoggedIn,
                getLoggedIn,
                setLoggedIn,
            }
        }
    }

    const cleanupWindowAccess = (name: string) => {
        if (typeof window !== 'undefined' && (window as any)[name]) {
            delete (window as any)[name]
        }
    }

    // Handled by the component to ensure reactivity on prop changes
    // if (addWindowAccess) {
    //    setupWindowAccess(windowAccessObjectName)
    // }

    return {
        loggedIn,
        isInitialized,
        setToLoggedIn,
        setToLoggedOut,
        toggleLoggedIn,
        getLoggedIn,
        setLoggedIn,
        setupWindowAccess,
        cleanupWindowAccess
    }
}
