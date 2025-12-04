'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Search, MapPin, X, ChevronLeft, ChevronRight, Eye, Heart } from 'lucide-react'
import { Ad } from '@/types/ad'
import { RANK_CONFIG, RankType } from '@/types/profile'
import { Watermark } from '@/components/Watermark'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { useLanguage } from '@/contexts/LanguageContext'
import { ScrollToTop } from '@/components/ScrollToTop'
import { supabase } from '@/lib/supabase'
import { CITY_SEO_DATA, getCityFromSlug } from '@/lib/citySeoData'

interface AdWithDistance extends Ad {
  distance_km?: number
}

function NewBadge({ createdAt }: { createdAt: Date }) {
  const { language } = useLanguage()

  const isNew = () => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
    return diffInHours <= 168
  }

  if (!isNew()) return null

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

export default function CityPage() {
  const router = useRouter()
  const params = useParams()
  const citySlug = params.city as string
  const cityData = getCityFromSlug(citySlug)

  const { isAuthenticated, user } = useAuth()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { t, language } = useLanguage()
  const [currentPhotoIndices, setCurrentPhotoIndices] = useState<Record<string, number>>({})
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null)

  const [allAds, setAllAds] = useState<AdWithDistance[]>([])
  const [loading, setLoading] = useState(true)

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Charger les annonces de cette ville
  useEffect(() => {
    if (!cityData) return

    const load = async () => {
      try {
        setLoading(true)

        // Recherche par location (nom de ville)
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('status', 'approved')
          .eq('country', cityData.country)
          .ilike('location', `%${cityData.name}%`)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) {
          console.error('Erreur:', error)
          return
        }

        if (!data || data.length === 0) {
          setAllAds([])
          return
        }

        const userIds = data.map((item: any) => item.user_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, rank, age')
          .in('id', userIds)

        const profilesMap = new Map()
        profiles?.forEach(profile => {
          profilesMap.set(profile.id, profile)
        })

        const ads: AdWithDistance[] = data.map((item: any) => {
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
            country: item.country,
            availability: '',
            createdAt: new Date(item.created_at),
            updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(item.created_at),
          }
        })

        setAllAds(ads)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [cityData])

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

  const sortedAds = useMemo(() => [...allAds].sort((a, b) => {
    return RANK_CONFIG[b.rank].priority - RANK_CONFIG[a.rank].priority
  }), [allAds])

  // Si la ville n'existe pas, rediriger
  if (!cityData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Ville non trouvée</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  const pageTitle = language === 'en'
    ? `Escorts ${cityData.name} - Escort girls and companions`
    : `Escorts ${cityData.name} - Escort girls et accompagnatrices`

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title={`Escorts ${cityData.name}`} showBackButton={true} />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* SEO Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {language === 'en'
              ? `Escorts in ${cityData.name} - Escort girls ${cityData.name}`
              : `Escorts à ${cityData.name} - Escort girls ${cityData.name}`}
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            {language === 'en'
              ? `Find the best escorts and companions in ${cityData.name}. Verified profiles, luxury escorts, and independent escort girls available in ${cityData.name} and surroundings.`
              : `Trouvez les meilleures escorts et accompagnatrices à ${cityData.name}. Profils vérifiés, escorts de luxe et escort girls indépendantes disponibles à ${cityData.name} et ses environs.`}
          </p>
        </div>

        {/* Results Count */}
        <p className="text-gray-400 mb-4 text-sm">
          {loading ? (
            t('searchPage.loading')
          ) : (
            t('searchPage.results', { count: sortedAds.length })
          )}
        </p>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sortedAds.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? 'No escorts found' : 'Aucune escort trouvée'}
            </h3>
            <p className="text-gray-400 mb-6">
              {language === 'en'
                ? `No escorts are currently available in ${cityData.name}. Check back later or explore other cities.`
                : `Aucune escort n'est actuellement disponible à ${cityData.name}. Revenez plus tard ou explorez d'autres villes.`}
            </p>
            <button
              onClick={() => router.push('/search')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              {language === 'en' ? 'Search all escorts' : 'Rechercher toutes les escorts'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedAds.map((ad, index) => (
              <div
                key={ad.id}
                className="group cursor-pointer animate-fadeIn"
                style={{ animationDelay: `${Math.min(index * 20, 300)}ms` }}
                onClick={() => handleViewAd(ad.id)}
              >
                <div className="relative aspect-[3/4] bg-gray-800 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0">
                    <div
                      className="flex h-full transition-transform duration-300 ease-out"
                      style={{ transform: `translateX(-${getCurrentPhotoIndex(ad.id) * 100}%)` }}
                    >
                      {[...Array(getPhotoCount(ad))].map((_, index) => (
                        <div key={index} className="min-w-full h-full">
                          <img
                            src={getPhotoUrl(ad, index)}
                            alt={`${ad.username} - Escort ${cityData.name}`}
                            className="w-full h-full object-cover pointer-events-none select-none"
                            draggable={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 pointer-events-none" />

                  <Watermark size="small" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-100 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Photo navigation */}
                  <div className="hidden md:flex absolute inset-0 items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <button
                      onClick={(e) => handlePrevPhoto(e, ad.id, getPhotoCount(ad))}
                      className="pointer-events-auto bg-black/60 backdrop-blur-sm p-2.5 rounded-full hover:bg-black/80 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={(e) => handleNextPhoto(e, ad.id, getPhotoCount(ad))}
                      className="pointer-events-auto bg-black/60 backdrop-blur-sm p-2.5 rounded-full hover:bg-black/80 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Photo dots */}
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

                  <NewBadge createdAt={ad.createdAt} />

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
                      <span>{ad.location}</span>
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
                      <button
                        onClick={(e) => handleToggleFavorite(e, ad.id, ad.userId)}
                        className={`backdrop-blur-sm p-1.5 rounded-full transition-colors ${
                          isFavorite(ad.id)
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-800/80 text-pink-500 hover:bg-gray-700/80'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorite(ad.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SEO Content */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <h2 className="text-xl font-bold text-white mb-4">
            {language === 'en'
              ? `Escort girls and companions in ${cityData.name}`
              : `Escort girls et accompagnatrices à ${cityData.name}`}
          </h2>
          <div className="text-gray-400 text-sm space-y-4">
            <p>
              {language === 'en'
                ? `SexElite is the #1 platform for finding quality escorts in ${cityData.name}. Our directory features verified profiles of escort girls, luxury companions, and independent escorts operating in ${cityData.name} and the surrounding area.`
                : `SexElite est la plateforme N°1 pour trouver des escorts de qualité à ${cityData.name}. Notre annuaire présente des profils vérifiés d'escort girls, d'accompagnatrices de luxe et d'escorts indépendantes exerçant à ${cityData.name} et dans les environs.`}
            </p>
            <p>
              {language === 'en'
                ? `Looking for a premium escort in ${cityData.name}? Browse our selection of VIP escorts, high-end companions, and verified profiles. Each escort profile includes photos, services offered, and contact information.`
                : `Vous cherchez une escort premium à ${cityData.name} ? Parcourez notre sélection d'escorts VIP, d'accompagnatrices haut de gamme et de profils vérifiés. Chaque profil d'escort comprend des photos, les services proposés et les informations de contact.`}
            </p>
          </div>
        </div>
      </div>
      <ScrollToTop />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center z-50 px-4 pointer-events-none">
          <div
            className={`px-4 py-2 rounded-lg shadow-lg animate-fadeIn ${
              toast.type === 'error'
                ? 'bg-red-500'
                : toast.type === 'success'
                ? 'bg-green-500'
                : 'bg-blue-500'
            } text-white text-sm font-medium`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}
