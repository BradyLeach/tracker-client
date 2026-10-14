import { Pagination, type PaginationProps } from '@mui/material';

/**
 * CustomPagination - Theme-element wrapper for MUI Pagination.
 * Passthrough; restyle here rather than at call sites.
 */
const CustomPagination = ( props: PaginationProps ) => <Pagination {...props} />;

export default CustomPagination;
export type { PaginationProps };
