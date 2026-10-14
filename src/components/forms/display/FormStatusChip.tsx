import { useTranslation } from 'react-i18next';
import { Box, Chip, FormLabel } from '@/components/ui';
import type { ChipProps } from '@/components/ui';

export interface FormStatusChipProps
{
    value: string;
    label: string;
    translationKey: string;
}

export const STATUS_COLOR_MAP: Record<string, ChipProps['color']> = {
    active: 'success',
    verified: 'success',
    pending: 'warning',
    locked: 'error',
    disabled: 'error',
    rejected: 'error',
    revoked: 'error',
    expired: 'warning',
    unverified: 'default',
};

export function FormStatusChip( { value, label, translationKey }: FormStatusChipProps )
{
    const { t } = useTranslation();

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormLabel>{label}</FormLabel>
            <Chip
                label={t( translationKey )}
                size="small"
                color={STATUS_COLOR_MAP[value] ?? 'default'}
            />
        </Box>
    );
}
