'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { ArrowLeft, Crown, Star, Sparkles, Zap, Check, Shield, Eye, TrendingUp, MessageCircle, ChevronRight } from 'lucide-react'
import { RANK_CONFIG } from '@/types/profile'

interface RankOffer {
  id: string
  name: string
  icon: string
  price: number
  duration: string
  color: string
  bgGradient: string
  borderColor: string
  glowColor: string
  popular?: boolean
  features: string[]
  badge?: string
}

const RANK_OFFERS: RankOffer[] = [
  {
    id: 'plus',
    name: 'Plus',
    icon: '✨',
    price: 30.75, // 19.99€ pour 30 jours avec 35% de réduction
    duration: '1 mois',
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
    price: 76.91, // 49.99€ pour 30 jours avec 35% de réduction
    duration: '1 mois',
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
    price: 153.83, // 99.99€ pour 30 jours avec 35% de réduction
    duration: '1 mois',
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
  { days: 1, label: '1 jour', discount: 0 },
  { days: 2, label: '2 jours', discount: 0 },
  { days: 3, label: '3 jours', discount: 5 },
  { days: 5, label: '5 jours', discount: 10 },
  { days: 7, label: '7 jours', discount: 15 },
  { days: 10, label: '10 jours', discount: 20 },
  { days: 15, label: '15 jours', discount: 25 },
  { days: 20, label: '20 jours', discount: 30 },
  { days: 30, label: '30 jours', discount: 35 },
]

export default function ShopPage() {
  const router = useRouter()
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({
    plus: 7,
    vip: 7,
    elite: 7,
  })

  const calculatePrice = (basePrice: number, days: number) => {
    const pricePerDay = basePrice / 30 // Prix de base pour 30 jours
    const totalBeforeDiscount = pricePerDay * days
    const discountOption = DURATION_OPTIONS.find(d => d.days === days)
    const discount = discountOption?.discount || 0
    return totalBeforeDiscount * (1 - discount / 100)
  }

  const handleDurationChange = (offerId: string, days: number) => {
    setSelectedDurations(prev => ({
      ...prev,
      [offerId]: days
    }))
  }

  const handlePurchase = (offerId: string, days: number, price: number) => {
    // TODO: Implémenter le système de paiement
    alert(`Paiement pour ${offerId} - ${days} jour(s) - ${price.toFixed(2)}€`)
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title="Boutique Premium" />

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
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Boutique Premium</h1>
            <Sparkles className="w-10 h-10 text-pink-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Boostez votre visibilité et multipliez vos contacts avec nos offres exclusives
          </p>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
        >
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
        </motion.div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {RANK_OFFERS.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`bg-gradient-to-br ${offer.bgGradient} rounded-2xl border ${offer.borderColor} ${offer.glowColor} overflow-hidden relative ${
                selectedOffer === offer.id ? 'ring-2 ring-pink-500' : ''
              }`}
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
                      const discountText = duration.discount > 0 ? ` (-${duration.discount}%)` : ''
                      return (
                        <option key={duration.days} value={duration.days}>
                          {duration.label}{discountText}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-1">
                    {calculatePrice(offer.price, selectedDurations[offer.id]).toFixed(2)}€
                  </div>
                  <div className="text-gray-400 text-sm">
                    {selectedDurations[offer.id]} jour{selectedDurations[offer.id] > 1 ? 's' : ''}
                  </div>
                  {DURATION_OPTIONS.find(d => d.days === selectedDurations[offer.id])?.discount! > 0 && (
                    <div className="text-green-400 text-xs mt-1">
                      Économisez {DURATION_OPTIONS.find(d => d.days === selectedDurations[offer.id])?.discount}%
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
                  onClick={() => handlePurchase(
                    offer.id,
                    selectedDurations[offer.id],
                    calculatePrice(offer.price, selectedDurations[offer.id])
                  )}
                  className={`w-full bg-gradient-to-r ${
                    offer.id === 'elite'
                      ? 'from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600'
                      : offer.id === 'vip'
                      ? 'from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                      : 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                  } text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg`}
                >
                  <span>Acheter maintenant</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900 rounded-2xl border border-gray-800 p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Questions fréquentes</h2>

          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="text-white font-bold mb-2">Comment fonctionne le paiement ?</h3>
              <p className="text-gray-400">
                Le paiement est sécurisé et traité via Stripe. Vous pouvez payer par carte bancaire ou PayPal.
                Votre abonnement est renouvelé automatiquement chaque mois.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2">Puis-je annuler mon abonnement ?</h3>
              <p className="text-gray-400">
                Oui, vous pouvez annuler votre abonnement à tout moment depuis vos paramètres.
                Vous garderez les avantages jusqu'à la fin de la période payée.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2">Puis-je changer d'offre ?</h3>
              <p className="text-gray-400">
                Oui, vous pouvez upgrader ou downgrader votre offre à tout moment.
                La différence de prix sera calculée au prorata.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2">Les statistiques sont-elles en temps réel ?</h3>
              <p className="text-gray-400">
                Les offres Gold et Diamond bénéficient de statistiques en temps réel.
                Les offres Bronze et Silver ont un délai de mise à jour de 1 heure.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
            <Shield className="w-5 h-5" />
            <span>Paiement sécurisé SSL</span>
          </div>
          <p className="text-gray-500 text-sm">
            Vos données sont protégées et cryptées. Nous ne stockons aucune information bancaire.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
