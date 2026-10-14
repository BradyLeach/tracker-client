/**
 * Label
 *
 * Renders an enum value as a styled outlined chip, translated via i18n.
 * Active partnerships use primary colour; inactive use neutral.
 *
 * Usage:
 *   <Label namespace="enums.partnershipType" value={partnership.partnershipType} active={isActive} />
 */

import { useTranslation } from 'react-i18next';
import { Chip, type ChipProps } from '@/components/ui/data-display/Chip';

export interface LabelProps extends Omit<ChipProps, 'children'>
{
    /** i18n namespace prefix — e.g. "enums.partnershipType" */
    namespace: string;
    /** Enum value — appended to namespace to form the full i18n key */
    value: string;
    /** Controls colour: primary when true, neutral when false. Defaults to true. */
    active?: boolean;
    /** True if this will be an outlined variant, otherwise false*/
    isOutline?: boolean;
}

export function Label( { namespace, value, active = true, isOutline = true, ...chipProps }: LabelProps )
{
    const { t } = useTranslation();

    return (
        <Chip

            label={t( `${namespace}.${value}` )}
            size="medium"
            variant={ isOutline ? "outlined" : "filled"}
            sx={{
                width: 'fit-content',
                height: 'auto',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: 500,
                color: active ? 'graphite' : 'text.muted',
                borderColor: active ? 'graphite' : 'border.base',
                '& .MuiChip-label': { padding: '2.5px 8px' },
            }}
            {...chipProps}
        />
    );
}
