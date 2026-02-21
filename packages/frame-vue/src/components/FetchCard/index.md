# FetchCard Component

The `FetchCard` is a utility Vue component that provides a unified, visual interface for testing, executing, and observing `ofetch` HTTP requests. 

It exposes its states, response payloads, error conditions, and gracefully styles the components of the URL based on the request's success or failure.

## Installation

As this component relies on `ofetch`, ensure you have it installed:

```bash
pnpm add ofetch
```

## Basic Usage

The component accepts an API endpoint via the `url` prop (continuous string) or `urlParts` (destructured endpoint pieces).

```vue
<script setup lang="ts">
import { FetchCard } from '@mtngtools/frame-vue';
</script>

<template>
  <!-- Simple URL auto-fetching -->
  <FetchCard 
    url="https://api.example.com/health"
    url-class="text-blue-500 font-bold"
  />
  
  <!-- URL Parts with manual checkbox gate -->
  <FetchCard 
    :require-checkbox-to-enable="true"
    :url-parts="['https://api.example.com', '/users/', '123']"
    :url-parts-classes="['text-gray-400', 'text-blue-600', 'text-green-600 font-bold']"
    :fetch-options="{ method: 'POST', body: { name: 'Jason' } }"
  />
</template>
```

## Props

The component operates on a discriminated union constraint, meaning you must provide **either** `url` **or** `urlParts`, but not both.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `MaybeRefOrGetter<string>` | `undefined` | The full HTTP URL string |
| `urlClass` | `MaybeRefOrGetter<string>` | `undefined` | CSS classes to apply to the `url` |
| `urlParts` | `MaybeRefOrGetter<string[]>` | `undefined` | An array of URL segments to be joined into a string |
| `urlPartsClasses`| `MaybeRefOrGetter<string[]>` | `undefined` | Array of CSS classes correlating to `urlParts` index |
| `urlCommonClass` | `MaybeRefOrGetter<string>` | `undefined` | CSS classes applied to the URL wrapping container |
| `requireCheckboxToEnable`| `MaybeRefOrGetter<boolean>`| `false` | If true, a checkbox must be checked before a request can occur. |
| `fetchOptions`| `MaybeRefOrGetter<FetchOptions>` | `{}` | Standard `ofetch` arguments corresponding to the second parameter. |
| `responseDisplayTimeout`| `MaybeRefOrGetter<number>` | `20000` | MS delay until the visual status styling returns to neutral. |

## Events

You can hook into the lifecycle events emitted by the FetchCard. All events return the current `props` object, and post-flight events return the generic `response`.

- `@fetching(props)`
- `@onResult(props, response)`
- `@onSuccess(props, response)`
- `@onError(props, err)`
