'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCountry, COUNTRIES } from '@/contexts/CountryContext'
import { useLanguage, Language } from '@/contexts/LanguageContext'
import { useStats } from '@/hooks/useStats'
import { ChevronDown, ArrowLeft, Users, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  backUrl?: string
}

// Composant pour le drapeau français
function FrenchFlag({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="600" fill="#ED2939"/>
      <rect width="600" height="600" fill="#fff"/>
      <rect width="300" height="600" fill="#002395"/>
    </svg>
  )
}

// Composant pour le drapeau britannique
function BritishFlag({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
      <clipPath id="t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  )
}

export function Header({ title, showBackButton = false, backUrl = '/' }: HeaderProps) {
  const router = useRouter()
  const { selectedCountry, setSelectedCountry } = useCountry()
  const { language, setLanguage, t } = useLanguage()
  const { stats, loading: statsLoading } = useStats()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const languages = [
    { code: 'fr' as Language, name: 'Français', flag: <FrenchFlag className="w-8 h-6" /> },
    { code: 'en' as Language, name: 'English', flag: <BritishFlag className="w-8 h-6" /> }
  ]

  return (
    <header className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-screen-xl mx-auto px-0.5 md:px-4 py-2 md:py-4 flex items-center justify-between gap-0.5 md:gap-4">
        {/* Left side - Back button (if enabled) or Logo + Country Selector + Stats */}
        <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
          {showBackButton ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(backUrl)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          ) : (
            <button
              onClick={() => router.push('/')}
              className="text-base md:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              SexElite.eu
            </button>
          )}

          {/* Country Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-0.5 md:gap-2 bg-gray-800/80 hover:bg-gray-700/80 px-1.5 md:px-3 py-1 md:py-2 rounded-lg transition-colors border border-gray-700"
            >
              <span className="text-sm text-white font-medium hidden md:inline">
                {t(`countries.${selectedCountry.code}`)}
              </span>
              <span className="text-base md:text-xl">{selectedCountry.flag}</span>
              <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  {/* Backdrop pour fermer le dropdown */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-20 min-w-[200px]"
                  >
                    {COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          setSelectedCountry(country)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/80 transition-colors ${
                          selectedCountry.code === country.code ? 'bg-gray-700/50' : ''
                        }`}
                      >
                        <span className="text-xl">{country.flag}</span>
                        <span className="text-sm text-white font-medium">
                          {t(`countries.${country.code}`)}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Stats on mobile - next to country selector */}
          {!title && !statsLoading && (
            <div className="flex items-center gap-0.5 md:hidden">
              <div className="flex items-center gap-0.5 bg-gray-800/50 px-0.5 py-0.5 rounded-lg border border-gray-700">
                <Users className="w-3 h-3 text-blue-500" />
                <span className="text-white font-semibold text-[10px]">{stats.totalUsers}</span>
              </div>
              <div className="flex items-center gap-0.5 bg-gray-800/50 px-0.5 py-0.5 rounded-lg border border-gray-700">
                <FileText className="w-3 h-3 text-pink-500" />
                <span className="text-white font-semibold text-[10px]">{stats.totalAds}</span>
              </div>
            </div>
          )}
        </div>

        {/* Center - Title or Stats (desktop only) */}
        <div className="flex-1 hidden md:flex items-center justify-center gap-4 overflow-hidden">
          {title ? (
            <h1 className="text-xl font-bold text-white truncate">
              {title}
            </h1>
          ) : (
            !statsLoading && (
              <>
                <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-white font-semibold text-sm">{stats.totalUsers}</span>
                  <span className="text-gray-400 text-xs">Utilisateurs</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                  <FileText className="w-4 h-4 text-pink-500" />
                  <span className="text-white font-semibold text-sm">{stats.totalAds}</span>
                  <span className="text-gray-400 text-xs">Annonces</span>
                </div>
              </>
            )
          )}
        </div>

        {/* Right side - Language Selector (always visible) */}
        <div className="flex items-center gap-2 md:gap-2 flex-shrink-0">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`transition-opacity hover:opacity-100 ${
                language === lang.code ? 'opacity-100' : 'opacity-40'
              }`}
              title={lang.name}
            >
              <div className="w-4 h-3 md:w-8 md:h-6">
                {lang.flag}
              </div>
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
