'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/Header'
import { ArrowLeft, Crown, Coins, Sparkles, Check, Shield, Eye, TrendingUp, MessageCircle, ChevronRight, ShoppingCart } from 'lucide-react'
import { RANK_CONFIG } from '@/types/profile'
import { supabase } from '@/lib/supabase'
import { Notification, NotificationType } from '@/components/Notification'

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
  { days: 1, label: '1 jour', coinMultiplier: 0.033 },
  { days: 2, label: '2 jours', coinMultiplier: 0.066 },
  { days: 3, label: '3 jours', coinMultiplier: 0.095 }, // ~5% de réduction
  { days: 5, label: '5 jours', coinMultiplier: 0.15 }, // ~10% de réduction
  { days: 7, label: '7 jours', coinMultiplier: 0.198 }, // ~15% de réduction
  { days: 10, label: '10 jours', coinMultiplier: 0.267 }, // ~20% de réduction
  { days: 15, label: '15 jours', coinMultiplier: 0.375 }, // ~25% de réduction
  { days: 20, label: '20 jours', coinMultiplier: 0.467 }, // ~30% de réduction
  { days: 30, label: '30 jours', coinMultiplier: 1 }, // Prix de base
]

export default function ShopPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'coins' | 'ranks'>('coins')
  const [eliteCoins, setEliteCoins] = useState<number>(0)
  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({
    plus: 30,
    vip: 30,
    elite: 30,
  })
  const [showDedipassModal, setShowDedipassModal] = useState(false)
  const [currentPurchase, setCurrentPurchase] = useState<{ packageId: string, price: number, coins: number } | null>(null)
  const [dedipassCode, setDedipassCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
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

  // Charger le widget Dédipass quand le modal s'ouvre
  useEffect(() => {
    if (showDedipassModal && currentPurchase) {
      const script = document.createElement('script')
      script.src = 'https://api.dedipass.com/v1/pay.js'
      script.async = true
      document.body.appendChild(script)

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
      }
    }
  }, [showDedipassModal, currentPurchase])


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
      router.push('/login')
      return
    }

    // Sauvegarder les infos de l'achat
    setCurrentPurchase({ packageId, price, coins })

    // Réinitialiser les états
    setDedipassCode('')
    setValidationError('')
    setIsValidating(false)

    // Ouvrir le modal Dédipass
    setShowDedipassModal(true)
  }

  const handleValidateCode = async () => {
    if (!dedipassCode.trim()) {
      setValidationError('Veuillez entrer votre code Dédipass')
      return
    }

    setIsValidating(true)
    setValidationError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setValidationError('Vous devez être connecté')
        setIsValidating(false)
        return
      }

      // Appeler l'API de validation
      const response = await fetch('/api/dedipass/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: dedipassCode,
          userId: user.id,
          packageId: currentPurchase?.packageId,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Succès - créditer les coins et fermer la modale
        setEliteCoins(data.newBalance)
        setShowDedipassModal(false)
        setDedipassCode('')
        showNotification(
          'success',
          'Achat réussi !',
          `${data.coinsAdded} EliteCoins ont été ajoutés à votre compte. Nouveau solde: ${data.newBalance} EC`
        )
      } else {
        // Erreur de validation
        setValidationError(data.error || 'Code invalide ou déjà utilisé')
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
      setValidationError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsValidating(false)
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
      // Appeler l'API d'achat de grade
      const response = await fetch('/api/ranks/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      <Header title="Boutique Premium" />

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
          <span>Retour</span>
        </motion.button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Boutique Premium</h1>
            <Sparkles className="w-10 h-10 text-pink-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Boostez votre visibilité et multipliez vos contacts avec nos offres exclusives
          </p>

          {/* Elite Coins Balance */}
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 px-6 py-3 rounded-xl border border-amber-400/30 max-w-xs mx-auto">
            <Coins className="w-6 h-6 text-amber-400" />
            <span className="text-white font-bold text-lg">Votre solde:</span>
            <span className="text-amber-400 font-bold text-2xl">{eliteCoins}</span>
            <span className="text-amber-400 font-bold text-lg">EliteCoins</span>
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
              <span>Acheter des EliteCoins</span>
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
              <span>Acheter un Grade</span>
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
                <h3 className="text-white font-bold mb-2">Monnaie universelle</h3>
                <p className="text-gray-400 text-sm">Utilisez vos EliteCoins pour tous vos achats</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-white font-bold mb-2">Bonus progressifs</h3>
                <p className="text-gray-400 text-sm">Plus vous achetez, plus vous recevez de bonus</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-bold mb-2">Paiement sécurisé</h3>
                <p className="text-gray-400 text-sm">Paiement par carte bancaire via Dédipass</p>
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
                        <span className="text-xs text-white font-bold">{pkg.badge}</span>
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
                        {pkg.coins} {pkg.bonus ? `+ ${pkg.bonus} bonus` : ''} EliteCoins
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-white mb-1">
                        {pkg.price.toFixed(2)}€
                      </div>
                      {pkg.bonus && (
                        <div className="text-green-400 text-xs mt-1">
                          +{Math.round((pkg.bonus / pkg.coins) * 100)}% bonus gratuit !
                        </div>
                      )}
                    </div>

                    {/* Purchase Button */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBuyCoins(pkg.id, pkg.price, pkg.coins + (pkg.bonus || 0))}
                      className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Acheter</span>
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
                <h3 className="text-white font-bold mb-2">+300% de vues</h3>
                <p className="text-gray-400 text-sm">En moyenne pour les profils premium</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-bold mb-2">Visibilité max</h3>
                <p className="text-gray-400 text-sm">Apparaissez en tête des résultats</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-bold mb-2">Plus de contacts</h3>
                <p className="text-gray-400 text-sm">Recevez jusqu'à 10x plus de messages</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-white font-bold mb-2">Badge</h3>
                <p className="text-gray-400 text-sm">Gagnez la confiance des clients</p>
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
                        <span className="text-xs text-white font-bold">{offer.badge}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-900/80 backdrop-blur-sm p-6">
                    {/* Icon & Name */}
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-3">{offer.icon}</div>
                      <h3 className={`text-2xl font-bold ${offer.color} mb-1`}>{offer.name}</h3>
                    </div>

                    {/* Duration Selector */}
                    <div className="mb-6">
                      <label className="text-gray-400 text-sm mb-2 block text-center">Durée</label>
                      <select
                        value={selectedDurations[offer.id]}
                        onChange={(e) => handleDurationChange(offer.id, parseInt(e.target.value))}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none text-sm text-center cursor-pointer"
                      >
                        {DURATION_OPTIONS.map((duration) => {
                          const coinPrice = calculateCoinPrice(offer.coinPrice, duration.days)
                          const discount = duration.days >= 3 ? ` (-${Math.round((1 - duration.coinMultiplier * 30 / duration.days) * 100)}%)` : ''
                          return (
                            <option key={duration.days} value={duration.days}>
                              {duration.label} - {coinPrice} EC{discount}
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
                        EliteCoins pour {selectedDurations[offer.id]} jour{selectedDurations[offer.id] > 1 ? 's' : ''}
                      </div>
                      {selectedDurations[offer.id] >= 3 && (
                        <div className="text-green-400 text-xs mt-1">
                          Économisez {Math.round((1 - DURATION_OPTIONS.find(d => d.days === selectedDurations[offer.id])!.coinMultiplier * 30 / selectedDurations[offer.id]) * 100)}%
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {offer.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Purchase Button */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
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
                      } text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg`}
                      disabled={eliteCoins < calculateCoinPrice(offer.coinPrice, selectedDurations[offer.id])}
                    >
                      <span>
                        {eliteCoins >= calculateCoinPrice(offer.coinPrice, selectedDurations[offer.id])
                          ? 'Acheter maintenant'
                          : 'Pas assez d\'EliteCoins'}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
            <Shield className="w-5 h-5" />
            <span>Paiement sécurisé par carte bancaire</span>
          </div>
          <p className="text-gray-500 text-sm">
            Paiement sécurisé via Dédipass. Vos données bancaires sont protégées et cryptées.
          </p>
        </motion.div>
      </div>

      {/* Modal Dédipass */}
      <AnimatePresence>
        {showDedipassModal && currentPurchase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDedipassModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white">Paiement sécurisé</h2>
                <button
                  onClick={() => setShowDedipassModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Récapitulatif de l'achat */}
              <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-xl p-4 mb-5 border border-amber-400/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <Coins className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-amber-400 font-bold text-2xl">{currentPurchase.coins} EC</div>
                      <div className="text-gray-400 text-sm">EliteCoins</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{currentPurchase.price}€</div>
                    <div className="text-sm text-gray-400">TTC</div>
                  </div>
                </div>
              </div>

              {/* Widget Dédipass */}
              <div className="bg-gray-800/50 rounded-xl p-4 mb-6 max-h-[400px] overflow-y-auto">
                <h3 className="text-white font-bold mb-3 text-center text-sm">Choisissez votre mode de paiement</h3>
                <div className="bg-white rounded-lg p-2" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                  <div
                    data-dedipass="493e04c66c01aeca43780caecd67b4ff"
                    data-dedipass-custom=""
                    style={{
                      maxWidth: '100%',
                      fontSize: '12px',
                      transform: 'scale(0.95)',
                      transformOrigin: 'top center'
                    }}
                  ></div>
                </div>
                <p className="text-gray-400 text-xs text-center mt-2">
                  Après paiement, entrez le code ci-dessous
                </p>
              </div>

              {/* Code Validation Form */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <label className="block text-white font-bold mb-2 text-sm">
                  J'ai reçu mon code
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dedipassCode}
                    onChange={(e) => setDedipassCode(e.target.value.toUpperCase())}
                    placeholder="ABCD1234"
                    className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none placeholder-gray-500 text-center font-mono text-lg"
                    disabled={isValidating}
                  />

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleValidateCode}
                    disabled={isValidating || !dedipassCode.trim()}
                    className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
                      isValidating || !dedipassCode.trim()
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900'
                    }`}
                  >
                    {isValidating ? (
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Valider'
                    )}
                  </motion.button>
                </div>

                {/* Error Message */}
                {validationError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 bg-red-500/20 border border-red-500/30 rounded-lg p-2 text-red-400 text-xs"
                  >
                    ❌ {validationError}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
