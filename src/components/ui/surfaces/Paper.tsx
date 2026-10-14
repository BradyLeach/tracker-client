/**
 * Paper - App UI layer wrapper
 *
 * Thin wrapper over CustomPaper.
 * Provides stable import surface for app code.
 */

import CustomPaper from '@/theme/theme-elements/surfaces/CustomPaper';
import type { PaperProps } from '@mui/material';

export function Paper( props: PaperProps )
{
    return <CustomPaper {...props} />;
}

export type { PaperProps };
