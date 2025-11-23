'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import i18n from '../i18n/config'

export type Language = 'fr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, options?: any) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr')

  useEffect(() => {
    // Détection automatique de la langue basée sur la géolocalisation
    const detectLanguage = async () => {
      try {
        // Détecter le pays via l'API ipapi.co
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        const countryCode = data.country_code

        console.log('🌍 Pays détecté:', countryCode)

        // Pays francophones : FR, BE, CH, LU
        const francophoneCountries = ['FR', 'BE', 'CH', 'LU']

        if (francophoneCountries.includes(countryCode)) {
          setLanguageState('fr')
          i18n.changeLanguage('fr')
          console.log('🇫🇷 Langue définie : Français')
        } else {
          setLanguageState('en')
          i18n.changeLanguage('en')
          console.log('🇬🇧 Langue définie : Anglais')
        }
      } catch (error) {
        // En cas d'erreur, utiliser le français par défaut
        console.error('Erreur détection langue:', error)
        setLanguageState('fr')
        i18n.changeLanguage('fr')
        console.log('🇫🇷 Langue par défaut : Français (erreur détection)')
      }
    }

    detectLanguage()
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    i18n.changeLanguage(lang)
  }

  const t = (key: string, options?: any): string => {
    // Force re-render when language changes by including it in the dependency
    return i18n.t(key, { ...options, lng: language }) as string
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
