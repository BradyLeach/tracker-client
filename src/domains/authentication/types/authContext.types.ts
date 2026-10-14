/**
 * Auth Context Types
 *
 * Response shape for GET /auth/context endpoint.
 * Returns unified auth context with identity, profile, and preferences.
 */

import type { AppPreferences } from '@/domains/preferences/app';
import type { Identity } from '@/domains/account/identity';
import type { Profile } from '@/domains/account/profile';

export interface AuthContextResponse
{
    identity: Identity;
    /** Raw backend Profile record; display names are composed from Identity data by presentation consumers. */
    profile: Profile;
    /** Omitted when the authenticated profile has no app preferences. */
    appPreference?: AppPreferences;
}
