/**
 * useCurrencies Hook
 *
 * Currencies from the entity store, behind the authentication boundary.
 *
 * Nothing pre-auth renders a currency, so there is no public counterpart to this one.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { currencyService } from '../services/geo.service';
import type { SystemCurrency } from '../types/reference.types';

export function useCurrencies()
{
    return useDataQuery<SystemCurrency[]>( () => currencyService.observeAll(), [] );
}
