/**
 * Validation Configuration Module
 *
 * Default validation rules and constraints for frontend and backend validation systems.
 * This module provides baseline validation values where rule-based rules are not yet available.
 * Note: Rule-driven validation (e.g. regional age limits) uses RuleRegistry at runtime.
 */

export interface ValidationConfig
{
    /** Age validation rules (fallback when rule not available) */
    age:
    {
        /** Minimum age for fallback validation (COPPA compliance) */
        min: number;

        /** Maximum age for fallback validation (reasonable human lifespan) */
        max: number;
    };

    /** Async validation configuration (used for debounce behavior in form inputs). */
    async?:
    {
        /** Debounce time in milliseconds before triggering async validation (e.g. username uniqueness). */
        debounceMs: number;

        /** Minimum number of characters required before async validation is triggered. */
        minInputLength: number;
    };

    /** Comment constraints. Comments are polymorphic, so one limit covers every entity. */
    comment:
    {
        /**
         * Plain-text characters allowed in a comment body. Counted on the text,
         * not the serialised document, so formatting costs the author nothing.
         */
        maxCharacters: number;
    };
}

/**
 * Default validation configuration (all environments)
 * These are fallback values when RuleRegistry is not available
 */
export const validationConfig: ValidationConfig = {
    age:
    {
        min: 16, // This is not a child's app.
        max: 120, // Reasonable human lifespan
    },
    async:
    {
        debounceMs: 2000,
        minInputLength: 3,
    },
    comment:
    {
        maxCharacters: 2000, // Long enough for a considered note, short enough to stay a comment.
    },
};
