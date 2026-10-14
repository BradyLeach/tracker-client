export interface LanguageConfig
{
    code: string;        // backend / profile value (e.g. "en")
    i18n: string;        // i18next locale (e.g. "en-GB")
    dayjs: string;       // dayjs locale (e.g. "en-gb")
    direction: 'ltr' | 'rtl';
}

export const languageConfig: Record<string, LanguageConfig> = {
    engb: { code: 'en-GB', i18n: 'en-GB', dayjs: 'en-gb', direction: 'ltr' },
    enus: { code: 'en-US', i18n: 'en', dayjs: 'en', direction: 'ltr' },
    en: { code: 'en', i18n: 'en', dayjs: 'en', direction: 'ltr' },
    ja: { code: 'ja', i18n: 'ja', dayjs: 'ja', direction: 'ltr' },
    ch: { code: 'ch', i18n: 'ch', dayjs: 'zh-cn', direction: 'ltr' },
};

export const DEFAULT_LANGUAGE = languageConfig.engb;