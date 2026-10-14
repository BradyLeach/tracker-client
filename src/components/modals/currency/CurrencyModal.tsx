/**
 * CurrencyModal
 *
 * Allows users to select their preferred currency.
 * Demonstrates the reference data pattern:
 * - Context stores only the ID (current selection)
 * - Hook provides available options (service caches)
 * - Component renders selection without managing fetch
 */

import { useTranslation } from 'react-i18next';
import { Dialog, MenuItem, Typography, Box } from '@/components/ui';
import { useCurrency } from '@/core/context';
import { useCurrencies } from '@/domains/system/hooks';
import { preferencesOrchestrator } from '@/domains/preferences';
import { formatApiError } from '@/core/utils';
import type { CurrencyId } from '@/core/types/ids';
import Spinner from '@/components/shared/spinner/Spinner';

interface CurrencyModalProps
{
    open: boolean;
    onClose: () => void;
}

export function CurrencyModal( { open, onClose }: CurrencyModalProps )
{
    const { t } = useTranslation();
    const { current: currentCurrencyId } = useCurrency();
    const { data: currencies, isLoading, error: apiError } = useCurrencies();

    const handleSelect = ( id: CurrencyId ) =>
    {
        // Fire-and-forget: orchestrator updates context + persists if authenticated
        void preferencesOrchestrator.updateCurrency( id );
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={t( 'preferences.currency.title', 'Select Currency' )}
            maxWidth="xs"
            fullWidth
        >
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Spinner />
                </Box>
            )}

            {apiError && (
                <Typography color="error" sx={{ py: 2 }}>
                    {formatApiError( t, apiError )}
                </Typography>
            )}

            {!isLoading && !apiError && currencies && (
                <Box sx={{ py: 1 }}>
                    {currencies.map( ( currency ) => (
                        <MenuItem
                            key={currency.id}
                            selected={currency.id === currentCurrencyId}
                            onClick={() => handleSelect( currency.id as CurrencyId )}
                            sx={{ py: 1.25, px: 2 }}
                        >
                            {currency.label} ({currency.symbol})
                        </MenuItem>
                    ) )}
                </Box>
            )}
        </Dialog>
    );
}
