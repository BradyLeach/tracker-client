/**
 * CollectionPagination
 *
 * Page control for any collection. Like CollectionToolbar it reports intent
 * and displays state — the pipeline owns which rows a page contains.
 *
 * Sits at the foot of a section so a container can hold a large history
 * without the page around it growing.
 *
 * @example
 * ```tsx
 * const collection = useCollection( orders, { fields, pageSize: 10 } );
 *
 * <CollectionPagination
 *     page={collection.page}
 *     pageCount={collection.pageCount}
 *     totalCount={collection.totalCount}
 *     pageSize={collection.pageSize}
 *     onPageChange={collection.setPage}
 * />
 * ```
 */

import { useTranslation } from 'react-i18next';
import { Box, Pagination, Typography } from '@/components/ui';

export interface CollectionPaginationProps
{
    page: number;
    pageCount: number;
    /** Rows across every page, for the summary. */
    totalCount: number;
    pageSize?: number;
    onPageChange: ( page: number ) => void;
    /**
     * Keep the row summary visible when there is only one page. The control
     * itself is always hidden in that case — a single page offers no choice.
     */
    alwaysShowSummary?: boolean;
}

export function CollectionPagination( {
    page,
    pageCount,
    totalCount,
    pageSize,
    onPageChange,
    alwaysShowSummary = true,
}: CollectionPaginationProps )
{
    const { t } = useTranslation();

    const hasPages = pageCount > 1;
    if( !hasPages && !alwaysShowSummary ) return null;

    const first = totalCount === 0 || !pageSize ? 0 : ( page - 1 ) * pageSize + 1;
    const last = pageSize ? Math.min( page * pageSize, totalCount ) : totalCount;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                flexWrap: 'wrap',
                pt: 1.5,
            }}
        >
            <Typography variant="caption" color="text.secondary">
                {totalCount === 0
                    ? t( 'collection.pagination.empty' )
                    : `${first}–${last} ${t( 'collection.pagination.of' )} ${totalCount}`}
            </Typography>

            {hasPages && (
                <Pagination
                    page={page}
                    count={pageCount}
                    onChange={( _, next ) => onPageChange( next )}
                    size="small"
                    shape="rounded"
                    // Ends only; arrows plus a full page list overflows a
                    // narrow container such as the detail panel.
                    siblingCount={0}
                    boundaryCount={1}
                />
            )}
        </Box>
    );
}

export default CollectionPagination;
