'use client'

import { motion } from 'framer-motion'
import { MapPin, X } from 'lucide-react'
import { useAdsContext } from '@/contexts/AdsContext'
import { useCountry } from '@/contexts/CountryContext'
import { useCityFilter } from '@/contexts/CityFilterContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'

export function AdsStats() {
  const { selectedCountry } = useCountry()
  const { selectedCity, setSelectedCity } = useCityFilter()
  const { t } = useLanguage()
  const [isMobile, setIsMobile] = useState(false)

  // Utiliser le contexte partagé des annonces
  const { ads, loading } = useAdsContext()

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const totalAds = ads.length

  // Compter les annonces par ville
  const cityCounts = ads.reduce((acc, ad) => {
    acc[ad.location] = (acc[ad.location] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Trier les villes par nombre d'annonces (décroissant)
  // 4 villes sur mobile, 10 sur desktop
  const topCities = Object.entries(cityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, isMobile ? 4 : 10)
    .map(([city, count]) => ({ city, count }))

  const handleCityClick = (city: string) => {
    if (selectedCity === city) {
      setSelectedCity(null) // Désélectionner si déjà sélectionné
    } else {
      setSelectedCity(city)
    }
  }

  const handleClearFilter = () => {
    setSelectedCity(null)
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 pt-6 pb-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/30 rounded-2xl p-6"
      >
        {/* Total des annonces */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            {loading ? (
              <span className="text-gray-400">Chargement...</span>
            ) : (
              <>
                {totalAds} <span className="text-pink-500">{t('home.adsAvailable')}</span>
              </>
            )}
          </h2>
          <p className="text-gray-400 text-sm">
            {t('home.in')} {selectedCountry.name}
          </p>
        </div>

        {/* Filtre actif */}
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <div className="bg-pink-500/20 border border-pink-500 rounded-full px-4 py-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-pink-500" />
              <span className="text-white text-sm font-medium">{selectedCity}</span>
              <button
                onClick={handleClearFilter}
                className="ml-1 hover:bg-pink-500/30 rounded-full p-1 transition-colors"
              >
                <X className="w-4 h-4 text-pink-500" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Top villes */}
        {!loading && topCities.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3 text-center">
              {t('home.mostActiveCities')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {topCities.map(({ city, count }, index) => (
                <motion.button
                  key={city}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleCityClick(city)}
                  className={`bg-gray-900/50 backdrop-blur-sm border rounded-xl p-3 transition-all cursor-pointer ${
                    selectedCity === city
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-gray-800 hover:border-pink-500/50'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className={`w-4 h-4 ${selectedCity === city ? 'text-pink-500' : 'text-pink-500'}`} />
                    <span className="text-white text-sm font-medium truncate">
                      {city}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {count} {count > 1 ? t('home.ads') : t('home.ad')}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
