import { dataStore } from '@/services/dataStore/dataStore';
import type { BootstrapLoader } from '../types';

/**
 * Opens the entity store for the authenticated profile.
 *
 * First step of the post-login sequence: the store's collection schemas come from the
 * model definitions loaded pre-auth, and everything after this writes into it.
 *
 * The session is already validated by the time this runs — the caller is post-login
 * hydration, and the store makes no network calls of its own.
 */
export class DataStoreLoader implements BootstrapLoader<void>
{
    name = 'dataStore';
    critical = true;

    private readonly profileId: string;

    constructor( profileId: string )
    {
        this.profileId = profileId;
    }

    async load(): Promise<void>
    {
        await dataStore.open( this.profileId );
    }
}
