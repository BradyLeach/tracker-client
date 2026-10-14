// core/context/hydration/hydrateContextBulk.ts
import { hydrationRegistry } from './hydration';
import type { HydrationData } from './types';

/**
 * Hydrate multiple contexts at once
 * @param data - Hydration data for each context
 * @param isAuthenticated - Whether user is authenticated (affects preference override logic)
 */
export function hydrateContextBulk( data: HydrationData, isAuthenticated: boolean = false ): void
{
    if( data.theme ) hydrationRegistry.theme.hydrate( data.theme, isAuthenticated );
    if( data.language ) hydrationRegistry.language.hydrate( data.language, isAuthenticated );
    if( data.currency ) hydrationRegistry.currency.hydrate( data.currency, isAuthenticated );
    if( data.country ) hydrationRegistry.country.hydrate( data.country, isAuthenticated );
    if( data.profile ) hydrationRegistry.profile.hydrate( data.profile );
}
