import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr.json'
import en from './locales/en.json'
import adDataEn from './locales/ad-data-en.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr, adData: {} }, // Pas de traduction pour FR, on utilise les valeurs en français directement
      en: { translation: en, adData: adDataEn },
    },
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  })

// Helper function to translate ad data (services, categories, etc.)
export const translateAdData = (key: string, language: string = 'fr'): string => {
  if (language === 'fr') return key // Return French as-is
  return i18n.t(key, { ns: 'adData', lng: language, defaultValue: key })
}

export default i18n
