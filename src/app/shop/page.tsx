'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/Header'
import { ArrowLeft, Crown, Coins, Sparkles, Check, Shield, Eye, TrendingUp, MessageCircle, ChevronRight, ShoppingCart } from 'lucide-react'
import { RANK_CONFIG } from '@/types/profile'
import { supabase } from '@/lib/supabase'
import { Notification, NotificationType } from '@/components/Notification'
import { useLanguage } from '@/contexts/LanguageContext'
import { VoteStats } from '@/components/VoteStats'
import { useAuth } from '@/contexts/AuthContext'

interface CoinPackage {
  id: string
  coins: number
  price: number
  bonus?: number
  popular?: boolean
  badge?: string
}

interface RankOffer {
  id: string
  name: string
  icon: string
  coinPrice: number // Prix en EliteCoins
  duration: string
  color: string
  bgGradient: string
  borderColor: string
  glowColor: string
  popular?: boolean
  features: string[]
  badge?: string
}

const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'pack_5',
    coins: 75,
    price: 5,
  },
  {
    id: 'pack_10',
    coins: 150,
    price: 10,
  },
  {
    id: 'pack_20',
    coins: 300,
    price: 20,
  },
  {
    id: 'pack_30',
    coins: 450,
    price: 30,
    bonus: 50, // +11% bonus
  },
  {
    id: 'pack_40',
    coins: 600,
    price: 40,
    bonus: 100, // +17% bonus
  },
  {
    id: 'pack_50',
    coins: 750,
    price: 50,
    bonus: 200, // +27% bonus
    popular: true,
    badge: 'POPULAIRE',
  },
  {
    id: 'pack_80',
    coins: 1200,
    price: 80,
    bonus: 400, // +33% bonus
    badge: 'BON PLAN',
  },
  {
    id: 'pack_100',
    coins: 1500,
    price: 100,
    bonus: 600, // +40% bonus
    badge: 'ELITE 1 MOIS',
  },
]

const RANK_OFFERS: RankOffer[] = [
  {
    id: 'plus',
    name: 'Plus',
    icon: '✨',
    coinPrice: 300, // 300 EliteCoins pour 30 jours = 20€
    duration: '30 jours',
    color: 'text-cyan-400',
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    glowColor: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    features: [
      'Badge Plus ✨ sur votre profil',
      'Priorité dans les résultats de recherche',
      'Mise en avant modérée',
      'Jusqu\'à 20 photos',
      'Accès à la liste noire',
      'Support prioritaire',
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    icon: '💎',
    coinPrice: 950, // 950 EliteCoins pour 30 jours = 50€ (750 + 200 bonus)
    duration: '30 jours',
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/20 to-pink-600/20',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    popular: true,
    badge: 'POPULAIRE',
    features: [
      'Badge VIP 💎 sur votre profil',
      'Haute priorité dans les résultats',
      'Mise en avant importante',
      'Jusqu\'à 40 photos',
      'Accès à la liste noire',
      'Support prioritaire',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    icon: '👑',
    coinPrice: 2100, // 2100 EliteCoins pour 30 jours = 100€ (1500 + 600 bonus)
    duration: '30 jours',
    color: 'text-amber-400',
    bgGradient: 'from-amber-400/20 to-yellow-500/20',
    borderColor: 'border-amber-400/30',
    glowColor: 'shadow-[0_0_30px_rgba(251,191,36,0.5)]',
    badge: 'EXCLUSIF',
    features: [
      'Badge Elite 👑 exclusif sur votre profil',
      'Position #1 garantie dans les résultats',
      'Mise en avant exclusive et permanente',
      'Photos illimitées (100+)',
      'Accès à la liste noire',
      'Support VIP dédié 24/7',
      'Messages illimités',
      'Boost quotidien automatique',
    ],
  },
]

const DURATION_OPTIONS = [
  { days: 1, coinMultiplier: 0.055 }, // +65% plus cher par jour que le mensuel
  { days: 2, coinMultiplier: 0.105 }, // +58% plus cher par jour
  { days: 3, coinMultiplier: 0.15 }, // +50% plus cher par jour
  { days: 5, coinMultiplier: 0.24 }, // +44% plus cher par jour
  { days: 7, coinMultiplier: 0.32 }, // +37% plus cher par jour
  { days: 10, coinMultiplier: 0.43 }, // +29% plus cher par jour
  { days: 15, coinMultiplier: 0.6 }, // +20% plus cher par jour
  { days: 20, coinMultiplier: 0.75 }, // +12% plus cher par jour
  { days: 30, coinMultiplier: 1 }, // Meilleur prix (référence)
]

export default function ShopPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'coins' | 'ranks'>('coins')
  const [eliteCoins, setEliteCoins] = useState<number>(0)
  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({
    plus: 30,
    vip: 30,
    elite: 30,
  })
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [notification, setNotification] = useState<{
    isVisible: boolean
    type: NotificationType
    title: string
    message: string
  }>({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  })

  useEffect(() => {
    const fetchUserCoins = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('elite_coins')
          .eq('id', user.id)
          .single()

        if (profile) {
          setEliteCoins(profile.elite_coins || 0)
        }
      }
    }

    fetchUserCoins()
  }, [])


  const calculateCoinPrice = (baseCoinPrice: number, days: number) => {
    const durationOption = DURATION_OPTIONS.find(d => d.days === days)
    if (!durationOption) return baseCoinPrice
    return Math.round(baseCoinPrice * durationOption.coinMultiplier)
  }

  const handleDurationChange = (offerId: string, days: number) => {
    setSelectedDurations(prev => ({
      ...prev,
      [offerId]: days
    }))
  }

  const showNotification = (type: NotificationType, title: string, message: string) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message
    })
  }

  const handleBuyCoins = async (packageId: string, price: number, coins: number) => {
    // Vérifier que l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      showNotification('warning', 'Connexion requise', 'Vous devez être connecté pour acheter des EliteCoins')
      router.push('/auth')
      return
    }

    setIsProcessingPayment(true)

    try {
      // Générer un token unique pour l'auto-connexion sur ShopElite
      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // Expire dans 5 minutes

      // Sauvegarder le token dans la base de données
      const { error: tokenError } = await supabase
        .from('auth_tokens')
        .insert({
          token,
          user_id: user.id,
          expires_at: expiresAt.toISOString()
        })

      if (tokenError) {
        console.error('Erreur création token:', tokenError)
        showNotification('error', 'Erreur', 'Impossible de préparer la redirection')
        setIsProcessingPayment(false)
        return
      }

      // Rediriger vers ShopElite avec le token et le package sélectionné
      const shopEliteUrl = `https://shopelite.eu/shop?token=${token}&package=${packageId}`
      window.location.href = shopEliteUrl
    } catch (error) {
      console.error('Erreur lors de la redirection vers ShopElite:', error)
      showNotification(
        'error',
        'Erreur serveur',
        'Impossible de traiter votre demande. Veuillez réessayer.'
      )
      setIsProcessingPayment(false)
    }
  }

  const handleBuyRank = async (offerId: string, days: number, coinPrice: number) => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      showNotification('warning', 'Connexion requise', 'Vous devez être connecté pour acheter un grade')
      router.push('/login')
      return
    }

    if (eliteCoins < coinPrice) {
      showNotification(
        'error',
        'Solde insuffisant',
        `Il vous manque ${coinPrice - eliteCoins} EliteCoins pour cet achat. Rechargez votre compte !`
      )
      setActiveTab('coins')
      return
    }

    try {
      // Récupérer le token d'authentification
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        showNotification('error', 'Erreur', 'Session expirée, veuillez vous reconnecter')
        return
      }

      // Appeler l'API d'achat de grade
      const response = await fetch('/api/ranks/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          rank: offerId,
          days: days,
          coinPrice: coinPrice,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Succès - mettre à jour le solde et afficher la confirmation
        setEliteCoins(data.newBalance)

        const rankNames = {
          plus: 'Plus ✨',
          vip: 'VIP 👑',
          elite: 'Elite ⭐'
        }

        showNotification(
          'success',
          'Grade acheté !',
          `Vous avez obtenu le grade ${rankNames[offerId as keyof typeof rankNames]} pour ${days} jours. ${coinPrice} EC débités.`
        )
      } else {
        // Erreur
        showNotification(
          'error',
          'Erreur d\'achat',
          data.error || 'Une erreur est survenue lors de l\'achat du grade'
        )
      }
    } catch (error) {
      console.error('Erreur lors de l\'achat du grade:', error)
      showNotification(
        'error',
        'Erreur serveur',
        'Impossible de traiter votre achat. Veuillez réessayer.'
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title={t('shop.title')} />

      {/* Notification */}
      <Notification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.back')}</span>
        </motion.button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">{t('shop.title')}</h1>
            <Sparkles className="w-10 h-10 text-pink-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            {t('home.subtitle')}
          </p>

          {/* Elite Coins Balance */}
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 px-6 py-3 rounded-xl border border-amber-400/30 max-w-xs mx-auto">
            <Coins className="w-6 h-6 text-amber-400" />
            <span className="text-white font-bold text-lg">{t('shop.yourBalance')}</span>
            <span className="text-amber-400 font-bold text-2xl">{eliteCoins}</span>
            <span className="text-amber-400 font-bold text-lg">{t('shop.eliteCoins')}</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('coins')}
            className={`px-6 py-3 font-bold transition-all relative ${
              activeTab === 'coins'
                ? 'text-amber-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              <span>{t('shop.buyCoins')}</span>
            </div>
            {activeTab === 'coins' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ranks')}
            className={`px-6 py-3 font-bold transition-all relative ${
              activeTab === 'ranks'
                ? 'text-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              <span>{t('shop.buyRank')}</span>
            </div>
            {activeTab === 'ranks' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
              />
            )}
          </button>
        </div>

        {/* Coin Packages Tab */}
        {activeTab === 'coins' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Coins className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-white font-bold mb-2">{t('shop.universalCurrency')}</h3>
                <p className="text-gray-400 text-sm">{t('shop.universalCurrencyDesc')}</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-white font-bold mb-2">{t('shop.progressiveBonuses')}</h3>
                <p className="text-gray-400 text-sm">{t('shop.progressiveBonusesDesc')}</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-bold mb-2">{t('shop.securePayment')}</h3>
                <p className="text-gray-400 text-sm">{t('shop.securePaymentDesc')}</p>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COIN_PACKAGES.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br from-amber-400/10 to-yellow-500/10 rounded-2xl border ${
                    pkg.popular ? 'border-amber-400/50 shadow-lg shadow-amber-500/20' : 'border-amber-400/20'
                  } overflow-hidden relative`}
                >
                  {/* Badge */}
                  {pkg.badge && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`${
                        pkg.badge === 'POPULAIRE'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                          : pkg.badge === 'BON PLAN'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          : 'bg-gradient-to-r from-amber-400 to-yellow-500'
                      } px-3 py-1 rounded-full`}>
                        <span className="text-xs text-white font-bold">
                          {pkg.badge === 'POPULAIRE' ? t('shop.popular') :
                           pkg.badge === 'BON PLAN' ? t('shop.goodDeal') :
                           pkg.badge === 'ELITE 1 MOIS' ? t('shop.elite1Month') : pkg.badge}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-900/80 backdrop-blur-sm p-6">
                    {/* Coins Amount */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Coins className="w-12 h-12 text-amber-400" />
                      </div>
                      <h3 className="text-3xl font-bold text-amber-400 mb-1">
                        {pkg.coins + (pkg.bonus || 0)}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {pkg.coins} {pkg.bonus ? `+ ${pkg.bonus} ${t('shop.bonus')}` : ''} {t('shop.eliteCoins')}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-white mb-1">
                        {pkg.price.toFixed(2)}€
                      </div>
                      {pkg.bonus && (
                        <div className="text-green-400 text-xs mt-1">
                          +{Math.round((pkg.bonus / pkg.coins) * 100)}% {t('shop.freeBonus')}
                        </div>
                      )}
                    </div>

                    {/* Purchase Button */}
                    <motion.button
                      whileTap={{ scale: isProcessingPayment ? 1 : 0.98 }}
                      onClick={() => handleBuyCoins(pkg.id, pkg.price, pkg.coins + (pkg.bonus || 0))}
                      disabled={isProcessingPayment}
                      className={`w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                        isProcessingPayment ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                          <span>Traitement...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          <span>{t('shop.buy')}</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Ranks Tab */}
        {activeTab === 'ranks' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-white font-bold mb-2">{t('shop.increaseViews')}</h3>
                <p className="text-gray-400 text-sm">{t('shop.increaseViewsDesc')}</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-bold mb-2">{t('shop.maxVisibility')}</h3>
                <p className="text-gray-400 text-sm">{t('shop.maxVisibilityDesc')}</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-bold mb-2">{t('shop.moreContacts')}</h3>
                <p className="text-gray-400 text-sm">{t('shop.moreContactsDesc')}</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-white font-bold mb-2">{t('shop.badge')}</h3>
                <p className="text-gray-400 text-sm">{t('shop.badgeDesc')}</p>
              </div>
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {RANK_OFFERS.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br ${offer.bgGradient} rounded-2xl border ${offer.borderColor} ${offer.glowColor} overflow-hidden relative`}
                >
                  {/* Popular/Exclusive Badge */}
                  {offer.badge && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`${
                        offer.badge === 'POPULAIRE'
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                      } px-3 py-1 rounded-full`}>
                        <span className="text-xs text-white font-bold">
                          {offer.badge === 'POPULAIRE' ? t('shop.popular') :
                           offer.badge === 'EXCLUSIF' ? t('shop.exclusive') : offer.badge}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-900/80 backdrop-blur-sm p-6">
                    {/* Icon & Name */}
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-3">{offer.icon}</div>
                      <h3 className={`text-2xl font-bold ${offer.color} mb-1`}>
                        {offer.id === 'plus' ? t('shop.plus') :
                         offer.id === 'vip' ? t('shop.vip') :
                         offer.id === 'elite' ? t('shop.elite') : offer.name}
                      </h3>
                    </div>

                    {/* Duration Selector */}
                    <div className="mb-6">
                      <label className="text-gray-400 text-sm mb-2 block text-center">{t('shop.duration')}</label>
                      <select
                        value={selectedDurations[offer.id]}
                        onChange={(e) => handleDurationChange(offer.id, parseInt(e.target.value))}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none text-sm text-center cursor-pointer"
                      >
                        {DURATION_OPTIONS.map((duration) => {
                          const coinPrice = calculateCoinPrice(offer.coinPrice, duration.days)
                          // Calculer le prix par jour pour cette option
                          const pricePerDayThisOption = coinPrice / duration.days
                          // Calculer le prix par jour pour le tarif 1 jour (référence la plus chère)
                          const oneDayPrice = calculateCoinPrice(offer.coinPrice, 1)
                          // Calculer la réduction par rapport au tarif journalier
                          const savingsPercent = Math.round((1 - pricePerDayThisOption / oneDayPrice) * 100)
                          const discount = savingsPercent > 0 ? ` (-${savingsPercent}%)` : ''
                          return (
                            <option key={duration.days} value={duration.days}>
                              {t('shop.durationDay', { count: duration.days })} - {coinPrice} EC{discount}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    {/* Price in Coins */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Coins className="w-6 h-6 text-amber-400" />
                        <span className="text-3xl font-bold text-white">
                          {calculateCoinPrice(offer.coinPrice, selectedDurations[offer.id])}
                        </span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {t('shop.eliteCoins')} {t('shop.forDays', { count: selectedDurations[offer.id] })}
                      </div>
                      {(() => {
                        const selectedDuration = DURATION_OPTIONS.find(d => d.days === selectedDurations[offer.id])
                        if (!selectedDuration) return null
                        const pricePerDay = selectedDuration.coinMultiplier / selectedDuration.days * 30
                        const savingsPercent = Math.round((1 - pricePerDay) * 100)

                        if (selectedDurations[offer.id] >= 20 && savingsPercent > 0) {
                          return (
                            <div className="text-green-400 text-xs mt-1">
                              {t('shop.save', { percent: savingsPercent })}
                            </div>
                          )
                        } else if (offer.id === 'elite' && selectedDurations[offer.id] === 30) {
                          return (
                            <div className="text-amber-400 text-xs mt-1">
                              {t('shop.bestValue')}
                            </div>
                          )
                        }
                        return null
                      })()}
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {offer.features.map((feature, idx) => {
                        // Traduire les features dynamiquement
                        const featureKey = `${offer.id}Feature${idx + 1}`
                        const translatedFeature = t(`shop.${featureKey}`)
                        return (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 text-sm">{translatedFeature}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Purchase Button */}
                    <motion.button
                      whileTap={{ scale: eliteCoins < calculateCoinPrice(offer.coinPrice, selectedDurations[offer.id]) ? 1 : 0.98 }}
                      onClick={() => handleBuyRank(
                        offer.id,
                        selectedDurations[offer.id],
                        calculateCoinPrice(offer.coinPrice, selectedDurations[offer.id])
                      )}
                      className={`w-full bg-gradient-to-r ${
                        offer.id === 'elite'
                          ? 'from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600'
                          : offer.id === 'vip'
                          ? 'from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                          : 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                      } text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                        eliteCoins < calculateCoinPrice(offer.coinPrice, selectedDurations[offer.id]) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={eliteCoins < calculateCoinPrice(offer.coinPrice, selectedDurations[offer.id])}
                    >
                      <span>
                        {eliteCoins >= calculateCoinPrice(offer.coinPrice, selectedDurations[offer.id])
                          ? t('shop.buyNow')
                          : t('shop.notEnoughCoins')}
                      </span>
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trust Section */}
        {/* Vote Stats - Classement et XP */}
        {user?.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-8"
          >
            <VoteStats profileId={user.id} showProgress={true} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
            <Shield className="w-5 h-5" />
            <span>Paiement sécurisé par Stripe</span>
          </div>
          <p className="text-gray-500 text-sm">
            Vos données de paiement sont cryptées et sécurisées. Nous acceptons toutes les cartes bancaires.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
