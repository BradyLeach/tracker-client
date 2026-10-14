import i18n from 'i18next';
import { apiErrorMessage, formatApiError } from '@/core/utils';
import { dataService } from '@/services/dataService/dataService';
import { shred } from '@/services/dataService/shredder';
import { confirm, isSatisfied } from '@/services/domain/scope';
import type { StateGraph } from '../types/stateGraph.types';

/**
 * The bootstrap read: every graph with its nodes, states, categories and transitions in one
 * call. The endpoint declares its own includes, so this asks for nothing beyond the path.
 */
const BOOTSTRAP_PATH = 'system/controllers/state-graphs';

export const stateGraphService =
{
    /**
     * Fetches every state graph and shreds the tree into the store.
     *
     * Called once by the post-login sequence, before StateRegistry projects. Throws on
     * failure: entities carry `currentStateId` and resolve it on nearly every screen, so an
     * app that boots without the graphs renders blanks rather than an error.
     *
     * A graph comes back with all of its nodes and transitions, so each of those is a
     * confirmed scope for that graph. The states and categories behind them are not — only
     * the ones some graph references came back, which says nothing about the collection.
     */
    async ensureLoaded(): Promise<void>
    {
        if( await isSatisfied( 'stateGraph', {} ) ) return;

        const response = await dataService.getAll<StateGraph>( BOOTSTRAP_PATH );

        if( response.status !== 200 || !response.data )
        {
            const message = response.status === 204
                ? apiErrorMessage( i18n.t, 'resource.empty', { item: 'state graphs' } )
                : formatApiError( i18n.t, response.error );

            throw new Error( message );
        }

        await shred( response.data, 'stateGraph' );
        await confirm( 'stateGraph', {} );

        for( const graph of response.data )
        {
            await confirm( 'stateGraphState', { stateGraphId: graph.id } );
            await confirm( 'transition', { stateGraphId: graph.id } );
        }
    }
};
