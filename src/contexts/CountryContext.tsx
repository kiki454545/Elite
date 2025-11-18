'use client'

import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react'

export type Country = {
  code: string
  name: string
  flag: string
}

export const COUNTRIES: Country[] = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'MT', name: 'Malte', flag: '🇲🇹' },
]

// Pays avec restrictions strictes (ne peuvent voir que leur propre pays)
const RESTRICTED_COUNTRIES = ['FR']

interface CountryContextType {
  selectedCountry: Country
  setSelectedCountry: (country: Country) => void
  userCountry: Country | null
  isRestricted: boolean
  canChangeCountry: boolean
  isDetectingCountry: boolean
}

const CountryContext = createContext<CountryContextType | undefined>(undefined)

export function CountryProvider({ children }: { children: ReactNode }) {
  const [userCountry, setUserCountry] = useState<Country | null>(null)
  const [selectedCountry, setSelectedCountryState] = useState<Country>(COUNTRIES[0]) // France par défaut
  const [isDetectingCountry, setIsDetectingCountry] = useState(true)

  // Détecter le pays de l'utilisateur via l'API de géolocalisation
  useEffect(() => {
    const detectUserCountry = async () => {
      try {
        console.log('🔍 Début de la détection du pays...')
        // Essayer avec l'API ipapi.co (gratuite)
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()

        console.log('📡 Réponse API géolocalisation:', data)

        if (data.country_code) {
          const detectedCountry = COUNTRIES.find(c => c.code === data.country_code)
          if (detectedCountry) {
            console.log('✅ Pays détecté et supporté:', detectedCountry.name, `(${detectedCountry.code})`)
            setUserCountry(detectedCountry)
            setSelectedCountryState(detectedCountry)
            console.log('📍 État mis à jour avec:', detectedCountry.name)
          } else {
            console.warn('⚠️ Pays détecté non supporté:', data.country_code, '- Utilisation de France par défaut')
            // Pays non supporté, utiliser France par défaut
            setUserCountry(COUNTRIES[0])
            setSelectedCountryState(COUNTRIES[0])
          }
        }
      } catch (error) {
        console.error('❌ Erreur détection pays:', error)
        // Par défaut France si erreur
        setUserCountry(COUNTRIES[0])
        setSelectedCountryState(COUNTRIES[0])
      } finally {
        console.log('🏁 Détection du pays terminée')
        setIsDetectingCountry(false)
      }
    }

    detectUserCountry()
  }, [])

  const isRestricted = useMemo(() => {
    return userCountry ? RESTRICTED_COUNTRIES.includes(userCountry.code) : false
  }, [userCountry])

  const canChangeCountry = useMemo(() => {
    return !isRestricted
  }, [isRestricted])

  const setSelectedCountry = (country: Country) => {
    console.log('🔄 Tentative de changement de pays vers:', country.name, `isRestricted:`, isRestricted, `userCountry:`, userCountry?.code)

    // Si l'utilisateur est en France, il ne peut pas changer de pays
    if (isRestricted && country.code !== selectedCountry.code) {
      alert('🚫 Restriction géographique\n\nEn raison des lois françaises, vous ne pouvez consulter que les annonces de France.\n\nPour accéder aux autres pays, vous devez vous connecter depuis l\'étranger.')
      console.warn('🚫 Changement de pays bloqué pour les utilisateurs français')
      return
    }

    console.log('✅ Changement de pays autorisé vers:', country.name)
    setSelectedCountryState(country)
  }

  const value = useMemo(() => ({
    selectedCountry,
    setSelectedCountry,
    userCountry,
    isRestricted,
    canChangeCountry,
    isDetectingCountry
  }), [selectedCountry, userCountry, isRestricted, canChangeCountry, isDetectingCountry])

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  )
}

export function useCountry() {
  const context = useContext(CountryContext)
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider')
  }
  return context
}
