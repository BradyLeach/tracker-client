/**
 * List - App UI layer wrapper
 *
 * Thin wrapper over CustomList.
 * Provides stable import surface for app code.
 */

import CustomList from '@/theme/theme-elements/forms/CustomList';
import type { ListProps } from '@mui/material';

export function List( props: ListProps )
{
    return <CustomList {...props} />;
}

export type { ListProps };
