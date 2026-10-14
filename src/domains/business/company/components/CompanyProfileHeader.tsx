/**
 * CompanyProfileHeader
 *
 * Identity at the top of the profile: who the company is and, in one line,
 * what our relationship with them currently is.
 *
 * Compact by design — no hero banner. The page's value is the sections below,
 * so the header states the facts and gets out of the way.
 */

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Avatar, Box, Divider, IconButton, IconRenderer, Menu, MenuItem, Tooltip, Typography } from '@/components/ui';
import { isActiveStateCategory } from '@/config/stateCategory.config';
import { displayHost, displayTaxIdentifier } from '../orchestrators/companies.orchestrator';
import { getInitials } from '@/core/utils';
import { stateRegistry } from '@/core/models/StateRegistry';
import type { Company } from '../types/company.types';
import type { Partnership } from '../../partnership/types/partnership.types';

export interface CompanyProfileHeaderProps
{
    company: Company;
    partnerships: Partnership[];
    /** Opens the company edit dialog. */
    onEdit?: ( company: Company ) => void;
    /** Moves the company to the trash. */
    onDelete?: ( company: Company ) => void;
    /** Restores a trashed company. Placeholder until the trash view exists. */
    onRestore?: ( company: Company ) => void;
    /** Opens the trash. Placeholder until the trash view exists. */
    onViewTrash?: ( company: Company ) => void;
}

export function CompanyProfileHeader( { company, partnerships, onEdit, onDelete, onRestore, onViewTrash }: CompanyProfileHeaderProps )
{
    const { t } = useTranslation();
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>( null );

    const closeMenu = () => setMenuAnchor( null );

    const runAndClose = ( action: ( company: Company ) => void ) => () =>
    {
        closeMenu();
        action( company );
    };

    const isActive = partnerships.some( partnership =>
    {
        const state = stateRegistry.getState( partnership.currentStateGraphStateId ?? '' );
        return isActiveStateCategory( state?.stateCategory?.name );
    } );

    // The same tokens the state chips use, so the relationship reads the same colour
    // wherever it appears — here as a ring, elsewhere as a chip.
    const relationship = isActive
        ? { colour: 'info', label: t( 'shared.status.active' ) }
        : { colour: 'muted', label: t( 'shared.status.inactive' ) };

    // Built as a list and filtered, rather than joined blind — a missing tax
    // identifier previously left a dangling separator.
    const facts = [
        company.websiteUrl ? displayHost( company.websiteUrl ) : undefined,
        displayTaxIdentifier( company ),
    ].filter( ( fact ): fact is string => !!fact && fact.trim().length > 0 );

    return (
        <Box
            component="header"
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                px: 2.5,
                py: 2.5,
                backgroundColor: 'background.sunk',
                border: '1px solid',
                borderColor: 'border.base',
                borderRadius: 1,
            }}
        >
            {/* Hidden on phones: the tile is decoration, and the name it sits
                beside is what gets truncated to make room for it.

                The relationship state rings the tile rather than occupying the action
                corner. It is context for the identity, not something you act on, and a
                tooltip keeps it explicit for anyone who reads the ring as decoration. */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Tooltip title={t( 'pages.company.relationshipStatus', { status: relationship.label } )}>
                    <Box
                        component="span"
                        sx={{
                            display: 'inline-flex',
                            padding: '2px',
                            borderRadius: '9px',
                            border: '2px solid',
                            borderColor: `${relationship.colour}.main`,
                        }}
                    >
                        <Avatar
                            variant="rounded"
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '6px',
                                flexShrink: 0,
                                userSelect: 'none',
                                fontSize: 15,
                                fontWeight: 600,
                                backgroundColor: 'iconTile.bg',
                                color: 'text.secondary',
                                border: '1px solid',
                                borderColor: 'border.faint',
                            }}
                        >
                            <IconRenderer
                                iconName={company.icon ?? 'building'}
                                fallback={getInitials( company.name )}
                                size={21}
                            />
                        </Avatar>
                    </Box>
                </Tooltip>
            </Box>

            {/* minWidth:0 so a long name truncates rather than pushing the
                actions control off the row. */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>

                <Typography
                    variant="h5"
                    noWrap
                    title={company.name}
                    sx={{ fontWeight: 700, textTransform: 'none', lineHeight: 1.2 }}
                >
                    {company.name}
                </Typography>

                {facts.length > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'none' }}>
                        {facts.join( ' · ' )}
                    </Typography>
                )}

            </Box>

            {/* One control, every company action. An Edit button beside a menu that also
                held Edit was the same action in two places; the menu is the single list. */}
            <Box sx={{ flexShrink: 0 }}>
                <IconButton
                    size="small"
                    aria-label={t( 'shared.buttons.moreActions' )}
                    aria-haspopup="true"
                    aria-expanded={menuAnchor ? 'true' : undefined}
                    onClick={( event ) => setMenuAnchor( event.currentTarget )}
                >
                    <IconRenderer iconKey="dotsVertical" size={18} />
                </IconButton>

                <Menu anchorEl={menuAnchor} open={Boolean( menuAnchor )} onClose={closeMenu}>
                    {onEdit && (
                        <MenuItem onClick={runAndClose( onEdit )} sx={{ gap: 1 }}>
                            <IconRenderer iconKey="edit" size={16} />
                            {t( 'pages.company.editButton' )}
                        </MenuItem>
                    )}

                    {onViewTrash && (
                        <MenuItem onClick={runAndClose( onViewTrash )} sx={{ gap: 1 }}>
                            <IconRenderer iconKey="trash" size={16} />
                            {t( 'shared.buttons.viewTrash' )}
                        </MenuItem>
                    )}

                    {onRestore && (
                        <MenuItem onClick={runAndClose( onRestore )} sx={{ gap: 1 }}>
                            <IconRenderer iconKey="restore" size={16} />
                            {t( 'shared.buttons.restore' )}
                        </MenuItem>
                    )}

                    {/* Destructive actions sit below a rule, away from the ones above. */}
                    {onDelete && <Divider />}

                    {onDelete && (
                        <MenuItem onClick={runAndClose( onDelete )} sx={{ color: 'danger.main', gap: 1 }}>
                            <IconRenderer iconKey="trash" size={16} />
                            {t( 'shared.buttons.delete' )}
                        </MenuItem>
                    )}
                </Menu>
            </Box>

        </Box>
    );
}

export default CompanyProfileHeader;
