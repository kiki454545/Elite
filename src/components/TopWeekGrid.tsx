'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, MapPin, Eye, ChevronLeft, ChevronRight, Loader2, X, Check, MessageCircle } from 'lucide-react'
import { RankType, RANK_CONFIG } from '@/types/profile'
import { Watermark } from './Watermark'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Ad } from '@/types/ad'
import { VoteBadgeCompact } from './VoteStats'

function RankBadge({ rank }: { rank: RankType }) {
  if (!rank || rank === 'standard') return null
  const config = RANK_CONFIG[rank]
  if (!config) return null

  return (
    <div className="absolute top-0 left-0 overflow-hidden w-32 h-32 pointer-events-none">
      <div className={`absolute top-4 left-[-38px] ${config.bgColor} text-white text-center py-1.5 px-10 -rotate-45 shadow-lg ${config.glowColor}`}>
        <span className="text-[13px] font-bold tracking-wider uppercase flex items-center gap-1.5">
          <span className="text-base">{config.icon}</span>
          <span className={config.textColor}>{config.label}</span>
        </span>
      </div>
    </div>
  )
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

export function TopWeekGrid() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { t } = useLanguage()
  const [currentPhotoIndices, setCurrentPhotoIndices] = useState<Record<string, number>>({})
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null)

  // États pour les top 20 de la semaine
  const [topWeeklyAds, setTopWeeklyAds] = useState<Ad[]>([])
  const [loadingWeekly, setLoadingWeekly] = useState(true)
  const [errorWeekly, setErrorWeekly] = useState<string | null>(null)

  // Helper pour afficher un toast
  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Charger les 20 escortes avec le plus de vues cette semaine (tous pays confondus)
  useEffect(() => {
    async function loadTopWeeklyAds() {
      try {
        setLoadingWeekly(true)

        // Charger TOUTES les annonces approuvées (tous pays)
        // Triées par weekly_views pour le classement hebdomadaire
        const { data: ads, error: adsError } = await supabase
          .from('ads')
          .select('*')
          .eq('status', 'approved')
          .order('weekly_views', { ascending: false })
          .limit(20)

        if (adsError) {
          console.error('Erreur lors du chargement des top annonces:', adsError)
          setErrorWeekly(adsError.message)
          return
        }

        if (!ads || ads.length === 0) {
          setTopWeeklyAds([])
          return
        }

        // Récupérer les profils des utilisateurs
        const userIds = ads.map((item: any) => item.user_id)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, rank')
          .in('id', userIds)

        if (profilesError) {
          console.error('Erreur lors du chargement des profils:', profilesError)
        }

        // Créer un index des profils
        const profilesMap = new Map()
        profiles?.forEach(profile => {
          profilesMap.set(profile.id, profile)
        })

        // Convertir en format Ad
        const formattedAds: Ad[] = ads.map((item: any) => {
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
            views: item.views || 0, // Afficher les vues totales (les weekly_views sont uniquement pour le classement)
            favorites: item.favorites_count || 0,
            rank: (profile?.rank || 'standard') as RankType,
            video: item.video_url,
            country: item.country,
            availability: '',
            arrondissement: item.arrondissement,
            createdAt: new Date(item.created_at),
            updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(item.created_at),
          }
        })

        // Le tri est déjà fait par la requête SQL (order by weekly_views)
        // Pas besoin de trier à nouveau par rang ici
        setTopWeeklyAds(formattedAds)
      } catch (error) {
        console.error('Erreur:', error)
        setErrorWeekly('Erreur lors du chargement')
      } finally {
        setLoadingWeekly(false)
      }
    }

    loadTopWeeklyAds()
  }, []) // Charger une seule fois au montage du composant

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
      showToast(t('home.cannotAddOwnAdToFavorites'), 'error')
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

  const getPhotoUrl = (ad: Ad, index: number) => {
    // Utiliser les vraies photos si disponibles, sinon photos de placeholder
    if (ad.photos && ad.photos.length > 0) {
      return ad.photos[index] || ad.photos[0]
    }
    return `https://picsum.photos/seed/${ad.id}-${index}/400/600`
  }

  const getPhotoCount = (ad: Ad) => {
    return ad.photos.length > 0 ? ad.photos.length : 3 // Default à 3 photos si pas de photos définies
  }

  // Afficher un loader pendant le chargement
  if (loadingWeekly) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            <p className="text-gray-400">Chargement du top de la semaine...</p>
          </div>
        </div>
      </div>
    )
  }

  // Afficher un message d'erreur si nécessaire
  if (errorWeekly) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-2">Erreur lors du chargement</p>
            <p className="text-gray-400 text-sm">{errorWeekly}</p>
          </div>
        </div>
      </div>
    )
  }

  // Afficher un message si aucune annonce
  if (topWeeklyAds.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">Aucune annonce disponible</p>
            <p className="text-gray-500 text-sm">Le classement sera bientôt disponible</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {topWeeklyAds.map((ad, index) => (
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
                  {[...Array(getPhotoCount(ad))].map((_, photoIndex) => (
                    <div
                      key={photoIndex}
                      className="min-w-full h-full"
                    >
                      <img
                        src={getPhotoUrl(ad, photoIndex)}
                        alt={`${ad.title} - Photo ${photoIndex + 1}`}
                        className="w-full h-full object-cover pointer-events-none select-none"
                        draggable={false}
                      />
                    </div>
                  ))}
                </motion.div>
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 pointer-events-none" />

              {/* Filigrane de protection */}
              <Watermark size="small" />

              {/* Overlay au hover */}
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

              {/* Online indicator */}
              {ad.online && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-xs text-white font-medium">En ligne</span>
                </div>
              )}

              {/* Rank Badge - Ruban diagonal en haut à gauche */}
              <RankBadge rank={ad.rank} />

              {/* New Badge - Ruban diagonal en haut à droite */}
              <NewBadge createdAt={ad.createdAt} />

              {/* Ad info */}
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
                  {/* XP Badge */}
                  <VoteBadgeCompact profileId={ad.userId} />
                </div>
                <div className="flex items-center gap-1 text-gray-300 text-xs mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {ad.location}
                    {ad.arrondissement && ` - ${ad.arrondissement}`}
                  </span>
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
