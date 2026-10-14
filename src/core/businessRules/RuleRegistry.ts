 
/**
 * RuleRegistry
 *
 * Singleton that stores and manages rule bundles from the backend.
 * Provides typed helper methods for common access patterns.
 *
 * Bundle Structure (full multi-region):
 * {
 *   region: {
 *     global: { accountTypeLevel: { 0: { verification: {...}, program: {...} } } },
 *     au: { accountTypeLevel: { 0: { verification: {...}, program: {...} } } },
 *     us: { accountTypeLevel: { 0: { verification: {...}, program: {...} } } }
 *   }
 * }
 */
import { ruleService } from './rule.service';
import { formatApiError } from '@/core/utils';
import { logger } from '@/core/utils/logger';
import i18n from 'i18next';

import type { RuleBundle } from './types';
import type { LimitRule } from './checkers/limitHandlers';

class RuleRegistry
{
    private bundle: RuleBundle | null = null;

    /**
     * Loads rule bundle from backend into memory.
     *
     * Called at app startup by RuleLoader during bootstrap.
     * Fetches full rule bundle (all regions, all account types) from `/api/v1/system/rule`.
     * Bundle is loaded once and contains all rule data needed for entire session.
     * No reload needed on login/profile switch - bundle already contains all rules.
     *
     * @returns {Promise<void>} Resolves when rule bundle is loaded
     * @throws {Error} If backend fetch fails or bundle is invalid
     */
    async load(): Promise<void>
    {
        const res = await ruleService.getRules();

        if( res.status == 200 && res.data )
        {
            this.bundle = res.data;
            logger.debug( 'rule bundle loaded' );
            return;
        }

        if( res.status == 204 )
        {
            logger.debug( 'no active rule bundle — fail open' );
            return;
        }

        const message = formatApiError( i18n.t, res.error );
        logger.error( message );
        throw new Error( message );
    }

    /**
     * Retrieves resource limit rule for a specific service operation.
     *
     * Used to check creation/deletion limits before showing forms or allowing actions.
     * Returns undefined if no rule exists (fail-open pattern - no rule means allowed).
     * Frontend uses limits for UX (warnings, upgrade prompts), backend enforces authoritatively.
     *
     * Region/account resolution order:
     * 1. Explicit parameters (regionCode, accountTypeLevel)
     * 2. Current user context (TODO: from /me endpoint)
     * 3. Global defaults (region='global', level=0)
     *
     * @param {string} service - Service name (e.g., 'program', 'participant')
     * @param {string} operation - Operation type (e.g., 'create', 'delete')
     * @param {string} [regionCode] - Optional region code override
     * @param {number} [accountTypeLevel] - Optional account level override
     * @returns {LimitRule | undefined} Limit rule with min/max values, or undefined if no limit
     *
     * @example
     * // Use current user's region/level (TODO: once /me is available)
     * const limit = ruleRegistry.getLimit('program', 'create');
     *
     * // Check limit for specific region/level (e.g., trainer checking trainee's limits)
     * const traineeLimit = ruleRegistry.getLimit('program', 'create', 'au', 0);
     */
    getLimit( service: string, operation: string, regionCode?: string, accountTypeLevel?: number ): LimitRule | undefined
    {
        // TODO: Get from user context when /me is available
        const region = regionCode || 'global';
        const level = accountTypeLevel ?? 0;

        return this.bundle?.region?.[region]?.accountTypeLevel?.[level]?.[service]?.operation?.[operation]?.limit;
    }

    /**
     * Retrieves all rules for a specific service operation.
     *
     * Returns the complete rule object including limits, retention, and other constraints.
     * Use when you need access to multiple rule types for a single operation.
     *
     * @param {string} service - Service name (e.g., 'program', 'participant')
     * @param {string} operation - Operation type (e.g., 'create', 'delete', 'update')
     * @param {string} [regionCode] - Optional region code override
     * @param {number} [accountTypeLevel] - Optional account level override
     * @returns {Record<string, any> | undefined} Complete rule object, or undefined if no rules exist
     *
     * @example
     * const rules = ruleRegistry.getRule('program', 'delete');
     * // Returns: { limit: { max: 2 }, dataRetention: { minRetentionDays: 365 } }
     */
    getRule( service: string, operation: string, regionCode?: string, accountTypeLevel?: number ): Record<string, any> | undefined
    {
        // TODO: Get from user context when /me is available
        const region = regionCode || 'global';
        const level = accountTypeLevel ?? 0;

        return this.bundle?.region?.[region]?.accountTypeLevel?.[level]?.[service]?.operation?.[operation];
    }

    /**
     * Set the rule bundle manually.
     *
     * This is primarily used for testing to inject deterministic rule bundles
     * without requiring backend calls. In production, the bundle is loaded once
     * at app startup via RuleLoader (bootstrap).
     *
     * Use Cases:
     * - Integration tests: Set up specific rule scenarios (limit=5, minAge=18)
     * - Unit tests: Test rule resolution logic with known bundles
     * - Development: Override bundle temporarily for feature testing
     *
     * @param bundle - Complete rule bundle matching backend structure
     *
     * @example
     * ```typescript
     * // Integration test setup
     * ruleRegistry.setBundle({
     *   region: {
     *     global: {
     *       accountTypeLevel: {
     *         0: {
     *           program: {
     *             operation: {
     *               create: {
     *                 limit: { max: 5 }
     *               }
     *             }
     *           }
     *         }
     *       }
     *     }
     *   }
     * });
     * ```
     *
     * @warning This completely replaces the existing bundle. Use only in tests.
     */
    setBundle( bundle: RuleBundle ): void
    {
        if( !bundle )
        {
            logger.warn( 'Attempted to set null/undefined rule bundle' );
            return;
        }

        this.bundle = bundle;
        logger.debug( 'rule bundle manually set (likely in test environment)', {
            regions: Object.keys( bundle.region || {} ),
        } );
    }

    /**
     * Check if a rule bundle is loaded.
     *
     * Useful in tests to verify bundle state or in guards to check
     * if RuleLoader has completed.
     *
     * @returns true if bundle contains data, false if empty
     */
    hasBundle(): boolean
    {
        return !!this.bundle && Object.keys( this.bundle ).length > 0;
    }

    /**
     * Clear the rule bundle.
     *
     * Used in test tear-down to reset RuleRegistry to empty state.
     * Prevents test pollution when multiple tests modify the bundle.
     *
     * @example
     * ```typescript
     * afterEach(() => {
     *   ruleRegistry.clearBundle();
     * });
     * ```
     */
    clearBundle(): void
    {
        this.bundle = {};
        logger.debug( 'rule bundle cleared' );
    }

    /**
     * Retrieves verification rule value by key for a specific service operation.
     *
     * Verification rules define service-specific requirements (age restrictions,
     * identity verification, compliance rules). Different services can have different
     * age requirements (e.g., registration=16+, join 18+ group=18+).
     *
     * Region/account resolution order:
     * 1. Explicit parameters (regionCode, accountTypeLevel)
     * 2. Current user context (TODO: from /me endpoint)
     * 3. Global defaults (region='global', level=0)
     *
     * @param {string} key - Verification rule key (e.g., 'minAge', 'maxAge', 'requireIdVerification')
     * @param {string} service - Service name (e.g., 'identity', 'group')
     * @param {string} operation - Operation type (e.g., 'create', 'join')
     * @param {string} [regionCode] - Optional region code override
     * @param {number} [accountTypeLevel] - Optional account level override
     * @returns {any} Rule value, or undefined if not set
     *
     * @example
     * // Registration age check (identity.create)
     * const minAge = ruleRegistry.getVerification('minAge', 'identity', 'create', 'au');
     * // Returns: 16 (Australia registration age)
     *
     * // Group join age check (group.join)
     * const groupMinAge = ruleRegistry.getVerification('minAge', 'group', 'join', 'us');
     * // Returns: 18 (US group join age)
     */
    getVerification( key: string, service: string, operation: string, regionCode?: string, accountTypeLevel?: number ): any
    {
        // TODO: Get from user context when /me is available
        const region = regionCode || 'global';
        const level = accountTypeLevel ?? 0;

        return this.bundle?.region?.[region]?.accountTypeLevel?.[level]?.[service]?.operation?.[operation]?.verification?.[key];
    }

    /**
     * Returns the complete raw rule bundle.
     *
     * Escape hatch for accessing rule data not covered by typed helper methods.
     * Use sparingly - prefer typed helpers (getLimit, getRule, getVerification) when possible.
     *
     * @returns {RuleBundle | null} Complete rule bundle, or null if not loaded
     */
    getRaw(): RuleBundle | null
    {
        return this.bundle;
    }
}

export const ruleRegistry = new RuleRegistry();
