'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Calendar, ExternalLink, RefreshCw, Pencil, X, Check } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { CITIES_BY_COUNTRY } from '@/data/cities'

// Toutes les villes disponibles (FR, BE, CH)
const ALL_CITIES = [
  ...CITIES_BY_COUNTRY.FR,
  ...CITIES_BY_COUNTRY.BE,
  ...CITIES_BY_COUNTRY.CH
]

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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCity, setEditCity] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [savingCity, setSavingCity] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filtrer les villes pour l'autocomplete
  const filteredCities = citySearch.length >= 2
    ? ALL_CITIES.filter(city =>
        city.toLowerCase().includes(citySearch.toLowerCase())
      ).slice(0, 15)
    : []

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

  function startEditing(update: CityUpdate) {
    setEditingId(update.id)
    setEditCity(update.new_city)
    setCitySearch(update.new_city)
    setShowSuggestions(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditCity('')
    setCitySearch('')
    setShowSuggestions(false)
  }

  function selectCity(city: string) {
    setEditCity(city)
    setCitySearch(city)
    setShowSuggestions(false)
  }

  async function saveCity(update: CityUpdate) {
    if (!editCity.trim() || editCity === update.new_city) {
      cancelEditing()
      return
    }

    setSavingCity(true)
    try {
      // Mettre à jour l'annonce
      const { error: adError } = await supabase
        .from('ads')
        .update({ location: editCity.trim() })
        .eq('id', update.ad_id)

      if (adError) throw adError

      // Mettre à jour le log
      const { error: logError } = await supabase
        .from('city_updates_log')
        .update({ new_city: editCity.trim() })
        .eq('id', update.id)

      if (logError) throw logError

      // Mettre à jour l'état local
      setUpdates(prev => prev.map(u =>
        u.id === update.id ? { ...u, new_city: editCity.trim() } : u
      ))

      cancelEditing()
    } catch (error) {
      console.error('Erreur sauvegarde ville:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSavingCity(false)
    }
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
                        {editingId === update.id ? (
                          <div className="relative flex items-center gap-2">
                            <div className="relative">
                              <input
                                ref={inputRef}
                                type="text"
                                value={citySearch}
                                onChange={(e) => {
                                  setCitySearch(e.target.value)
                                  setEditCity(e.target.value)
                                  setShowSuggestions(true)
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveCity(update)
                                  if (e.key === 'Escape') cancelEditing()
                                }}
                                className="w-48 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-pink-500"
                                placeholder="Rechercher une ville..."
                              />
                              <AnimatePresence>
                                {showSuggestions && filteredCities.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-50 top-full left-0 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto"
                                  >
                                    {filteredCities.map((city) => (
                                      <button
                                        key={city}
                                        onClick={() => selectCity(city)}
                                        className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 transition-colors"
                                      >
                                        {city}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <button
                              onClick={() => saveCity(update)}
                              disabled={savingCity}
                              className="p-1 bg-green-600 hover:bg-green-500 rounded transition-colors disabled:opacity-50"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 font-medium">{update.new_city}</span>
                            <button
                              onClick={() => startEditing(update)}
                              className="p-1 text-gray-400 hover:text-pink-400 transition-colors"
                              title="Modifier la ville"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
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
