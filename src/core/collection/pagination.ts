/**
 * Pagination
 *
 * Slicing a processed collection into pages. Pure, and applied after filtering
 * and sorting so a page always describes the current result set rather than
 * the raw one.
 */

/** Pages needed to hold `total` rows. Always at least one, so an empty collection still has page 1. */
export function pageCountOf( total: number, pageSize?: number ): number
{
    if( !pageSize || pageSize <= 0 ) return 1;
    return Math.max( 1, Math.ceil( total / pageSize ) );
}

/**
 * Keep a page number inside the collection.
 *
 * Filtering can shrink a collection under the page you were on; without this
 * the view would land on a valid page number holding no rows.
 */
export function clampPage( page: number, total: number, pageSize?: number ): number
{
    return Math.min( Math.max( 1, page ), pageCountOf( total, pageSize ) );
}

/** The rows on a page. No `pageSize` means no pagination — every row. */
export function paginate<TRow>( rows: readonly TRow[], page: number, pageSize?: number ): TRow[]
{
    if( !pageSize || pageSize <= 0 ) return [...rows];

    const safePage = clampPage( page, rows.length, pageSize );
    const start = ( safePage - 1 ) * pageSize;

    return rows.slice( start, start + pageSize );
}
