'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useCountry, COUNTRIES } from '@/contexts/CountryContext'
import { useLanguage, Language } from '@/contexts/LanguageContext'
import { useStats } from '@/hooks/useStats'
import { ChevronDown, ArrowLeft, Users, FileText, Coins, Home, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

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
  const pathname = usePathname()
  const { selectedCountry, setSelectedCountry, canChangeCountry } = useCountry()
  const { language, setLanguage, t } = useLanguage()
  const { stats, loading: statsLoading } = useStats()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [eliteCoins, setEliteCoins] = useState<number>(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Récupérer le solde EliteCoin de l'utilisateur
  useEffect(() => {
    const fetchUserCoins = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setIsLoggedIn(true)
        const { data: profile } = await supabase
          .from('profiles')
          .select('elite_coins')
          .eq('id', user.id)
          .single()

        if (profile) {
          setEliteCoins(profile.elite_coins || 0)
        }
      } else {
        setIsLoggedIn(false)
        setEliteCoins(0)
      }
    }

    fetchUserCoins()

    // S'abonner aux changements du solde
    const channel = supabase
      .channel('elite_coins_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload: any) => {
          if (payload.new.elite_coins !== undefined) {
            setEliteCoins(payload.new.elite_coins)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const languages = [
    { code: 'fr' as Language, name: 'Français', flag: <FrenchFlag className="w-8 h-6" /> },
    { code: 'en' as Language, name: 'English', flag: <BritishFlag className="w-8 h-6" /> }
  ]

  return (
    <header className="sticky top-0 z-30 bg-gray-900/98 md:backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-screen-xl mx-auto px-2 md:px-4 py-2 md:py-4 flex items-center justify-between gap-2 md:gap-4">
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

          {/* Country Selector - Nom uniquement sans drapeau */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 md:gap-2 bg-gray-800/80 hover:bg-gray-700/80 px-2 md:px-3 py-1 md:py-2 rounded-lg transition-colors border border-gray-700"
            >
              <span className="text-xs md:text-sm text-white font-medium">
                {t(`countries.${selectedCountry.code}`)}
              </span>
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
                    className="absolute top-full mt-2 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-20 min-w-[160px]"
                  >
                    {COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          setSelectedCountry(country)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full flex items-center justify-start px-4 py-3 hover:bg-gray-700/80 transition-colors ${
                          selectedCountry.code === country.code ? 'bg-gray-700/50' : ''
                        }`}
                      >
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
                  <span className="text-gray-400 text-xs">{t('common.users')}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                  <FileText className="w-4 h-4 text-pink-500" />
                  <span className="text-white font-semibold text-sm">{stats.totalAds}</span>
                  <span className="text-gray-400 text-xs">{t('common.ads')}</span>
                </div>
              </>
            )
          )}
        </div>

        {/* Right side - Language Selector only */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 pr-1 md:pr-0">
          {/* Language Selector - Toggle button */}
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="flex items-center gap-1.5 bg-gray-800/50 hover:bg-gray-700/50 px-2 py-1 rounded-lg border border-gray-700 transition-colors"
            title={language === 'fr' ? 'Switch to English' : 'Passer en Français'}
          >
            <div className="w-5 h-3.5 md:w-7 md:h-5 flex items-center justify-center overflow-hidden">
              {language === 'fr' ? <FrenchFlag className="w-full h-full object-cover" /> : <BritishFlag className="w-full h-full object-cover" />}
            </div>
            <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Barre de navigation Top Week / Premium / EliteCoins - Mobile uniquement */}
      <div className="md:hidden border-t border-gray-800">
        <div className="flex items-center justify-around px-2 py-2">
          <button
            onClick={() => router.push('/top-week')}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-lg transition-all active:scale-95 touch-manipulation ${
              pathname === '/top-week' || (pathname === '/' && selectedCountry.code === 'ALL')
                ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30'
                : 'bg-gray-800/50 active:bg-gray-700/50'
            }`}
          >
            <Flame className={`w-4 h-4 pointer-events-none ${
              pathname === '/top-week' || (pathname === '/' && selectedCountry.code === 'ALL')
                ? 'text-orange-500'
                : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium pointer-events-none ${
              pathname === '/top-week' || (pathname === '/' && selectedCountry.code === 'ALL')
                ? 'text-orange-500'
                : 'text-gray-300'
            }`}>
              {t('nav.topWeek')}
            </span>
          </button>

          <button
            onClick={() => router.push('/premium')}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-lg transition-all active:scale-95 touch-manipulation ${
              pathname === '/premium'
                ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30'
                : 'bg-gray-800/50 active:bg-gray-700/50'
            }`}
          >
            <Coins className={`w-4 h-4 pointer-events-none ${
              pathname === '/premium'
                ? 'text-yellow-500'
                : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium pointer-events-none ${
              pathname === '/premium'
                ? 'text-yellow-500'
                : 'text-gray-300'
            }`}>
              {t('nav.premium')}
            </span>
          </button>

          {/* EliteCoins Display - Mobile (uniquement si connecté) */}
          {isLoggedIn && (
            <button
              onClick={() => router.push('/shop')}
              className="flex items-center gap-1.5 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-400/20 to-yellow-500/20 active:from-amber-400/30 active:to-yellow-500/30 border border-amber-400/30 transition-all active:scale-95 touch-manipulation"
              title="Acheter des EliteCoins"
            >
              <Coins className="w-4 h-4 text-amber-400 pointer-events-none" />
              <span className="text-amber-400 font-bold text-sm pointer-events-none">{eliteCoins}</span>
            </button>
          )}
        </div>
      </div>

    </header>
  )
}
