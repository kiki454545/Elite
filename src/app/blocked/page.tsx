'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldAlert, Clock } from 'lucide-react'

function BlockedContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') || 'Votre accès a été restreint'
  const until = searchParams.get('until')

  const getTimeRemaining = () => {
    if (!until) return null

    const now = new Date()
    const end = new Date(until)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} heure${hours > 1 ? 's' : ''}`
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  const timeRemaining = getTimeRemaining()

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gray-900 rounded-2xl border border-red-800 p-8 max-w-md w-full shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          {/* Icône d'alerte */}
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-500/50">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>

          {/* Titre */}
          <h1 className="text-2xl font-bold text-white mb-3">
            Accès Refusé
          </h1>

          {/* Message */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            {reason}
          </p>

          {/* Durée restante si ban temporaire */}
          {timeRemaining && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-6 w-full">
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <Clock className="w-5 h-5 text-red-400" />
                <span>Temps restant : <strong className="text-white">{timeRemaining}</strong></span>
              </div>
              {until && (
                <p className="text-gray-400 text-sm mt-2">
                  Expire le {new Date(until).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          )}

          {/* Bannissement permanent */}
          {!until && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 w-full">
              <p className="text-red-400 text-sm font-medium">
                Restriction permanente
              </p>
            </div>
          )}

          {/* Footer */}
          <p className="text-gray-500 text-sm">
            Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function BlockedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <BlockedContent />
    </Suspense>
  )
}
