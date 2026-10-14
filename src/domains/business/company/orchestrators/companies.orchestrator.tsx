/**
 * companies.orchestrator
 *
 * Supplies renderers for the company columns whose value is derived from the
 * company's partnerships rather than stored on the company itself.
 *
 * Both renderers delegate to what the grouped table already used —
 * `PartnershipTypeBadges` for the types and `isPartnershipGroupActive` for the
 * rollup — so there is one implementation of each, not two.
 *
 * Kept out of buildCompaniesTableConfig so that file stays declarative and
 * JSX-free, matching the partnerships orchestrator.
 *
 * @example
 * ```tsx
 * const config = withCompanyCellRenderers( buildCompaniesTableConfig(), partnerships );
 * ```
 */

import i18n from 'i18next';
import { typeRegistry } from '@/core/models/TypeRegistry';
import { buildTypeFacet } from '@/core/collection';
import { StatusChip } from '@/components/shared/status';
import { PartnershipTypeBadges } from '../components/CompanyHeader';
import { isPartnershipGroupActive } from '../../partnership/orchestrators/partnerships.orchestrator';
import type { CollectionFilter } from '@/core/collection';
import type { CollectionFilterOption } from '@/components/collection';
import type { TypeCatalogue } from '@/domains/system';
import type { TableConfig } from '@/components/tables';
import type { Company } from '../types/company.types';
import type { Partnership } from '../../partnership';

/**
 * Partnerships grouped by the company they belong to.
 *
 * One pass, built by the page and handed to everything that needs it — the
 * filters close over it and the cell renderers read it, so the same index
 * answers both rather than each building its own.
 */
export function indexPartnershipsByCompany( partnerships: readonly Partnership[] ): Map<string, Partnership[]>
{
    const byCompany = new Map<string, Partnership[]>();

    for( const partnership of partnerships )
    {
        const key = partnership.companyId ?? '';
        const existing = byCompany.get( key );
        if( existing ) existing.push( partnership );
        else byCompany.set( key, [partnership] );
    }

    return byCompany;
}

/**
 * Both filters are derived from partnership data, so their predicates close
 * over the lookup above rather than reading anything off the company.
 *
 * Each is a facet: ticking Active and Inactive means "either", as does
 * ticking two types. Ungrouped they would intersect and return nothing.
 *
 * Type options come from the partnerships actually loaded, so the menu
 * never offers a type that would empty the list.
 */
export function buildCompanyFilters(
    partnerships: readonly Partnership[],
    partnershipsByCompany: Map<string, Partnership[]>,
    catalogue: TypeCatalogue,
): { filters: CollectionFilter<Company>[]; filterOptions: CollectionFilterOption[] }
{
    const isActive = ( company: Company ) =>
        isPartnershipGroupActive( partnershipsByCompany.get( company.id ) ?? [] );

    const statusFilters: CollectionFilter<Company>[] = [
        { key: 'status:active', group: 'status', predicate: isActive },
        { key: 'status:inactive', group: 'status', predicate: company => !isActive( company ) },
    ];

    const statusOptions: CollectionFilterOption[] = [
        { key: 'status:active', label: 'shared.status.active' },
        { key: 'status:inactive', label: 'shared.status.inactive' },
    ];

    // A company has no type of its own: it matches through the partnerships
    // it holds, which is the only part of the facet that differs here.
    const typeFacet = buildTypeFacet<Company>( {
        model: 'partnershipType',
        presentIds: partnerships.map( row => row.partnershipTypeId ),
        matches: ( company, typeId ) =>
            ( partnershipsByCompany.get( company.id ) ?? [] )
                .some( partnership => partnership.partnershipTypeId === typeId ),
        catalogue,
    } );

    return {
        filters: [...statusFilters, ...typeFacet.filters],
        filterOptions: [...statusOptions, ...typeFacet.options],
    };
}

/** Website without the scheme — noise at this size. */
export function displayHost( url: string ): string
{
    return url.replace( /^https?:\/\//, '' ).replace( /\/$/, '' );
}

/** Tax identifier led by its type, e.g. "ABN 11 000 000 001". */
export function displayTaxIdentifier( company: Company ): string | undefined
{
    if( !company.taxIdentifier ) return undefined;

    return [company.taxIdentifierType?.toUpperCase(), company.taxIdentifier].filter( Boolean ).join( ' ' );
}

/**
 * Attaches renderers for the derived columns.
 *
 * Takes the index rather than the raw list: the page already holds one for its
 * filters, and the columns do not depend on how the backend shapes the
 * company's own association.
 */
export function withCompanyCellRenderers(
    config: TableConfig<Company>,
    partnershipsByCompany: Map<string, Partnership[]>,
): TableConfig<Company>
{
    const forCompany = ( company: Company ) => partnershipsByCompany.get( company.id ) ?? [];

    return {
        ...config,
        columns: config.columns.map( column =>
        {
            // Presented as the profile header presents them, so a company reads the same everywhere.
            if( column.key === 'websiteUrl' )
            {
                return { ...column, render: ( company: Company ) => company.websiteUrl ? displayHost( company.websiteUrl ) : '—' };
            }

            if( column.key === 'taxIdentifier' )
            {
                return { ...column, render: ( company: Company ) => displayTaxIdentifier( company ) ?? '—' };
            }

            if( column.key === 'partnershipTypes' )
            {
                return {
                    ...column,
                    render: ( company: Company ) =>
                        <PartnershipTypeBadges partnerships={forCompany( company )} />,
                    // Derived from the partnerships, so there is no stored value for
                    // the search to read. The labels shown are what it reads instead.
                    searchValue: ( company: Company ) => forCompany( company )
                        .map( partnership => typeRegistry.getLabel( partnership.partnershipTypeId ) )
                        .filter( Boolean )
                        .map( label => i18n.t( `types.partnershipType.${label}` ) )
                        .join( ' ' ),
                };
            }

            if( column.key === 'aggregateStatus' )
            {
                return {
                    ...column,
                    render: ( company: Company ) =>
                    {
                        const active = isPartnershipGroupActive( forCompany( company ) );
                        return (
                            <StatusChip
                                stateName={i18n.t( active ? 'shared.status.active' : 'shared.status.inactive' )}
                                stateCategoryColour={active ? 'active' : 'muted'}
                                size="small"
                                variant="outlined"
                            />
                        );
                    },
                    searchValue: ( company: Company ) => i18n.t(
                        isPartnershipGroupActive( forCompany( company ) )
                            ? 'shared.status.active'
                            : 'shared.status.inactive'
                    ),
                };
            }

            return column;
        } ),
    };
}
