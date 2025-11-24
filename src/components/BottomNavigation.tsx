'use client'

import { Home, Search, MessageCircle, Heart, User, LogIn, Flame, Crown, Coins } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMessages } from '@/contexts/MessagesContext'
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
    setActiveTab(item.id)
    router.push(item.path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:static z-20 bg-gray-900/95 backdrop-blur-sm border-t md:border-t-0 md:border-b border-gray-800">
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
  )
}
