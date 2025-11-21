'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, Coins, ArrowRight } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const session = searchParams.get('session_id')
    setSessionId(session)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-2xl border-2 border-green-500 max-w-md w-full p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-6"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Paiement Réussi ! 🎉
        </h1>

        <p className="text-gray-300 mb-6">
          Votre achat d'EliteCoins a été traité avec succès. Les coins ont été ajoutés à votre compte.
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Coins className="w-6 h-6 text-amber-400" />
            <span className="text-white font-bold text-lg">EliteCoins crédités !</span>
          </div>
          <p className="text-gray-400 text-sm">
            Vous pouvez maintenant utiliser vos coins pour booster votre serveur Minecraft
          </p>
        </div>

        {sessionId && (
          <p className="text-gray-500 text-xs mb-6">
            ID de transaction: {sessionId.slice(0, 20)}...
          </p>
        )}

        <div className="space-y-3">
          <Link
            href="/payment"
            className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
          >
            <span>Acheter un package pub</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/"
            className="block w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
