/**
 * Reason: Yup does not expose detailed typings for the `params` object in `setLocale` custom messages.
 * Typing each one manually is impractical and error-prone for dynamic keys.
 */
 
import { setLocale } from 'yup';
import i18n from '@/utils/i18n';
import dayjs from 'dayjs';

/**
 * Field names that receive custom validation messages in the Yup locale.
 * Centralised here so a field rename doesn't silently fall through to defaults.
 */
const FIELD_NAMES = {
    passwordConfirm: 'passwordConfirm',
    confirmPassword: 'confirmPassword',
    handle: 'handle',
} as const;

// Function to setup Yup locale with i18n integration
export const setupYupLocaleWithI18n = () =>
{
    // Use a more TypeScript-friendly approach
    const localize: any = {
        mixed: {
            default: ( params: any ) =>
            {
                return i18n.t( 'messages.error.mixed.default', { value: params.value } );
            },
            required: () =>
            {
                return i18n.t( 'messages.error.mixed.required' );
            },
            notType: ( params: any ) =>
            {
                return i18n.t( 'messages.error.mixed.notType', { type: params.type } );
            },
            notNull: () =>
            {
                return i18n.t( 'messages.error.mixed.notNull' );
            },
            oneOf: ( params: any ) =>
            {
                if( params.path == FIELD_NAMES.passwordConfirm )
                {
                    return i18n.t( 'messages.error.confirmPassword' );
                }

                return i18n.t( 'messages.error.mixed.oneOf', { values: params.values } );
            }
        },
        number: {
            min: ( params: any ) =>
            {
                return i18n.t( 'messages.error.number.min', { min: params.min } );
            },
            max: ( params: any ) =>
            {
                return i18n.t( 'messages.error.number.max', { max: params.max } );
            },
            positive: () =>
            {
                return i18n.t( 'messages.error.number.positive' );
            },
            integer: () =>
            {
                return i18n.t( 'messages.error.number.integer' );
            },
            moreThan: ( params: any ) =>
            {
                return i18n.t( 'messages.error.number.moreThan', { more: params.more } );
            }
        },
        string: {
            min: ( params: any ) =>
            {
                return i18n.t( 'messages.error.string.min', { min: params.min } );
            },
            max: ( params: any ) =>
            {
                return i18n.t( 'messages.error.string.max', { max: params.max } );
            },
            matches: ( params: any ) =>
            {
                if( params.path == FIELD_NAMES.handle )
                {
                    return i18n.t( 'messages.error.string.handle' );
                }
                else if( params.path == FIELD_NAMES.confirmPassword )
                {
                    return i18n.t( 'messages.error.string.password' );
                }

                // fall through to default for other fields.
                return i18n.t( 'messages.error.string.default' );
            },
            email: () =>
            {
                return i18n.t( 'messages.error.string.email' );
            },
            url: () =>
            {
                return i18n.t( 'messages.error.string.url' );
            },
            uuid: () =>
            {
                return i18n.t( 'messages.error.string.uuid' );
            }
        },
        date: {
            min: ( params: any ) =>
            {
                const minDate = dayjs( params.min ).format( 'YYYY-MM-DD' );
                return i18n.t( 'messages.error.date.min', { min: minDate } );
            },
            max: ( params: any ) =>
            {
                const maxDate = dayjs( params.max ).format( 'YYYY-MM-DD' );
                return i18n.t( 'messages.error.date.max', { max: maxDate } );
            },
            format: () =>
            {
                return i18n.t( 'messages.error.date.format' );
            },
            utc: () =>
            {
                return i18n.t( 'messages.error.date.utc' );
            }
        },
        array: {
            required: () =>
            {
                return i18n.t( 'messages.error.array.required' );
            },
            min: ( params: any ) =>
            {
                return i18n.t( 'messages.error.array.min', { min: params.min } );
            },
            max: ( params: any ) =>
            {
                return i18n.t( 'messages.error.array.max', { max: params.max } );
            }
        },
        boolean: {
            notType: () =>
            {
                return i18n.t( 'messages.error.boolean.notType' );
            },
            mustAccept: ( params: any ) =>
            {
                return i18n.t( 'messages.error.boolean.mustAccept', { field: params.path } );
            },
            mustConfirm: () =>
            {
                return i18n.t( 'messages.error.boolean.mustConfirm' );
            }
        }
    };

    // Set up the locale in Yup
    setLocale( localize );
};

// Function to update locale when language changes
export const updateYupLocale = () =>
{
    setupYupLocaleWithI18n();
};

// Initialize on module load
setupYupLocaleWithI18n();

export default setupYupLocaleWithI18n;