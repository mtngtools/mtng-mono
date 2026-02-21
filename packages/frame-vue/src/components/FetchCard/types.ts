import type { MaybeRefOrGetter } from 'vue';
import type { FetchOptions } from 'ofetch';

export type BaseFetchCardProps = {
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
    /** CSS classes applied to the response body block. */
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
        /** Direction to lay out the urlParts. Defaults to 'row'. */
        urlPartsDirection?: MaybeRefOrGetter<'row' | 'column'>;
    }
);
