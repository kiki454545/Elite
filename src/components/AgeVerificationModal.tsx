'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, Check } from 'lucide-react'

// Liste des user-agents de bots/crawlers à ne pas bloquer
const BOT_USER_AGENTS = [
  'googlebot', 'bingbot', 'yandex', 'baiduspider', 'duckduckbot',
  'slurp', 'facebookexternalhit', 'linkedinbot', 'twitterbot',
  'applebot', 'msnbot', 'teoma', 'ia_archiver', 'semrush',
  'ahrefsbot', 'mj12bot', 'dotbot', 'rogerbot', 'seznambot',
  'pinterest', 'embedly', 'quora', 'outbrain', 'vkshare',
  'w3c_validator', 'lighthouse', 'chrome-lighthouse', 'pagespeed'
]

function isBot(): boolean {
  if (typeof window === 'undefined') return false
  const userAgent = window.navigator.userAgent.toLowerCase()
  return BOT_USER_AGENTS.some(bot => userAgent.includes(bot))
}

export function AgeVerificationModal() {
  const [isVisible, setIsVisible] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    // Ne pas afficher le modal pour les bots (SEO)
    if (isBot()) {
      return
    }

    // Vérifier si l'utilisateur a déjà confirmé son âge
    const ageVerified = localStorage.getItem('ageVerified')
    if (!ageVerified) {
      setIsVisible(true)
    }
  }, [])

  const handleConfirm = () => {
    setIsConfirming(true)
    setTimeout(() => {
      localStorage.setItem('ageVerified', 'true')
      setIsVisible(false)
    }, 500)
  }

  const handleDecline = () => {
    // Rediriger vers Google ou une page d'information
    window.location.href = 'https://www.google.com'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl sm:rounded-3xl border-2 border-pink-500/30 shadow-2xl shadow-pink-500/20 max-w-lg w-full p-5 sm:p-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Shield className="w-7 h-7 sm:w-10 sm:h-10 text-pink-500" />
                <h2 className="text-xl sm:text-3xl font-bold text-white">Vérification d&apos;âge</h2>
                <Shield className="w-7 h-7 sm:w-10 sm:h-10 text-pink-500" />
              </div>
              <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto"></div>
            </div>

            {/* Content */}
            <div className="space-y-4 sm:space-y-6 mb-5 sm:mb-8">
              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-yellow-500 font-bold text-sm sm:text-base mb-0.5 sm:mb-1">Contenu réservé aux adultes</h3>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    Ce site contient du contenu pour adultes et est strictement réservé aux personnes majeures.
                  </p>
                </div>
              </div>

              {/* Main Question */}
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                  Avez-vous 18 ans ou plus ?
                </p>
                <p className="text-gray-400 text-sm sm:text-base">
                  Vous devez avoir au moins 18 ans pour accéder à ce contenu
                </p>
              </div>

              {/* Legal Info */}
              <div className="bg-gray-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <p className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>L&apos;accès à ce site est interdit aux mineurs</span>
                </p>
                <p className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>En continuant, vous confirmez être majeur</span>
                </p>
                <p className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>Vous acceptez de voir du contenu adulte</span>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDecline}
                className="bg-gray-800 hover:bg-gray-700 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-base transition-colors border border-gray-700"
              >
                Non, - de 18 ans
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={isConfirming}
                className={`bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-base transition-all shadow-lg shadow-pink-500/30 ${
                  isConfirming ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  </span>
                ) : (
                  'Oui, + de 18 ans'
                )}
              </motion.button>
            </div>

            {/* Footer */}
            <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-4 sm:mt-6">
              En accédant à ce site, vous acceptez nos conditions d&apos;utilisation
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
