export type Simplify<T> = {
    [K in keyof T]: T[K];
} & {};

export type SimplifyDeep<T> = T extends object
    ? { [K in keyof T]: SimplifyDeep<T[K]> } & {}
    : T;