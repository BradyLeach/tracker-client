/**
 * CompanyCommentsPanel
 *
 * The conversation as a workspace: the panel body a `SidePanel` fills, so the
 * profile beside it stays readable and interactive while a comment is written.
 *
 * The same `CommentThread` the section shows, given the panel's full height —
 * the thread scrolls here, not the page.
 */

import { Box } from '@/components/ui';
import { DetailPanelHeader } from '@/components/container/DetailPanelHeader';
import { CommentThread } from '@/components/shared/comments';
import { useCompanyComments } from '../hooks/useCompanyComments';

export interface CompanyCommentsPanelProps
{
    companyId: string;
    /** Shown in the panel header, e.g. the company's name. */
    title: string;
    onClose: () => void;
}

/** Comments per page here, where the panel has room for more than a section. */
const PANEL_PAGE_SIZE = 15;

export function CompanyCommentsPanel( { companyId, title, onClose }: CompanyCommentsPanelProps )
{
    const { entries, isSubmitting, submit } = useCompanyComments( companyId );

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <DetailPanelHeader iconKey="comment" title={title} onClose={onClose} />

            {/* minHeight:0 so the thread's own scroll region resolves against
                the panel rather than growing past it. */}
            <Box sx={{ flex: 1, minHeight: 0, px: 2, py: 2 }}>
                <CommentThread
                    comments={entries}
                    isSubmitting={isSubmitting}
                    onSubmit={submit}
                    pageSize={PANEL_PAGE_SIZE}
                />
            </Box>
        </Box>
    );
}

export default CompanyCommentsPanel;
