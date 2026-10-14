/**
 * Rule Codes
 *
 * Enforcer-based rule codes for scalable rule checking.
 * Only 4 codes needed - one per enforcer type.
 *
 * Design principles:
 * - Enforcer-based (not service-specific) - scales infinitely
 * - Self-describing results include service/operation/data context
 * - Type-safe and semantic
 * - Used for UI resolution and logging
 */
export const RULE_CODES = {
    /**
     * Resource limit enforcement (creation/deletion limits)
     * Example: User has created 5/5 programs, cannot create more
     */
    LIMIT: 'LIMIT',

    /**
     * Verification enforcement (age, identity, email verification)
     * Example: User is 14 years old, requires 16+ for registration in AU
     */
    VERIFICATION: 'VERIFICATION',

    /**
     * Feature access enforcement (premium features, tier restrictions)
     * Example: Advanced analytics only available on standard+ plan
     */
    FEATURE: 'FEATURE',

    /**
     * Compliance enforcement (data retention, regional regulations)
     * Example: Cannot delete program due to 365-day retention rule
     */
    COMPLIANCE: 'COMPLIANCE',
} as const;

/**
 * Type for rule code keys
 */
export type RuleCodeKey = keyof typeof RULE_CODES;

/**
 * Type for rule code values (enforcer types)
 */
export type RuleCode = typeof RULE_CODES[RuleCodeKey];
