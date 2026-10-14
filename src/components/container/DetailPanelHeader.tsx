/**
 * DetailPanelHeader
 *
 * The fixed top row of a detail panel, in two zones: what you selected and the
 * action on it, then what you can do with the panel — open it as a full page,
 * act on the record through the menu, or close it.
 *
 * Single line, always. The row already competes for width with two controls,
 * so there is no subtitle — a second line belongs in the panel body.
 *
 * Domain-agnostic on purpose. Every collection page follows the same flow —
 * list, select, peek in a panel, open in full — so the header is one component
 * and the domain only varies the `iconKey`.
 *
 * It renders no record detail. The panel's body is a separate component:
 *
 *     <DetailPanelHeader />
 *     <CompanyDetail />
 *
 * @example
 * ```tsx
 * <SidePanel side="right" open={!!selected} onClose={clear}>
 *     <DetailPanelHeader
 *         iconKey="building"
 *         title={selected.name}
 *         onEdit={() => setEditing( selected )}
 *         onExpand={() => navigate(`/companies/${selected.id}`)}
 *         onClose={clear}
 *     />
 *     <CompanyDetail company={selected} />
 * </SidePanel>
 * ```
 */

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, IconButton, Tooltip, Typography } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { getInitials } from '@/core/utils';

export interface DetailPanelHeaderProps
{
    /** Record-type icon. Varies per domain — 'building', 'package', 'flask'. */
    iconKey?: string;
    /** Record name. Also the tile's initials fallback when no icon resolves. */
    title: string;
    /**
     * Opens the record for editing. Omit to hide the control.
     *
     * Sits with the identity rather than the panel controls: it acts on the
     * record, where expand, more and close act on the panel.
     */
    onEdit?: () => void;
    /** Opens the record as a full page. Omit to hide the control. */
    onExpand?: () => void;
    /** Dismisses the panel. Omit to hide the control. */
    onClose?: () => void;
    /** Secondary record actions, placed between expand and close. */
    actions?: ReactNode;
}

export function DetailPanelHeader( {
    iconKey,
    title,
    onEdit,
    onExpand,
    onClose,
    actions,
}: DetailPanelHeaderProps )
{
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.5,
                flexShrink: 0,
                borderBottom: '1px solid',
                borderColor: 'border.base',
            }}
        >
            <Avatar
                variant="rounded"
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '6px',
                    flexShrink: 0,
                    userSelect: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: 'iconTile.bg',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'border.faint',
                }}
            >
                <IconRenderer iconName={iconKey} fallback={getInitials( title )} size={17} />
            </Avatar>

            {/* minWidth:0 so a long name truncates instead of pushing the
                controls off the panel. */}
            <Typography
                variant="subtitle2"
                noWrap
                title={title}
                sx={{ minWidth: 0, textTransform: 'none' }}
            >
                {title}
            </Typography>

            {onEdit && (
                <Tooltip title={t( 'shared.buttons.edit' )}>
                    <IconButton
                        size="small"
                        aria-label={t( 'shared.buttons.edit' )}
                        onClick={onEdit}
                    >
                        <IconRenderer iconKey="edit" size={16} />
                    </IconButton>
                </Tooltip>
            )}

            {/* Separates what acts on the record from what acts on the panel. */}
            <Box sx={{ flex: 1, minWidth: 0 }} />

            {onExpand && (
                <Tooltip title={t( 'shared.buttons.openFullPage' )}>
                    <IconButton
                        size="small"
                        aria-label={t( 'shared.buttons.openFullPage' )}
                        onClick={onExpand}
                    >
                        <IconRenderer iconKey="externalLink" size={16} />
                    </IconButton>
                </Tooltip>
            )}

            {actions}

            {onClose && (
                <Tooltip title={t( 'shared.buttons.close' )}>
                    <IconButton
                        size="small"
                        aria-label={t( 'shared.buttons.close' )}
                        onClick={onClose}
                    >
                        <IconRenderer iconKey="xFilled" size={16} />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
}

export default DetailPanelHeader;
