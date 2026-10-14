/**
 * ListItemButton - App UI layer wrapper
 *
 * Thin wrapper over CustomListItemButton.
 * Provides stable import surface for app code.
 */

import CustomListItemButton from '@/theme/theme-elements/forms/CustomListItemButton';
import type { ListItemButtonProps } from '@mui/material';

export function ListItemButton( props: ListItemButtonProps )
{
    return <CustomListItemButton {...props} />;
}

export type { ListItemButtonProps as ListItemButtonProps };
