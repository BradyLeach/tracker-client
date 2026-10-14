/**
 * System Type Service
 *
 * The one aggregate read in the reference data: nine catalogs in a single call, each keyed
 * by its own model name. It does not come from createDomainStore because it is not one
 * collection — it fills nine of them, and no domain owns it.
 *
 * Everything after the fetch is the ordinary path. The payload keys are model names, so the
 * shredder writes each catalog into its own table without this service interpreting the
 * response, and every model it filled is a confirmed scope like any other read.
 */

import i18n from 'i18next';
import { apiErrorMessage, formatApiError } from '@/core/utils';
import { dataService } from '@/services/dataService/dataService';
import { shred } from '@/services/dataService/shredder';
import { confirm, isSatisfied } from '@/services/domain/scope';
import { SYSTEM_TYPE_MODELS } from '../types/systemType.types';
import type { SystemTypeCatalogs, SystemType } from '../types/systemType.types';

const PATH = 'system/types';

export const systemTypeService = {
    /**
     * Fetches every system type catalog and shreds it into the store.
     *
     * Called once by the post-login sequence, before the registries project. Throws on
     * failure: the catalogs resolve the `...TypeId` on nearly every screen, so an app that
     * boots without them renders blanks rather than an error.
     *
     * Skips the fetch when every catalog is already a satisfied scope. Login is always cold,
     * so this holds only for a second call within one session.
     */
    async ensureLoaded(): Promise<void>
    {
        const held = await Promise.all( SYSTEM_TYPE_MODELS.map( model => isSatisfied( model, {} ) ) );
        if( held.every( Boolean ) ) return;

        const response = await dataService.get<SystemTypeCatalogs>( PATH );

        if( response.status !== 200 || !response.data )
        {
            const message = response.status === 204
                ? apiErrorMessage( i18n.t, 'resource.empty', { item: 'system types' } )
                : formatApiError( i18n.t, response.error );

            throw new Error( message );
        }

        // Driven by the response rather than by SYSTEM_TYPE_MODELS: a catalog added to the
        // endpoint lands in its table without a client release, because the key names the
        // table. Only the projection needs to know the list in advance.
        for( const [model, records] of Object.entries( response.data ) as [string, SystemType[]][] )
        {
            await shred( records, model );
            await confirm( model, {} );
        }
    }
};
