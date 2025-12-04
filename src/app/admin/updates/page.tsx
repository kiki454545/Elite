'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Calendar, ExternalLink, RefreshCw } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface CityUpdate {
  id: string
  ad_id: string
  ad_title: string
  old_city: string
  new_city: string
  source_url: string
  created_at: string
}

export default function AdminUpdatesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [updates, setUpdates] = useState<CityUpdate[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (profile?.is_admin) {
        setIsAdmin(true)
        loadUpdates()
      } else {
        router.push('/')
      }
    }

    if (!loading) {
      if (!user) {
        router.push('/auth')
      } else {
        checkAdmin()
      }
    }
  }, [user, loading, router])

  async function loadUpdates() {
    setLoadingData(true)
    try {
      const { data, error } = await supabase
        .from('city_updates_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setUpdates(data || [])
    } catch (error) {
      console.error('Erreur chargement updates:', error)
    } finally {
      setLoadingData(false)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Historique des Updates</h1>
              <p className="text-gray-400 text-sm">Mises à jour automatiques des villes</p>
            </div>
          </div>
          <button
            onClick={loadUpdates}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors text-white"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total mises à jour</p>
            <p className="text-2xl font-bold text-white">{updates.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Aujourd'hui</p>
            <p className="text-2xl font-bold text-green-500">
              {updates.filter(u => {
                const today = new Date().toDateString()
                return new Date(u.created_at).toDateString() === today
              }).length}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Cette semaine</p>
            <p className="text-2xl font-bold text-blue-500">
              {updates.filter(u => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(u.created_at) > weekAgo
              }).length}
            </p>
          </div>
        </div>

        {/* Liste des updates */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune mise à jour pour le moment</p>
              <p className="text-gray-500 text-sm mt-2">
                Les changements de ville apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {updates.map((update, index) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">
                          {update.ad_title.split(' - ')[0]}
                        </span>
                        <button
                          onClick={() => router.push(`/ads/${update.ad_id}`)}
                          className="text-pink-500 hover:text-pink-400 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-red-400 line-through">{update.old_city}</span>
                        <span className="text-gray-500">→</span>
                        <span className="text-green-400 font-medium">{update.new_city}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      {formatDate(update.created_at)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
