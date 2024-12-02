import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../translation/en.json';
import fr from '../translation/fr.json';
import ar from '../translation/ar.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

export default i18n;
