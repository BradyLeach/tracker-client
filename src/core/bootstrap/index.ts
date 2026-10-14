import { BootstrapOrchestrator } from './BootstrapOrchestrator';
import
{
    ConfigLoader,
    PublicModelRegistryLoader,
    I18nLoader,
    AuthLoader,
} from './loaders';
import type { TypedBootstrapContext } from './types';

/**
 * Pre-auth bootstrap.
 *
 * Loads only what an unauthenticated visitor renders: the marketing page and three
 * forms — login, register, newsletter signup. Those need validation, so this is config,
 * i18n and the whitelisted model definitions. Nothing record-shaped, and no store.
 *
 * Everything behind the login boundary is initialiseSession(), which is ordered because
 * its steps depend on each other. This phase has no such dependencies beyond config.
 */
export async function bootstrap(): Promise<TypedBootstrapContext>
{
    const orchestrator = new BootstrapOrchestrator();

    orchestrator
        .register( new ConfigLoader() ) // Load env config first
        .register( new PublicModelRegistryLoader() ) // Definitions the pre-auth forms validate against
        .register( new I18nLoader() ) // Initialize translations
        .register( new AuthLoader() ); // Restore session from refresh cookie
    // Theme handled by ThemeContext (no localStorage)

    // Execute bootstrap sequence and cast to typed context
    const context = await orchestrator.execute();
    return context as TypedBootstrapContext;
}

// Re-export types and classes for extensibility
export { BootstrapOrchestrator } from './BootstrapOrchestrator';
export { initialiseSession, endSession } from './initialiseSession';
export type { BootstrapContext, BootstrapLoader } from './types';
export * from './loaders';

