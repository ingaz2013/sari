import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationAR from '../locales/ar.json';
import translationEN from '../locales/en.json';
import translationFR from '../locales/fr.json';
import translationTR from '../locales/tr.json';

const resources = {
  ar: {
    translation: translationAR
  },
  en: {
    translation: translationEN
  },
  fr: {
    translation: translationFR
  },
  tr: {
    translation: translationTR
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    lng: 'ar',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
