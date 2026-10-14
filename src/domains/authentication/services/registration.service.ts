import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type {
    RegistrationFormFields,
    ProvideEmailFormFields,
    ProvideCodeFormFields
} from '../types/formFields.types';

// Register all the paths for easy access and updates
const REGISTRATION_PATH = 'account/registration';
const VERIFY_PATH = `${REGISTRATION_PATH}/verify`;
const RESEND_PATH = `${REGISTRATION_PATH}/resend`;
const UNIQUE_PATH = `${REGISTRATION_PATH}/check-unique`;

/**
 * Registration Service
 *
 * Handles account registration logic (sign-up, handle checks, etc.)
 */
export const registrationService = {

    // <=======================================================================>
    // <=============================> PUBLIC API <============================>
    // <=======================================================================>
    /**
     * Submit registration form and create signupAttempt
     *
     * @param fields - Registration form fields
     * @returns ApiResponse containing the result
     */
    async register( fields: RegistrationFormFields ): Promise<ApiResponse<any>>
    {
        const payload = {
            identity:
            {
                email: fields.email,
                firstname: fields.firstname,
                lastname: fields.lastname,
                password: fields.password,
            },
            company:
            {
                name: fields.companyName,
            },
            // Jurisdiction, sent at the top level alongside consent. The account is bound to
            // it, so it is the caller's to state rather than the server's to infer.
            countryId: fields.countryId,
            acknowledgedTerms: fields.acknowledgedTerms,
        };

        // Uses create (POST /account/registration) - creates signupAttempt resource
        return await dataService.create( REGISTRATION_PATH, payload );
    },

    /**
     * Verify a signup code
     *
     * @param code - The 6 digit signup code
     * @returns ApiResponse with result of verification
     */
    async verify( fields: ProvideCodeFormFields ): Promise<ApiResponse<any>>
    {
        const { email, code } = fields;

        // Uses post (POST /account/registration/verify) - RPC operation, not
        //  resource creation
        return await dataService.post( VERIFY_PATH, { email, code } );
    },

    /**
     * Request a new signup code
     *
     * @param email - The email associated with the account requesting the code.
     * @returns ApiResponse with result of verification
     */
    async requestNewCode( fields: ProvideEmailFormFields ): Promise<ApiResponse<any>>
    {
        const { email } = fields;

        // Uses post (POST /account/registration/resend) - RPC operation, not
        // resource creation
        return await dataService.post( RESEND_PATH, { email } );
    },

    // <=======================================================================>
    // <=======================> ASYNC ERROR HELPERS <=========================>
    // <=======================================================================>

    /**
     * Check if a handle is available
     *
     * @param handle - The profile handle to check
     * @returns ApiResponse<boolean> true if available, false if taken
     */
    async checkHandle( handle: string ): Promise<ApiResponse<void>>
    {
        return await dataService.getOne<void>( UNIQUE_PATH, { field: 'handle', value: handle } );
    },

    /**
     * Check if an email is available
     *
     * @param email - The email to check
     * @returns ApiResponse<void> 204 if available, error if taken
     */
    async checkEmail( email: string ): Promise<ApiResponse<void>>
    {
        return await dataService.getOne<void>( UNIQUE_PATH, { field: 'email', value: email } );
    }
};
