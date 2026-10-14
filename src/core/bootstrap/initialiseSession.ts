/**
 * Session initialisation — the post-login half of bootstrap.
 *
 * Pre-auth loads only what an unauthenticated visitor renders: config, i18n and the
 * whitelisted model definitions the login, register and newsletter forms validate
 * against. Everything else lives behind this boundary — the full domain model included,
 * because the schema is the shape of the product.
 *
 * The sequence is ordered, not parallel. Each step depends on the one before it.
 */

import { BootstrapOrchestrator } from './BootstrapOrchestrator';
import { DataStoreLoader } from './loaders/DataStoreLoader';
import { IdentityLoader } from './loaders/IdentityLoader';
import { ModelRegistryLoader } from './loaders/ModelRegistryLoader';
import { RealtimeLoader } from './loaders/RealtimeLoader';
import { RuleLoader } from './loaders/RuleLoader';
import { StateRegistryLoader } from './loaders/StateRegistryLoader';
import { TypeRegistryLoader } from './loaders/TypeRegistryLoader';
import { stateRegistry } from '@/core/models/StateRegistry';
import { typeRegistry } from '@/core/models/TypeRegistry';
import { dataStore } from '@/services/dataStore/dataStore';
import { realtimeService } from '@/services/realtime/realtime';
import { logger } from '@/core/utils/logger';

/**
 * The sequence currently running, so concurrent callers join it rather than start a second.
 *
 * Two call sites reach this on a login — the hydration effect and the profile effect — and
 * they do not arrive in a fixed order. Sequential calls are already cheap, but concurrent
 * ones are not merely wasteful: they would open the store twice, and the second pass would
 * reconnect the registries out from under the first while it was still running.
 */
let running: { profileId: string; sequence: Promise<void> } | undefined;

/**
 * Runs the post-login sequence for a profile.
 *
 * ```
 * full model definitions → the store's tables and indexes are generated from them
 * store created          → profile-scoped, versioned on the model shapes
 * identity stored        → the authenticated Identity the auth context returned
 * reference data         → types, state graphs and rules
 * app renders
 * ```
 *
 * Idempotent, including under concurrency: a call while one is already running for the same
 * profile awaits that one. Awaiting it is what callers must do before rendering anything
 * that reads the store — a subscription taken before the store is open throws at subscribe
 * time, and the screen it belongs to stays empty.
 *
 * @param profileId - Profile of the validated session the store is scoped to.
 */
export function initialiseSession( profileId: string ): Promise<void>
{
    if( running?.profileId === profileId ) return running.sequence;

    const orchestrator = new BootstrapOrchestrator();

    orchestrator
        // Full definitions first — the store's tables and indexes are generated from them
        .register( new ModelRegistryLoader() )
        // Store next — everything below writes into it
        .register( new DataStoreLoader( profileId ) )
        // The authenticated Identity the auth context already returned
        .register( new IdentityLoader() )
        // Realtime next — incoming dirty state is persisted through the store above
        .register( new RealtimeLoader() )
        // Reference data
        .register( new TypeRegistryLoader() )
        .register( new StateRegistryLoader() )
        .register( new RuleLoader() );

    // Held for the life of the session rather than cleared on completion: the point is that
    // a later caller finds the sequence already done and continues, not that it repeats it.
    // endSession() clears it, because after that the store really does need opening again.
    const sequence = orchestrator.executeSequential().then( () => undefined );
    running = { profileId, sequence };

    return sequence;
}

/**
 * Drops the entity store for every tab on this origin.
 *
 * Called on login and on logout. Login is destructive too: logout is the path that does
 * not run when a tab is killed or a browser crashes, so login is always cold.
 *
 * The registries let go first. They hold live subscriptions over the tables about to be
 * dropped, and a projection left running would be watching a database that no longer exists.
 *
 * Never throws — a failed teardown must not block signing in or out.
 */
export async function endSession(): Promise<void>
{
    // Before anything else: the held sequence describes a store that is about to stop
    // existing. Leaving it would have the next login find initialisation already done and
    // skip opening the store it needs.
    running = undefined;

    try
    {
        // First: no new dirty state should be applied to a store about to be torn down.
        realtimeService.disconnect();

        typeRegistry.disconnect();
        stateRegistry.disconnect();

        await dataStore.destroy();
    }
    catch ( error )
    {
        logger.warn( 'Session teardown failed', { error } );
    }
}
