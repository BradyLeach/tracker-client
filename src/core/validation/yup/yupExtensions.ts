/**
 * Reason: Yup does not provide complete typings for schema extensions (e.g., .test in mixed schemas).
 * Type assertions (`as any`) are required when extending Yup using custom methods.
 */
 
import * as yup from 'yup';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import i18n from '@/utils/i18n';
import { getConfig } from '@/config';
import { apiErrorMessage, logger } from '@/core/utils';
import { ruleRegistry } from '@/core/businessRules/RuleRegistry';

dayjs.extend( utc );
dayjs.extend( customParseFormat );

declare module 'yup' {
    interface DateSchema
    {
        validDob( errorKey?: string ): DateSchema;
        utc( errorKey?: string ): DateSchema;
    }

    interface MixedSchema
    {
        isJson( errorKey?: string ): MixedSchema;
    }

    interface BooleanSchema
    {
        mustAccept( errorKey?: string ): BooleanSchema;
        mustConfirm( errorKey?: string ): BooleanSchema;
    }

    interface StringSchema
    {
        verificationCode( errorKey?: string ): StringSchema;
        isUnique(
            check: ( value: string, context?: Record<string, unknown> ) => Promise<boolean>,
            errorKey?: string
        ): StringSchema;
    }
}

/**
 * Yup Date of Birth Validation Method
 *
 * Validates that a date of birth falls within acceptable age ranges based on
 * rule rules or configuration defaults. Age requirements are context-aware
 * and can vary by service, operation, region, and account type level.
 *
 * @remarks
 * This method extends Yup's date schema with DOB-specific validation.
 * It integrates with the rule system for dynamic age requirements and
 * falls back to global config when rule lookup is unavailable.
 *
 * Validation Flow:
 * 1. Skip validation for null/undefined (handled by required())
 * 2. Fetch age requirements from rule or config
 * 3. Calculate valid date range based on current date
 * 4. Validate DOB falls within acceptable range
 * 5. Return appropriate error messages for violations
 *
 * @example
 * // Basic usage
 * yup.date().validDob().required()
 *
 * @example
 * // With rule context
 * yup.date().validDob().test({
 *   name: 'dob-check',
 *   test: function(value) {
 *     return this.resolve(value);
 *   },
 *   options: {
 *     context: {
 *       service: 'registration',
 *       operation: 'create',
 *       regionCode: 'US',
 *       accountTypeLevel: 1
 *     }
 *   }
 * })
 *
 * @this {yup.DateSchema} The date schema being extended
 * @returns {yup.DateSchema} The schema with validDob test added
 */
yup.addMethod( yup.date, 'validDob', function( this: yup.DateSchema, errorKey: string = 'error.date.validDob' )
{
    return this.test( 'valid-dob', function( value: unknown )
    {
        const { path, createError, options } = this;

        // Null/undefined handled by required()
        if( value == null ) return true;

        // Get age requirements from rule or config
        const { minAge, maxAge } = getAgeRequirements( options.context );

        // Calculate valid date range
        const now = dayjs().utc();
        const oldestAllowed = now.subtract( maxAge, 'year' ).endOf( 'day' );
        const youngestAllowed = now.subtract( minAge, 'year' ).endOf( 'day' );

        // Validate date
        const dob = dayjs( value as Date | string | number );

        if( dob.isBefore( oldestAllowed ) )
        {
            return createError( {
                path,
                message: apiErrorMessage( i18n.t, `${errorKey}.tooOld`, { field: path, maxAge } )
            } );
        }

        if( dob.isAfter( youngestAllowed ) )
        {
            return createError( {
                path,
                message: apiErrorMessage( i18n.t, `${errorKey}.tooYoung`, { field: path, minAge } )
            } );
        }

        return true;
    } );
} );

/**
 * Get Age Requirements from Rule or Configuration
 *
 * Retrieves minimum and maximum age requirements using a hierarchical lookup:
 * 1. First attempts rule-based lookup if service/operation context provided
 * 2. Falls back to global configuration defaults if rule unavailable
 *
 * Rule lookups are region and account-level aware, allowing different age
 * requirements based on geographical location and user tier.
 *
 * @param context - Optional validation context containing rule lookup parameters
 * @param context.service - Service name for rule lookup (e.g., 'registration')
 * @param context.operation - Operation name for rule lookup (e.g., 'create')
 * @param context.regionCode - ISO region code (e.g., 'US', 'GB'), defaults to 'global'
 * @param context.accountTypeLevel - Account tier level for tiered age requirements
 *
 * @returns Age requirement object with minimum and maximum allowed ages in years
 *
 * @example
 * // Rule-based lookup
 * const { minAge, maxAge } = getAgeRequirements({
 *   service: 'registration',
 *   operation: 'create',
 *   regionCode: 'US',
 *   accountTypeLevel: 1
 * });
 * // Returns rule-specific requirements (e.g., minAge: 18, maxAge: 120)
 *
 * @example
 * // Config fallback
 * const { minAge, maxAge } = getAgeRequirements();
 * // Returns config defaults (e.g., minAge: 13, maxAge: 150)
 *
 * @remarks
 * Logs the source of age requirements (rule or config) at debug level
 * for troubleshooting validation behavior.
 */
function getAgeRequirements( context?: Record<string, unknown> ): { minAge: number; maxAge: number }
{
    const {
        service,
        operation,
        regionCode,
        accountTypeLevel
    } = ( context || {} ) as {
        service?: string;
        operation?: string;
        regionCode?: string;
        accountTypeLevel?: number; // Or string if this is also a string
    };

    // Try rule lookup first
    if( service && operation )
    {
        const region = regionCode || 'global';
        const level = accountTypeLevel ?? 0;

        const minAge = ruleRegistry.getVerification( 'minAge', service, operation, region, level );
        const maxAge = ruleRegistry.getVerification( 'maxAge', service, operation, region, level );

        if( minAge && maxAge )
        {
            return { minAge, maxAge };
        }
    }

    // Fall back to config
    const { validation } = getConfig();
    logger.debug( 'Using config age defaults', { minAge: validation.age.min, maxAge: validation.age.max } );

    return {
        minAge: validation.age.min,
        maxAge: validation.age.max
    };
}

/**
 * Adds a `utc` method to Yup's date schema that validates UTC ISO 8601 strings.
 *
 * This validates format only - does not transform the value.
 * Accepts valid UTC date strings (e.g., "2024-01-01T12:00:00Z").
 * Rejects invalid formats or non-UTC strings.
 *
 * @example
 * yup.date().utc().validate('2024-01-01T12:00:00Z'); // passes
 * yup.date().utc().validate('2024-01-01T12:00:00+08:00'); // fails
 * yup.date().utc().validate('invalid-date'); // fails
 */
yup.addMethod<yup.DateSchema>( yup.date, 'utc', function( errorKey: string = 'error.string.date' )
{
    return this.test( 'utc', 'error.string.date', function( value )
    {
        const { path, createError } = this;

        if( value == null ) return true; // allow optional

        const str = value instanceof Date ? value.toISOString() : value;

        if( typeof str !== 'string' || !str.endsWith( 'Z' ) )
        {
            return createError( {
                path,
                message: apiErrorMessage( i18n.t, errorKey, { field: path } ),
            } );
        }

        const isValid = dayjs.utc( str, undefined, true ).isValid();

        return isValid ? true : createError( {
            path,
            message: apiErrorMessage( i18n.t, errorKey, { field: path } ),
        } );
    } );
} );

/**
 * Adds an `isJson` method to Yup's mixed schema.
 *
 * Validates that the value is a plain JSON object (not array or primitive).
 *
 * @param errorKey - The i18n key for error messages
 * @returns Yup schema with JSON validation
 *
 * @example
 * yup.mixed().isJson().validate({ key: 'value' }); // passes
 * yup.mixed().isJson().validate([]); // fails
 * yup.mixed().isJson().validate('string'); // fails
 */
yup.addMethod( yup.mixed, 'isJson', function( this: yup.MixedSchema, errorKey: string = 'error.mixed.notType' )
{
    return ( this as any ).test( 'isJson', errorKey, function( this: yup.TestContext, value: unknown )
    {
        const { path, createError } = this;

        // Allow undefined/null values
        if( value == null ) return true;

        const isValid = typeof value === 'object' &&
            value !== null &&
            !Array.isArray( value ) &&
            value.constructor === Object;

        if( !isValid )
        {
            return createError( {
                path,
                message: apiErrorMessage( i18n.t, errorKey, { field: path } )
            } );
        }

        return true;
    } );
} );

/**
 * Custom Yup method for boolean fields that must be `true` during CREATE operations (e.g., T&Cs checkbox).
 * This validator is context-aware and only enforces the rule when `$isCreate` is true.
 */
yup.addMethod<yup.BooleanSchema>( yup.boolean, 'mustAccept', function( errorKey: string = 'error.boolean.mustAccept' )
{
    return this.when( '$isCreate', {
        is: true,
        then: schema => schema.test( 'mustAccept', function( value )
        {
            const { path, createError } = this;

            if( value !== true )
            {
                return createError( {
                    path,
                    message: apiErrorMessage( i18n.t, errorKey, { field: path } )
                } );
            }
            return true;
        } )
    } );
} );

/**
 * Custom Yup method for boolean confirmation fields during CREATE operations (e.g., age confirmation).
 * This validator is context-aware and only enforces the rule when `$isCreate` is true.
 * Similar to mustAccept but semantically distinct for confirmation-type fields.
 */
yup.addMethod<yup.BooleanSchema>( yup.boolean, 'mustConfirm', function( errorKey: string = 'error.boolean.mustConfirm' )
{
    return this.when( '$isCreate', {
        is: true,
        then: schema => schema.test( 'mustConfirm', function( value )
        {
            const { path, createError } = this;

            if( value !== true )
            {
                return createError( {
                    path,
                    message: apiErrorMessage( i18n.t, errorKey, { field: path } )
                } );
            }
            return true;
        } )
    } );
} );

/**
 * Custom Yup method for 6-digit numeric verification codes.
 *
 * Validates email/SMS verification codes, 2FA codes, etc.
 * Enforces exactly 6 numeric digits for consistency across all verification flows.
 * Validates both empty and invalid codes with the same error message.
 *
 * @param errorKey - i18n key for error message (defaults to 'error.string.verificationCode')
 * @returns Yup string schema with verification code validation
 *
 * @example
 * yup.string().verificationCode() // No need for .required()
 */
yup.addMethod<yup.StringSchema>( yup.string, 'verificationCode', function( errorKey: string = 'error.string.verificationCode' )
{
    return this.test( 'verificationCode', function( value )
    {
        const { path, createError } = this;

        // DO BASIC REGEX BULLSHIT IN THERE
        const isValid = /^\d{6}$/.test( value || '' );

        if( !isValid )
        {
            return createError( {
                path,
                message: apiErrorMessage( i18n.t, errorKey, { field: path } )
            } );
        }

        return true;
    } );
} );

/**
 * Adds an `isUnique` method to Yup's string schema.
 *
 * Performs async uniqueness validation against a backend service.
 * Designed for handle, email, slug, or name uniqueness checks.
 *
 * - Async-safe (works with yupResolver)
 * - Context-aware (service/operation/region available if needed)
 * - i18n-first error handling
 *
 * @example
 * yup.string().isUnique(checkFn)
 */
yup.addMethod<yup.StringSchema>(
    yup.string,
    'isUnique',
    function(
        check: ( value: string, context?: Record<string, unknown> ) => Promise<boolean>,
        errorKey: string = 'error.string.notUnique'
    )
    {
        return this.test( 'is-unique', async function( value )
        {
            const { path, createError, options } = this;

            // Empty values handled by required()
            if( !value ) return true;

            try
            {
                const isUnique = await check( value, options.context );

                if( !isUnique )
                {
                    return createError( {
                        path,
                        message: apiErrorMessage( i18n.t, errorKey, { field: path } )
                    } );
                }

                return true;
            }
            catch ( err )
            {
                // Fail closed: backend unreachable = validation failure
                logger.warn( 'Uniqueness check failed', { field: path, err } );

                return createError( {
                    path,
                    message: apiErrorMessage( i18n.t, errorKey, { field: path } )
                } );
            }
        } );
    } );

export default yup;