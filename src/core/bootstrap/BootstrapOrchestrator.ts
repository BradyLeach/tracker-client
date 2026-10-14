import type { BootstrapLoader, LoaderResult, TypedBootstrapContext } from './types';
import { logger, performanceLogger } from '@/core/utils/logger';

/**
 * BootstrapOrchestrator
 *
 * Coordinates ordered + parallel execution of bootstrap loaders with:
 * - Critical fail-fast behaviour
 * - Non-critical best-effort execution
 * - Timing, success, and failure tracking for dashboards
 * - Production of a typed bootstrap context for the application
 */
export class BootstrapOrchestrator
{
    private loaders: BootstrapLoader[] = [];
    private results: Map<string, LoaderResult> = new Map();

    /**
     * Register a loader to participate in the bootstrap sequence.
     *
     * @param loader - A bootstrap loader definition
     * @returns this (chainable)
     */
    register( loader: BootstrapLoader ): this
    {
        this.loaders.push( loader );
        return this;
    }

    /**
     * Execute the full bootstrap process.
     *
     * Flow:
     * 1. Run all critical loaders (parallel)
     * 2. If any critical loader fails → throw → ErrorBoundary
     * 3. Run all non-critical loaders (parallel)
     * 4. Build typed context from successful loaders
     *
     * @throws Error - When any critical loader fails
     * @returns TypedBootstrapContext - Aggregated results of successful loaders
     */
    async execute(): Promise<TypedBootstrapContext>
    {
        const timer = performanceLogger.start( 'application-bootstrap' );

        const criticalLoaders = this.loaders.filter( loader => loader.critical );
        const nonCriticalLoaders = this.loaders.filter( loader => !loader.critical );

        try
        {
            await this.executeLoaders( criticalLoaders );
            await this.executeLoaders( nonCriticalLoaders );

            timer.end( { success: true } );

            logger.debug( 'Bootstrap completed', {
                critical: criticalLoaders.length,
                nonCritical: nonCriticalLoaders.length
            } );

            return this.buildContext();
        }
        catch ( error )
        {
            timer.end( { success: false, error } );
            logger.error( 'Bootstrap failed', { error } );
            throw error; // Forward to global error boundary
        }
    }

    /**
     * Execute every registered loader one at a time, in registration order.
     *
     * The post-login sequence is ordered rather than parallel because each step
     * depends on the one before it: the store is created from the model definitions,
     * reference data is written into the store, and the registries project over it.
     * Registration order is the dependency order.
     *
     * @throws Error - When any critical loader fails
     * @returns TypedBootstrapContext - Aggregated results of successful loaders
     */
    async executeSequential(): Promise<TypedBootstrapContext>
    {
        const timer = performanceLogger.start( 'session-initialisation' );

        try
        {
            for( const loader of this.loaders )
            {
                await this.runLoader( loader );
            }

            timer.end( { success: true } );
            logger.debug( 'Session initialisation completed', { loaders: this.loaders.length } );

            return this.buildContext();
        }
        catch ( error )
        {
            timer.end( { success: false, error } );
            logger.error( 'Session initialisation failed', { error } );
            throw error;
        }
    }

    /**
     * Execute a batch of loaders in parallel.
     *
     * Uses Promise.all to:
     * - Maintain parallelism
     * - Fail-fast when any critical loader throws
     *
     * @param loaders - List of loaders to execute
     */
    private async executeLoaders( loaders: BootstrapLoader[] ): Promise<void>
    {
        if( loaders.length === 0 )
        {
            return;
        }

        await Promise.all( loaders.map( loader => this.runLoader( loader ) ) );
    }

    /**
     * Execute a single loader with timing, error processing, and dashboard recording.
     *
     * Behaviour:
     * - On success: record { status: 'success', duration, data }
     * - On non-critical failure: record failed result and continue
     * - On critical failure: throw → abort bootstrap → caught in execute()
     *
     * @param loader - Loader being executed
     * @throws Error - If loader is critical and fails
     */
    private async runLoader( loader: BootstrapLoader ): Promise<void>
    {
        const start = performance.now();
        logger.debug( `Loading ${loader.name} (${loader.critical ? 'CRITICAL' : 'NON-CRITICAL'})` );

        try
        {
            const data = await loader.load();
            const duration = performance.now() - start;

            this.results.set( loader.name, {
                status: 'success',
                duration,
                data
            } );

            logger.debug( `${loader.name} loaded`, { duration } );
        }
        catch ( err )
        {
            const error = err instanceof Error ? err : new Error( String( err ) );
            const duration = performance.now() - start;

            this.results.set( loader.name, {
                status: 'failed',
                duration,
                error
            } );

            logger.error( `${loader.name} failed`, { duration, error } );

            if( loader.critical )
            {
                throw new Error( `Critical loader ${loader.name} failed: ${error.message}` );
            }

            logger.warn( `Continuing despite ${loader.name} failure` );
        }
    }

    /**
     * Build the final, typed bootstrap context composed only of
     * successfully executed loader outputs.
     *
     * @returns TypedBootstrapContext - Combined context for application use
     */
    private buildContext(): TypedBootstrapContext
    {
        const context: Partial<TypedBootstrapContext> = {};

        for( const [name, result] of this.results )
        {
            if( result.status === 'success' )
            {
                ( context as any )[name] = result.data;
            }
        }

        return context as TypedBootstrapContext;
    }

    /**
     * Expose all loader execution results for dashboards, including
     * success, failure, durations, and errors.
     *
     * @returns Map<string, LoaderResult> - Snapshot of loader execution outcomes
     */
    getResults(): Map<string, LoaderResult>
    {
        return new Map( this.results );
    }
}
