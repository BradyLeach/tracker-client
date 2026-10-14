/**
 * useLanguages Hook
 *
 * Languages from the entity store, behind the authentication boundary.
 *
 * I18nSync is mounted app-wide and resolves a language before a session exists, so it
 * reads the public catalog through usePublicLanguages instead. This one serves the
 * authenticated selection UI.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { languageService } from '../services/geo.service';
import type { SystemLanguage } from '../types/reference.types';

export function useLanguages()
{
    return useDataQuery<SystemLanguage[]>( () => languageService.observeAll(), [] );
}
