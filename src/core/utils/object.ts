/**
 * Object Utilities
 *
 * Generic object manipulation utilities.
 * Used across config system and other modules.
 */

/**
 * Deep merge two objects
 *
 * Recursively merges source into target.
 * Mutates target object for performance.
 *
 * @param target - Target object to merge into
 * @param source - Source object to merge from
 * @returns Merged target object
 *
 * @example
 * const base = { a: 1, b: { c: 2 } };
 * const override = { b: { d: 3 }, e: 4 };
 * deepMerge(base, override);
 * // Result: { a: 1, b: { c: 2, d: 3 }, e: 4 }
 */
export function deepMerge<T extends Record<string, any>>(
    target: T,
    source: Partial<T>
): T
{
    for( const key in source )
    {
        const sourceValue = source[key];
        const targetValue = target[key];

        if( sourceValue && typeof sourceValue === 'object' && !Array.isArray( sourceValue ) )
        {
            // Recursively merge objects
            target[key] = deepMerge(
                targetValue && typeof targetValue === 'object' ? targetValue : {},
                sourceValue
            ) as any;
        }
        else if( sourceValue !== undefined )
        {
            // Overwrite primitives and arrays
            target[key] = sourceValue as any;
        }
    }
    return target;
}

/**
 * Set a value at a dot-notation path in an object
 *
 * Creates intermediate objects as needed.
 * Mutates the object.
 *
 * @param obj - Object to modify
 * @param path - Dot-notation path (e.g., "api.baseUrl")
 * @param value - Value to set
 *
 * @example
 * const obj = {};
 * setPath(obj, "api.baseUrl", "http://localhost");
 * // Result: { api: { baseUrl: "http://localhost" } }
 */
export function setPath( obj: any, path: string, value: any ): void
{
    const keys = path.split( '.' );
    let current = obj;

    for( let i = 0; i < keys.length - 1; i++ )
    {
        const key = keys[i];
        if( !( key in current ) || typeof current[key] !== 'object' )
        {
            current[key] = {};
        }
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
}

/**
 * Get a value at a dot-notation path in an object
 *
 * Returns undefined if path doesn't exist.
 *
 * @param obj - Object to read from
 * @param path - Dot-notation path (e.g., "api.baseUrl")
 * @returns Value at path or undefined
 *
 * @example
 * const obj = { api: { baseUrl: "http://localhost" } };
 * getPath(obj, "api.baseUrl"); // "http://localhost"
 * getPath(obj, "api.timeout");  // undefined
 */
export function getPath( obj: any, path: string ): any
{
    const keys = path.split( '.' );
    let current = obj;

    for( const key of keys )
    {
        if( current == null || typeof current !== 'object' )
        {
            return undefined;
        }
        current = current[key];
    }

    return current;
}
