/**
 * PartnershipCard
 *
 * One partnership, wherever a partnership is shown: the child row inside
 * GroupedDataTable, and the profile's Partners section. `surface` is the only
 * thing that changes between them — the behaviour travels with the card, so no
 * placement has to rebuild it.
 *
 * Animates the rating from 0 to the actual score on mount.
 * Fires on each expand because Collapse unmounts on close.
 *
 * State control:
 * - Desktop: click StatusChip → Menu listing all states (greyed if no transition)
 * - Mobile: Swipeable wrapper wired to goForward / goBack
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Swipeable, Menu, MenuItem, IconButton } from '@/components/ui';
import { Typography } from '@/components/ui/typography';
import { AnimatedRating } from '@/components/ui/data-display/AnimatedRating';
import { IconRenderer } from '@/components/ui/icons/Icon';
import type { IconKey } from '@/components/ui';
import { StatusChip, StateSplitButton } from '@/components/shared/status';
import { useRealtimeAnimation } from '@/components/shared/realtime';
import { stateRegistry } from '@/core/models/StateRegistry';
import { typeRegistry } from '@/core/models/TypeRegistry';
import { usePartnershipStateControl } from '../hooks/usePartnershipStateControl';
import type { Partnership } from '../types/partnership.types';

/**
 * Where the card is sitting.
 *
 * `tableRow` — a child row in GroupedDataTable: table chrome, two columns.
 * `panel`    — a narrow column such as a ProfileSection or side panel: no
 *              chrome of its own, one column whatever the viewport, and a rule
 *              between siblings. Container width, not viewport width, decides
 *              here, so the breakpoint grid cannot answer it.
 */
export type PartnershipCardSurface = 'tableRow' | 'panel';

export interface PartnershipCardProps
{
    partnership: Partnership;
    onEdit?: ( partnership: Partnership ) => void;
    surface?: PartnershipCardSurface;
    /** Changes each time the partnership changes in realtime, running the trace once. */
    changeNonce?: number;
}

const SURFACE_SX = {
    tableRow: {
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        gap: 3,
        p: 2,
        borderRadius: 0,
        bgcolor: 'groupedTable.childRowBg',
        borderTop: '1px solid',
        borderColor: 'groupedTable.border',
        '&:hover': { bgcolor: 'groupedTable.rowHoverBg' },
    },
    panel: {
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 1,
        px: 2.5,
        py: 1.25,
        borderRadius: 0,
        bgcolor: 'transparent',
        '&:hover': { bgcolor: 'action.hover' },
        '&:not(:last-of-type)': { borderBottom: '1px solid', borderColor: 'border.base' },
    },
} as const;

export function PartnershipCard( { partnership, onEdit, surface = 'tableRow', changeNonce }: PartnershipCardProps )
{
    const { t } = useTranslation();
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>( null );
    const traceClass = useRealtimeAnimation( changeNonce );
    const stateControl = usePartnershipStateControl( partnership );

    const state = stateRegistry.getState( partnership.currentStateGraphStateId ?? '' );

    const handleChipClick = ( event: React.MouseEvent<HTMLElement> ) =>
    {
        event.stopPropagation();
        if( stateControl && stateControl.availableTransitions.length > 0 ) setMenuAnchor( event.currentTarget );
    };

    const handleMenuClose = () => setMenuAnchor( null );

    const handleStateSelect = async ( targetStateId: string ) =>
    {
        handleMenuClose();
        await stateControl?.transitionTo( targetStateId );
    };

    // The pieces are built once and arranged per surface below, so the two
    // placements cannot drift into two cards.

    const name = (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Typography variant="body1" noWrap sx={{ fontWeight: 600 }}>
                {partnership.contactName}
            </Typography>
            {onEdit && (
                <IconButton
                    className="partnership-edit-btn"
                    size="small"
                    onClick={( event ) => { event.stopPropagation(); onEdit( partnership ); }}
                    sx={{
                        opacity: 0,
                        transition: 'opacity 0.15s ease',
                        width: 28,
                        height: 28,
                        color: 'text.primary',
                        '&:hover': { backgroundColor: 'transparent', color: 'primary.main' },
                    }}
                >
                    <IconRenderer iconKey="edit" width={16} stroke={2.5} />
                </IconButton>
            )}
        </Box>
    );

    const stateElement = stateControl && stateControl.availableTransitions.length > 0
        ? (
            <StateSplitButton
                stateName={state && t( `states.${state.label}` )}
                stateCategoryColour={state?.stateCategory?.color}
                onClick={handleChipClick}
                disabled={stateControl.isPending}
            />
        )
        : (
            <StatusChip
                stateName={state && t( `states.${state.label}` )}
                stateCategoryColour={state?.stateCategory?.color}
            />
        );

    // A data-driven name (a type's icon) shows nothing when absent, rather than the default icon.
    const contactLine = ( icon: { iconKey?: IconKey; iconName?: string }, value: string | undefined ) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Box sx={{ color: 'text.disabled', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <IconRenderer
                    iconKey={icon.iconKey}
                    iconName={icon.iconName}
                    fallback={icon.iconKey ? undefined : null}
                    width={14}
                />
            </Box>
            <Typography
                className="ps-dim"
                variant="body2"
                color="text.secondary"
                noWrap
            >
                {value || '~'}
            </Typography>
        </Box>
    );

    const partnershipType = typeRegistry.getById( partnership.partnershipTypeId );
    const type = contactLine(
        { iconName: partnershipType?.icon },
        t( `types.partnershipType.${partnershipType?.label}` ),
    );

    const rating = <AnimatedRating value={partnership.rating ?? 0} max={5} readOnly size="small" />;

    // The whole card opens edit, so touch users are not left relying on the hover-only pencil.
    const handleCardClick = onEdit ? () => onEdit( partnership ) : undefined;

    const surfaceSx = {
        display: 'grid',
        ...SURFACE_SX[surface],
        cursor: onEdit ? 'pointer' : 'default',
        transition: 'background-color 0.15s ease',
        '& .ps-dim': { transition: 'color 0.15s ease' },
        '&:hover .ps-dim': { color: 'text.primary' },
        '&:hover .partnership-edit-btn': { opacity: 1 },
    };

    // Panel — two lines (name and rating, then type and contacts) with the state centred beside them.
    const cardContent = surface === 'panel'
        ? (
            <Box className={traceClass} sx={surfaceSx} onClick={handleCardClick}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flexWrap: 'wrap' }}>
                        {name}
                        {rating}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', columnGap: 1.5, rowGap: 0.5, flexWrap: 'wrap' }}>
                        {type}
                        {contactLine( { iconKey: 'phone' }, partnership.contactPhone )}
                        {contactLine( { iconKey: 'mail' }, partnership.contactEmail )}
                    </Box>
                </Box>

                <Box sx={{ flexShrink: 0 }}>{stateElement}</Box>
            </Box>
        )
        : (
            <Box className={traceClass} sx={surfaceSx} onClick={handleCardClick}>
                {/* Left column — contact name, type, state */}
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {name}
                        {type}
                    </Box>
                    {stateElement}
                </Box>

                {/* Right column — contact details, rating */}
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {contactLine( { iconKey: 'mail' }, partnership.contactEmail )}
                        {contactLine( { iconKey: 'phone' }, partnership.contactPhone )}
                    </Box>
                    <Box sx={{ pb: 0.5 }}>{rating}</Box>
                </Box>
            </Box>
        );

    return (
        <>
            <Swipeable
                onSwipeRight={stateControl?.canGoBack ? stateControl.goBack : undefined}
                onSwipeLeft={stateControl?.canGoForward ? stateControl.goForward : undefined}
                disabled={!stateControl || stateControl.isPending}
            >
                {cardContent}
            </Swipeable>

            {stateControl && (
                <Menu
                    anchorEl={menuAnchor}
                    open={menuAnchor !== null}
                    onClose={handleMenuClose}
                >
                    {stateControl.availableTransitions.map( ( { transition, targetStateNode } ) => (
                        <MenuItem
                            key={transition.id}
                            onClick={() => handleStateSelect( targetStateNode.id )}
                        >
                            <Box
                                sx={{ display: 'grid', gridTemplateColumns: '1fr 28px 96px', alignItems: 'center', width: '100%' }}
                            >
                                <Typography variant="body2" sx={{ textAlign: 'right', pr: 1 }}>{t( `transitions.${transition.label}` )}</Typography>
                                <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center' }}>→</Typography>
                                <StatusChip
                                    stateName={targetStateNode.state && t( `states.${targetStateNode.state.label}` )}
                                    stateCategoryColour={targetStateNode.state?.stateCategory?.color}
                                />
                            </Box>
                        </MenuItem>
                    ) )}
                </Menu>
            )}
        </>
    );
}
