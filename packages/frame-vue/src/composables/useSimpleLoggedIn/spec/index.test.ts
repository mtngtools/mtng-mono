import { describe, it, expect, beforeEach } from 'vitest'
import { useSimpleLoggedIn } from '../useSimpleLoggedIn'

describe('useSimpleLoggedIn', () => {
    beforeEach(() => {
        const { setToLoggedOut } = useSimpleLoggedIn()
        setToLoggedOut()
    })

    it('should initialize with false', () => {
        const { loggedIn } = useSimpleLoggedIn()
        expect(loggedIn.value).toBe(false)
    })

    it('should set to logged in', () => {
        const { loggedIn, setToLoggedIn } = useSimpleLoggedIn()
        setToLoggedIn()
        expect(loggedIn.value).toBe(true)
    })

    it('should set to logged out', () => {
        const { loggedIn, setToLoggedIn, setToLoggedOut } = useSimpleLoggedIn()
        setToLoggedIn()
        setToLoggedOut()
        expect(loggedIn.value).toBe(false)
    })

    it('should toggle logged in status', () => {
        const { loggedIn, toggleLoggedIn } = useSimpleLoggedIn()
        toggleLoggedIn()
        expect(loggedIn.value).toBe(true)
        toggleLoggedIn()
        expect(loggedIn.value).toBe(false)
    })

    it('should share state between instances', () => {
        const instanceA = useSimpleLoggedIn()
        const instanceB = useSimpleLoggedIn()

        expect(instanceA.loggedIn.value).toBe(false)
        expect(instanceB.loggedIn.value).toBe(false)

        instanceA.setToLoggedIn()

        expect(instanceA.loggedIn.value).toBe(true)
        expect(instanceB.loggedIn.value).toBe(true)
    })
})
