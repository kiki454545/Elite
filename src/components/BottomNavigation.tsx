'use client'

import { Home, Search, MessageCircle, Heart, User, LogIn, Flame, Crown, Coins, X, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMessages } from '@/contexts/MessagesContext'
import { useCountry, COUNTRIES } from '@/contexts/CountryContext'
import { supabase } from '@/lib/supabase'

type NavItem = {
  id: string
  icon: typeof Home
  label: string
  path: string
}

export function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const { unreadCount } = useMessages()
  const { selectedCountry, setSelectedCountry } = useCountry()
  const [eliteCoins, setEliteCoins] = useState<number>(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [isSticky, setIsSticky] = useState(false)

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
      .channel('elite_coins_changes_nav')
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

  // Menu mobile (en bas)
  const mobileNavItems: NavItem[] = [
    { id: 'home', icon: Home, label: t('nav.home'), path: '/' },
    { id: 'search', icon: Search, label: t('nav.search'), path: '/search' },
    { id: 'messages', icon: MessageCircle, label: t('nav.messages'), path: '/messages' },
    { id: 'favorites', icon: Heart, label: t('nav.favorites'), path: '/favorites' },
    isAuthenticated
      ? { id: 'profile', icon: User, label: t('nav.profile'), path: '/my-ads' }
      : { id: 'auth', icon: LogIn, label: t('nav.login'), path: '/auth' },
  ]

  // Menu desktop (en haut) - seulement Top Week et Premium
  const desktopNavItems: NavItem[] = [
    { id: 'home', icon: Home, label: t('nav.home'), path: '/' },
    { id: 'topWeek', icon: Flame, label: t('nav.topWeek'), path: '/top-week' },
    { id: 'premium', icon: Crown, label: t('nav.premium'), path: '/premium' },
    { id: 'search', icon: Search, label: t('nav.search'), path: '/search' },
    { id: 'messages', icon: MessageCircle, label: t('nav.messages'), path: '/messages' },
    { id: 'favorites', icon: Heart, label: t('nav.favorites'), path: '/favorites' },
    isAuthenticated
      ? { id: 'profile', icon: User, label: t('nav.profile'), path: '/my-ads' }
      : { id: 'auth', icon: LogIn, label: t('nav.login'), path: '/auth' },
  ]

  const getActiveTab = () => {
    const active = desktopNavItems.find(item => item.path === pathname)
    return active?.id || 'home'
  }

  const [activeTab, setActiveTab] = useState(getActiveTab())

  const handleNavClick = (item: NavItem) => {
    // Si c'est la recherche et qu'aucun pays n'est sélectionné (code 'ALL'), afficher le modal
    if (item.id === 'search' && selectedCountry.code === 'ALL') {
      setShowCountryModal(true)
      return
    }

    setActiveTab(item.id)
    router.push(item.path)
  }

  const handleCountrySelect = (countryCode: string) => {
    // Trouver l'objet Country correspondant depuis COUNTRIES
    const country = COUNTRIES.find(c => c.code === countryCode)

    if (country && country.code !== 'ALL') {
      setSelectedCountry(country)
      setShowCountryModal(false)
      setActiveTab('search')
      router.push('/search')
    }
  }

  const handleCloseModal = () => {
    setShowCountryModal(false)
    // Ne pas naviguer, rester sur la page actuelle
  }

  // Bloquer le scroll de la page en arrière-plan quand le modal est ouvert
  useEffect(() => {
    if (showCountryModal) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.touchAction = 'auto'
      document.body.style.position = 'static'
      document.body.style.width = 'auto'
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.touchAction = 'auto'
      document.body.style.position = 'static'
      document.body.style.width = 'auto'
    }
  }, [showCountryModal])

  // Détecter le scroll pour rendre le menu sticky (desktop uniquement)
  useEffect(() => {
    const handleScroll = () => {
      // Le menu devient sticky après avoir scrollé de 100px
      setIsSticky(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mapper les codes pays vers leurs noms complets
  const getCountryName = (code: string): string => {
    const countryNames: Record<string, string> = {
      'FR': 'France',
      'BE': 'Belgique',
      'CH': 'Suisse',
      'LU': 'Luxembourg',
      'ES': 'Espagne',
      'IT': 'Italie',
      'DE': 'Allemagne',
      'NL': 'Pays-Bas',
      'PT': 'Portugal',
      'MT': 'Malte'
    }
    return countryNames[code] || code
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 md:sticky md:top-[71px] z-20 bg-gray-900/95 backdrop-blur-sm border-t md:border-t-0 md:border-b border-gray-800">
        <div className="max-w-screen-xl mx-auto px-2">
          {/* Menu mobile */}
          <div className="flex md:hidden items-center justify-around">
            {mobileNavItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="relative flex flex-col items-center gap-0.5 py-2 px-1 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabMobile"
                      className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-600/10 rounded-xl"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? 'text-pink-500'
                          : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                    />

                    {/* Notification badge for messages */}
                    {item.id === 'messages' && unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-red-500 rounded-full flex items-center justify-center px-0.5">
                        <span className="text-white text-[10px] font-bold">{unreadCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      isActive
                        ? 'text-pink-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center justify-center gap-4">
            {desktopNavItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="relative flex flex-row items-center gap-2 py-2 px-4 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabDesktop"
                      className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-600/10 rounded-xl"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? 'text-pink-500'
                          : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                    />

                    {/* Notification badge for messages */}
                    {item.id === 'messages' && unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-red-500 rounded-full flex items-center justify-center px-0.5">
                        <span className="text-white text-[10px] font-bold">{unreadCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-pink-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              )
            })}

            {/* EliteCoins Display - Desktop only (uniquement si connecté) */}
            {isLoggedIn && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/shop')}
                className="relative flex flex-row items-center gap-2 py-2 px-4 transition-colors bg-gradient-to-r from-amber-400/20 to-yellow-500/20 hover:from-amber-400/30 hover:to-yellow-500/30 rounded-xl border border-amber-400/30"
                title="Acheter des EliteCoins"
              >
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">{eliteCoins}</span>
              </motion.button>
            )}
          </div>
        </div>
      </nav>

      {/* Modal de sélection de pays - en dehors du nav pour un z-index correct */}
      <AnimatePresence>
        {showCountryModal && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            {/* Overlay - Bloque le scroll de la page en arrière-plan */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              onWheel={(e) => e.preventDefault()}
              onTouchMove={(e) => e.preventDefault()}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-6 max-h-[80vh] overflow-hidden flex flex-col z-[10000]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-pink-500" />
                  <h2 className="text-xl font-bold text-white">
                    Sélectionnez un pays
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-6">
                Veuillez choisir le pays où vous souhaitez effectuer votre recherche.
              </p>

              {/* Liste des pays avec scroll */}
              <div className="space-y-2 overflow-y-auto flex-1 pr-2 max-h-[50vh]">
                <button
                  onClick={() => handleCountrySelect('FR')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 hover:border-pink-500 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">France</span>
                    <div className="text-gray-400 group-hover:text-pink-500 transition-colors">→</div>
                  </div>
                </button>
                <button
                  onClick={() => handleCountrySelect('BE')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 hover:border-pink-500 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Belgique</span>
                    <div className="text-gray-400 group-hover:text-pink-500 transition-colors">→</div>
                  </div>
                </button>
                <button
                  onClick={() => handleCountrySelect('CH')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 hover:border-pink-500 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Suisse</span>
                    <div className="text-gray-400 group-hover:text-pink-500 transition-colors">→</div>
                  </div>
                </button>
                <button
                  onClick={() => handleCountrySelect('LU')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 hover:border-pink-500 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Luxembourg</span>
                    <div className="text-gray-400 group-hover:text-pink-500 transition-colors">→</div>
                  </div>
                </button>
                <button
                  onClick={() => handleCountrySelect('ES')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 hover:border-pink-500 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Espagne</span>
                    <div className="text-gray-400 group-hover:text-pink-500 transition-colors">→</div>
                  </div>
                </button>
                <button
                  onClick={() => handleCountrySelect('IT')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 hover:border-pink-500 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Italie</span>
                    <div className="text-gray-400 group-hover:text-pink-500 transition-colors">→</div>
                  </div>
                </button>
                <button
                  onClick={() => handleCountrySelect('DE')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 hover:border-pink-500 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Allemagne</span>
                    <div className="text-gray-400 group-hover:text-pink-500 transition-colors">→</div>
                  </div>
                </button>
                <button
                  onClick={() => handleCountrySelect('NL')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 hover:border-pink-500 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Pays-Bas</span>
                    <div className="text-gray-400 group-hover:text-pink-500 transition-colors">→</div>
                  </div>
                </button>
                <button
                  onClick={() => handleCountrySelect('PT')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 hover:border-pink-500 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Portugal</span>
                    <div className="text-gray-400 group-hover:text-pink-500 transition-colors">→</div>
                  </div>
                </button>
                <button
                  onClick={() => handleCountrySelect('MT')}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 hover:border-pink-500 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Malte</span>
                    <div className="text-gray-400 group-hover:text-pink-500 transition-colors">→</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
