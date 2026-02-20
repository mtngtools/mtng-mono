import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import VanillaIf from './VanillaIf.vue'

describe('VanillaIf Configuration', () => {
    it('immediately resolves and mounts a literal boolean', () => {
        const wrapper = mount(VanillaIf, {
            props: { show: true },
            slots: { default: '<div id="default">Yes</div>' }
        })
        expect(wrapper.find('#default').exists()).toBe(true)
    })

    it('immediately resolves and mounts a literal boolean false into else slot', () => {
        const wrapper = mount(VanillaIf, {
            props: { show: false },
            slots: { default: '<div id="default">Yes</div>', else: '<div id="else">No</div>' }
        })
        expect(wrapper.find('#default').exists()).toBe(false)
        expect(wrapper.find('#else').exists()).toBe(true)
    })

    it('immediately resolves a Vue Ref', () => {
        const showRef = ref(true)
        const wrapper = mount(VanillaIf, {
            props: { show: showRef },
            slots: { default: '<div id="default">Ref</div>' }
        })
        expect(wrapper.find('#default').exists()).toBe(true)
    })
})

describe('VanillaIf Polling Engine', () => {
    it('polls repeatedly while swallowing ReferenceErrors', async () => {
        vi.useFakeTimers()
        const win = {} as any

        const wrapper = mount(VanillaIf, {
            props: {
                show: () => win.someExternalSystem.isActive() // This throws TypeError because someExternalSystem is undefined
            },
            slots: { default: '<div id="target">Loaded</div>' }
        })

        // Not resolved yet, no slot mounted
        expect(wrapper.find('#target').exists()).toBe(false)

        // Advance a few intervals, still nothing
        vi.advanceTimersByTime(150)
        expect(wrapper.find('#target').exists()).toBe(false)

        // Finally define it
        win.someExternalSystem = { isActive: () => true }

        // It should catch on the next tick interval
        vi.advanceTimersByTime(50)
        await wrapper.vm.$nextTick()

        expect(wrapper.find('#target').exists()).toBe(true)
        vi.useRealTimers()
    })

    it('polls repeatedly until the function returns a strict boolean instead of undefined', async () => {
        vi.useFakeTimers()
        let val: any = undefined

        const wrapper = mount(VanillaIf, {
            props: {
                show: () => val
            },
            slots: { default: '<div id="target">Loaded</div>', else: '<div id="else">Failed</div>' }
        })

        expect(wrapper.find('#target').exists()).toBe(false)
        expect(wrapper.find('#else').exists()).toBe(false)

        vi.advanceTimersByTime(100)

        // define it tightly to false
        val = false
        vi.advanceTimersByTime(50)
        await wrapper.vm.$nextTick()

        expect(wrapper.find('#target').exists()).toBe(false)
        expect(wrapper.find('#else').exists()).toBe(true)
        vi.useRealTimers()
    })

    it('polls window method when showWindowFn is specified', async () => {
        vi.useFakeTimers()
        // initially not present on window

        const wrapper = mount(VanillaIf, {
            props: {
                showWindowFn: 'myExternalVanillaLogic'
            },
            slots: { default: '<div id="target">Loaded</div>' }
        })

        expect(wrapper.find('#target').exists()).toBe(false)

        // Advance
        vi.advanceTimersByTime(150)
        expect(wrapper.find('#target').exists()).toBe(false)

            // Mock external system injection
            ; (window as any).myExternalVanillaLogic = () => true

        // Catch the polling tick
        vi.advanceTimersByTime(50)
        await wrapper.vm.$nextTick()

        expect(wrapper.find('#target').exists()).toBe(true)
        vi.useRealTimers()

        // Cleanup global
        delete (window as any).myExternalVanillaLogic
    })
})
