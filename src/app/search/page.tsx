'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, X, SlidersHorizontal, ChevronLeft, ChevronRight, Eye, Heart, Navigation } from 'lucide-react'
import { Ad } from '@/types/ad'
import { RANK_CONFIG, RankType } from '@/types/profile'
import { AD_CATEGORIES } from '@/types/ad'
import { Watermark } from '@/components/Watermark'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCountry } from '@/contexts/CountryContext'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { useLanguage } from '@/contexts/LanguageContext'
import { ScrollToTop } from '@/components/ScrollToTop'
import { LocationSearch } from '@/components/LocationSearch'
import { AdvancedSearchFilters, AdvancedSearchFiltersData } from '@/components/AdvancedSearchFilters'
import { supabase } from '@/lib/supabase'

interface City {
  name: string
  country: string
}

interface AdWithDistance extends Ad {
  distance_km?: number
  ethnicity?: string
  nationality?: string
  cup_size?: string
  height?: number
  weight?: number
  hair_color?: string
  eye_color?: string
  body_type?: string
  pubic_hair?: string
  tattoos?: boolean
  piercings?: boolean
  meeting_at_home?: boolean
  meeting_at_hotel?: boolean
  meeting_in_car?: boolean
  meeting_at_escort?: boolean
  has_comments?: boolean
}

function RankBadge() {
  // Badges de rang désactivés
  return null
}

function NewBadge({ createdAt }: { createdAt: Date }) {
  const { language } = useLanguage()

  // Vérifier si l'annonce a été créée dans les derniers 7 jours
  const isNew = () => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
    return diffInHours <= 168 // 7 jours = 168 heures
  }

  if (!isNew()) return null

  // Badge pour anglais
  if (language === 'en') {
    return (
      <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none">
        <div className="absolute top-3 right-[-32px] bg-gradient-to-r from-rose-600 to-pink-600 text-white text-center py-1 px-8 rotate-45 shadow-lg shadow-pink-600/60">
          <span className="text-[11px] font-bold tracking-wider uppercase">
            {'\u2009\u2009\u2009\u2009NEW\u2009\u2009\u2009\u2009\u2009\u2009'}
          </span>
        </div>
      </div>
    )
  }

  // Badge pour français
  return (
    <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none">
      <div className="absolute top-3 right-[-32px] bg-gradient-to-r from-rose-600 to-pink-600 text-white text-center py-1 px-8 rotate-45 shadow-lg shadow-pink-600/60">
        <span className="text-[11px] font-bold tracking-wider uppercase">
          Nouveau
        </span>
      </div>
    </div>
  )
}

export default function SearchPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { selectedCountry } = useCountry()
  const { t } = useLanguage()
  const [currentPhotoIndices, setCurrentPhotoIndices] = useState<Record<string, number>>({})
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null)
  const isDraggingRef = useRef<Record<string, boolean>>({})

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Filtres avancés
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFiltersData>({})

  // Stabiliser les callbacks pour éviter les re-renders
  const handleAdvancedFiltersChange = useCallback((newFilters: AdvancedSearchFiltersData) => {
    setAdvancedFilters(newFilters)
  }, [])

  const handleClearAdvancedFilters = useCallback(() => {
    setAdvancedFilters({})
  }, [])

  // Sélection de ville
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null)

  // Toutes les annonces de la base de données
  const [allAds, setAllAds] = useState<AdWithDistance[]>([])
  const [loadingAllAds, setLoadingAllAds] = useState(false)
  const isLoadingRef = useRef(false)
  const hasLoadedOnce = useRef(false)

  // Helper pour afficher un toast
  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Rediriger vers l'accueil si la page est actualisée (F5)
  useEffect(() => {
    // Vérifier si on arrive sur la page sans avoir de pays sélectionné
    // Cela arrive uniquement lors d'un refresh (F5)
    if (selectedCountry.code === 'ALL') {
      router.push('/')
    }
  }, [])

  // Charger toutes les annonces au démarrage
  useEffect(() => {
    let isCancelled = false

    const load = async () => {
      // Éviter les chargements multiples simultanés
      if (isLoadingRef.current) {
        return
      }

      try {
        isLoadingRef.current = true
        setLoadingAllAds(true)

        // Charger TOUTES les annonces sans filtres (filtrage côté client pour performance)
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('status', 'approved')
          .eq('country', selectedCountry.code)
          .order('created_at', { ascending: false })

        // Si le composant est démonté ou qu'un nouveau chargement a commencé, abandonner
        if (isCancelled) {
          return
        }

        if (error) {
          console.error('Erreur lors du chargement des annonces:', error)
          return
        }

        if (!data || data.length === 0) {
          if (!isCancelled) setAllAds([])
          return
        }

        // Récupérer les profils des utilisateurs avec tous les champs nécessaires
        const userIds = data.map((item: any) => item.user_id)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, rank, age, gender, ethnicity, nationality, cup_size, height, weight, hair_color, eye_color, body_type, tattoos, piercings, pubic_hair, languages')
          .in('id', userIds)

        if (isCancelled) {
          return
        }

        if (profilesError) {
          console.error('Erreur lors du chargement des profils:', profilesError)
        }

        // Créer un index des profils pour recherche rapide
        const profilesMap = new Map()
        profiles?.forEach(profile => {
          profilesMap.set(profile.id, profile)
        })

        // Convertir les données en format Ad
        const ads: AdWithDistance[] = (data || []).map((item: any) => {
          const profile = profilesMap.get(item.user_id)
          return {
            id: item.id,
            userId: item.user_id,
            username: profile?.username || item.title || 'Utilisateur',
            title: item.title || profile?.username || 'Utilisateur',
            age: profile?.age || item.age || 25,
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
            // Ajouter tous les champs de filtrage avancé (depuis profile ou ads)
            gender: profile?.gender || item.gender,
            ethnicity: profile?.ethnicity || item.ethnicity,
            nationality: profile?.nationality || item.nationality,
            cup_size: profile?.cup_size || item.cup_size,
            height: profile?.height || item.height,
            weight: profile?.weight || item.weight,
            hair_color: profile?.hair_color || item.hair_color,
            eye_color: profile?.eye_color || item.eye_color,
            body_type: profile?.body_type || item.body_type,
            pubic_hair: profile?.pubic_hair || item.pubic_hair,
            tattoos: profile?.tattoos ?? item.tattoos,
            piercings: profile?.piercings ?? item.piercings,
            meeting_at_home: item.meeting_at_home,
            meeting_at_hotel: item.meeting_at_hotel,
            meeting_in_car: item.meeting_in_car,
            meeting_at_escort: item.meeting_at_escort,
            languages: profile?.languages || item.languages || [],
            has_comments: item.has_comments,
          }
        })

        if (!isCancelled) {
          setAllAds(ads)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('❌ Erreur lors du chargement:', error)
        }
      } finally {
        if (!isCancelled) {
          setLoadingAllAds(false)
        }
        isLoadingRef.current = false
      }
    }

    load()

    // Cleanup function
    return () => {
      isCancelled = true
      isLoadingRef.current = false
    }
  }, [selectedCountry])

  // NE PAS recharger à chaque changement de filtre (filtrage côté client)

  const handleViewAd = (adId: string) => {
    router.push(`/ads/${adId}`)
  }

  const handleToggleFavorite = (e: React.MouseEvent, adId: string, adUserId: string) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    if (user?.id === adUserId) {
      showToast(t('searchPage.cannotAddOwnAdToFavorites'), 'error')
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
    if (ad.photos && ad.photos.length > 0 && ad.photos[index]) {
      return ad.photos[index]
    }
    return `https://picsum.photos/seed/${ad.id}-${index}/400/600`
  }

  const getPhotoCount = (ad: AdWithDistance) => {
    return ad.photos && ad.photos.length > 0 ? ad.photos.length : 1
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedCity(null)
    setSelectedRadius(null)
    setAdvancedFilters({})
  }

  // Filtrer les vraies annonces (côté client, INSTANTANÉ !) - avec useMemo pour éviter les re-renders
  // Mapping des valeurs françaises vers les valeurs anglaises de la base
  const genderMap: Record<string, string> = {
    'femme': 'female',
    'homme': 'male',
    'trans': 'transsexual',
    'couple': 'couple',
    'non-binaire': 'non-binary'
  }

  const ethnicityMap: Record<string, string> = {
    'caucasienne': 'caucasian',
    'africaine': 'african',
    'asiatique': 'asian',
    'latine': 'latina',
    'arabe': 'arab',
    'metisse': 'mixed',
    'indienne': 'indian',
    'autre': 'other'
  }

  const hairColorMap: Record<string, string> = {
    'blonde': 'blonde',
    'brune': 'brunette',
    'rousse': 'redhead',
    'chatain': 'brown',
    'noire': 'black',
    'grise': 'gray',
    'blanche': 'white',
    'coloree': 'colored',
    'autre': 'other'
  }

  const eyeColorMap: Record<string, string> = {
    'bleus': 'blue',
    'verts': 'green',
    'marrons': 'brown',
    'noirs': 'black',
    'gris': 'gray',
    'noisette': 'hazel',
    'autre': 'other'
  }

  const bodyTypeMap: Record<string, string> = {
    'mince': 'slim',
    'athletique': 'athletic',
    'moyenne': 'average',
    'ronde': 'curvy',
    'pulpeuse': 'voluptuous',
    'musclee': 'muscular'
  }

  // Pas besoin de mapping pour pubic_hair car les valeurs sont déjà en français dans la DB
  // Les valeurs possibles sont: 'rasee', 'taillee', 'naturelle', 'epilee'

  // Mapping des codes ISO vers les noms complets de langues (en anglais et français)
  const languageMap: Record<string, string[]> = {
    'fr': ['fr', 'french', 'français', 'francais'],
    'en': ['en', 'english', 'anglais'],
    'es': ['es', 'spanish', 'español', 'espagnol'],
    'de': ['de', 'german', 'deutsch', 'allemand'],
    'it': ['it', 'italian', 'italiano', 'italien'],
    'pt': ['pt', 'portuguese', 'português', 'portugais'],
    'ru': ['ru', 'russian', 'русский', 'russe'],
    'ar': ['ar', 'arabic', 'العربية', 'arabe'],
    'zh': ['zh', 'chinese', '中文', 'chinois'],
    'ja': ['ja', 'japanese', '日本語', 'japonais'],
    'nl': ['nl', 'dutch', 'nederlands', 'néerlandais'],
    'tr': ['tr', 'turkish', 'türkçe', 'turc'],
    'pl': ['pl', 'polish', 'polski', 'polonais'],
  }

  const filteredAds = useMemo(() => {
    // Si les annonces sont en cours de chargement, retourner un tableau vide
    if (loadingAllAds || allAds.length === 0) {
      return []
    }

    // Debug: afficher les filtres actifs
    console.log('🔍 Filtres actifs:', advancedFilters)

    // Vérifier si des filtres sont actifs
    const hasFilters = selectedCategory !== '' ||
      selectedCity !== null ||
      Object.keys(advancedFilters).some(key => {
        const value = advancedFilters[key as keyof AdvancedSearchFiltersData]
        if (Array.isArray(value)) return value.length > 0
        return value !== undefined && value !== null
      })

    // Si l'utilisateur tape moins de 2 caractères dans la barre de recherche
    // ET qu'aucun filtre n'est actif, afficher toutes les annonces
    // (comportement par défaut de la page de recherche)

    const results = allAds.filter(ad => {
      // Recherche textuelle - vérification précoce pour éliminer rapidement
      if (searchQuery.length >= 2 && !ad.username.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Catégorie - vérification précoce
      if (selectedCategory !== '' && ad.category !== selectedCategory) {
        return false
      }

      // Ville - vérification précoce
      if (selectedCity && ad.location?.toLowerCase() !== selectedCity.name.toLowerCase()) {
        return false
      }

      // Téléphone
      if (advancedFilters.phoneNumber) {
        return false // Skip pour l'instant
      }

      // Genre
      if (advancedFilters.gender && advancedFilters.gender.length > 0) {
        if (!advancedFilters.gender.includes(ad.gender || '')) return false
      }

      // Âge
      if (advancedFilters.ageMin && (!ad.age || ad.age < advancedFilters.ageMin)) return false
      if (advancedFilters.ageMax && (!ad.age || ad.age > advancedFilters.ageMax)) return false

      // Ethnie
      if (advancedFilters.ethnicity && advancedFilters.ethnicity.length > 0) {
        if (!advancedFilters.ethnicity.includes(ad.ethnicity || '')) return false
      }

      // Nationalité
      if (advancedFilters.nationality && advancedFilters.nationality.length > 0) {
        if (!advancedFilters.nationality.includes(ad.nationality || '')) return false
      }

      // Bonnet
      if (advancedFilters.cupSize && advancedFilters.cupSize.length > 0) {
        if (!advancedFilters.cupSize.includes(ad.cup_size || '')) return false
      }

      // Taille
      if (advancedFilters.heightMin && (!ad.height || ad.height < advancedFilters.heightMin)) return false
      if (advancedFilters.heightMax && (!ad.height || ad.height > advancedFilters.heightMax)) return false

      // Poids
      if (advancedFilters.weightMin && (!ad.weight || ad.weight < advancedFilters.weightMin)) return false
      if (advancedFilters.weightMax && (!ad.weight || ad.weight > advancedFilters.weightMax)) return false

      // Couleur de cheveux
      if (advancedFilters.hairColor && advancedFilters.hairColor.length > 0) {
        if (!advancedFilters.hairColor.includes(ad.hair_color || '')) return false
      }

      // Couleur des yeux
      if (advancedFilters.eyeColor && advancedFilters.eyeColor.length > 0) {
        if (!advancedFilters.eyeColor.includes(ad.eye_color || '')) return false
      }

      // Type de corps
      if (advancedFilters.bodyType && advancedFilters.bodyType.length > 0) {
        if (!advancedFilters.bodyType.includes(ad.body_type || '')) return false
      }

      // Pilosité pubienne
      if (advancedFilters.pubicHair && advancedFilters.pubicHair.length > 0) {
        if (!advancedFilters.pubicHair.includes(ad.pubic_hair || '')) return false
      }

      // Tatouages
      if (advancedFilters.tattoos !== undefined && advancedFilters.tattoos !== null) {
        if (ad.tattoos !== advancedFilters.tattoos) return false
      }

      // Piercings
      if (advancedFilters.piercings !== undefined && advancedFilters.piercings !== null) {
        if (ad.piercings !== advancedFilters.piercings) return false
      }

      // Lieux de rendez-vous
      if (advancedFilters.meetingPlaces && advancedFilters.meetingPlaces.length > 0) {
        const hasMatchingPlace = advancedFilters.meetingPlaces.some(place => {
          if (place === 'home') return !!(ad as any).meeting_at_home
          if (place === 'hotel') return !!(ad as any).meeting_at_hotel
          if (place === 'car') return !!(ad as any).meeting_in_car
          if (place === 'escort') return !!(ad as any).meeting_at_escort
          return false
        })
        if (!hasMatchingPlace) return false
      }

      // Langues
      if (advancedFilters.languages && advancedFilters.languages.length > 0) {
        const adLanguages = ad.languages || []
        const hasMatchingLanguage = advancedFilters.languages.some(lang => adLanguages.includes(lang))
        if (!hasMatchingLanguage) return false
      }

      // Vérifié
      if (advancedFilters.verified && !ad.verified) return false

      // Commentaires
      if (advancedFilters.hasComments && !(ad as any).has_comments) return false

      return true
    })

    return results
  }, [allAds, searchQuery, selectedCategory, selectedCity, advancedFilters, loadingAllAds])

  // Afficher les annonces filtrées
  const adsToDisplay: AdWithDistance[] = filteredAds

  // Trier par distance si géolocalisation active, sinon par rank - avec useMemo
  const sortedAds = useMemo(() => [...adsToDisplay].sort((a, b) => {
    if (selectedCity) {
      return (a.distance_km || 0) - (b.distance_km || 0)
    } else {
      return RANK_CONFIG[b.rank].priority - RANK_CONFIG[a.rank].priority
    }
  }), [adsToDisplay, selectedCity])

  const hasActiveFilters = () => {
    return selectedCategory !== '' ||
      selectedCity !== null ||
      Object.keys(advancedFilters).some(key => {
        const value = advancedFilters[key as keyof AdvancedSearchFiltersData]
        if (Array.isArray(value)) return value.length > 0
        return value !== undefined && value !== null
      })
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title={t('searchPage.title')} showBackButton={true} />

      {/* Search Bar */}
      <div className={`${showFilters ? '' : 'sticky top-[71px]'} z-[20] bg-gray-900 border-b border-gray-800`}>
        <div className="max-w-screen-xl mx-auto px-4 py-4">

          {/* Search Bar */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchPage.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg border transition-colors ${
                showFilters || hasActiveFilters()
                  ? 'bg-pink-500 border-pink-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-3">
              {/* Géolocalisation */}
              <div className="bg-gray-800 rounded-lg p-4 mb-3">
                <LocationSearch
                  onLocationChange={(city, radius) => {
                    setSelectedCity(city)
                    setSelectedRadius(radius)
                  }}
                  className="mb-4"
                />

                {/* Category */}
                <div className="mb-4">
                  <label className="text-gray-300 text-sm font-medium mb-2 block">{t('searchPage.category')}</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        selectedCategory === ''
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {t('searchPage.all')}
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
              </div>

              {/* Filtres avancés - Désactivés pendant le chargement */}
              <div className={loadingAllAds ? 'pointer-events-none opacity-50' : ''}>
                <AdvancedSearchFilters
                  filters={advancedFilters}
                  onFiltersChange={handleAdvancedFiltersChange}
                  onClear={handleClearAdvancedFilters}
                />
              </div>

              {/* Clear All Filters */}
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-3 bg-gray-800 text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {t('searchPage.clearAllFilters')}
                </button>
              )}
            </div>
          )}

          {/* Active Filters Tags */}
          {hasActiveFilters() && (
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
            </div>
          )}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Results Count */}
        <p className="text-gray-400 mb-4 text-sm">
          {loadingAllAds ? (
            t('searchPage.loading')
          ) : (
            <>
              {t('searchPage.results', { count: sortedAds.length })}
              {selectedCity && selectedRadius && (
                <span className="ml-2 text-pink-400">
                  {t('searchPage.withinRadius', { radius: selectedRadius, city: selectedCity.name })}
                </span>
              )}
            </>
          )}
        </p>

        {/* Results Grid */}
        {sortedAds.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{t('searchPage.noResults')}</h3>
            <p className="text-gray-400 mb-6">{t('searchPage.noResultsDesc')}</p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              {t('searchPage.resetSearch')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedAds.map((ad, index) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                className="group cursor-pointer"
                onClick={() => handleViewAd(ad.id)}
              >
                <div className="relative aspect-[3/4] bg-gray-800 rounded-2xl overflow-hidden">
                  {/* Carousel avec effet de slide horizontal */}
                  <motion.div className="absolute inset-0">
                    <motion.div
                      className="flex h-full"
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
                        <div key={index} className="min-w-full h-full">
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

                  {/* Photo navigation arrows */}
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

                  <RankBadge />

                  {/* Badge NEW/Nouveau */}
                  <NewBadge createdAt={ad.createdAt} />

                  {/* Online indicator */}
                  {ad.online && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-xs text-white font-medium">{t('searchPage.online')}</span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-base">
                        {ad.username}, {ad.age}
                      </h3>
                      {/* Verified badge */}
                      {ad.verified && (
                        <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 p-0.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                          <svg className="w-3 h-3 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-300 text-xs mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {ad.location}
                        {ad.arrondissement && ` - ${ad.arrondissement}`}
                      </span>
                      {ad.distance_km !== undefined && (
                        <span className="ml-1 text-pink-400 font-medium">
                          • {t('searchPage.at', { distance: Math.round(ad.distance_km) })}
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <ScrollToTop />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center z-50 px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`px-4 py-2 rounded-lg shadow-lg ${
              toast.type === 'error'
                ? 'bg-red-500'
                : toast.type === 'success'
                ? 'bg-green-500'
                : 'bg-blue-500'
            } text-white text-sm font-medium`}
          >
            {toast.message}
          </motion.div>
        </div>
      )}
    </div>
  )
}
