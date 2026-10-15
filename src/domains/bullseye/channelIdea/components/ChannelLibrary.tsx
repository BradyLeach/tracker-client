/**
 * ChannelLibrary
 *
 * All nineteen traction channels from the channel catalogue, each with what it covers
 * and how many ideas the board already holds for it — so a channel nobody has considered
 * stands out. Adding an idea from here starts it on that channel, in the outer ring.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Chip, IconRenderer, Typography } from '@/components/ui';
import type { IconKey } from '@/components/ui';
import type { TypeCatalogue } from '@/domains/system';

export interface ChannelLibraryProps
{
    catalogue: TypeCatalogue;
    ideaCounts: Map<string, number>;
    onAddIdea: ( channelId: string ) => void;
}

const CARD_COLUMNS = 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))';

export function ChannelLibrary( { catalogue, ideaCounts, onAddIdea }: ChannelLibraryProps )
{
    const { t } = useTranslation();

    const channels = useMemo(
        () => catalogue.getByModel( 'channel' )
            .map( channel => ( { ...channel, name: t( `types.channel.${channel.label}` ) } ) )
            .sort( ( first, second ) => first.name.localeCompare( second.name ) ),
        [catalogue, t],
    );

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: CARD_COLUMNS, gap: 2 }}>
            {channels.map( channel => (
                <Box
                    key={channel.id}
                    sx={{
                        display: 'flex', flexDirection: 'column', gap: 1, p: 2,
                        border: '1px solid', borderColor: 'border.base', borderRadius: 1, backgroundColor: 'background.paper',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {channel.icon && <IconRenderer iconKey={channel.icon as IconKey} size={20} />}
                        <Typography variant="subtitle1" sx={{ flex: 1 }}>{channel.name}</Typography>
                        <Chip size="small" label={ideaCounts.get( channel.id ) ?? 0} />
                    </Box>
                    {channel.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{channel.description}</Typography>
                    )}
                    <Box>
                        <Button size="small" variant="text" onClick={() => onAddIdea( channel.id )}>
                            {t( 'pages.bullseye.addButton' )}
                        </Button>
                    </Box>
                </Box>
            ) )}
        </Box>
    );
}
