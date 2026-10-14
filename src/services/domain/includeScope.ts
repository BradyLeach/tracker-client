/**
 * Include Scope
 *
 * Confirms scope at every level of a nested include graph, driven by the requested
 * include paths — not by what the response happens to contain.
 *
 * A flat include like 'partnership' confirms the immediate edge. A dotted path like
 * 'location.locationAddress.address' walks three levels and confirms each one.
 */

import { modelRegistry } from '@/core/models/ModelRegistry';
import { confirm } from './scope';

// <=======================================================================>
// <============================> INCLUDE TREE <===========================>
// <=======================================================================>

export interface IncludeNode
{
    [alias: string]: IncludeNode;
}

/**
 * Parses dot-path include strings into a nested tree.
 *
 * ['location', 'location.locationAddress', 'location.locationAddress.address']
 * → { location: { locationAddress: { address: {} } } }
 */
export function buildIncludeTree( includes: string[] ): IncludeNode
{
    const tree: IncludeNode = {};

    for( const path of includes )
    {
        const segments = path.split( '.' );
        let current = tree;

        for( const segment of segments )
        {
            current[segment] ??= {};
            current = current[segment];
        }
    }

    return tree;
}

// <=======================================================================>
// <========================> RECURSIVE CONFIRMATION <=======================>
// <=======================================================================>

/**
 * Walks the response tree through the requested include paths, confirming scope
 * at each level.
 *
 * hasMany: the parent's children are complete for that parent's foreign key.
 * hasOne: the parent's child is complete for that parent's foreign key.
 * belongsTo: the referenced record is confirmed as present and authoritative.
 *
 * Empty arrays confirm the edge (the server said "none") but do not recurse.
 */
async function confirmLevel(
    records: Record<string, unknown>[],
    modelName: string,
    tree: IncludeNode
): Promise<void>
{
    if( !records.length || !Object.keys( tree ).length ) return;

    const associations = modelRegistry.associations( modelName );

    for( const [alias, subtree] of Object.entries( tree ) )
    {
        const edge = associations[alias];
        if( !edge ) continue;

        if( edge.type === 'hasMany' || edge.type === 'hasOne' )
        {
            // Only confirm when the alias key is present on the response — its absence
            // means the server did not honour the include, and claiming completeness
            // for data that was never returned is the silent-wrong-data case.
            const recordsWithEdge = records.filter( record => alias in record );
            if( !recordsWithEdge.length ) continue;

            await Promise.all( recordsWithEdge.map( record =>
                confirm( edge.target, { [edge.foreignKey]: record.id as string } ) ) );

            const childRecords = recordsWithEdge.flatMap( record =>
            {
                const nested = record[alias];
                if( Array.isArray( nested ) ) return nested as Record<string, unknown>[];
                if( nested && typeof nested === 'object' ) return [nested as Record<string, unknown>];
                return [];
            } );

            if( childRecords.length )
            {
                await confirmLevel( childRecords, edge.target, subtree );
            }
        }
        else if( edge.type === 'belongsTo' )
        {
            const recordsWithEdge = records.filter( record => alias in record );
            if( !recordsWithEdge.length ) continue;

            const childRecords = recordsWithEdge
                .map( record => record[alias] )
                .filter( ( nested ): nested is Record<string, unknown> =>
                    !!nested && typeof nested === 'object' && !Array.isArray( nested ) );

            const uniqueIds = [...new Set(
                childRecords.map( record => record.id as string ).filter( Boolean )
            )];

            await Promise.all( uniqueIds.map( id => confirm( edge.target, { id } ) ) );

            if( childRecords.length )
            {
                await confirmLevel( childRecords, edge.target, subtree );
            }
        }
    }
}

/**
 * Confirms scope at every level of a nested include graph.
 *
 * @param records - The raw response records, before shredding strips nested objects.
 * @param modelName - The root model name.
 * @param includes - The requested include paths (flat or dotted).
 */
export async function confirmIncludeScopes(
    records: Record<string, unknown>[] | undefined,
    modelName: string,
    includes: string[] | undefined
): Promise<void>
{
    if( !records?.length || !includes?.length ) return;

    const tree = buildIncludeTree( includes );
    await confirmLevel( records, modelName, tree );
}
