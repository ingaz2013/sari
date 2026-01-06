/**
 * Supported languages configuration
 */

export type Language = 'ar' | 'en' | 'fr' | 'tr' | 'es' | 'it' | 'both';

export interface LanguageConfig {
  code: Language;
  name: string;
  nameAr: string;
  direction: 'rtl' | 'ltr';
  flag: string;
}

export const SUPPORTED_LANGUAGES: Record<Language, LanguageConfig> = {
  ar: {
    code: 'ar',
    name: 'Arabic',
    nameAr: 'العربية',
    direction: 'rtl',
    flag: '🇸🇦',
  },
  en: {
    code: 'en',
    name: 'English',
    nameAr: 'الإنجليزية',
    direction: 'ltr',
    flag: '🇺🇸',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nameAr: 'الفرنسية',
    direction: 'ltr',
    flag: '🇫🇷',
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nameAr: 'التركية',
    direction: 'ltr',
    flag: '🇹🇷',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nameAr: 'الإسبانية',
    direction: 'ltr',
    flag: '🇪🇸',
  },
  it: {
    code: 'it',
    name: 'Italian',
    nameAr: 'الإيطالية',
    direction: 'ltr',
    flag: '🇮🇹',
  },
  both: {
    code: 'both',
    name: 'Both (Arabic & English)',
    nameAr: 'كلاهما (عربي وإنجليزي)',
    direction: 'rtl',
    flag: '🌐',
  },
};

/**
 * Get language configuration by code
 */
export function getLanguageConfig(code: Language): LanguageConfig {
  return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES.ar;
}

/**
 * Get all supported languages as array
 */
export function getAllLanguages(): LanguageConfig[] {
  return Object.values(SUPPORTED_LANGUAGES);
}

/**
 * Get languages for dropdown/select (excluding 'both')
 */
export function getLanguagesForSelection(): LanguageConfig[] {
  return Object.values(SUPPORTED_LANGUAGES).filter(lang => lang.code !== 'both');
}
