/**
 * TypeRegistry
 *
 * A synchronous projection of the system type catalogs held in the store.
 *
 * Entities carry `...TypeId` foreign keys (partnershipTypeId, orderTypeId, …) and every
 * table cell, chip and header resolves one during render — so this has to be synchronous.
 * A hook per lookup would mean a loading state per cell, and store reads are asynchronous.
 *
 * It holds no fetch of its own. The catalogs reach the store through the ordinary path
 * (systemTypeService → shredder), and this subscribes to the tables they land in, keeping
 * the same plain Maps it always kept. Callers see no difference.
 *
 * Catalogs are keyed by model name, which is what the store keys them by and what the
 * endpoint returns — one name for one thing, end to end.
 */
import { logger } from '@/core/utils/logger';
import { project, source } from '@/services/domain/projection';
import type { Projection } from '@/services/domain/projection';

import { SYSTEM_TYPE_MODELS } from '@/domains/system/types/systemType.types';
import type { SystemType, SystemTypeModel, TypeCatalogue } from '@/domains/system/types/systemType.types';

class TypeRegistry implements TypeCatalogue
{
    private catalogMap: Map<SystemTypeModel, SystemType[]> = new Map();
    private typeMap: Map<string, SystemType> = new Map();
    private idByLabel: Map<string, string> = new Map();
    private projection: Projection | undefined;

    /**
     * Subscribes to every catalog table and keeps the lookup maps current.
     *
     * Called once by the post-login sequence, after the catalogs have been shredded into
     * the store. Each table is observed independently — nine small collections that never
     * change together, so there is nothing to combine and no ordering between them.
     *
     * Resolves once every catalog has emitted, so boot does not complete on empty maps and
     * leave the first render resolving type ids to nothing.
     *
     * Idempotent: connecting twice drops the first set of subscriptions rather than
     * doubling them.
     */
    async connect(): Promise<void>
    {
        this.disconnect();

        const { projection, ready } = project(
            SYSTEM_TYPE_MODELS.map( model =>
                source<SystemType>( model, records => this.catalogMap.set( model, records ) ) ),
            () => this._index()
        );

        this.projection = projection;
        await ready;

        logger.debug( '[TypeRegistry] Projecting', { catalogs: this.catalogMap.size, types: this.typeMap.size } );
    }

    /** Drops the subscriptions. Called when the session ends and the store goes away. */
    disconnect(): void
    {
        this.projection?.stop();
        this.projection = undefined;
    }

    /**
     * Returns the type record for a given ID, whatever catalog it belongs to.
     * This is the primary lookup — entities store the ID and the UI needs the
     * label to translate and render.
     *
     * @param typeId - UUID held by an entity's `...TypeId` field
     */
    getById( typeId: string | undefined ): SystemType | undefined
    {
        if( !typeId ) return undefined;
        return this.typeMap.get( typeId );
    }

    /**
     * Returns the label for a given type ID, or undefined when unknown.
     * The label doubles as the i18n key, so callers pass it straight to `t()`.
     *
     * @param typeId - UUID held by an entity's `...TypeId` field
     */
    getLabel( typeId: string | undefined ): string | undefined
    {
        return this.getById( typeId )?.label;
    }

    /**
     * Returns every type in one catalog, for building select options and filters.
     *
     * @param model - Catalog's model name, e.g. 'partnershipType'
     */
    getByModel( model: SystemTypeModel ): SystemType[]
    {
        return this.catalogMap.get( model ) ?? [];
    }

    /**
     * Resolves a catalog + label back to its ID.
     *
     * Needed wherever code used to compare against a string enum — a predicate
     * like `row.partnershipType === 'supplier'` becomes an ID comparison.
     *
     * @param model - Catalog's model name, e.g. 'partnershipType'
     * @param label - Type label, e.g. 'supplier'
     */
    getId( model: SystemTypeModel, label: string ): string | undefined
    {
        return this.idByLabel.get( `${model}.${label}` );
    }

    // -------------------------------------------------------------------------

    /**
     * Rebuilds the id-keyed lookups from the catalogs.
     *
     * Whole rather than incremental: nine catalogs of a few rows each are cheaper to rebuild
     * than to reconcile, and a rebuild cannot leave an entry behind for a record the store
     * no longer holds.
     */
    private _index(): void
    {
        this.typeMap.clear();
        this.idByLabel.clear();

        for( const [model, types] of this.catalogMap )
        {
            for( const type of types )
            {
                this.typeMap.set( type.id, type );
                this.idByLabel.set( `${model}.${type.label}`, type.id );
            }
        }
    }
}

export const typeRegistry = new TypeRegistry();
