/**
 * ProfileSection
 *
 * One block of a profile page: a titled region with an optional trailing
 * action and an optional footer for its own pagination.
 *
 * Every section on a profile uses it, so headings, spacing and surfaces cannot
 * drift between them. A section is self-contained by design — paging one must
 * not lengthen or reflow the page around it.
 *
 * @example
 * ```tsx
 * <ProfileSection title="Orders" action={<Link>View all</Link>} footer={<CollectionPagination … />}>
 *     <DataTable … />
 * </ProfileSection>
 * ```
 */

import type { ReactNode } from 'react';
import { Box, Typography } from '@/components/ui';

/**
 * Fixed chrome heights.
 *
 * A header holding a filter control is taller than a plain one, and a
 * pagination footer is taller than a caption. Left to content, sections that
 * should sit on one grid end at different heights.
 */
const HEADER_HEIGHT = 56;
const FOOTER_HEIGHT = 48;

/**
 * For a section without a footer sharing a row with one that has it: its body
 * has to make up the difference, or the two end at different points.
 */
export const PROFILE_SECTION_FOOTER_HEIGHT = FOOTER_HEIGHT;

export interface ProfileSectionProps
{
    /** Already translated. */
    title: string;
    /** Trailing control, e.g. "View all". */
    action?: ReactNode;
    /** Pagination or a summary, separated from the body. */
    footer?: ReactNode;
    /** Removes body padding, for a section whose child owns its own edges. */
    disableBodyPadding?: boolean;
    /**
     * Exact body height. Sections sharing a value sit on one grid, and a short
     * final page cannot shrink the section and jerk the page below it.
     *
     * Exact rather than a minimum: a minimum still lets content nudge the box,
     * which left sections a few pixels apart.
     */
    bodyHeight?: number;
    children: ReactNode;
}

export function ProfileSection( {
    title,
    action,
    footer,
    disableBodyPadding = false,
    bodyHeight,
    children,
}: ProfileSectionProps )
{
    return (
        <Box
            component="section"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                // Height comes from content: a profile is a finite page, not a
                // set of scrolling panes.
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'border.base',
                borderRadius: 1,
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    height: HEADER_HEIGHT,
                    flexShrink: 0,
                    px: 2.5,
                    py: 0.75,
                    // Same one-step surface as the card header, so a section
                    // reads as one object rather than stacked panels.
                    backgroundColor: 'background.sunk',
                }}
            >
                <Typography
                    variant="subtitle2"
                    sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11, color: 'text.secondary' }}
                >
                    {title}
                </Typography>
                {action}
            </Box>

            {/* Fixed, so paging never reflows the page below and sections
                sharing a height line up exactly. */}
            <Box
                sx={{
                    minWidth: 0,
                    // `flex: 1` would set flex-basis to 0 and let the column
                    // decide the height, overriding the fixed value entirely.
                    ...( bodyHeight
                        ? { flex: '0 0 auto', height: bodyHeight, overflow: 'hidden' }
                        : { flex: 1 } ),
                    ...( disableBodyPadding ? {} : { px: 2.5, py: 2 } ),
                }}
            >
                {children}
            </Box>

            {/* Fixed height so a caption footer and a pagination footer leave
                sections the same overall size. Without it, sections sitting
                side by side end at different heights. */}
            {footer && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        height: FOOTER_HEIGHT,
                        flexShrink: 0,
                        px: 2.5,
                        pb: 1.5,
                        pt: 0,
                    }}
                >
                    {footer}
                </Box>
            )}
        </Box>
    );
}

export default ProfileSection;
