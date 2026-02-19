import { describe, it, expect, beforeEach } from 'vitest'
import { useSimpleLoggedIn } from './useSimpleLoggedIn'

describe('useSimpleLoggedIn', () => {
    beforeEach(() => {
        // Reset state before each test
        const { setToLoggedOut } = useSimpleLoggedIn()
        setToLoggedOut()
    })

    it('should initialize with false by default', () => {
        const { loggedIn } = useSimpleLoggedIn()
        expect(loggedIn.value).toBe(false)
    })

    it('should initialize with true if provided', () => {
        // We need to be careful here because state is global.
        // However, the implementation sets the value if provided.
        // So this should work to update the global state.
        const { loggedIn } = useSimpleLoggedIn(true)
        expect(loggedIn.value).toBe(true)
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
