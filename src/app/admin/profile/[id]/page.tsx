'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Mail, Calendar, MapPin, Star, Eye, Heart, AlertCircle, Ban, CheckCircle, XCircle, Edit, Trash2, ArrowLeft, AlertTriangle, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { RANK_CONFIG } from '@/types/profile'
import { ConfirmModal } from '@/components/ConfirmModal'

interface ProfileDetail {
  id: string
  username: string
  email: string
  age?: number
  verified: boolean
  rank: string
  is_admin: boolean
  created_at: string
  phone?: string
  location?: string
  bio?: string
}

interface UserAd {
  id: string
  title: string
  description: string
  location: string
  country: string
  photos: string[]
  views: number
  favorites_count: number
  status: string
  created_at: string
}

interface UserStats {
  totalAds: number
  totalViews: number
  totalFavorites: number
  totalReports: number
  totalBlocked: number
}

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

export default function AdminProfileDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [profile, setProfile] = useState<ProfileDetail | null>(null)
  const [ads, setAds] = useState<UserAd[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalAds: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalReports: 0,
    totalBlocked: 0
  })
  const [loadingData, setLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState<'ads' | 'stats' | 'warnings' | 'actions'>('ads')

  // Warnings
  const [warnings, setWarnings] = useState<UserWarning[]>([])
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [warningReason, setWarningReason] = useState('')
  const [warningDetails, setWarningDetails] = useState('')
  const [submittingWarning, setSubmittingWarning] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Modals state
  const [deleteProfileModal, setDeleteProfileModal] = useState(false)
  const [deleteAdModal, setDeleteAdModal] = useState<string | null>(null)

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    async function checkAdmin() {
      if (!user?.id) {
        router.push('/auth')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profileData?.is_admin) {
        router.push('/')
        return
      }

      setIsAdmin(true)
    }

    if (!loading) {
      checkAdmin()
    }
  }, [user, loading, router])

  // Charger les données du profil
  useEffect(() => {
    if (isAdmin && params.id) {
      loadProfileData()
      loadWarnings()
    }
  }, [isAdmin, params.id])

  async function loadProfileData() {
    try {
      setLoadingData(true)

      // Charger le profil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Charger les annonces
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', params.id)
        .order('created_at', { ascending: false })

      if (adsError) throw adsError
      setAds(adsData || [])

      // Calculer les stats
      const totalViews = (adsData || []).reduce((sum, ad) => sum + (ad.views || 0), 0)
      const totalFavorites = (adsData || []).reduce((sum, ad) => sum + (ad.favorites_count || 0), 0)

      // Compter les signalements
      const { count: reportsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('reported_id', params.id)
        .eq('reported_type', 'profile')

      // Compter les blocages
      const { count: blockedCount } = await supabase
        .from('blocked_users')
        .select('*', { count: 'exact', head: true })
        .eq('blocked_user_id', params.id)

      setStats({
        totalAds: adsData?.length || 0,
        totalViews,
        totalFavorites,
        totalReports: reportsCount || 0,
        totalBlocked: blockedCount || 0
      })
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoadingData(false)
    }
  }

  async function toggleVerification() {
    if (!profile) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified: !profile.verified })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, verified: !profile.verified })
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  async function deleteProfile() {
    if (!profile) return

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id)

      if (error) throw error

      router.push('/admin')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  async function deleteAd(adId: string) {
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId)

      if (error) throw error

      await loadProfileData()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  async function loadWarnings() {
    try {
      const { data, error } = await supabase
        .from('user_warnings')
        .select(`
          *,
          admin:profiles!user_warnings_admin_id_fkey(username)
        `)
        .eq('user_id', params.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWarnings(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des avertissements:', error)
    }
  }

  async function addWarning() {
    if (!warningReason.trim() || !user?.id || !profile) return

    try {
      setSubmittingWarning(true)

      // Créer l'avertissement
      const { data: warning, error: warningError } = await supabase
        .from('user_warnings')
        .insert({
          user_id: profile.id,
          admin_id: user.id,
          reason: warningReason.trim(),
          details: warningDetails.trim() || null
        })
        .select()
        .single()

      if (warningError) throw warningError

      // Créer la notification pour l'utilisateur
      const { error: notificationError } = await supabase
        .from('warning_notifications')
        .insert({
          user_id: profile.id,
          warning_id: warning.id,
          reason: warningReason.trim(),
          details: warningDetails.trim() || null
        })

      if (notificationError) throw notificationError

      // Créer ou récupérer la conversation avec le support
      let conversationId: string

      // Vérifier si une conversation existe déjà entre l'admin et l'utilisateur
      const { data: existingConversations, error: convSearchError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${profile.id}),and(user1_id.eq.${profile.id},user2_id.eq.${user.id})`)
        .maybeSingle()

      if (existingConversations && !convSearchError) {
        conversationId = existingConversations.id
      } else {
        // Créer une nouvelle conversation
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            user1_id: user.id,
            user2_id: profile.id
          })
          .select('id')
          .single()

        if (convError) throw convError
        conversationId = newConversation!.id
      }

      // Envoyer le message d'avertissement
      const messageContent = `⚠️ **AVERTISSEMENT DU SUPPORT**

**Raison:** ${warningReason.trim()}

${warningDetails.trim() ? `**Détails:**\n${warningDetails.trim()}\n\n` : ''}Votre compte a reçu un avertissement de notre équipe de modération. Nous vous invitons à consulter nos règles d'utilisation et à adapter votre comportement en conséquence.

Trop d'avertissements peuvent entraîner des restrictions ou la suspension de votre compte.

Si vous pensez que cet avertissement a été émis par erreur, vous pouvez nous contacter via ce fil de discussion.

**Équipe de modération - ${user.user_metadata?.username || user.email || 'Support'}**`

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent,
          read: false
        })

      if (messageError) throw messageError

      // Mettre à jour le timestamp et le dernier message de la conversation
      await supabase
        .from('conversations')
        .update({
          last_message: messageContent.substring(0, 100),
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      // Réinitialiser le formulaire
      setWarningReason('')
      setWarningDetails('')
      setShowWarningModal(false)

      // Afficher le message de succès
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)

      // Recharger les avertissements
      await loadWarnings()
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avertissement:', error)
      alert('Erreur lors de l\'ajout de l\'avertissement')
    } finally {
      setSubmittingWarning(false)
    }
  }

  if (loading || loadingData || !isAdmin || !profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  const rankConfig = RANK_CONFIG[profile.rank as keyof typeof RANK_CONFIG] || RANK_CONFIG.standard

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title="Détails du profil" showBackButton={true} backUrl="/admin" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
                  {profile.verified && <CheckCircle className="w-6 h-6 text-blue-500" />}
                  {profile.is_admin && <Shield className="w-6 h-6 text-yellow-500" />}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </div>
                  {profile.age && (
                    <span>{profile.age} ans</span>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Inscrit le {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>

            {profile.rank !== 'standard' && (
              <div className={`flex items-center gap-2 ${rankConfig.bgColor} px-4 py-2 rounded-full border ${rankConfig.borderColor}`}>
                <span className="text-sm">{rankConfig.icon}</span>
                <span className={`text-sm font-bold ${rankConfig.textColor}`}>
                  {rankConfig.label}
                </span>
              </div>
            )}
          </div>

          {profile.bio && (
            <p className="text-gray-300 mb-4">{profile.bio}</p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalAds}</div>
              <div className="text-xs text-gray-400">Annonces</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalViews}</div>
              <div className="text-xs text-gray-400">Vues totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalFavorites}</div>
              <div className="text-xs text-gray-400">Favoris</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.totalReports}</div>
              <div className="text-xs text-gray-400">Signalements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.totalBlocked}</div>
              <div className="text-xs text-gray-400">Fois bloqué</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-900 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab('ads')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'ads'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Annonces ({stats.totalAds})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Statistiques
          </button>
          <button
            onClick={() => setActiveTab('warnings')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'warnings'
                ? 'bg-yellow-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Avertissements ({warnings.length})
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'actions'
                ? 'bg-red-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Actions Admin
          </button>
        </div>

        {/* Content */}
        {activeTab === 'ads' ? (
          <div className="space-y-4">
            {ads.length === 0 ? (
              <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
                <p className="text-gray-400">Aucune annonce</p>
              </div>
            ) : (
              ads.map((ad, index) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
                >
                  <div className="flex gap-4 p-4">
                    {ad.photos[0] && (
                      <img
                        src={ad.photos[0]}
                        alt={ad.title}
                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-semibold text-lg mb-1">{ad.title}</h3>
                          <p className="text-gray-400 text-sm line-clamp-2">{ad.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {ad.status === 'paused' && (
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">En pause</span>
                          )}
                          {ad.status === 'approved' && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Actif</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {ad.location}, {ad.country}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {ad.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {ad.favorites_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(ad.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/ads/${ad.id}`)}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
                        >
                          Voir l'annonce
                        </button>
                        <button
                          onClick={() => setDeleteAdModal(ad.id)}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : activeTab === 'stats' ? (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              <h3 className="text-white font-semibold text-lg mb-4">Statistiques détaillées</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Nombre total d'annonces</span>
                  <span className="text-white font-semibold">{stats.totalAds}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Vues totales</span>
                  <span className="text-white font-semibold">{stats.totalViews}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Favoris totaux</span>
                  <span className="text-white font-semibold">{stats.totalFavorites}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Signalements reçus</span>
                  <span className="text-red-400 font-semibold">{stats.totalReports}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Bloqué par (utilisateurs)</span>
                  <span className="text-orange-400 font-semibold">{stats.totalBlocked}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Moyenne de vues par annonce</span>
                  <span className="text-white font-semibold">
                    {stats.totalAds > 0 ? Math.round(stats.totalViews / stats.totalAds) : 0}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        ) : activeTab === 'warnings' ? (
          <div className="space-y-4">
            {/* Bouton pour ajouter un avertissement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Avertissements</h3>
                    <p className="text-sm text-gray-400">Gérer les avertissements de cet utilisateur</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWarningModal(true)}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Ajouter un avertissement
                </button>
              </div>

              {/* Liste des avertissements */}
              <div className="space-y-3">
                {warnings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Aucun avertissement pour le moment
                  </div>
                ) : (
                  warnings.map((warning, index) => (
                    <motion.div
                      key={warning.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-800 rounded-lg p-4 border border-yellow-500/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-white font-semibold mb-1">{warning.reason}</h4>
                              {warning.details && (
                                <p className="text-sm text-gray-300">{warning.details}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              <span>Par: {warning.admin?.username || 'Admin'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(warning.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              <h3 className="text-white font-semibold text-lg mb-4">Actions d'administration</h3>
              <div className="space-y-3">
                <button
                  onClick={toggleVerification}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border ${
                    profile.verified
                      ? 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20'
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  } transition-all`}
                >
                  <div className="flex items-center gap-3">
                    {profile.verified ? (
                      <XCircle className="w-5 h-5 text-blue-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-white font-medium">
                      {profile.verified ? 'Retirer la vérification' : 'Vérifier le profil'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setDeleteProfileModal(true)}
                  className="w-full flex items-center justify-between p-4 rounded-lg border bg-red-500/10 border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-400" />
                    <span className="text-white font-medium">Supprimer le profil</span>
                  </div>
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium mb-1">Attention</p>
                    <p>La suppression d'un profil est irréversible. Toutes les annonces, messages et données associées seront définitivement supprimés.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Modale d'ajout d'avertissement */}
      <AnimatePresence>
        {showWarningModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWarningModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-yellow-500/30"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* En-tête */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Ajouter un avertissement</h2>
                      <p className="text-sm text-gray-400">Pour {profile.username}</p>
                    </div>
                  </div>

                  {/* Formulaire */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Raison de l'avertissement *
                      </label>
                      <input
                        type="text"
                        value={warningReason}
                        onChange={(e) => setWarningReason(e.target.value)}
                        placeholder="Ex: Contenu inapproprié, spam, etc."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                        maxLength={100}
                      />
                      <p className="text-xs text-gray-500 mt-1">{warningReason.length}/100</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Détails (optionnel)
                      </label>
                      <textarea
                        value={warningDetails}
                        onChange={(e) => setWarningDetails(e.target.value)}
                        placeholder="Ajoutez des détails supplémentaires..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">{warningDetails.length}/500</p>
                    </div>

                    {/* Info */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-200">
                          L'utilisateur recevra une notification avec la raison de cet avertissement.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowWarningModal(false)
                        setWarningReason('')
                        setWarningDetails('')
                      }}
                      className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-all"
                      disabled={submittingWarning}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={addWarning}
                      disabled={!warningReason.trim() || submittingWarning}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-xl font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submittingWarning ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5" />
                          Avertir
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Toast de succès */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Avertissement envoyé avec succès !</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ConfirmModal
        isOpen={deleteProfileModal}
        onClose={() => setDeleteProfileModal(false)}
        onConfirm={deleteProfile}
        title="Supprimer le profil"
        message={`Voulez-vous vraiment supprimer le profil de ${profile.username} ? Cette action est irréversible et supprimera toutes les données associées.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      <ConfirmModal
        isOpen={deleteAdModal !== null}
        onClose={() => setDeleteAdModal(null)}
        onConfirm={() => {
          if (deleteAdModal) deleteAd(deleteAdModal)
        }}
        title="Supprimer l'annonce"
        message="Voulez-vous vraiment supprimer cette annonce ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  )
}
