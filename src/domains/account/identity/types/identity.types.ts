/**
 * Identity Types
 *
 * Frontend representation of user identity.
 * Strongly typed — does not use generated model unknowns.
 */

export interface Identity
{
    id: string;
    email: string;
    recoveryEmail?: string;
    firstname: string;
    lastname: string;
    dob: string;
    status?: 'active' | 'pending' | 'locked' | 'disabled';
    emailVerifiedAt?: string;
    identityVerificationStatus?: 'unverified' | 'pending' | 'verified' | 'expired' | 'rejected' | 'revoked';
}
