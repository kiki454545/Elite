'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, MapPin, ChevronLeft, ChevronRight, Loader2, Trophy } from 'lucide-react'
import { RankType, RANK_CONFIG } from '@/types/profile'
import { Watermark } from '@/components/Watermark'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BottomNavigation } from '@/components/BottomNavigation'
import { Header } from '@/components/Header'
import { ScrollToTop } from '@/components/ScrollToTop'
import { getCurrentBadge } from '@/types/badges'

interface TopProfile {
  id: string
  adId: string
  username: string
  age: number
  location: string
  photos: string[]
  verified: boolean
  online: boolean
  rank: RankType
  video: string | null
  top1_votes: number
  top5_votes: number
  top10_votes: number
  top50_votes: number
  total_score: number
  arrondissement?: string
  createdAt: Date
}

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

// Badges de votes (toujours affichés, taille plus grande)
// top1 = Top 1, top5 = Top 2, top10 = Top 3, top50 = Top 50
function VoteBadgesCompact({ top1, top2, top3, top50 }: { top1: number; top2: number; top3: number; top50: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-xs font-bold ${top1 > 0 ? 'bg-yellow-500/90 text-white' : 'bg-gray-700/60 text-gray-400'}`}>
        🥇{top1}
      </div>
      <div className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-xs font-bold ${top2 > 0 ? 'bg-gray-400/90 text-white' : 'bg-gray-700/60 text-gray-400'}`}>
        🥈{top2}
      </div>
      <div className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-xs font-bold ${top3 > 0 ? 'bg-amber-600/90 text-white' : 'bg-gray-700/60 text-gray-400'}`}>
        🥉{top3}
      </div>
      <div className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-xs font-bold ${top50 > 0 ? 'bg-green-500/90 text-white' : 'bg-gray-700/60 text-gray-400'}`}>
        ⭐{top50}
      </div>
    </div>
  )
}

function XPBadgeDisplay({ score }: { score: number }) {
  const badge = getCurrentBadge(score)
  if (!badge) return null

  return (
    <img
      src={badge.image}
      alt={badge.name}
      className="w-7 h-7 object-contain"
    />
  )
}

export default function Top50Page() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { t, language } = useLanguage()
  const [currentPhotoIndices, setCurrentPhotoIndices] = useState<Record<string, number>>({})
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null)
  const [profiles, setProfiles] = useState<TopProfile[]>([])
  const [loading, setLoading] = useState(true)

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    async function fetchTop50() {
      try {
        setLoading(true)

        // Récupérer tous les votes
        const { data: votesData, error: votesError } = await supabase
          .from('profile_votes')
          .select('profile_id, vote_type')


        if (votesError) {
          console.error('Erreur votes:', votesError)
          return
        }

        // Calculer les scores pour chaque profil
        const profileScores = new Map<string, {
          score: number
          top1: number
          top5: number
          top10: number
          top50: number
        }>()

        votesData?.forEach((vote) => {
          const current = profileScores.get(vote.profile_id) || { score: 0, top1: 0, top5: 0, top10: 0, top50: 0 }

          switch (vote.vote_type) {
            case 'top1':
              current.score += 50
              current.top1++
              break
            case 'top5':
              current.score += 20
              current.top5++
              break
            case 'top10':
              current.score += 10
              current.top10++
              break
            case 'top50':
              current.score += 5
              current.top50++
              break
          }

          profileScores.set(vote.profile_id, current)
        })


        // Si aucun vote, afficher message vide
        if (profileScores.size === 0) {
          setProfiles([])
          return
        }

        // Trier par score et prendre les 50 premiers
        const topProfileIds = Array.from(profileScores.entries())
          .sort((a, b) => b[1].score - a[1].score)
          .slice(0, 50)
          .map(([id]) => id)


        // Récupérer les profils (avec l'age)
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, verified, rank, age')
          .in('id', topProfileIds)


        if (profilesError) {
          console.error('Erreur profils:', profilesError)
          return
        }

        // Récupérer les annonces de ces profils
        const { data: adsData, error: adsError } = await supabase
          .from('ads')
          .select('id, user_id, photos, location, country, video_url, arrondissement, created_at, status')
          .in('user_id', topProfileIds)


        if (adsError) {
          console.error('Erreur annonces:', adsError)
        }

        // Construire les données finales
        const rankedProfiles: TopProfile[] = topProfileIds
          .map((profileId) => {
            const profile = profilesData?.find((p) => p.id === profileId)
            if (!profile) {
              return null
            }

            // Trouver une annonce pour ce profil (préférer approved)
            const profileAds = adsData?.filter((a) => a.user_id === profileId) || []
            let ad = profileAds.find((a) => a.status === 'approved')
            if (!ad && profileAds.length > 0) {
              ad = profileAds[0] // Prendre la première annonce si aucune n'est approved
            }

            if (!ad) {
              return null
            }

            const scores = profileScores.get(profileId)!

            return {
              id: profile.id,
              adId: ad.id,
              username: profile.username,
              age: profile.age || 25,
              location: ad.location,
              photos: ad.photos || [],
              verified: profile.verified,
              online: false,
              rank: profile.rank as RankType,
              video: ad.video_url,
              top1_votes: scores.top1,
              top5_votes: scores.top5,
              top10_votes: scores.top10,
              top50_votes: scores.top50,
              total_score: scores.score,
              arrondissement: ad.arrondissement || undefined,
              createdAt: new Date(ad.created_at),
            } as TopProfile
          })
          .filter((p): p is TopProfile => p !== null)

        setProfiles(rankedProfiles)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTop50()
  }, [])

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

  const getCurrentPhotoIndex = (adId: string) => currentPhotoIndices[adId] || 0

  const getPhotoUrl = (profile: TopProfile, index: number) => {
    if (profile.photos && profile.photos.length > 0) {
      return profile.photos[index] || profile.photos[0]
    }
    return `https://picsum.photos/seed/${profile.id}-${index}/400/600`
  }

  const getPhotoCount = (profile: TopProfile) => {
    return profile.photos.length > 0 ? profile.photos.length : 3
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 pb-20 md:pb-0">
        <Header />
        <BottomNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            <p className="text-gray-400">{language === 'fr' ? 'Chargement du Top 50...' : 'Loading Top 50...'}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 pb-20 md:pb-0">
      <Header />
      <BottomNavigation />

      {/* Hero Section */}
      <div className="max-w-screen-xl mx-auto px-4 pt-24 pb-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <Trophy className="inline-block w-10 h-10 text-amber-400 mr-2" />
            {language === 'fr' ? 'Top 50 des Votes' : 'Top 50 Votes'}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {language === 'fr'
              ? 'Les profils les plus populaires selon les votes de la communauté'
              : 'The most popular profiles according to community votes'}
          </p>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="max-w-screen-xl mx-auto px-4 py-20">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              {language === 'fr' ? 'Aucun vote pour le moment' : 'No votes yet'}
            </h2>
            <p className="text-gray-400">
              {language === 'fr'
                ? 'Soyez le premier à voter pour vos profils préférés !'
                : 'Be the first to vote for your favorite profiles!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group cursor-pointer"
                onClick={() => handleViewAd(profile.adId)}
              >
                <div className="relative aspect-[3/4] bg-gray-800 rounded-2xl overflow-hidden">
                  {/* Carousel */}
                  <motion.div className="absolute inset-0">
                    <motion.div
                      className="flex h-full"
                      animate={{
                        x: `-${getCurrentPhotoIndex(profile.adId) * 100}%`
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                    >
                      {[...Array(getPhotoCount(profile))].map((_, photoIndex) => (
                        <div key={photoIndex} className="min-w-full h-full">
                          <img
                            src={getPhotoUrl(profile, photoIndex)}
                            alt={`${profile.username} - Photo ${photoIndex + 1}`}
                            className="w-full h-full object-cover pointer-events-none select-none"
                            draggable={false}
                          />
                        </div>
                      ))}
                    </motion.div>
                  </motion.div>

                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 pointer-events-none" />
                  <Watermark size="small" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-100 pointer-events-none" />

                  {/* Navigation arrows */}
                  <div className="hidden md:flex absolute inset-0 items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handlePrevPhoto(e, profile.adId, getPhotoCount(profile))}
                      className="pointer-events-auto bg-black/60 backdrop-blur-sm p-2.5 rounded-full hover:bg-black/80 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleNextPhoto(e, profile.adId, getPhotoCount(profile))}
                      className="pointer-events-auto bg-black/60 backdrop-blur-sm p-2.5 rounded-full hover:bg-black/80 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>

                  {/* Photo indicators */}
                  <div className="absolute top-1/2 left-0 right-0 flex justify-center gap-1.5 md:gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-none">
                    {[...Array(getPhotoCount(profile))].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          i === getCurrentPhotoIndex(profile.adId) ? 'bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Online indicator */}
                  {profile.online && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-xs text-white font-medium">En ligne</span>
                    </div>
                  )}

                  <RankBadge rank={profile.rank} />
                  <NewBadge createdAt={profile.createdAt} />

                  {/* Profile info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-base">
                        {profile.username}, {profile.age}
                      </h3>
                      {profile.verified && (
                        <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 p-0.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                          <svg className="w-3 h-3 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <XPBadgeDisplay score={profile.total_score} />
                    </div>
                    <div className="flex items-center gap-1 text-gray-300 text-xs mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {profile.location}
                        {profile.arrondissement && ` - ${profile.arrondissement}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Vote badges compacts à gauche */}
                      <div className="flex items-center gap-1">
                        <VoteBadgesCompact
                          top1={profile.top1_votes}
                          top2={profile.top5_votes}
                          top3={profile.top10_votes}
                          top50={profile.top50_votes}
                        />
                      </div>

                      {/* Video + Favoris à droite */}
                      <div className="flex items-center gap-2">
                        {profile.video && (
                          <div className="bg-black/70 backdrop-blur-sm p-1.5 rounded-full">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleToggleFavorite(e, profile.adId, profile.id)}
                          className={`backdrop-blur-sm p-1.5 rounded-full transition-colors ${
                            isFavorite(profile.adId)
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-800/80 text-pink-500 hover:bg-gray-700/80'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFavorite(profile.adId) ? 'fill-current' : ''}`} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

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
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
}
