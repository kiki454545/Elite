'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Calendar, Shield, ArrowLeft, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface UserWarning {
  id: string
  user_id: string
  admin_id: string
  reason: string
  details?: string
  created_at: string
  admin?: {
    username: string
  }
}

export default function WarningsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [warnings, setWarnings] = useState<UserWarning[]>([])
  const [loadingWarnings, setLoadingWarnings] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      loadWarnings()
    }
  }, [user, loading, router])

  async function loadWarnings() {
    try {
      setLoadingWarnings(true)
      const { data, error } = await supabase
        .from('user_warnings')
        .select(`
          *,
          admin:profiles!user_warnings_admin_id_fkey(username)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWarnings(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des avertissements:', error)
    } finally {
      setLoadingWarnings(false)
    }
  }

  if (loading || loadingWarnings) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title="Mes avertissements" showBackButton={true} backUrl="/my-ads" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-white font-semibold mb-2">À propos des avertissements</h2>
              <p className="text-sm text-yellow-200">
                Les avertissements sont émis par notre équipe de modération lorsque votre activité ne respecte pas nos règles.
                Trop d'avertissements peuvent entraîner des restrictions sur votre compte.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Warnings Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Total d'avertissements</h3>
                <p className="text-sm text-gray-400">Historique complet</p>
              </div>
            </div>
            <div className="text-4xl font-bold text-yellow-500">{warnings.length}</div>
          </div>
        </motion.div>

        {/* Warnings List */}
        <div className="space-y-4">
          {warnings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-green-500/20 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Aucun avertissement</h3>
                  <p className="text-gray-400">Vous n'avez reçu aucun avertissement. Continuez ainsi !</p>
                </div>
              </div>
            </motion.div>
          ) : (
            warnings.map((warning, index) => (
              <motion.div
                key={warning.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-gray-900 rounded-2xl border border-yellow-500/20 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-yellow-500/10 to-transparent p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-yellow-500/20 rounded-xl flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold text-lg mb-1">{warning.reason}</h3>
                          {warning.details && (
                            <p className="text-gray-300 text-sm leading-relaxed">{warning.details}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Shield className="w-4 h-4" />
                          <span>Par: {warning.admin?.username || 'Support'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(warning.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Help Section */}
        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + warnings.length * 0.05 }}
            className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mt-6"
          >
            <h3 className="text-white font-semibold mb-3">Besoin d'aide ?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Si vous pensez qu'un avertissement a été émis par erreur, vous pouvez contacter notre équipe de support.
            </p>
            <button
              onClick={() => router.push('/profile/support')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
            >
              Contacter le support
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
