import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

interface ValidationError {
  key: string;
  field: string;
  value?: unknown;
  message: string;
  [key: string]: unknown; // For additional params like min, max, etc.
}

interface ServerError {
  message: ValidationError | string;
  path: string;
  type?: string;
}

/**
 * Custom hook for handling both client-side Yup errors and server-side validation errors
 * with unified i18n translation support
 */
export const useValidationErrors = () =>
{
    const { t } = useTranslation();

    /**
   * Process Yup validation errors (client-side)
   */
    const processYupErrors = ( error: yup.ValidationError ): Record<string, string> =>
    {
        const errors: Record<string, string> = {};

        if( error.inner && error.inner.length > 0 )
        {
            // Multiple validation errors
            error.inner.forEach( ( err ) =>
            {
                if( err.path )
                {
                    // If error.message is an object with key (from your custom methods)
                    if( typeof err.message === 'object' && 'key' in err.message )
                    {
                        const errorObj = err.message as ValidationError;
                        errors[err.path] = translateValidationError( t, errorObj );
                    }
                    else
                    {
                        // Standard Yup error (already translated by your locale setup)
                        errors[err.path] = err.message;
                    }
                }
            } );
        }
        else if( error.path )
        {
            // Single validation error
            if( typeof error.message === 'object' && 'key' in error.message )
            {
                const errorObj = error.message as ValidationError;
                errors[error.path] = translateValidationError( t, errorObj );
            }
            else
            {
                errors[error.path] = error.message;
            }
        }

        return errors;
    };

    /**
   * Process server validation errors (backend responses)
   */
    const processServerErrors = ( serverErrors: ServerError[] ): Record<string, string> =>
    {
        const errors: Record<string, string> = {};

        serverErrors.forEach( ( serverError ) =>
        {
            const { path, message } = serverError;

            if( typeof message === 'object' && 'key' in message )
            {
                // Server returned Yup error object with key
                const errorObj = message as ValidationError;

                // Use the full key path that matches your JSON structure
                errors[path] = translateValidationError( t, errorObj );
            }
            else
            {
                // Server returned simple string message
                errors[path] = typeof message === 'string' ? message : JSON.stringify( message );
            }
        } );

        return errors;
    };

    /**
     * Returns a translated error message from a ValidationError object.
     *
     * @param t - i18next translation function
     * @param errorObj - the structured ValidationError from server or Yup
     * @returns translated error message
     */
    const translateValidationError = (
        t: ( key: string, options?: Record<string, unknown> ) => string,
        errorObj: ValidationError
    ): string =>
    {
        const { key, field, value, ...additionalParams } = errorObj;
        return t( key, {
            field,
            value,
            ...additionalParams
        } );
    };

    /**
   * Get a single translated error message by key
   */
    const getErrorMessage = ( errorKey: string, params: Record<string, unknown> = {} ): string =>
    {
        return t( errorKey, params );
    };

    /**
   * Format field names for better UX (convert camelCase to readable format)
   */
    const formatFieldName = ( fieldPath: string ): string =>
    {
    // Convert nested paths like "user.firstName" to "First Name"
        const fieldName = fieldPath.split( '.' ).pop() || fieldPath;

        // Convert camelCase to readable format
        return fieldName
            .replace( /([A-Z])/g, ' $1' )
            .replace( /^./, str => str.toUpperCase() )
            .trim();
    };

    return {
        processYupErrors,
        processServerErrors,
        getErrorMessage,
        formatFieldName
    };
};

export default useValidationErrors;