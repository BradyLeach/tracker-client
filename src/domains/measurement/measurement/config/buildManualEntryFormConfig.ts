/**
 * buildManualEntryFormConfig
 *
 * Form config for entering one measurement by hand into a source. What can be entered is
 * the source's to say: the measurement names are its allowed names, and there is one
 * optional field per dimension key it may write, named `dimensions.<key>` so the values
 * arrive as the dimensions object the server stores.
 *
 * An event source records one occurrence per measurement, so its value starts at 1; a
 * bucket source records a total, which the user enters.
 */

import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { MeasurementSource } from '../../measurementSource/types/measurementSource.types';

export function buildManualEntryFormConfig( source: MeasurementSource ): FormConfig
{
    const fields: FormFieldConfig[] = [
        {
            name: 'name',
            type: 'select',
            required: true,
            options: source.allowedMeasurementNames.map( name => ( { value: name, label: name } ) ),
        },
        { name: 'occurredAt', type: 'date', required: true },
        {
            name: 'value',
            type: 'number',
            required: source.sourceType === 'bucket',
            defaultValue: source.sourceType === 'event' ? 1 : undefined,
        },
        { name: 'campaignKey', type: 'text' },
        ...source.allowedDimensionKeys.map( key => ( {
            name: `dimensions.${key}`,
            type: 'text' as const,
            virtual: true,
            label: { text: key },
        } ) ),
    ];

    return {
        context: {
            isCreate: true,
            service: 'manualEntry',
            operation: 'create',
        },
        groups: [{ type: 'fields' as const, fields }],
    };
}
