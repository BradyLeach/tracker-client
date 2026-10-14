/**
 * ListItemText - App UI layer wrapper
 *
 * Thin wrapper over CustomListItemText.
 * Provides stable import surface for app code.
 */

import CustomListItemText from '@/theme/theme-elements/forms/CustomListItemText';
import type { ListItemTextProps } from '@mui/material';

export function ListItemText( props: ListItemTextProps )
{
    return <CustomListItemText {...props} />;
}

export type { ListItemTextProps };
