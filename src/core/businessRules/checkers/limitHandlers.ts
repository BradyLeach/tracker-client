/**
 * Limit rule constraint (resource creation limits)
 */
export type LimitRule = {
    min?: number;
    max?: number;
    burst?: number
};

/**
 * Actual resolved limit values.
 * Derived from fetching current resource count.
 */
export interface LimitActualValues
{
    current: number;
}

/**
 * Limit Handler Map
 *
 * A map of limit rule keys to pure check functions.
 * Keys must match backend rule keys.
 * Expected values are typed as `LimitRule[key]` (dynamic).
 */
export const limitHandlers:
    {
        [K in keyof LimitRule]: ( expected: LimitRule[K], actual: LimitActualValues ) => boolean;
    } =
{
    max: ( expected, actual ) =>
        typeof expected === "number" &&
        actual.current < expected
    ,

    min: ( expected, actual ) =>
        typeof expected === "number" &&
        actual.current > expected,
};
