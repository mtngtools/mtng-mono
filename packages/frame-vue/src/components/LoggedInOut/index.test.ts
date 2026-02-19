import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoggedInOut from './LoggedInOut.vue'
import { useSimpleLoggedIn } from '../../composables/useSimpleLoggedIn'

describe('LoggedInOut.vue', () => {
    beforeEach(() => {
        const { setToLoggedOut } = useSimpleLoggedIn()
        setToLoggedOut()
    })

    it('should render loggedOut slot initially', () => {
        const wrapper = mount(LoggedInOut, {
            slots: {
                loggedIn: '<div id="logged-in">Logged In Content</div>',
                loggedOut: '<div id="logged-out">Logged Out Content</div>'
            }
        })

        expect(wrapper.find('#logged-out').exists()).toBe(true)
        expect(wrapper.find('#logged-in').exists()).toBe(false)
    })

    it('should switch to loggedIn slot when state changes', async () => {
        const wrapper = mount(LoggedInOut, {
            slots: {
                loggedIn: '<div id="logged-in">Logged In Content</div>',
                loggedOut: '<div id="logged-out">Logged Out Content</div>'
            }
        })

        const { setToLoggedIn } = useSimpleLoggedIn()
        setToLoggedIn()

        await wrapper.vm.$nextTick()

        expect(wrapper.find('#logged-in').exists()).toBe(true)
        expect(wrapper.find('#logged-out').exists()).toBe(false)
    })

    it('should expose auth methods and state', () => {
        const wrapper = mount(LoggedInOut)

        expect(wrapper.vm.loggedIn).toBeDefined()
        expect(typeof wrapper.vm.setToLoggedIn).toBe('function')
        expect(typeof wrapper.vm.setToLoggedOut).toBe('function')
        expect(typeof wrapper.vm.toggleLoggedIn).toBe('function')
    })

    it('should toggle state via exposed method', async () => {
        const wrapper = mount(LoggedInOut, {
            slots: {
                loggedIn: '<div id="logged-in">In</div>',
                loggedOut: '<div id="logged-out">Out</div>'
            }
        })

            ; (wrapper.vm as any).setToLoggedIn()
        await wrapper.vm.$nextTick()
        expect(wrapper.find('#logged-in').exists()).toBe(true)

            ; (wrapper.vm as any).toggleLoggedIn()
        await wrapper.vm.$nextTick()
        expect(wrapper.find('#logged-out').exists()).toBe(true)
    })
    it('should accept initiallyLoggedIn prop', async () => {
        // Reset global state first
        const { setToLoggedOut } = useSimpleLoggedIn()
        setToLoggedOut()

        const wrapper = mount(LoggedInOut, {
            props: {
                initiallyLoggedIn: true
            },
            slots: {
                loggedIn: '<div id="logged-in">In</div>',
                loggedOut: '<div id="logged-out">Out</div>'
            }
        })

        expect(wrapper.vm.loggedIn).toBe(true)
        // Wait for next tick to ensure DOM updates (though useSimpleLoggedIn is reactive independently)
        await wrapper.vm.$nextTick()
        expect(wrapper.find('#logged-in').exists()).toBe(true)
    })

    it('should add window access when addWindowAccess is true', () => {
        const wrapper = mount(LoggedInOut, {
            props: {
                addWindowAccess: true
            }
        })

        expect((window as any).loggedInOut).toBeDefined()
        expect(typeof (window as any).loggedInOut.setToLoggedIn).toBe('function')
        expect(typeof (window as any).loggedInOut.getLoggedIn).toBe('function')

        wrapper.unmount()
        expect((window as any).loggedInOut).toBeUndefined()
    })

    it('should use custom window object name', () => {
        const wrapper = mount(LoggedInOut, {
            props: {
                addWindowAccess: true,
                windowAccessObjectName: 'customAuth'
            }
        })

        expect((window as any).customAuth).toBeDefined()
        expect((window as any).loggedInOut).toBeUndefined()

        wrapper.unmount()
        expect((window as any).customAuth).toBeUndefined()
    })

    it('should allow getting and setting loggedIn via window object', async () => {
        mount(LoggedInOut, {
            props: {
                addWindowAccess: true
            }
        })

        const win = (window as any).loggedInOut
        win.setToLoggedOut()
        expect(win.getLoggedIn()).toBe(false)

        win.setToLoggedIn()
        expect(win.getLoggedIn()).toBe(true)

        win.toggleLoggedIn()
        expect(win.getLoggedIn()).toBe(false)

        win.setLoggedIn(true)
        expect(win.getLoggedIn()).toBe(true)
    })
})
