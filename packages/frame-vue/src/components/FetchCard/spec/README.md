# FetchCard

## Overview
A Vue component to make an HTTP request using `ofetch` and gracefully display the details of the call (state, assembled URL, and response).

## Props

The component requires either `url` or `urlParts` to construct the target. 

```ts
import type { MaybeRefOrGetter } from 'vue';
import type { FetchOptions } from 'ofetch';

type BaseFetchCardProps = {
  /** If true, requires a rendered checkbox to be checked before the fetch can execute. Defaults to false. */
  requireCheckboxToEnable?: MaybeRefOrGetter<boolean>;
  /** Options passed directly as the second parameter to ofetch */
  fetchOptions?: MaybeRefOrGetter<FetchOptions>;
  /** Time in milliseconds to display the response status/body before returning to neutral. Defaults to 20000 (20s). */
  responseDisplayTimeout?: MaybeRefOrGetter<number>;
  /** Fetches automatically when component mounts. Defaults to false. */
  fetchOnMount?: MaybeRefOrGetter<boolean>;
  /** Text to display on the fetch button. Defaults to 'Fetch'. */
  fetchButtonText?: MaybeRefOrGetter<string>;
  /** CSS classes applied to the fetch button. */
  fetchButtonClass?: MaybeRefOrGetter<string>;
  /** CSS classes applied to the response payload box. defaults to max-h-24 and group hover expansion. */
  responseClass?: MaybeRefOrGetter<string>;
  /** CSS valid max-height applied to the response body block when hovering. Defaults to 40vh. */
  responseMaxHeight?: MaybeRefOrGetter<string>;
};

export type FetchCardProps = BaseFetchCardProps & (
  | {
      url: MaybeRefOrGetter<string>;
      urlClass?: MaybeRefOrGetter<string>;
      urlCommonClass?: MaybeRefOrGetter<string>;
      urlParts?: never;
      urlPartsClasses?: never;
    }
  | {
      url?: never;
      urlClass?: never;
      urlCommonClass?: MaybeRefOrGetter<string>;
      urlParts: MaybeRefOrGetter<string[]>;
      urlPartsClasses?: MaybeRefOrGetter<string[]>;
      urlPartsDirection?: MaybeRefOrGetter<'row' | 'column'>;
    }
);
```

- All props accept their native types, `ref`, or `computed` (via `MaybeRefOrGetter`), and will be converted into `computed` properties internally using Vue's `toValue`.
- The resolved fetch URL is a `computed` property derived from either the `url` prop directly, or the `urlParts` prop joined into a single string.
- `responseDisplayTimeout` defaults to `20000` (20 seconds).
- `fetchOnMount` defaults to `false`. Required explicit user action on the Fetch button to initiate a fetch, unless `fetchOnMount` is true. Checking the enable checkbox only enables the button, it does *not* auto-trigger.

## State and Behavior

### Display Elements
The card should render the following elements:
1. **Enable Checkbox** (Optional, based on `requireCheckboxToEnable` prop). *Intent: This option is intended for buttons/requests that should not be clicked without great consideration, enforcing a deliberate 2-step process. Submitting a fetch will automatically uncheck this box.*
2. **HTTP Method**: A computed display of the method mapping to `fetchOptions.method` (defaults to `GET`).
3. **URL Display**: 
   - When given `url`, it renders it as a continuous string with optional `urlClass` styling.
   - When given `urlParts`, it renders each segment in its own `div` individually. If `urlPartsClasses` is provided, those classes map exactly to the index. If `urlPartsClasses` is **not** provided, the default sizing logic applies:
      - If `urlParts.length > 1`: index 0 is `hidden`, index 1 is standard size (`text-sm font-medium`).
      - If `urlParts.length > 2`: index 0 is `hidden`, index 1 is standard size (`text-sm font-medium`), and index 2 is much larger (`text-xl font-bold`).
4. **Action Button**: Triggers the fetch. It is disabled if `requireCheckboxToEnable` is true but the checkbox is unchecked. Its text defaults to "Fetch" or the value of `fetchButtonText`, and can receive additional classes via `fetchButtonClass`.
5. **Response Block**: A single compact horizontal row containing:
   - **Left**: Status code color box (no text label).
   - **Right**: The response body. By default, constrained logic shows ~3 lines with scroll and reveals full content up to `responseMaxHeight` (defaulting to `40vh`) on hover. The class constraint can be customized entirely by passing `responseClass`. It also contains an absolute-positioned Copy button in the top right that appears on hover.

### Status Code Styling
The response status code color indicates the state of the fetch:
- **Neutral** (Default state)
- **Yellow**: While the response is pending (after action button is clicked).
- **Green**: On a successful fetch response (e.g., 20x).
- **Red**: On a failed fetch response (e.g., 40x / 50x / network error).
- **Return to Neutral**: After the given `responseDisplayTimeout` has passed since the request completed, the status code style should return to neutral.

## Events
The component emits the following events:
- `fetching`: Emitted when the fetch request begins. Payload: `(props: FetchCardProps)`.
- `onResult`: Emitted when any response is received (success or failure). Payload: `(props: FetchCardProps, response: any)`.
- `onSuccess`: Emitted when a successful response is received. Payload: `(props: FetchCardProps, response: any)`.
- `onError`: Emitted when a fetch fails. Payload: `(props: FetchCardProps, response: any)`.

## Future Improvements
- **Generic Return Typing:** Later, we plan to add generic typing such that `FetchCard<T>` strongly types the return data (i.e. simulating the usage of `ofetch<Article>`).
