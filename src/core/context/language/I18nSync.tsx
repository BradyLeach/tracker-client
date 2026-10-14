/**
 * I18nSync
 *
 * Syncs LanguageContext state to i18n and dayjs.
 * LanguageContext is the source of truth; this component propagates changes.
 *
 * Flow:
 * 1. Get language ID from context
 * 2. Query backend for language by ID
 * 3. Use language code to look up static config
 * 4. Sync i18n and dayjs with resolved locales
 */

import { useEffect, type ReactNode } from 'react';
import i18n from '@/utils/i18n';
import dayjs from 'dayjs';
import { useLanguage } from './Language.context';
import { usePublicLanguages } from '@/domains/system/hooks/usePublicLanguages';
import { languageConfig, DEFAULT_LANGUAGE } from '@/../config/modules/language';

interface I18nSyncProps
{
    children: ReactNode;
}

export function I18nSync( { children }: I18nSyncProps )
{
    const { current: languageId } = useLanguage();
    const { data: languages } = usePublicLanguages();

    useEffect( () =>
    {
        // Still loading — no-op until data arrives
        if( languages === undefined ) return;

        // No language ID yet (startup) or empty reference data — use default
        if( !languageId || languages.length === 0 )
        {
            if( i18n.language !== DEFAULT_LANGUAGE.i18n )
            {
                void i18n.changeLanguage( DEFAULT_LANGUAGE.i18n );
            }
            dayjs.locale( DEFAULT_LANGUAGE.dayjs );
            return;
        }

        // Find the language from query by ID
        const systemLanguage = languages?.find( ( lang ) => lang.id === languageId );

        if( !systemLanguage )
        {
            return; // Skip sync if language not found
        }

        // Look up static config by code
        const languageConfigEntry = Object.values( languageConfig ).find(
            ( lang ) => lang.code === systemLanguage.code
        );

        if( !languageConfigEntry )
        {
            return; // Skip sync if config not found
        }

        // Sync i18n and dayjs
        if( i18n.language !== languageConfigEntry.i18n )
        {
            void i18n.changeLanguage( languageConfigEntry.i18n );
        }
        dayjs.locale( languageConfigEntry.dayjs );
    }, [languageId, languages] );

    return <>{ children }</>;
}
