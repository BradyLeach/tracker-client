/**
 * buildConnectionFormConfig
 *
 * Form config for a connection to one connector. The connector is chosen before the form,
 * because what a connection holds depends on it: its settings and credentials are the
 * fields its declaration lists, so no connector's fields are written here.
 *
 * Pass defaults to pre-populate fields from an existing connection; without an id the config
 * is for create. Settings fields are named `settings.<key>` and credential fields
 * `credentials.<key>`, so the submitted values arrive as the objects the server stores.
 * Credentials are never read back, so an edit form starts them blank and leaves them
 * optional — blank keeps the stored ones.
 */

import i18n from 'i18next';
import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig, FormFieldConfig, FormFieldType } from '@/components/forms/types/formConfig.types';
import type { Connection, ConnectorDescriptor, ConnectorField } from '../types/connection.types';

const CONNECTION_FIELDS = ['label', 'isActive', 'pullIntervalMinutes'];

/** The form control each declared field type is entered with. */
const FIELD_TYPES: Record<ConnectorField['type'], FormFieldType> = {
    text: 'text',
    number: 'number',
    list: 'tags',
};

/**
 * A declared connector field as a form field under `prefix`, labelled from the
 * connector-field translations.
 */
function declaredField(
    field: ConnectorField,
    prefix: 'settings' | 'credentials',
    required: boolean,
    defaultValue?: unknown,
): FormFieldConfig
{
    const placeholderKey = `forms.connection.connectorFields.${field.key}Placeholder`;

    return {
        name: `${prefix}.${field.key}`,
        type: prefix === 'credentials' ? 'password' : FIELD_TYPES[field.type],
        required,
        virtual: true,
        defaultValue,
        label: { text: `forms.connection.connectorFields.${field.key}` },
        placeholder: i18n.exists( placeholderKey ) ? placeholderKey : undefined,
    };
}

export function buildConnectionFormConfig( connector: ConnectorDescriptor, defaults?: Partial<Connection> ): FormConfig
{
    const isEdit = !!defaults?.id;
    const { settingFields, credentialFields } = connector.declaration;

    const allFields = formFieldFactory.getFormFields( 'connection' );
    const byKey = Object.fromEntries( allFields.map( field => [field.name, field] ) );
    const validation = modelRegistry.getValidation( 'connection' ).pick( CONNECTION_FIELDS );

    const presetValues: Partial<Connection> = defaults ?? {};

    const connectionFields: FormFieldConfig[] = CONNECTION_FIELDS
        .map( key => byKey[key]
            ? { ...byKey[key], defaultValue: presetValues[key as keyof Connection] } as FormFieldConfig
            : undefined )
        .filter( ( field ): field is FormFieldConfig => field !== undefined );

    const settings = settingFields.map( field =>
        declaredField( field, 'settings', !field.optional, presetValues.settings?.[field.key] ) );

    const credentials = credentialFields.map( field =>
        declaredField( field, 'credentials', !isEdit && !field.optional ) );

    return {
        context: {
            isCreate: !isEdit,
            service: 'connection',
            operation: isEdit ? 'update' : 'create',
        },
        validationSchema: validation,
        groups: [
            { type: 'fields' as const, fields: connectionFields },
            ...( settings.length ? [{ type: 'fields' as const, title: 'forms.connection.settingsTitle', fields: settings }] : [] ),
            ...( credentials.length
                ? [{
                    type: 'fields' as const,
                    title: 'forms.connection.credentialsTitle',
                    subtitle: isEdit ? 'forms.connection.credentialsKeep' : undefined,
                    fields: credentials,
                }]
                : [] ),
        ],
    };
}
