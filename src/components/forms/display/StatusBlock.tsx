import { useTranslation } from 'react-i18next';
import { Box, Chip, FormLabel, Stack } from '@/components/ui';
import { STATUS_COLOR_MAP } from './FormStatusChip';
import type { StatusItemConfig } from '@/components/forms/types/formConfig.types';

export interface StatusBlockProps
{
    items: StatusItemConfig[];
}

export function StatusBlock( { items }: StatusBlockProps )
{
    const { t } = useTranslation();

    return (
        <Stack gap={1}>
            {items.map( item => (
                <Box
                    key={item.labelKey}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <FormLabel>{t( item.labelKey )}</FormLabel>
                    <Chip
                        label={t( item.translationKey )}
                        size="small"
                        color={STATUS_COLOR_MAP[item.value] ?? 'default'}
                        sx={{ minWidth: 120, justifyContent: 'center' }}
                    />
                </Box>
            ) )}
        </Stack>
    );
}
