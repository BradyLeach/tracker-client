/**
 * Dialog - App UI layer wrapper
 *
 * Thin wrapper over CustomTransitionDialog from theme-elements.
 * Provides stable import surface for app code.
 */

import { CustomTransitionDialog, type CustomTransitionDialogProps } from '@/theme/theme-elements/surfaces/CustomTransitionDialog';

export function Dialog( props: CustomTransitionDialogProps )
{
    return <CustomTransitionDialog {...props} />;
}

export type { CustomTransitionDialogProps as DialogProps };
