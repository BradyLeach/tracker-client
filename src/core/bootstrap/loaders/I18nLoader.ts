import i18n from '@/utils/i18n';
import { updateYupLocale } from '@/core/validation/yup/i18nYup';
import type { BootstrapLoader } from '../types';
import dayjs from 'dayjs';
import { logger } from '@/core/utils/logger';
import { DEFAULT_LANGUAGE } from '@/../config/modules/language';

export interface I18nConfig {
  language: string;
  isReady: boolean;
}

export class I18nLoader implements BootstrapLoader<I18nConfig>
{
    name = 'i18n';
    critical = true;

    async load(): Promise<I18nConfig>
    {
        // Initialize from config default
        if( i18n.language !== DEFAULT_LANGUAGE.i18n )
        {
            await i18n.changeLanguage( DEFAULT_LANGUAGE.i18n );
        }

        dayjs.locale( DEFAULT_LANGUAGE.dayjs );

        // Sync yup when language changes (triggered by LanguageContext)
        i18n.on( 'languageChanged', ( lng: string ) =>
        {
            logger.debug( 'Language changed', { newLanguage: lng } );
            updateYupLocale();
        } );

        return {
            language: i18n.language,
            isReady: i18n.isInitialized,
        };
    }
}