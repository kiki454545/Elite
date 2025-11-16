'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Settings, LogOut, Crown, Eye, Heart, Loader2, Trash2, Edit, Pause, Play, Shield, MessageCircle, AlertTriangle, ShoppingBag, Star, Sparkles, Zap } from 'lucide-react'
import { RANK_CONFIG } from '@/types/profile'
import { Header } from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { Ad } from '@/types/ad'

export default function MyAdsPage() {
  const router = useRouter()
  const { user, profile, logout, loading } = useAuth()
  const [myAds, setMyAds] = useState<Ad[]>([])
  const [adsLoading, setAdsLoading] = useState(true)
  const [totalViews, setTotalViews] = useState(0)
  const [totalFavorites, setTotalFavorites] = useState(0)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [adToDelete, setAdToDelete] = useState<string | null>(null)
  const [pauseModalOpen, setPauseModalOpen] = useState(false)
  const [adToPause, setAdToPause] = useState<{ id: string; status: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Rediriger si non authentifié (dans un useEffect pour éviter l'erreur côté serveur)
  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.push('/auth')
    }
  }, [user, profile, loading, router])

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    async function checkAdmin() {
      if (user?.id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (profileData?.is_admin) {
          setIsAdmin(true)
        }
      }
    }
    checkAdmin()
  }, [user])

  // Charger les annonces de l'utilisateur
  useEffect(() => {
    if (user) {
      fetchMyAds()
    }
  }, [user])

  async function fetchMyAds() {
    try {
      setAdsLoading(true)

      const { data: adsData, error } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (adsData) {
        const transformedAds: Ad[] = adsData.map((ad: any) => ({
          id: ad.id,
          userId: ad.user_id,
          username: profile?.username || 'Anonyme',
          title: ad.title,
          description: ad.description || '',
          age: profile?.age || 0,
          location: ad.location,
          country: ad.country,
          category: ad.categories?.[0] || 'escort',
          photos: ad.photos || [],
          video: false,
          price: ad.price,
          services: ad.meeting_places || [],
          availability: '',
          verified: false,
          rank: profile?.rank || 'standard',
          online: false,
          views: ad.views || 0,
          favorites: ad.favorites_count || 0,
          createdAt: new Date(ad.created_at),
          updatedAt: ad.updated_at ? new Date(ad.updated_at) : new Date(ad.created_at),
          status: ad.status || 'approved'
        }))

        setMyAds(transformedAds)

        // Calculer les stats
        const views = transformedAds.reduce((sum, ad) => sum + ad.views, 0)
        const favorites = transformedAds.reduce((sum, ad) => sum + ad.favorites, 0)
        setTotalViews(views)
        setTotalFavorites(favorites)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error)
    } finally {
      setAdsLoading(false)
    }
  }

  function confirmDeleteAd(adId: string) {
    setAdToDelete(adId)
    setDeleteModalOpen(true)
  }

  async function handleDeleteAd() {
    if (!adToDelete) return

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adToDelete)

      if (error) throw error

      // Recharger les annonces
      setDeleteModalOpen(false)
      setAdToDelete(null)
      fetchMyAds()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de l\'annonce')
    }
  }

  function confirmToggleAdStatus(adId: string, currentStatus: string) {
    setAdToPause({ id: adId, status: currentStatus })
    setPauseModalOpen(true)
  }

  async function handleToggleAdStatus() {
    if (!adToPause) return

    try {
      const newStatus = adToPause.status === 'approved' ? 'paused' : 'approved'

      const { error } = await supabase
        .from('ads')
        .update({ status: newStatus })
        .eq('id', adToPause.id)

      if (error) throw error

      // Recharger les annonces
      setPauseModalOpen(false)
      setAdToPause(null)
      fetchMyAds()
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      alert('Erreur lors du changement de statut de l\'annonce')
    }
  }

  function handleEditAd(adId: string) {
    router.push(`/ads/${adId}/edit`)
  }

  // Afficher un écran de chargement pendant la vérification de session
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  // Protection pendant le chargement côté serveur
  if (!user || !profile) {
    return null
  }

  const rankConfig = profile.rank ? RANK_CONFIG[profile.rank] : RANK_CONFIG['standard']

  const handleLogout = () => {
    logout()
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title={profile.username} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="text-2xl font-bold text-white">
                  {profile.username}
                </h2>
                {profile.verified && (
                  <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 p-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-transform hover:scale-110">
                    <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-gray-400">{profile.age} ans</p>
            </div>

            {/* Rank Badge */}
            {profile.rank !== 'standard' && (
              <div className={`flex items-center gap-1.5 ${rankConfig.bgColor} px-3 py-1.5 rounded-full border ${rankConfig.borderColor} ${rankConfig.glowColor} transition-all hover:scale-105 cursor-pointer`}>
                <span className="text-sm">{rankConfig.icon}</span>
                <span className={`text-xs font-bold tracking-wide ${rankConfig.textColor} uppercase`}>
                  {rankConfig.label}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{myAds.length}</div>
              <div className="text-xs text-gray-400">Annonces</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{totalViews}</div>
              <div className="text-xs text-gray-400">Vues totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{totalFavorites}</div>
              <div className="text-xs text-gray-400">Favoris</div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        {myAds.length === 0 ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => router.push('/profile/edit')}
              className="bg-gray-800 text-white py-4 rounded-2xl font-medium hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
            >
              <Settings className="w-5 h-5" />
              Éditer le profil
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => router.push('/ads/create')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-2xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Créer une annonce
            </motion.button>
          </div>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => router.push('/profile/edit')}
            className="w-full bg-gray-800 text-white py-4 rounded-2xl font-medium hover:bg-gray-700 transition-all flex items-center justify-center gap-2 mb-6"
            whileTap={{ scale: 0.98 }}
          >
            <Settings className="w-5 h-5" />
            Éditer le profil
          </motion.button>
        )}

        {/* My Ads Grid */}
        {adsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </div>
        ) : myAds.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Aucune annonce */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center"
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Aucune annonce pour le moment
              </h3>
              <p className="text-gray-400">
                Créez votre première annonce pour commencer à recevoir des contacts
              </p>
            </motion.div>

            {/* Boutique */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-pink-500/20 via-purple-600/20 to-blue-500/20 rounded-2xl border border-pink-500/30 overflow-hidden cursor-pointer group"
              onClick={() => router.push('/shop')}
            >
              <div className="relative h-48 bg-gradient-to-br from-pink-600 via-purple-700 to-blue-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <Sparkles className="w-5 h-5 text-pink-400" />
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full">
                    <span className="text-xs text-white font-bold">PREMIUM</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-b from-gray-900/80 to-gray-900">
                <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Boutique Premium
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Boostez votre visibilité avec nos offres exclusives
                </p>
                <div className="flex items-center gap-2 text-pink-400 text-sm font-medium">
                  <span>Voir les offres</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {myAds.map((ad, index) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden relative group cursor-pointer"
                onClick={() => router.push(`/ads/${ad.id}`)}
              >
                {/* Badge de statut */}
                {ad.status === 'paused' && (
                  <div className="absolute top-3 left-3 bg-orange-500/90 backdrop-blur-sm px-3 py-1 rounded-full z-10">
                    <span className="text-xs text-white font-medium">En pause</span>
                  </div>
                )}

                <div className="relative aspect-[16/9]">
                  <img
                    src={ad.photos[0] || `https://picsum.photos/seed/${ad.id}/800/450`}
                    alt={ad.title}
                    className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${ad.status === 'paused' ? 'opacity-50' : ''}`}
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmToggleAdStatus(ad.id, ad.status || 'approved')
                      }}
                      className={`${
                        ad.status === 'paused'
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-orange-500 hover:bg-orange-600'
                      } text-white p-2 rounded-full transition-colors shadow-lg`}
                      title={ad.status === 'paused' ? 'Réactiver' : 'Mettre en pause'}
                    >
                      {ad.status === 'paused' ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditAd(ad.id)
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors shadow-lg"
                      title="Éditer"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmDeleteAd(ad.id)
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2">{ad.title}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{ad.description}</p>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{ad.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{ad.favorites}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upgrade Card */}
        {user.rank === 'standard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/30 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">
                Passez à l'élite
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              Apparaissez en tête des résultats et débloquez des fonctionnalités premium
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                <span>Priorité dans les résultats de recherche</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                <span>Badge distinctif sur vos annonces</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                <span>Statistiques détaillées</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                <span>Messages illimités</span>
              </li>
            </ul>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Voir les offres
            </motion.button>
          </motion.div>
        )}

        {/* Settings Links */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 divide-y divide-gray-800 mb-6">
          {isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className="w-full px-6 py-4 text-left text-white hover:bg-gray-800/50 transition-colors flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Panel Admin</span>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            </button>
          )}
          <button
            onClick={() => router.push('/profile/settings')}
            className="w-full px-6 py-4 text-left text-white hover:bg-gray-800/50 transition-colors flex items-center justify-between"
          >
            <span>Paramètres du compte</span>
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => router.push('/profile/privacy')}
            className="w-full px-6 py-4 text-left text-white hover:bg-gray-800/50 transition-colors flex items-center justify-between"
          >
            <span>Préférences de confidentialité</span>
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => router.push('/profile/warnings')}
            className="w-full px-6 py-4 text-left text-white hover:bg-gray-800/50 transition-colors flex items-center justify-between"
          >
            <span>Mes avertissements</span>
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </button>
          <button
            onClick={() => router.push('/profile/support')}
            className="w-full px-6 py-4 text-left text-white hover:bg-gray-800/50 transition-colors flex items-center justify-between"
          >
            <span>Support</span>
            <MessageCircle className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-6 py-4 text-left text-red-500 hover:bg-gray-800/50 transition-colors flex items-center justify-between"
          >
            <span>Déconnexion</span>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <AnimatePresence>
        {deleteModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md w-full shadow-2xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Supprimer l'annonce ?
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Cette action est irréversible. Votre annonce sera définitivement supprimée.
                  </p>

                  <div className="flex gap-3 w-full">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDeleteModalOpen(false)}
                      className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteAd}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-red-600 hover:to-pink-700 transition-all"
                    >
                      Supprimer
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de confirmation de pause/réactivation */}
      <AnimatePresence>
        {pauseModalOpen && adToPause && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPauseModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md w-full shadow-2xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${
                    adToPause.status === 'paused' ? 'bg-green-500/20' : 'bg-orange-500/20'
                  } rounded-full flex items-center justify-center mb-4`}>
                    {adToPause.status === 'paused' ? (
                      <Play className="w-8 h-8 text-green-500" />
                    ) : (
                      <Pause className="w-8 h-8 text-orange-500" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {adToPause.status === 'paused' ? 'Réactiver l\'annonce ?' : 'Mettre en pause l\'annonce ?'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {adToPause.status === 'paused'
                      ? 'Votre annonce sera de nouveau visible par tous les utilisateurs.'
                      : 'Votre annonce ne sera plus visible publiquement. Vous pourrez la réactiver à tout moment.'}
                  </p>

                  <div className="flex gap-3 w-full">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPauseModalOpen(false)}
                      className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleToggleAdStatus}
                      className={`flex-1 ${
                        adToPause.status === 'paused'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                          : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
                      } text-white py-3 rounded-xl font-medium transition-all`}
                    >
                      {adToPause.status === 'paused' ? 'Réactiver' : 'Mettre en pause'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
