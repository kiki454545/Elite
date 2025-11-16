'use client'

import { motion } from 'framer-motion'
import { Heart, MapPin, Eye, Trash2, Loader2 } from 'lucide-react'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useRouter } from 'next/navigation'
import { Watermark } from '@/components/Watermark'
import { RANK_CONFIG, RankType } from '@/types/profile'
import { Header } from '@/components/Header'
import { ScrollToTop } from '@/components/ScrollToTop'
import { useAuth } from '@/contexts/AuthContext'
import { useFavoriteAds } from '@/hooks/useFavorites'
import { useEffect } from 'react'

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

export default function FavoritesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { removeFromFavorites } = useFavorites()
  const { favoriteAds, loading, error, refetch } = useFavoriteAds()

  // Rediriger si non authentifié (dans un useEffect pour éviter l'erreur côté serveur)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  // Afficher un écran de chargement pendant la vérification de session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  // Ne rien afficher si pas authentifié (la redirection est en cours)
  if (!user) {
    return null
  }

  const handleViewAd = (adId: string) => {
    router.push(`/ads/${adId}`)
  }

  const handleRemoveFavorite = async (e: React.MouseEvent, adId: string) => {
    e.stopPropagation()
    const success = await removeFromFavorites(adId)
    if (success) {
      // Recharger la liste des favoris après suppression
      refetch()
    }
  }

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pb-20">
        <Header title="Mes Favoris" />
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            <p className="text-gray-400">Chargement de vos favoris...</p>
          </div>
        </div>
      </div>
    )
  }

  // Gestion des erreurs
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 pb-20">
        <Header title="Mes Favoris" />
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title="Mes Favoris" />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {favoriteAds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center"
          >
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Aucun favori
            </h3>
            <p className="text-gray-400 mb-6">
              Ajoutez des annonces à vos favoris pour les retrouver facilement
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Découvrir les annonces
            </button>
          </motion.div>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              {favoriteAds.length} annonce{favoriteAds.length > 1 ? 's' : ''} en favoris
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favoriteAds.map((ad, index) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer relative"
                >
                  <div className="relative aspect-[3/4] bg-gray-800 rounded-2xl overflow-hidden">
                    <img
                      src={ad.photos && ad.photos.length > 0 ? ad.photos[0] : `https://picsum.photos/seed/${ad.id}/400/600`}
                      alt={ad.username}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10" />

                    <Watermark size="small" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-100 transition-opacity" />

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

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-lg mb-2">
                        {ad.username}, {ad.age}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-300 text-sm mb-3">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {ad.location}
                          {ad.arrondissement && ` - ${ad.arrondissement}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
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
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewAd(ad.id)}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-full text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
                        >
                          Voir l'annonce
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleRemoveFavorite(e, ad.id)}
                          className="bg-red-500/80 backdrop-blur-sm p-2 rounded-full text-white hover:bg-red-600/80 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
      <ScrollToTop />
    </div>
  )
}
