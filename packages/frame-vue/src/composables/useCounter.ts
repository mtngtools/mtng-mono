import { ref, type Ref } from 'vue';

/**
 * Simple counter composable. Sample for frame-vue composables.
 */
export function useCounter(initial = 0): {
  count: Ref<number>;
  increment: () => void;
  decrement: () => void;
} {
  const count = ref(initial);
  return {
    count,
    increment: () => {
      count.value += 1;
    },
    decrement: () => {
      count.value -= 1;
    },
  };
}
