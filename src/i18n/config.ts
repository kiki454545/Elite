import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr.json'
import en from './locales/en.json'
import adDataEn from './locales/ad-data-en.json'
import adDataFr from './locales/ad-data-fr.json'
import frSearchFilters from './locales/fr-search-filters.json'
import enSearchFilters from './locales/en-search-filters.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: { ...fr, ...frSearchFilters },
        adData: adDataFr
      },
      en: {
        translation: { ...en, ...enSearchFilters },
        adData: adDataEn
      },
    },
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  })

// Helper function to translate ad data (services, categories, etc.)
export const translateAdData = (key: string, language: string = 'fr'): string => {
  return i18n.t(key, { ns: 'adData', lng: language, defaultValue: key })
}

export default i18n
