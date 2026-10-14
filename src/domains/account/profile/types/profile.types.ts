/**
 * Profile Types
 *
 * Mirrors profile records returned by the backend API.
 * These JSON contracts are separate from generated backend model declarations.
 */

/** Profile record returned by the API. Display names belong to Identity presentation. */
export interface Profile
{
    id: string;
    /** ID of the account that owns this profile, not the authenticated Identity. */
    ownerId: string;
    /** Profile handle used to identify the user in @mentions. */
    handle: string;
    bio?: string;
    /** Canonical avatar URL property, preserved unchanged from the API. */
    avatarURL?: string;
    isActive?: boolean;
    isDefault?: boolean;
    status?: 'active' | 'pending' | 'locked' | 'disabled';
    /** Creation timestamp serialized as an ISO date string by the API. */
    createdAt?: string;
    /** Last update timestamp serialized as an ISO date string by the API. */
    updatedAt?: string;
    /** Deletion timestamp serialized as an ISO date string; absent for undeleted records. */
    deletedAt?: string;
}
