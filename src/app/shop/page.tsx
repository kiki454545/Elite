'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Coins, Sparkles, ShoppingCart, Shield, TrendingUp, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface CoinPackage {
  id: string
  coins: number
  price: number
  bonus?: number
  popular?: boolean
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
    badge: 'MEILLEUR PRIX',
  },
]

function ShopContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [eliteCoins, setEliteCoins] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoLoginLoading, setAutoLoginLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Gérer l'auto-connexion avec token depuis SexElite.eu
  useEffect(() => {
    const handleAutoLogin = async () => {
      const token = searchParams.get('token')

      if (token) {
        try {
          // Vérifier le token dans la base de données
          const { data: tokenData, error: tokenError } = await supabase
            .from('auth_tokens')
            .select('user_id, expires_at')
            .eq('token', token)
            .single()

          if (tokenError || !tokenData) {
            console.error('Token invalide:', tokenError)
            setError('Session invalide. Veuillez vous reconnecter sur SexElite.eu')
            setAutoLoginLoading(false)
            return
          }

          // Vérifier l'expiration du token
          if (new Date(tokenData.expires_at) < new Date()) {
            setError('Session expirée. Veuillez vous reconnecter sur SexElite.eu')
            await supabase.from('auth_tokens').delete().eq('token', token)
            setAutoLoginLoading(false)
            return
          }

          // Supprimer le token utilisé (usage unique)
          await supabase.from('auth_tokens').delete().eq('token', token)

          // L'utilisateur est authentifié via le token
          setIsAuthenticated(true)

          // Charger les coins de l'utilisateur
          const { data: profile } = await supabase
            .from('profiles')
            .select('elite_coins')
            .eq('id', tokenData.user_id)
            .single()

          if (profile) {
            setEliteCoins(profile.elite_coins || 0)
          }

          // Nettoyer l'URL (retirer le token)
          const packageId = searchParams.get('package')
          if (packageId) {
            window.history.replaceState({}, '', `/shop?package=${packageId}`)
          } else {
            window.history.replaceState({}, '', '/shop')
          }

          setAutoLoginLoading(false)
        } catch (err) {
          console.error('Erreur auto-login:', err)
          setError('Erreur lors de la connexion automatique')
          setAutoLoginLoading(false)
        }
      } else {
        // Pas de token, vérifier si déjà connecté via Supabase Auth
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setIsAuthenticated(true)
          const { data: profile } = await supabase
            .from('profiles')
            .select('elite_coins')
            .eq('id', user.id)
            .single()

          if (profile) {
            setEliteCoins(profile.elite_coins || 0)
          }
        }

        setAutoLoginLoading(false)
      }
    }

    handleAutoLogin()
  }, [searchParams])

  const handleBuyCoins = async (packageId: string, price: number, coins: number) => {
    setIsLoading(true)
    setError(null)

    try {
      // Vérifier que l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser()

      if (!user && !isAuthenticated) {
        setError('Vous devez être connecté pour acheter des EliteCoins')
        router.push('/auth')
        return
      }

      // Créer une session Stripe Checkout
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
          userId: user?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du paiement')
      }

      // Rediriger vers Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  // Afficher un loader pendant l'auto-connexion
  if (autoLoginLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Connexion en cours...</p>
          <p className="text-gray-400 text-sm mt-2">Transfert depuis SexElite.eu</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">⛏️</span>
            <div>
              <h1 className="text-2xl font-bold text-white">ShopElite</h1>
              <p className="text-xs text-green-400 font-semibold">Paiements SexElite</p>
            </div>
          </div>

          {/* Coins Balance */}
          <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-white font-bold">{eliteCoins}</span>
            <span className="text-amber-400 text-sm">EliteCoins</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button - Retour vers SexElite */}
        <motion.a
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          href="https://sexelite.eu"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour sur SexElite.eu</span>
        </motion.a>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coins className="w-12 h-12 text-amber-400" />
            <h1 className="text-4xl font-bold text-white">Boutique EliteCoins</h1>
            <Sparkles className="w-12 h-12 text-green-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Achetez des EliteCoins pour booster vos annonces sur SexElite.eu !
          </p>
        </motion.div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
            <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Monnaie Universelle</h3>
            <p className="text-gray-400 text-sm">
              Utilisez vos EliteCoins pour tous nos services de publicité
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Bonus Progressifs</h3>
            <p className="text-gray-400 text-sm">
              Plus vous achetez, plus vous recevez de coins bonus gratuits
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
            <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Paiement Sécurisé</h3>
            <p className="text-gray-400 text-sm">
              Transactions 100% sécurisées via Stripe
            </p>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COIN_PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 ${
                pkg.popular
                  ? 'border-amber-400 shadow-lg shadow-amber-500/30 scale-105'
                  : 'border-gray-700'
              } overflow-hidden relative transform transition-transform hover:scale-110`}
            >
              {/* Badge */}
              {pkg.badge && (
                <div className="absolute top-3 right-3 z-10">
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

              <div className="p-6">
                {/* Coins Amount */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Coins className="w-10 h-10 text-amber-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-amber-400 mb-1">
                    {pkg.coins + (pkg.bonus || 0)}
                  </h3>
                  <p className="text-gray-400 text-xs">
                    {pkg.coins} {pkg.bonus ? `+ ${pkg.bonus} bonus` : ''} EliteCoins
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-1">
                    {pkg.price}€
                  </div>
                  {pkg.bonus && (
                    <div className="text-green-400 text-xs">
                      +{Math.round((pkg.bonus / pkg.coins) * 100)}% gratuit
                    </div>
                  )}
                </div>

                {/* Purchase Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBuyCoins(pkg.id, pkg.price, pkg.coins + (pkg.bonus || 0))}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{isLoading ? 'Chargement...' : 'Acheter'}</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-900 border border-red-700 text-white px-6 py-4 rounded-lg shadow-lg max-w-md">
            <p className="font-bold mb-1">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-bold text-lg mb-4">Comment utiliser vos EliteCoins ?</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">1.</span>
              <p>Achetez des EliteCoins en choisissant un pack ci-dessus</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">2.</span>
              <p>Retournez sur votre profil pour utiliser vos coins</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">3.</span>
              <p>Boostez vos annonces et attirez plus de visiteurs !</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
