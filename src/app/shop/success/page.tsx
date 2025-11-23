'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { CheckCircle, Coins, ArrowRight, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [sessionData, setSessionData] = useState<{
    coins: number
    amount: number
    newBalance: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id')

      if (!sessionId) {
        router.push('/shop')
        return
      }

      try {
        // Récupérer les informations de la session
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        // Récupérer le nouveau solde
        const { data: profile } = await supabase
          .from('profiles')
          .select('elite_coins')
          .eq('id', user.id)
          .single()

        if (profile) {
          // Récupérer la dernière transaction
          const { data: transaction } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .eq('payment_id', sessionId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (transaction) {
            setSessionData({
              coins: transaction.amount,
              amount: transaction.package_id ? parseFloat(transaction.package_id.split('_')[1]) : 0,
              newBalance: profile.elite_coins,
            })
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du paiement:', error)
      } finally {
        setIsLoading(false)
      }
    }

    verifyPayment()
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Vérification du paiement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title="Paiement Réussi" />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/30 p-8 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-400" />
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Paiement réussi !
          </h1>

          <p className="text-gray-300 mb-8">
            Votre achat a été traité avec succès. Les EliteCoins ont été crédités sur votre compte.
          </p>

          {/* Transaction Details */}
          {sessionData && (
            <div className="space-y-4 mb-8">
              {/* Coins Purchased */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <Coins className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-gray-400 text-sm">EliteCoins achetés</div>
                      <div className="text-amber-400 font-bold text-2xl">
                        +{sessionData.coins} EC
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm">Montant payé</div>
                    <div className="text-white font-bold text-xl">
                      {sessionData.amount.toFixed(2)}€
                    </div>
                  </div>
                </div>
              </div>

              {/* New Balance */}
              <div className="bg-gradient-to-br from-amber-400/10 to-yellow-500/10 rounded-xl p-6 border border-amber-400/30">
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  <div>
                    <div className="text-gray-400 text-sm">Nouveau solde</div>
                    <div className="text-amber-400 font-bold text-3xl">
                      {sessionData.newBalance} EC
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/shop')}
              className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Coins className="w-5 h-5" />
              <span>Retour à la boutique</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>Tableau de bord</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Additional Info */}
          <p className="text-gray-500 text-sm mt-6">
            Un email de confirmation a été envoyé à votre adresse email.
          </p>
        </motion.div>

        {/* What to do next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Et maintenant ?</h2>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">1</span>
              </div>
              <p className="text-sm">
                Utilisez vos EliteCoins pour acheter des grades Premium (Plus, VIP, Elite)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">2</span>
              </div>
              <p className="text-sm">
                Augmentez votre visibilité et apparaissez en tête des résultats de recherche
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">3</span>
              </div>
              <p className="text-sm">
                Profitez de fonctionnalités exclusives comme les photos illimitées et le support prioritaire
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
