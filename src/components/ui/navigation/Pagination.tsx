/**
 * Pagination - App UI layer wrapper
 *
 * Stable import surface over the theme-element wrapper.
 */
import CustomPagination, { type PaginationProps } from '@/theme/theme-elements/navigation/CustomPagination';

export type { PaginationProps };

export function Pagination( props: PaginationProps )
{
    return <CustomPagination {...props} />;
}

export default Pagination;
