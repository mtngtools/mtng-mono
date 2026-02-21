import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import FetchCard from './FetchCard.vue';
import { ofetch } from 'ofetch';

vi.mock('ofetch', () => ({
    ofetch: {
        raw: vi.fn(),
    },
}));

describe('FetchCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Props and URL resolution', () => {
        it('resolves raw url prop correctly', () => {
            const wrapper = mount(FetchCard, {
                props: {
                    url: 'https://api.example.com/data',
                },
            });
            // The DOM should contain the string URL
            expect(wrapper.text()).toContain('https://api.example.com/data');
        });

        it('resolves urlParts prop correctly and applies respective classes', () => {
            const wrapper = mount(FetchCard, {
                props: {
                    urlParts: ['https://api.example.com', '/users', '/123'],
                    urlPartsClasses: ['base-cls', 'path-cls', 'id-cls'],
                },
            });

            const parts = wrapper.findAll('.base-cls, .path-cls, .id-cls');
            expect(parts.length).toBe(3);
            expect(parts[0]?.text()).toBe('https://api.example.com');
            expect(parts[1]?.text()).toBe('/users');
            expect(parts[2]?.text()).toBe('/123');
        });

        it('applies default length-based styling to urlParts when urlPartsClasses is missing', () => {
            const wrapper = mount(FetchCard, {
                props: {
                    urlParts: ['https://api.example.com', '/users', '/123'],
                },
            });

            // length > 2
            const parts = wrapper.findAll('.flex-wrap.font-mono > div');
            expect(parts.length).toBe(3);
            expect(parts[0]?.classes()).toContain('hidden');
            expect(parts[1]?.classes()).toContain('text-sm');
            expect(parts[2]?.classes()).toContain('text-2xl');
        });

        it('applies flex-col layout when urlPartsDirection is column', () => {
            const wrapper = mount(FetchCard, {
                props: {
                    urlParts: ['https://api.example.com', '/users'],
                    urlPartsDirection: 'column',
                },
            });

            // The direct parent of the parts should have flex-col
            const partsWrapper = wrapper.find('.break-all.text-neutral-800');
            expect(partsWrapper.classes()).toContain('flex-col');
            expect(partsWrapper.classes()).toContain('items-start');
            expect(partsWrapper.classes()).not.toContain('flex-row');
        });
    });

    describe('Checkbox requirement', () => {
        it('disables fetch button when requireCheckboxToEnable is true and checkbox is unchecked', () => {
            const wrapper = mount(FetchCard, {
                props: {
                    url: 'https://api.example.com',
                    requireCheckboxToEnable: true,
                },
            });

            const button = wrapper.find('button');
            expect(button.attributes('disabled')).toBeDefined();
        });

        it('enables fetch button when checkbox is checked without auto-fetching', async () => {
            const wrapper = mount(FetchCard, {
                props: {
                    url: 'https://api.example.com',
                    requireCheckboxToEnable: true,
                },
            });

            const checkbox = wrapper.find('input[type="checkbox"]');
            await checkbox.setValue(true);

            let button = wrapper.find('button');
            expect(button.attributes('disabled')).toBeUndefined();

            // Checkbox should exclusively enable the action button, not trigger the fetch.
            expect(ofetch.raw).not.toHaveBeenCalled();
        });

        it('clears the checkbox after the fetch is executed, enforcing a deliberate two-step process', async () => {
            const wrapper = mount(FetchCard, {
                props: {
                    url: 'https://api.example.com',
                    requireCheckboxToEnable: true,
                },
            });

            const checkbox = wrapper.find('input[type="checkbox"]');

            // Check the box
            await checkbox.setValue(true);
            expect((checkbox.element as HTMLInputElement).checked).toBe(true);
            let button = wrapper.find('button');
            expect(button.attributes('disabled')).toBeUndefined();

            // Execution should immediately uncheck the box
            await button.trigger('click');

            // Wait for Vue to process DOM updates locally (since we bound to v-model)
            await wrapper.vm.$nextTick();

            expect((checkbox.element as HTMLInputElement).checked).toBe(false);

            button = wrapper.find('button');
            expect(button.attributes('disabled')).toBeDefined();
        });
    });

    describe('Fetching and Events', () => {
        it('does not fetch on mount by default, and fetches when button is clicked', async () => {
            const mockResponse = { _data: { id: 1 }, status: 200 };
            vi.mocked(ofetch.raw).mockResolvedValueOnce(mockResponse as any);

            const wrapper = mount(FetchCard, {
                props: {
                    url: 'https://api.example.com',
                    requireCheckboxToEnable: false,
                },
            });

            // Wait a bit
            await new Promise(r => setTimeout(r, 50));
            expect(ofetch.raw).not.toHaveBeenCalled();

            await wrapper.find('button').trigger('click');
            await new Promise(r => setTimeout(r, 50));
            expect(ofetch.raw).toHaveBeenCalledWith('https://api.example.com', {});
        });

        it('emits fetching, onResult, and onSuccess on successful fetch', async () => {
            const mockResponse = { _data: { id: 1 }, status: 200 };
            vi.mocked(ofetch.raw).mockResolvedValueOnce(mockResponse as any);

            const wrapper = mount(FetchCard, {
                props: {
                    url: 'https://api.example.com',
                    requireCheckboxToEnable: false,
                    fetchOnMount: true,
                },
            });

            await new Promise(r => setTimeout(r, 50));

            expect(ofetch.raw).toHaveBeenCalledWith('https://api.example.com', {});

            expect(wrapper.emitted()).toHaveProperty('fetching');
            expect(wrapper.emitted()).toHaveProperty('onResult');
            expect(wrapper.emitted()).toHaveProperty('onSuccess');
            expect(wrapper.emitted()).not.toHaveProperty('onError');

            const successEvent = wrapper.emitted('onSuccess') as any[][];
            expect(successEvent?.[0]?.[1]).toEqual(mockResponse);
        });

        it('emits fetching, onResult, and onError on failed fetch', async () => {
            const mockError = { data: { message: 'Not found' }, status: 404 };
            vi.mocked(ofetch.raw).mockRejectedValueOnce(mockError);

            const wrapper = mount(FetchCard, {
                props: {
                    url: 'https://api.example.com',
                    requireCheckboxToEnable: false,
                    fetchOnMount: true,
                },
            });

            await new Promise(r => setTimeout(r, 50));

            expect(wrapper.emitted()).toHaveProperty('fetching');
            expect(wrapper.emitted()).toHaveProperty('onResult');
            expect(wrapper.emitted()).toHaveProperty('onError');
            expect(wrapper.emitted()).not.toHaveProperty('onSuccess');

            const errorEvent = wrapper.emitted('onError') as any[][];
            expect(errorEvent?.[0]?.[1]).toEqual(mockError);
        });
    });

    describe('Styling and Timeout', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('resets styling to neutral after responseDisplayTimeout', async () => {
            const mockResponse = { _data: { id: 1 }, status: 200 };
            vi.mocked(ofetch.raw).mockResolvedValue(mockResponse as any);

            const wrapper = mount(FetchCard, {
                props: {
                    url: 'https://api.example.com',
                    requireCheckboxToEnable: true,
                    responseDisplayTimeout: 1000,
                },
            });

            // Checkbox needed, so no auto-fetch
            await wrapper.find('input[type="checkbox"]').setValue(true);
            await wrapper.find('button').trigger('click');

            // With fakeTimers, ofetch's internal async operations might need ticks
            await vi.runAllTicks();
            await flushPromises();

            // Check if it's currently green
            const statusCodeEl = wrapper.find('.text-green-400');
            expect(statusCodeEl.exists()).toBe(true);

            // Fast-forward timeout to trigger reset
            vi.advanceTimersByTime(1500);
            await wrapper.vm.$nextTick();

            // Should be back to neutral
            const neutralEl = wrapper.find('.text-neutral-500');
            expect(neutralEl.exists()).toBe(true);
        });
    });
});
