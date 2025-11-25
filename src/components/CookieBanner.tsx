'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Cookie } from 'lucide-react'
import Link from 'next/link'

interface CookieConsent {
  essential: boolean
  analytics: boolean
  timestamp: number
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait un choix
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Afficher le banner après un petit délai
      setTimeout(() => setShowBanner(true), 1000)
    }
  }, [])

  const saveConsent = (consent: CookieConsent) => {
    localStorage.setItem('cookie-consent', JSON.stringify(consent))
    setShowBanner(false)
  }

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      timestamp: Date.now()
    })
  }

  const acceptEssentialOnly = () => {
    saveConsent({
      essential: true,
      analytics: false,
      timestamp: Date.now()
    })
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-pink-500/30 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Gestion des cookies
                      </h3>
                      <p className="text-sm text-gray-400">
                        Nous respectons votre vie privée
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBanner(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-gray-300 leading-relaxed">
                    Nous utilisons des cookies essentiels pour assurer le bon fonctionnement
                    de notre site (authentification, sécurité). Aucun cookie de tracking ou
                    publicitaire n'est utilisé.
                  </p>
                </div>

                {/* Details (optional) */}
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mb-6 space-y-3"
                  >
                    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Cookies essentiels
                        </h4>
                        <span className="text-xs text-gray-400">Toujours actifs</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Nécessaires au fonctionnement du site (connexion, sécurité, préférences).
                      </p>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                          Cookies analytiques
                        </h4>
                        <span className="text-xs text-gray-400">Désactivés</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Nous n'utilisons aucun cookie de tracking ou d'analyse.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all duration-300 font-medium border border-gray-700"
                  >
                    {showDetails ? 'Masquer les détails' : 'Voir les détails'}
                  </button>

                  <button
                    onClick={acceptEssentialOnly}
                    className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all duration-300 font-medium border border-gray-700"
                  >
                    Essentiels uniquement
                  </button>

                  <button
                    onClick={acceptAll}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-pink-500/25"
                  >
                    Tout accepter
                  </button>
                </div>

                {/* Footer link */}
                <div className="mt-4 text-center">
                  <Link
                    href="/cookies"
                    className="text-sm text-gray-400 hover:text-pink-400 transition-colors underline"
                  >
                    En savoir plus sur notre politique de cookies
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
