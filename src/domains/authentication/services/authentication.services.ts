import { dataService } from '@/services/dataService/dataService';
import { endSession } from '@/core/bootstrap/initialiseSession';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type {
    LoginFormFields
} from '../types/formFields.types';
import type { AuthContextResponse } from '../types/authContext.types';
import type { Identity } from '@/domains/account/identity/types/identity.types';

// Register all the paths for easy access and updates
const LOGIN_PATH = 'auth/login';
const LOGOUT_PATH = 'auth/logout';
const AUTH_CONTEXT_PATH = 'auth/context';

/**
 * The authenticated Identity from the last auth context read.
 *
 * Module scope, like the access token: held from hydration until the store opens and
 * IdentityLoader shreds it, and as the source of the current identity's id thereafter.
 * Cleared wherever the session ends.
 */
let authenticatedIdentity: Identity | undefined;
/**
 * Registration Service
 *
 * Handles account registration logic (sign-up, handle checks, etc.)
 */
export const authenticationService = {

    // <=======================================================================>
    // <=============================> PUBLIC API <============================>
    // <=======================================================================>
    /**
     *
     */
    async login( fields: LoginFormFields ): Promise<ApiResponse<any>>
    {
        const payload = {
            email: fields.email,
            password: fields.password
        };

        // Login is always cold. Logout is the path that does not run when a tab is
        // killed or a browser crashes, so the store is dropped here too — before the
        // new session opens one of its own.
        await endSession();
        authenticatedIdentity = undefined;

        // Attempt to authenticate
        return await dataService.post( LOGIN_PATH, payload );
    },

    async logout(): Promise<ApiResponse<any>>
    {
        const response = await dataService.post( LOGOUT_PATH );

        // Every tab on this origin closes its connection, then the database is deleted.
        await endSession();
        authenticatedIdentity = undefined;

        return response;
    },

    async getAuthContext(): Promise<ApiResponse<AuthContextResponse>>
    {
        const response = await dataService.get<AuthContextResponse>( AUTH_CONTEXT_PATH );

        authenticatedIdentity = response.data?.identity;

        return response;
    },

    /** The authenticated Identity, or undefined outside a session. */
    getIdentity(): Identity | undefined
    {
        return authenticatedIdentity;
    },
    // <=======================================================================>
    // <=======================> ASYNC ERROR HELPERS <=========================>
    // <=======================================================================>
};