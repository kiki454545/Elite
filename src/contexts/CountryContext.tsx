'use client'

import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, AlertTriangle, XCircle } from 'lucide-react'

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
  const [showRestrictionModal, setShowRestrictionModal] = useState(false)

  // Détecter le pays de l'utilisateur via l'API de géolocalisation
  useEffect(() => {
    const detectUserCountry = async () => {
      try {
        console.log('🔍 Début de la détection du pays...')

        // Mode test : vérifier le localStorage pour forcer un pays (développement uniquement)
        const forcedCountry = typeof window !== 'undefined' ? localStorage.getItem('test_country') : null
        if (forcedCountry) {
          const testCountry = COUNTRIES.find(c => c.code === forcedCountry)
          if (testCountry) {
            console.log('🧪 MODE TEST : Pays forcé à', testCountry.name)
            setUserCountry(testCountry)
            setSelectedCountryState(testCountry)
            setIsDetectingCountry(false)
            return
          }
        }

        // Essayer avec l'API ip-api.com (gratuite et supporte CORS)
        const response = await fetch('http://ip-api.com/json/')
        const data = await response.json()

        console.log('📡 Réponse API géolocalisation:', data)

        if (data.countryCode) {
          const detectedCountry = COUNTRIES.find(c => c.code === data.countryCode)
          if (detectedCountry) {
            console.log('✅ Pays détecté et supporté:', detectedCountry.name, `(${detectedCountry.code})`)
            setUserCountry(detectedCountry)
            setSelectedCountryState(detectedCountry)
            console.log('📍 État mis à jour avec:', detectedCountry.name)
          } else {
            console.warn('⚠️ Pays détecté non supporté:', data.countryCode, '- Utilisation de France par défaut')
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
      setShowRestrictionModal(true)
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

      {/* Modal de restriction dans le thème du site */}
      <AnimatePresence>
        {showRestrictionModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRestrictionModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md w-full shadow-2xl"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icône */}
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-4 border border-pink-500/30">
                    <ShieldAlert className="w-8 h-8 text-pink-500" />
                  </div>

                  {/* Titre */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    Restriction géographique
                  </h3>

                  {/* Message */}
                  <p className="text-gray-400 mb-4 leading-relaxed">
                    Votre adresse IP a été détectée en <span className="font-bold text-pink-500">France</span>.
                  </p>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6 w-full">
                    <p className="text-gray-300 text-sm mb-3">
                      En raison de la législation française :
                    </p>
                    <ul className="space-y-2 text-gray-400 text-sm text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-pink-500">•</span>
                        <span>Accès limité aux annonces françaises uniquement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-pink-500">•</span>
                        <span>Les autres pays ne sont pas accessibles</span>
                      </li>
                    </ul>
                  </div>

                  {/* Bouton */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowRestrictionModal(false)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
                  >
                    J'ai compris
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
