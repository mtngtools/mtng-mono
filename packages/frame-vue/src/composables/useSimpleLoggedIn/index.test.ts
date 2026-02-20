import { describe, it, expect, beforeEach } from 'vitest'
import { useSimpleLoggedIn, __resetStateForTesting } from './useSimpleLoggedIn'

describe('useSimpleLoggedIn', () => {
    beforeEach(() => {
        // Reset global state flag and value before each test
        __resetStateForTesting()
    })

    it('should initialize with false by default', () => {
        const { loggedIn } = useSimpleLoggedIn()
        expect(loggedIn.value).toBe(false)
    })

    it('should initialize with true if provided', () => {
        // We need to be careful here because state is global.
        // However, the implementation sets the value if provided.
        // So this should work to update the global state.
        const { loggedIn } = useSimpleLoggedIn({ initialValue: true })
        expect(loggedIn.value).toBe(true)
    })

    it('should initialize from window if configured', () => {
        // Mock window object property
        ; (window as any).initialLoggedIn = true

        const { loggedIn, isInitialized } = useSimpleLoggedIn({
            initializeFromWindowAccessObject: true,
            initializeWindowAccessObjectName: 'initialLoggedIn'
        })

        expect(loggedIn.value).toBe(true)
        expect(isInitialized.value).toBe(true)
        delete (window as any).initialLoggedIn
    })

    it('should poll for window object if not immediately available', async () => {
        const { loggedIn, isInitialized } = useSimpleLoggedIn({
            initializeFromWindowAccessObject: true,
            initializeWindowAccessObjectName: 'delayedLoggedIn'
        })

        expect(isInitialized.value).toBe(false)
        expect(loggedIn.value).toBe(false)

        setTimeout(() => {
            ; (window as any).delayedLoggedIn = true
        }, 100)

        // Wait for the next poll cycle
        await new Promise(resolve => setTimeout(resolve, 200))

        expect(isInitialized.value).toBe(true)
        expect(loggedIn.value).toBe(true)

        delete (window as any).delayedLoggedIn
    })

    it('should toggle state', () => {
        const { loggedIn, toggleLoggedIn } = useSimpleLoggedIn()
        // Ensure it starts false
        const { setToLoggedOut } = useSimpleLoggedIn()
        setToLoggedOut()

        expect(loggedIn.value).toBe(false)
        toggleLoggedIn()
        expect(loggedIn.value).toBe(true)
        toggleLoggedIn()
        expect(loggedIn.value).toBe(false)
    })

    it('should set to logged in', () => {
        const { loggedIn, setToLoggedIn } = useSimpleLoggedIn()
        expect(loggedIn.value).toBe(false)
        setToLoggedIn()
        expect(loggedIn.value).toBe(true)
    })

    it('should set to logged out', () => {
        const { loggedIn, setToLoggedIn, setToLoggedOut } = useSimpleLoggedIn()
        setToLoggedIn()
        expect(loggedIn.value).toBe(true)
        setToLoggedOut()
        expect(loggedIn.value).toBe(false)
    })
})
