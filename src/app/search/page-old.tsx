'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, X, SlidersHorizontal, ChevronLeft, ChevronRight, Check, MessageCircle, Navigation } from 'lucide-react'
import { Ad } from '@/types/ad'
import { RANK_CONFIG, RankType } from '@/types/profile'
import { AD_CATEGORIES, COMMON_SERVICES } from '@/types/ad'
import { Heart, Eye } from 'lucide-react'
import { Watermark } from '@/components/Watermark'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCountry } from '@/contexts/CountryContext'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { ScrollToTop } from '@/components/ScrollToTop'
import { LocationSearch } from '@/components/LocationSearch'
import { supabase } from '@/lib/supabase'

interface City {
  id: string
  name: string
  department: string
  department_code: string
  latitude: number
  longitude: number
}

interface AdWithDistance extends Ad {
  distance_km?: number
}

function RankBadge({ rank }: { rank: RankType }) {
  if (rank === 'standard') return null
  const config = RANK_CONFIG[rank]
  return (
    <div className={`absolute top-3 left-3 flex items-center gap-1.5 ${config.bgColor} backdrop-blur-md px-2.5 py-1.5 rounded-lg border ${config.borderColor} shadow-lg`}>
      <span className="text-sm">{config.icon}</span>
      <span className={`text-xs font-bold ${config.textColor} tracking-wider`}>
        {config.label}
      </span>
    </div>
  )
}

export default function SearchPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { selectedCountry } = useCountry()
  const [currentPhotoIndices, setCurrentPhotoIndices] = useState<Record<string, number>>({})
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Géolocalisation
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null)
  const [locationAds, setLocationAds] = useState<AdWithDistance[]>([])
  const [loadingLocationAds, setLoadingLocationAds] = useState(false)

  // Toutes les annonces de la base de données
  const [allAds, setAllAds] = useState<AdWithDistance[]>([])
  const [loadingAllAds, setLoadingAllAds] = useState(false)

  // Helper pour afficher un toast
  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Charger toutes les annonces au démarrage
  useEffect(() => {
    loadAllAds()
  }, [selectedCountry])

  // Charger les annonces par géolocalisation
  useEffect(() => {
    if (selectedCity) {
      loadAdsByLocation()
    } else {
      setLocationAds([])
    }
  }, [selectedCity, selectedRadius])

  async function loadAllAds() {
    try {
      setLoadingAllAds(true)

      // 1. Récupérer les annonces
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'approved')
        .eq('country', selectedCountry.code)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur lors du chargement des annonces:', error)
        return
      }

      console.log('📋 Annonces chargées:', data)

      if (!data || data.length === 0) {
        setAllAds([])
        return
      }

      // 2. Récupérer les profils des utilisateurs
      const userIds = data.map((item: any) => item.user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, rank')
        .in('id', userIds)

      if (profilesError) {
        console.error('Erreur lors du chargement des profils:', profilesError)
      }

      console.log('👤 Profils chargés:', profiles)

      // 3. Créer un index des profils pour recherche rapide
      const profilesMap = new Map()
      profiles?.forEach(profile => {
        profilesMap.set(profile.id, profile)
      })

      // 4. Convertir les données en format Ad
      const ads: AdWithDistance[] = (data || []).map((item: any) => {
        const profile = profilesMap.get(item.user_id)
        return {
          id: item.id,
          userId: item.user_id,
          username: profile?.username || item.title || 'Utilisateur',
          title: item.title || profile?.username || 'Utilisateur',
          age: profile?.age || 25,
          location: item.location,
          photos: item.photos || [],
          category: (item.categories && item.categories[0]) || 'escort',
          services: [],
          description: item.description || '',
          verified: item.verified || false,
          online: false,
          views: item.views || 0,
          favorites: item.favorites_count || 0,
          rank: (profile?.rank || 'standard') as RankType,
          video: item.video_url,
          country: item.country || selectedCountry.code,
          availability: '',
          createdAt: new Date(item.created_at),
          updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(item.created_at),
        }
      })

      setAllAds(ads)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoadingAllAds(false)
    }
  }

  async function loadAdsByLocation() {
    if (!selectedCity) return

    try {
      setLoadingLocationAds(true)

      const { data, error } = await supabase
        .rpc('search_ads_by_distance', {
          search_lat: selectedCity.latitude,
          search_lon: selectedCity.longitude,
          max_distance_km: selectedRadius,
          limit_count: 100,
          offset_count: 0
        })

      if (error) {
        console.error('Erreur lors de la recherche par distance:', error)
        return
      }

      console.log('📍 Résultats de la recherche:', data)

      if (!data || data.length === 0) {
        setLocationAds([])
        return
      }

      // Récupérer les profils des utilisateurs
      const userIds = data.map((item: any) => item.user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, rank')
        .in('id', userIds)

      if (profilesError) {
        console.error('Erreur lors du chargement des profils:', profilesError)
      }

      // Créer un index des profils pour recherche rapide
      const profilesMap = new Map()
      profiles?.forEach(profile => {
        profilesMap.set(profile.id, profile)
      })

      // Convertir les données de Supabase en format Ad
      const adsWithDistance: AdWithDistance[] = (data || []).map((item: any) => {
        const profile = profilesMap.get(item.user_id)
        return {
          id: item.id,
          userId: item.user_id,
          username: profile?.username || item.title || 'Utilisateur',
          age: 25,
          location: item.location,
          photos: item.photos || [],
          category: (item.categories && item.categories[0]) || 'escort',
          services: [],
          description: item.description || '',
          verified: item.verified || false,
          online: false,
          views: item.views || 0,
          favorites: item.favorites_count || 0,
          rank: (profile?.rank || 'standard') as RankType,
          video: false,
          country: item.country || selectedCountry.code,
          distance_km: item.distance_km
        }
      })

      setLocationAds(adsWithDistance)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoadingLocationAds(false)
    }
  }

  const handleViewAd = (adId: string) => {
    router.push(`/ads/${adId}`)
  }

  const handleToggleFavorite = (e: React.MouseEvent, adId: string, adUserId: string) => {
    e.stopPropagation()

    // Rediriger vers la page d'auth si non connecté
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    // Vérifier que l'utilisateur ne met pas sa propre annonce en favoris
    if (user?.id === adUserId) {
      showToast('Vous ne pouvez pas ajouter votre propre annonce aux favoris', 'error')
      return
    }

    toggleFavorite(adId)
  }

  const handlePrevPhoto = (e: React.MouseEvent, adId: string, totalPhotos: number) => {
    e.stopPropagation()
    setCurrentPhotoIndices(prev => ({
      ...prev,
      [adId]: ((prev[adId] || 0) - 1 + totalPhotos) % totalPhotos
    }))
  }

  const handleNextPhoto = (e: React.MouseEvent, adId: string, totalPhotos: number) => {
    e.stopPropagation()
    setCurrentPhotoIndices(prev => ({
      ...prev,
      [adId]: ((prev[adId] || 0) + 1) % totalPhotos
    }))
  }

  const handleSwipe = (adId: string, direction: 'left' | 'right', totalPhotos: number) => {
    setCurrentPhotoIndices(prev => ({
      ...prev,
      [adId]: direction === 'left'
        ? ((prev[adId] || 0) + 1) % totalPhotos
        : ((prev[adId] || 0) - 1 + totalPhotos) % totalPhotos
    }))
  }

  const getCurrentPhotoIndex = (adId: string) => currentPhotoIndices[adId] || 0

  const getPhotoUrl = (ad: AdWithDistance, index: number) => {
    // Utiliser les vraies photos de l'annonce
    if (ad.photos && ad.photos.length > 0 && ad.photos[index]) {
      return ad.photos[index]
    }
    // Photo par défaut si pas de photos
    return `https://picsum.photos/seed/${ad.id}-${index}/400/600`
  }

  const getPhotoCount = (ad: AdWithDistance) => {
    return ad.photos && ad.photos.length > 0 ? ad.photos.length : 1
  }

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedServices([])
    setSelectedCategory('')
    setSelectedCity(null)
    setSelectedRadius(null)
  }

  // Filtrer les vraies annonces
  const filteredAds = allAds.filter(ad => {
    const matchesSearch = searchQuery === '' ||
      ad.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === '' ||
      ad.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Utiliser les annonces de géolocalisation si disponibles, sinon toutes les annonces filtrées
  const adsToDisplay: AdWithDistance[] = selectedCity
    ? locationAds
    : filteredAds

  // Trier par distance si géolocalisation active, sinon par rank
  const sortedAds = [...adsToDisplay].sort((a, b) => {
    if (selectedCity) {
      // Trier par distance croissante
      return (a.distance_km || 0) - (b.distance_km || 0)
    } else {
      // Trier par rank
      return RANK_CONFIG[b.rank].priority - RANK_CONFIG[a.rank].priority
    }
  })

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title="Recherche" showBackButton={true} />

      {/* Search Bar */}
      <div className="sticky top-[73px] z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-screen-xl mx-auto px-4 py-4">

          {/* Search Bar */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par pseudo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg border transition-colors ${
                showFilters || selectedServices.length > 0 || selectedCategory || selectedCity
                  ? 'bg-pink-500 border-pink-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-800 rounded-lg p-4 mb-3"
            >
              {/* Géolocalisation */}
              <LocationSearch
                onLocationChange={(city, radius) => {
                  setSelectedCity(city)
                  setSelectedRadius(radius)
                }}
                className="mb-4"
              />

              {/* Category */}
              <div className="mb-4">
                <label className="text-gray-300 text-sm font-medium mb-2 block">Catégorie</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      selectedCategory === ''
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Toutes
                  </button>
                  {Object.entries(AD_CATEGORIES).map(([key, { label, icon }]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        selectedCategory === key
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div className="mb-4">
                <label className="text-gray-300 text-sm font-medium mb-2 block">Services</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SERVICES.map(service => (
                    <button
                      key={service}
                      onClick={() => toggleService(service)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        selectedServices.includes(service)
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                          : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full bg-gray-900 text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Effacer les filtres
              </button>
            </motion.div>
          )}

          {/* Active Filters */}
          {(selectedServices.length > 0 || selectedCategory || selectedCity) && (
            <div className="flex flex-wrap gap-2">
              {selectedCity && (
                <span className="bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  {selectedCity.name} {selectedRadius && `(${selectedRadius} km)`}
                  <button onClick={() => {
                    setSelectedCity(null)
                    setSelectedRadius(null)
                  }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  {AD_CATEGORIES[selectedCategory as keyof typeof AD_CATEGORIES].label}
                  <button onClick={() => setSelectedCategory('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedServices.map(service => (
                <span key={service} className="bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  {service}
                  <button onClick={() => toggleService(service)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Results Count */}
        <p className="text-gray-400 mb-4 text-sm">
          {(loadingLocationAds || loadingAllAds) ? (
            'Chargement...'
          ) : (
            <>
              {sortedAds.length} résultat{sortedAds.length > 1 ? 's' : ''}
              {selectedCity && selectedRadius && (
                <span className="ml-2 text-pink-400">
                  dans un rayon de {selectedRadius} km autour de {selectedCity.name}
                </span>
              )}
            </>
          )}
        </p>

        {/* Results Grid */}
        {sortedAds.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Aucun résultat</h3>
            <p className="text-gray-400 mb-6">Essayez de modifier vos critères de recherche</p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedAds.map((ad, index) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => handleViewAd(ad.id)}
              >
                <div className="relative aspect-[3/4] bg-gray-800 rounded-2xl overflow-hidden">
                  {/* Carousel avec effet de slide horizontal */}
                  <motion.div
                    className="absolute inset-0"
                  >
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.1}
                      dragMomentum={false}
                      onDragStart={(e) => {
                        // Empêcher le drag si c'est une souris (desktop)
                        if ((e as any).pointerType === 'mouse') {
                          e.preventDefault()
                          return false
                        }
                      }}
                      onDragEnd={(e, { offset }) => {
                        const swipe = offset.x
                        const photoCount = getPhotoCount(ad)
                        if (Math.abs(swipe) > 50) {
                          handleSwipe(ad.id, swipe > 0 ? 'right' : 'left', photoCount)
                        }
                      }}
                      className="flex h-full touch-pan-y"
                      animate={{
                        x: `-${getCurrentPhotoIndex(ad.id) * 100}%`
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                    >
                      {[...Array(getPhotoCount(ad))].map((_, index) => (
                        <div
                          key={index}
                          className="min-w-full h-full"
                        >
                          <img
                            src={getPhotoUrl(ad, index)}
                            alt={`${ad.username} - Photo ${index + 1}`}
                            className="w-full h-full object-cover pointer-events-none select-none"
                            draggable={false}
                          />
                        </div>
                      ))}
                    </motion.div>
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 pointer-events-none" />

                  <Watermark size="small" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-100 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Photo navigation arrows - visible au hover sur desktop uniquement */}
                  <div className="hidden md:flex absolute inset-0 items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handlePrevPhoto(e, ad.id, getPhotoCount(ad))}
                      className="pointer-events-auto bg-black/60 backdrop-blur-sm p-2.5 rounded-full hover:bg-black/80 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleNextPhoto(e, ad.id, getPhotoCount(ad))}
                      className="pointer-events-auto bg-black/60 backdrop-blur-sm p-2.5 rounded-full hover:bg-black/80 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>

                  {/* Photo indicator dots */}
                  <div className="absolute top-1/2 left-0 right-0 flex justify-center gap-1.5 md:gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-none">
                    {[...Array(getPhotoCount(ad))].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          i === getCurrentPhotoIndex(ad.id) ? 'bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>

                  <RankBadge rank={ad.rank} />

                  {ad.online && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-xs text-white font-medium">En ligne</span>
                    </div>
                  )}

                  {ad.verified && (
                    <div className="absolute top-14 left-3 bg-blue-500/90 backdrop-blur-sm p-1.5 rounded-full">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-base mb-1">
                      {ad.username}, {ad.age}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-300 text-xs mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{ad.location}</span>
                      {ad.distance_km !== undefined && (
                        <span className="ml-1 text-pink-400 font-medium">
                          • À {Math.round(ad.distance_km)} km
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{ad.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{ad.favorites}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Video indicator */}
                        {ad.video && (
                          <div className="bg-black/70 backdrop-blur-sm p-1.5 rounded-full">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleToggleFavorite(e, ad.id, ad.userId)}
                          className={`backdrop-blur-sm p-1.5 rounded-full transition-colors ${
                            isFavorite(ad.id)
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-800/80 text-pink-500 hover:bg-gray-700/80'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFavorite(ad.id) ? 'fill-current' : ''}`} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <ScrollToTop />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pointer-events-auto max-w-md w-full"
          >
            <div className={`rounded-xl p-4 shadow-2xl backdrop-blur-sm ${
              toast.type === 'error'
                ? 'bg-red-500/90 text-white'
                : toast.type === 'success'
                ? 'bg-green-500/90 text-white'
                : 'bg-blue-500/90 text-white'
            }`}>
              <div className="flex items-center gap-3">
                {toast.type === 'error' && <X className="w-5 h-5 flex-shrink-0" />}
                {toast.type === 'success' && <Check className="w-5 h-5 flex-shrink-0" />}
                {toast.type === 'info' && <MessageCircle className="w-5 h-5 flex-shrink-0" />}
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
