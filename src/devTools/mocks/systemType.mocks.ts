/**
 * System type mock data
 *
 * Catalogs for playgrounds that resolve `...TypeId` fields, and a catalogue
 * over them. Labels are real i18n keys, so options translate as they do in the
 * app. Lives in devTools — not domain code, not used in production.
 */

import type { SystemType, SystemTypeModel, TypeCatalogue } from '@/domains/system';

/** A catalogue over the given catalogs, answering the same contract as the live one. */
export function createMockTypeCatalogue( catalogs: Partial<Record<SystemTypeModel, SystemType[]>> ): TypeCatalogue
{
    const entries = Object.entries( catalogs ) as [SystemTypeModel, SystemType[]][];
    const byId = new Map( entries.flatMap( ( [, types] ) => types.map( type => [type.id, type] as const ) ) );

    return {
        getById: typeId => typeId ? byId.get( typeId ) : undefined,
        getLabel: typeId => typeId ? byId.get( typeId )?.label : undefined,
        getByModel: model => catalogs[model] ?? [],
        getId: ( model, label ) => catalogs[model]?.find( type => type.label === label )?.id,
    };
}
