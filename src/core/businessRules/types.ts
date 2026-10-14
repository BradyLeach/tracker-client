 
/**
 * Rule Type Definitions
 *
 * All types for the rule system are centralized here for consistency.
 */

import type { RuleCode } from './ruleCodes';

// ============================================================================
// RuleRegistry Types
// ============================================================================

/**
 * Rule bundle from backend (flexible structure)
 * Accepts whatever backend sends to allow backend evolution
 */
export type RuleBundle = Record<string, any>;

// ============================================================================
// RuleEngine Types
// ============================================================================

/**
 * Rule check result returned by enforcers
 *
 * Self-describing structure containing all context needed for:
 * - UI resolution (which component to show)
 * - Logging and debugging
 * - Error messages
 * - Up-sell flows
 */
export interface RuleCheckResult
{
    /**
     * Whether the operation is allowed
     */
    allowed: boolean;

    /**
     * Which enforcer failed (only present if !allowed)
     * Used by RuleUIResolver to determine UI behavior
     */
    enforcer?: RuleCode;

    /**
     * Service being checked (e.g., 'program', 'participant', 'identity')
     */
    service: string;

    /**
     * Operation being checked (e.g., 'create', 'delete', 'update')
     */
    operation: string;

    /**
     * The specific field that failed rule adherence.
     */
    specific?: string;

    /**
     * Enforcer-specific context data
     *
     * LIMIT enforcer:
     * - current: number of existing resources
     * - max: maximum allowed
     * - accountTypeLevel: current tier level
     *
     * VERIFICATION enforcer:
     * - minAge/maxAge: age limits
     * - actualAge: user's age
     * - region: regulatory region
     * - emailVerified: verification status
     * - identityVerificationStatus: verification status
     *
     * FEATURE enforcer:
     * - feature: feature name
     * - requiredPlan: minimum plan required
     *
     * COMPLIANCE enforcer:
     * - rule: compliance rule name
     * - minRetentionDays: minimum retention period
     * - recordAge: age of record in days
     */
    data: Record<string, any>;
}

/**
 * Context passed to rule checkers
 */
export interface RuleCheckContext
{
    service: string;
    operation: string;
    recordId?: string;
    createdAt?: Date;
    userDob?: Date | string;
    emailVerified?: boolean;
    identityVerificationStatus?: string;
    [key: string]: any;
}
