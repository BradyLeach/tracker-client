/**
 * Verification rule (age limits, identity requirements, etc.)
 */
export type VerificationRule = Record<string, any>;

/**
 * Actual resolved user verification values.
 * Derived from context (dob, email status, identity status).
 */
export interface VerificationActualValues
{
    age?: number;
    emailVerified?: boolean;
    identityVerificationStatus?: string;
}

/**
 * Verification Handler Map
 *
 * A map of verification rule keys to pure check functions.
 * Keys must match backend rule keys.
 * Expected values are typed as `VerificationRule[key]` (dynamic).
 */
export const verificationHandlers: {
    [K in keyof VerificationRule]: (
        expected: VerificationRule[K],
        actual: VerificationActualValues
    ) => boolean;
} = {
    minAge: ( expected, actual ) =>
        typeof expected === "number" &&
        typeof actual.age === "number" &&
        actual.age >= expected,

    maxAge: ( expected, actual ) =>
        typeof expected === "number" &&
        typeof actual.age === "number" &&
        actual.age <= expected,

    emailVerified: ( expected, actual ) =>
        typeof expected === "boolean" &&
        actual.emailVerified === expected,

    identityVerified: ( expected, actual ) =>
        typeof expected === "boolean" &&
        ( actual.identityVerificationStatus === "verified" ) === expected
};