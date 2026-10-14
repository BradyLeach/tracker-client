/**
 * PlaygroundDataPreview
 *
 * Shows the data driving a playground demo beside the rendered output, so a
 * developer can see the shape a component expects without opening the file.
 *
 * Only the box is shared — each playground supplies its own fixtures, since
 * seeing the real config next to the real output is the point of a tab.
 */

import type { ReactNode } from 'react';
import { Box, Typography } from '@/components/ui';

export interface PlaygroundDataPreviewProps
{
    /** What the JSON represents, e.g. "CommentEntry[]". */
    title: string;
    /** Serialised as formatted JSON. */
    data: unknown;
    /** Extra note under the heading. */
    caption?: ReactNode;
    maxHeight?: number;
}

export function PlaygroundDataPreview( {
    title,
    data,
    caption,
    maxHeight = 320,
}: PlaygroundDataPreviewProps )
{
    return (
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'border.base' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ textTransform: 'none' }}>
                {title}
            </Typography>

            {caption && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    {caption}
                </Typography>
            )}

            <Box
                component="pre"
                sx={{
                    // Theme tokens, not grey.100 — a fixed light grey is
                    // unreadable in dark mode.
                    fontSize: 11,
                    fontFamily: theme => theme.typography.fontFamilyMono,
                    backgroundColor: 'background.sunk',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'border.base',
                    p: 2,
                    m: 0,
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight,
                }}
            >
                {JSON.stringify( data, null, 2 )}
            </Box>
        </Box>
    );
}

export default PlaygroundDataPreview;
