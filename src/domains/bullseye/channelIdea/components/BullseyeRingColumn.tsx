/**
 * BullseyeRingColumn
 *
 * One ring of the Bullseye board and its ideas. Each idea names its channel and can move
 * one ring in or out, which is the board's whole workflow; editing and deleting are on
 * the idea itself.
 */

import { useTranslation } from 'react-i18next';
import { Box, Button, IconButton, IconRenderer, Tooltip, Typography } from '@/components/ui';
import { ProfileSection } from '@/components/container/ProfileSection';
import type { TypeCatalogue } from '@/domains/system';
import type { IconKey } from '@/components/ui';
import { adjacentRings } from '../orchestrators/bullseye.orchestrator';
import type { BullseyeRing, ChannelIdea } from '../types/channelIdea.types';

export interface BullseyeRingColumnProps
{
    ring: BullseyeRing;
    ideas: ChannelIdea[];
    catalogue: TypeCatalogue;
    /** The idea being moved, so its buttons wait for the move to land. */
    movingId?: string;
    onMove: ( idea: ChannelIdea, ring: BullseyeRing ) => void;
    onEdit: ( idea: ChannelIdea ) => void;
    onDelete: ( idea: ChannelIdea ) => void;
}

export function BullseyeRingColumn( { ring, ideas, catalogue, movingId, onMove, onEdit, onDelete }: BullseyeRingColumnProps )
{
    const { t } = useTranslation();

    return (
        <ProfileSection title={t( `pages.bullseye.rings.${ring}` )}>
            {ideas.length === 0 && (
                <Typography variant="body2" color="text.secondary">{t( 'pages.bullseye.emptyRing' )}</Typography>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {ideas.map( idea =>
                {
                    const channel = catalogue.getById( idea.channelId );

                    return (
                        <Box key={idea.id} sx={{ border: '1px solid', borderColor: 'border.base', borderRadius: 1, p: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                {channel?.icon && <IconRenderer iconKey={channel.icon as IconKey} size={18} />}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2">{idea.title}</Typography>
                                    {channel && (
                                        <Typography variant="caption" color="text.secondary">
                                            {t( `types.channel.${channel.label}` )}
                                        </Typography>
                                    )}
                                </Box>
                                <Tooltip title={t( 'shared.buttons.edit' )}>
                                    <IconButton
                                        size="small"
                                        aria-label={t( 'shared.buttons.edit' )}
                                        onClick={() => onEdit( idea )}
                                    >
                                        <IconRenderer iconKey="edit" size={14} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t( 'shared.buttons.delete' )}>
                                    <IconButton
                                        size="small"
                                        aria-label={t( 'shared.buttons.delete' )}
                                        onClick={() => onDelete( idea )}
                                    >
                                        <IconRenderer iconKey="trash" size={14} />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {idea.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                    {idea.description}
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                {adjacentRings( ring ).map( next => (
                                    <Button
                                        key={next}
                                        size="small"
                                        variant="text"
                                        disabled={movingId === idea.id}
                                        onClick={() => onMove( idea, next )}
                                    >
                                        {t( 'pages.bullseye.moveTo', { ring: t( `forms.channelIdea.options.${next}` ) } )}
                                    </Button>
                                ) )}
                            </Box>
                        </Box>
                    );
                } )}
            </Box>
        </ProfileSection>
    );
}
