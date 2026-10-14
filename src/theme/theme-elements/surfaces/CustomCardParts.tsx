import {
    CardHeader,
    CardContent,
    CardActions,
    type CardHeaderProps,
    type CardContentProps,
    type CardActionsProps,
} from '@mui/material';

/**
 * Card part wrappers - theme-element layer.
 *
 * Passthroughs, so app code can compose MUI's card structure without importing
 * from @mui/material directly.
 */
const CustomCardHeader = ( props: CardHeaderProps ) => <CardHeader {...props} />;
const CustomCardContent = ( props: CardContentProps ) => <CardContent {...props} />;
const CustomCardActions = ( props: CardActionsProps ) => <CardActions {...props} />;

export { CustomCardHeader, CustomCardContent, CustomCardActions };
export type { CardHeaderProps, CardContentProps, CardActionsProps };
