/**
 * CompanyHeader
 *
 * A company name and its partnership type badges, for grouped table parent
 * rows. Card presentation comes from the collection's column config, not here.
 */

import { useTranslation } from 'react-i18next';
import { Box } from '@/components/ui/layout';
import { Badge } from '@/components/ui/data-display/Badge';
import { Chip } from '@/components/ui/data-display/Chip';
import { IconButton } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { stateRegistry } from '@/core/models/StateRegistry';
import { typeRegistry } from '@/core/models/TypeRegistry';
import { isActiveStateCategory } from '@/config/stateCategory.config';
import type { Company } from '../types/company.types';
import type { Partnership } from '../../partnership';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompanyHeaderProps
{
    /** Hydrated company — may be undefined if relation not yet loaded. */
    company: Company | undefined;
    /** Fallback display name when company is not hydrated. */
    label: string;
    /** All partnerships belonging to this company group. */
    partnerships: Partnership[];
    /** Horizontal/compact. The only layout this renders. */
    variant: 'row';
    /** Called when the user clicks the edit button (row variant only). */
    onEdit?: ( company: Company ) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BadgesProps { partnerships: Partnership[]; justify?: 'flex-start' | 'center' }

export function PartnershipTypeBadges( { partnerships, justify = 'flex-start' }: BadgesProps )
{
    const { t } = useTranslation();

    const byType = partnerships.reduce<Map<string, { count: number; isActive: boolean }>>(
        ( accumulator, partnership ) =>
        {
            const state = stateRegistry.getState( partnership.currentStateGraphStateId ?? '' );
            const isActive = isActiveStateCategory( state?.stateCategory?.name );
            const typeLabel = typeRegistry.getLabel( partnership.partnershipTypeId ) ?? '';
            const existing = accumulator.get( typeLabel );

            accumulator.set( typeLabel, {
                count: ( existing?.count ?? 0 ) + 1,
                isActive: ( existing?.isActive ?? false ) || isActive,
            } );

            return accumulator;
        },
        new Map()
    );

    return (
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: justify }}>
            {Array.from( byType.entries() ).map( ( [typeLabel, { count, isActive }] ) => (
                <Badge
                    key={typeLabel}
                    badgeContent={count > 1 ? count : 0}
                    color="primary"
                    sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}
                >
                    <Chip
                        label={t( `types.partnershipType.${typeLabel}` )}
                        size="medium"
                        variant="outlined"
                        sx={{
                            height: 'auto',
                            borderRadius: '4px',
                            fontSize: '0.6875rem',
                            fontWeight: 500,
                            color: isActive ? "graphite" : "tag.inactiveText",
                            borderColor: isActive ? "graphite" : "border.base",
                            '& .MuiChip-label': { padding: '2.5px 8px' },
                        }}
                    />
                </Badge>
            ) )}
        </Box>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CompanyHeader( { company, label, partnerships, onEdit }: CompanyHeaderProps )
{
    const displayName = company?.name ?? label;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1.25,
                px: 2,
                flex: 1,
                '&:hover .company-edit-btn': { opacity: 1 },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{displayName}</Box>
                    {onEdit && company && (
                        <IconButton
                            className="company-edit-btn"
                            size="small"
                            onClick={( event ) => { event.stopPropagation(); onEdit( company ); }}
                            sx={{ opacity: 0, transition: 'opacity 0.15s ease', width: 28, height: 28, color: 'text.primary', '&:hover': { backgroundColor: 'transparent', color: 'primary.main' } }}
                        >
                            <IconRenderer iconKey="edit" width={16} stroke={2.5} />
                        </IconButton>
                    )}
                </Box>
                <PartnershipTypeBadges partnerships={partnerships} />
            </Box>
        </Box>
    );
}
