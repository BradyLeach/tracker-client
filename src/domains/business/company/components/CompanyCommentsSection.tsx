/**
 * CompanyCommentsSection
 *
 * The profile's view of the conversation. The thread itself owns ordering and
 * paging; this component supplies the section chrome and the control that hands
 * the conversation to the side panel.
 */

import { useTranslation } from 'react-i18next';
import { IconButton, Tooltip } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { ProfileSection } from '@/components/container/ProfileSection';
import { CommentThread } from '@/components/shared/comments';
import { useCompanyComments } from '../hooks/useCompanyComments';

export interface CompanyCommentsSectionProps
{
    companyId: string;
    /** Shared with the section beside it so the row lines up. */
    bodyHeight?: number;
    /** Opens the conversation in the side panel. Omit to hide the control. */
    onExpand?: () => void;
}

/** Few enough that the section shows whole comments rather than a sliver of one. */
const SECTION_PAGE_SIZE = 3;

export function CompanyCommentsSection( { companyId, bodyHeight, onExpand }: CompanyCommentsSectionProps )
{
    const { t } = useTranslation();

    const { entries, isSubmitting, submit } = useCompanyComments( companyId );

    return (
        <ProfileSection
            title={t( 'pages.company.section.comment' )}
            bodyHeight={bodyHeight}
            action={onExpand && (
                <Tooltip title={t( 'comment.expand' )}>
                    <IconButton size="small" aria-label={t( 'comment.expand' )} onClick={onExpand}>
                        <IconRenderer iconKey="externalLink" size={16} />
                    </IconButton>
                </Tooltip>
            )}
        >
            <CommentThread
                comments={entries}
                isSubmitting={isSubmitting}
                onSubmit={submit}
                pageSize={SECTION_PAGE_SIZE}
                compact
            />
        </ProfileSection>
    );
}

export default CompanyCommentsSection;
