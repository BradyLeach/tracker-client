/**
 * buildChannelIdeaFormConfig
 *
 * Form config for adding an idea to the Bullseye board or editing one. Pass defaults to
 * pre-populate fields — an existing idea, or just a channel and ring when an idea is added
 * from the channel library. Without an id the config is for create.
 *
 * The channel is chosen from the channel catalogue, translated, and the ring from the
 * model's enum. The catalogue is passed in, so the builder stays pure data and a
 * playground can call it with a mock catalogue.
 */

import i18n from 'i18next';
import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { TypeCatalogue } from '@/domains/system';
import type { ChannelIdea } from '../types/channelIdea.types';

const FORM_FIELDS = ['channelId', 'title', 'description', 'ring'];

/** Notes are a few sentences — why it might work, and how to test it cheaply. */
const DESCRIPTION_ROWS = 3;

export function buildChannelIdeaFormConfig( catalogue: TypeCatalogue, defaults?: Partial<ChannelIdea> ): FormConfig
{
    const allFields = formFieldFactory.getFormFields( 'channelIdea' );
    const byKey = Object.fromEntries( allFields.map( field => [field.name, field] ) );
    const validation = modelRegistry.getValidation( 'channelIdea' ).pick( FORM_FIELDS );

    const presetValues: Partial<ChannelIdea> = defaults ?? {};

    const channelOptions = catalogue.getByModel( 'channel' )
        .map( channel => ( { value: channel.id, label: i18n.t( `types.channel.${channel.label}` ) } ) )
        .sort( ( first, second ) => first.label.localeCompare( second.label ) );

    const fields: FormFieldConfig[] = FORM_FIELDS
        .map( key => byKey[key]
            ? { ...byKey[key], defaultValue: presetValues[key as keyof ChannelIdea] } as FormFieldConfig
            : undefined )
        .filter( ( field ): field is FormFieldConfig => field !== undefined )
        .map( field =>
        {
            if( field.name === 'channelId' ) return { ...field, type: 'select', options: channelOptions };
            if( field.name === 'description' )
            {
                return { ...field, props: { ...field.props, multiline: true, minRows: DESCRIPTION_ROWS } };
            }
            if( field.name === 'ring' ) return withTranslatedOptions( field );
            return field;
        } );

    return {
        context: {
            isCreate: !defaults?.id,
            service: 'channelIdea',
            operation: defaults?.id ? 'update' : 'create',
        },
        validationSchema: validation,
        groups: [{ type: 'fields' as const, fields }],
    };
}

/** Enum options arrive as their raw values; the translation happens here, where the form is assembled. */
function withTranslatedOptions( field: FormFieldConfig ): FormFieldConfig
{
    if( !field.options ) return field;

    return {
        ...field,
        options: field.options.map( option => ( {
            value: option.value,
            label: i18n.t( `forms.channelIdea.options.${option.value}` ),
        } ) ),
    };
}
