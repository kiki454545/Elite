'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, MessageCircle, UserX, ArrowLeft, Trash2, Phone, Search, AlertTriangle, AlertCircle, CheckCircle, Upload, X, Image as ImageIcon, Crown, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { hasBlacklistAccess, BLACKLIST_RESTRICTED_MESSAGE, BLACKLIST_RESTRICTED_TITLE } from '@/lib/blacklist'
import type { RankType } from '@/types/profile'

interface BlockedUser {
  id: string
  blocked_user_id: string
  blocked_username: string
  blocked_at: string
}

interface BlacklistEntry {
  id: string
  phone_number: string
  reason: string
  created_at: string
  user_id: string
}

interface VerificationRequest {
  id: string
  user_id: string
  verification_photos: string[]
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  created_at: string
  reviewed_at?: string
}

export default function PrivacySettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [acceptsMessages, setAcceptsMessages] = useState(true)
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [blockUsername, setBlockUsername] = useState('')
  const [blockError, setBlockError] = useState('')
  const [userRank, setUserRank] = useState<RankType>('standard')

  // Liste noire des numéros
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneReason, setPhoneReason] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([])

  // Recherche de numéro
  const [searchPhone, setSearchPhone] = useState('')
  const [searchResults, setSearchResults] = useState<BlacklistEntry[]>([])
  const [searching, setSearching] = useState(false)

  // Vérification de compte
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null)
  const [verificationPhotos, setVerificationPhotos] = useState<File[]>([])
  const [uploadError, setUploadError] = useState('')
  const [uploadingVerification, setUploadingVerification] = useState(false)

  useEffect(() => {
    if (user) {
      loadPrivacySettings()
    }
  }, [user])

  const loadPrivacySettings = async () => {
    if (!user) return

    try {
      // Charger les paramètres de messages privés et le rank
      const { data: profile } = await supabase
        .from('profiles')
        .select('accepts_messages, rank')
        .eq('id', user.id)
        .single()

      if (profile) {
        setAcceptsMessages(profile.accepts_messages ?? true)
        setUserRank((profile.rank as RankType) || 'standard')
      }

      // Charger la liste des utilisateurs bloqués
      const { data: blocked } = await supabase
        .from('blocked_users')
        .select(`
          id,
          blocked_user_id,
          blocked_at,
          blocked_profile:profiles!blocked_users_blocked_user_id_fkey(username)
        `)
        .eq('user_id', user.id)
        .order('blocked_at', { ascending: false })

      if (blocked) {
        setBlockedUsers(blocked.map(b => ({
          id: b.id,
          blocked_user_id: b.blocked_user_id,
          blocked_username: (b.blocked_profile as any)?.username || 'Utilisateur inconnu',
          blocked_at: b.blocked_at
        })))
      }

      // Charger la liste noire des numéros
      const { data: phoneBlacklist } = await supabase
        .from('phone_blacklist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (phoneBlacklist) {
        setBlacklist(phoneBlacklist)
      }

      // Charger la demande de vérification existante
      const { data: verificationData } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (verificationData) {
        setVerificationRequest(verificationData)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMessages = async (value: boolean) => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ accepts_messages: value })
        .eq('id', user.id)

      if (error) throw error
      setAcceptsMessages(value)
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleBlockUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !blockUsername.trim()) return

    setBlockError('')
    setSaving(true)

    try {
      // Vérifier si l'utilisateur existe
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', blockUsername.trim())
        .single()

      if (userError || !targetUser) {
        setBlockError('Utilisateur non trouvé')
        setSaving(false)
        return
      }

      // Ne pas se bloquer soi-même
      if (targetUser.id === user.id) {
        setBlockError('Vous ne pouvez pas vous bloquer vous-même')
        setSaving(false)
        return
      }

      // Vérifier si déjà bloqué
      const { data: existing } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('user_id', user.id)
        .eq('blocked_user_id', targetUser.id)
        .single()

      if (existing) {
        setBlockError('Cet utilisateur est déjà bloqué')
        setSaving(false)
        return
      }

      // Bloquer l'utilisateur
      console.log('🔒 Tentative de blocage:', {
        user_id: user.id,
        blocked_user_id: targetUser.id
      })

      const { data: insertData, error: blockError } = await supabase
        .from('blocked_users')
        .insert({
          user_id: user.id,
          blocked_user_id: targetUser.id
        })
        .select()

      console.log('🔒 Résultat insertion:', { data: insertData, error: blockError })

      if (blockError) {
        console.error('❌ Erreur de blocage:', blockError)
        throw blockError
      }

      // Recharger la liste
      await loadPrivacySettings()
      setBlockUsername('')
    } catch (error) {
      console.error('Erreur lors du blocage:', error)
      setBlockError('Erreur lors du blocage de l\'utilisateur')
    } finally {
      setSaving(false)
    }
  }

  const handleUnblockUser = async (blockedUserId: string) => {
    if (!user) return

    setSaving(true)
    try {
      console.log('🔓 Déblocage de l\'utilisateur:', blockedUserId)

      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', user.id)
        .eq('blocked_user_id', blockedUserId)

      if (error) {
        console.error('❌ Erreur lors du déblocage:', error)
        throw error
      }

      console.log('✅ Utilisateur débloqué avec succès')

      // Recharger la liste
      await loadPrivacySettings()

      // Forcer un refresh de la page après un court délai pour s'assurer que tout est à jour
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Erreur lors du déblocage:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddPhoneToBlacklist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !phoneNumber.trim() || !phoneReason.trim()) return

    // Vérifier l'accès à la liste noire
    if (!hasBlacklistAccess(userRank)) {
      setPhoneError(BLACKLIST_RESTRICTED_MESSAGE)
      return
    }

    setPhoneError('')
    setSaving(true)

    try {
      // Nettoyer le numéro (enlever espaces et caractères spéciaux)
      const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '')

      // Vérifier si déjà en liste noire
      const { data: existing } = await supabase
        .from('phone_blacklist')
        .select('id')
        .eq('user_id', user.id)
        .eq('phone_number', cleanPhone)
        .single()

      if (existing) {
        setPhoneError('Ce numéro est déjà dans votre liste noire')
        setSaving(false)
        return
      }

      // Ajouter à la liste noire
      const { error: insertError } = await supabase
        .from('phone_blacklist')
        .insert({
          user_id: user.id,
          phone_number: cleanPhone,
          reason: phoneReason.trim()
        })

      if (insertError) throw insertError

      // Recharger la liste
      await loadPrivacySettings()
      setPhoneNumber('')
      setPhoneReason('')
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
      setPhoneError('Erreur lors de l\'ajout du numéro')
    } finally {
      setSaving(false)
    }
  }

  const handleRemovePhoneFromBlacklist = async (entryId: string) => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('phone_blacklist')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id)

      if (error) throw error

      // Recharger la liste
      await loadPrivacySettings()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSearchPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchPhone.trim()) return

    setSearching(true)
    try {
      // Nettoyer le numéro de recherche
      const cleanPhone = searchPhone.replace(/[^0-9+]/g, '')

      // Rechercher dans toutes les entrées (publique)
      const { data, error } = await supabase
        .from('phone_blacklist')
        .select('*')
        .eq('phone_number', cleanPhone)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSearchResults(data || [])
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setSearching(false)
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadError('')

    // Vérifier le nombre de photos (max 3)
    if (verificationPhotos.length + files.length > 3) {
      setUploadError('Vous pouvez envoyer maximum 3 photos')
      return
    }

    // Vérifier la taille des fichiers (max 5MB par photo)
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Chaque photo doit faire moins de 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setUploadError('Seules les images sont acceptées')
        return
      }
    }

    setVerificationPhotos([...verificationPhotos, ...files])
  }

  const removePhoto = (index: number) => {
    setVerificationPhotos(verificationPhotos.filter((_, i) => i !== index))
  }

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || verificationPhotos.length === 0) return

    setUploadError('')
    setUploadingVerification(true)

    try {
      // Upload des photos vers Supabase Storage
      const photoUrls: string[] = []

      for (let i = 0; i < verificationPhotos.length; i++) {
        const file = verificationPhotos[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}-${i}.${fileExt}`
        const filePath = `verification/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('verification-photos')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('verification-photos')
          .getPublicUrl(filePath)

        photoUrls.push(publicUrl)
      }

      // Créer la demande de vérification
      const { error: insertError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          verification_photos: photoUrls,
          status: 'pending'
        })

      if (insertError) throw insertError

      // Recharger les données
      await loadPrivacySettings()
      setVerificationPhotos([])
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error)
      setUploadError('Erreur lors de l\'envoi de la demande')
    } finally {
      setUploadingVerification(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-pink-500" />
            <h1 className="text-2xl font-bold text-white">Préférences de confidentialité</h1>
          </div>
        </div>

        {/* Messages privés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-pink-500/10 rounded-xl">
              <MessageCircle className="w-6 h-6 text-pink-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Messages privés</h2>
              <p className="text-gray-400 mb-4">
                Autorisez ou bloquez les autres utilisateurs à vous envoyer des messages privés.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleMessages(!acceptsMessages)}
                  disabled={saving}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    acceptsMessages ? 'bg-pink-500' : 'bg-gray-700'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      acceptsMessages ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-white font-medium">
                  {acceptsMessages ? 'Activé' : 'Désactivé'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vérification du compte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Vérification du compte</h2>
              <p className="text-gray-400">
                Faites vérifier votre compte pour obtenir le badge vérifié et gagner la confiance des autres utilisateurs.
              </p>
            </div>
          </div>

          {verificationRequest ? (
            <div className="space-y-4">
              {/* Demande existante */}
              <div className={`p-4 rounded-xl border ${
                verificationRequest.status === 'pending'
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : verificationRequest.status === 'approved'
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {verificationRequest.status === 'pending' && (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-400 font-semibold">Demande en cours de traitement</span>
                    </>
                  )}
                  {verificationRequest.status === 'approved' && (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-400 font-semibold">Compte vérifié !</span>
                    </>
                  )}
                  {verificationRequest.status === 'rejected' && (
                    <>
                      <X className="w-5 h-5 text-red-500" />
                      <span className="text-red-400 font-semibold">Demande refusée</span>
                    </>
                  )}
                </div>
                <p className="text-gray-300 text-sm">
                  Demande envoyée le {new Date(verificationRequest.created_at).toLocaleDateString('fr-FR')}
                </p>
                {verificationRequest.rejection_reason && (
                  <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-red-400">Raison du refus :</span> {verificationRequest.rejection_reason}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Vous pouvez soumettre une nouvelle demande en respectant les consignes ci-dessous.
                    </p>
                  </div>
                )}
              </div>

              {/* Permettre une nouvelle demande si refusée */}
              {verificationRequest.status === 'rejected' && (
                <button
                  onClick={() => setVerificationRequest(null)}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                >
                  Soumettre une nouvelle demande
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-400" />
                  Instructions importantes
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Prenez une photo de vous tenant une pancarte avec les informations suivantes :</span>
                  </li>
                  <li className="flex gap-2 ml-6">
                    <span className="text-pink-400">-</span>
                    <span>Votre pseudonyme : <span className="font-mono text-white">{user?.user_metadata?.username || 'N/A'}</span></span>
                  </li>
                  <li className="flex gap-2 ml-6">
                    <span className="text-pink-400">-</span>
                    <span>La date du jour : <span className="font-mono text-white">{new Date().toLocaleDateString('fr-FR')}</span></span>
                  </li>
                  <li className="flex gap-2 ml-6">
                    <span className="text-pink-400">-</span>
                    <span>Le texte : <span className="font-mono text-white">SexElite.eu</span></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Votre visage doit être clairement visible</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>La pancarte et les informations doivent être lisibles</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Vous pouvez envoyer jusqu'à 3 photos (max 5MB chacune)</span>
                  </li>
                </ul>
              </div>

              {/* Formulaire d'upload */}
              <form onSubmit={handleSubmitVerification} className="space-y-4">
                <div>
                  <label className="block mb-2">
                    <div className="flex items-center justify-center w-full p-8 border-2 border-dashed border-gray-700 rounded-xl hover:border-blue-500 transition-colors cursor-pointer bg-gray-800/30">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoSelect}
                        className="hidden"
                        disabled={uploadingVerification || verificationPhotos.length >= 3}
                      />
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-white font-medium mb-1">
                          Cliquez pour ajouter des photos
                        </p>
                        <p className="text-gray-400 text-sm">
                          {verificationPhotos.length}/3 photos ajoutées
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Prévisualisation des photos */}
                  {verificationPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {verificationPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-red-400 text-sm">{uploadError}</p>
                )}

                <button
                  type="submit"
                  disabled={uploadingVerification || verificationPhotos.length === 0}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingVerification ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Soumettre la demande de vérification
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>

        {/* Blocage d'utilisateurs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <UserX className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Utilisateurs bloqués</h2>
              <p className="text-gray-400">
                Les utilisateurs bloqués ne peuvent plus voir votre profil ni vous contacter.
              </p>
            </div>
          </div>

          {/* Formulaire de blocage */}
          <form onSubmit={handleBlockUser} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={blockUsername}
                onChange={(e) => setBlockUsername(e.target.value)}
                placeholder="Nom d'utilisateur à bloquer"
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
              />
              <button
                type="submit"
                disabled={saving || !blockUsername.trim()}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bloquer
              </button>
            </div>
            {blockError && (
              <p className="text-red-400 text-sm mt-2">{blockError}</p>
            )}
          </form>

          {/* Liste des utilisateurs bloqués */}
          {blockedUsers.length > 0 ? (
            <div className="space-y-3">
              {blockedUsers.map((blocked) => (
                <div
                  key={blocked.id}
                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl"
                >
                  <div>
                    <p className="text-white font-medium">@{blocked.blocked_username}</p>
                    <p className="text-gray-500 text-sm">
                      Bloqué le {new Date(blocked.blocked_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnblockUser(blocked.blocked_user_id)}
                    disabled={saving}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Débloquer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Aucun utilisateur bloqué
            </p>
          )}
        </motion.div>

        {/* Liste noire des numéros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`bg-gray-900/50 backdrop-blur-sm border rounded-2xl p-6 ${
            hasBlacklistAccess(userRank) ? 'border-gray-800' : 'border-yellow-500/30'
          }`}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-xl ${
              hasBlacklistAccess(userRank) ? 'bg-orange-500/10' : 'bg-yellow-500/10'
            }`}>
              {hasBlacklistAccess(userRank) ? (
                <Phone className="w-6 h-6 text-orange-500" />
              ) : (
                <Lock className="w-6 h-6 text-yellow-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-white">Liste noire des numéros</h2>
                {!hasBlacklistAccess(userRank) && (
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    PREMIUM
                  </span>
                )}
              </div>
              <p className="text-gray-400">
                Signalez les numéros de téléphone problématiques pour avertir les autres utilisateurs.
              </p>
              {!hasBlacklistAccess(userRank) && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{BLACKLIST_RESTRICTED_MESSAGE}</span>
                  </p>
                  <button
                    onClick={() => router.push('/shop')}
                    className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    Découvrir les offres Premium →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Formulaire d'ajout */}
          {hasBlacklistAccess(userRank) && (
            <form onSubmit={handleAddPhoneToBlacklist} className="mb-6">
              <div className="space-y-3">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Numéro de téléphone (ex: +33612345678)"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                />
                <textarea
                  value={phoneReason}
                  onChange={(e) => setPhoneReason(e.target.value)}
                  placeholder="Raison du signalement..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={saving || !phoneNumber.trim() || !phoneReason.trim()}
                  className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter à la liste noire
                </button>
              </div>
              {phoneError && (
                <p className="text-red-400 text-sm mt-2">{phoneError}</p>
              )}
            </form>
          )}

          {/* Mes signalements */}
          {blacklist.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Mes signalements</h3>
              <div className="space-y-3">
                {blacklist.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-gray-800/30 rounded-xl border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-mono font-medium">{entry.phone_number}</p>
                        <p className="text-gray-500 text-sm">
                          Signalé le {new Date(entry.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemovePhoneFromBlacklist(entry.id)}
                        disabled={saving}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm">{entry.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recherche de numéro - PREMIUM UNIQUEMENT */}
          {hasBlacklistAccess(userRank) && (
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Rechercher un numéro
              </h3>
              <form onSubmit={handleSearchPhone} className="mb-4">
                <div className="flex gap-3">
                  <input
                    type="tel"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder="Numéro à rechercher..."
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="submit"
                    disabled={searching || !searchPhone.trim()}
                    className="px-6 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? 'Recherche...' : 'Rechercher'}
                  </button>
                </div>
              </form>

              {/* Résultats de recherche */}
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-orange-400 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <p className="font-semibold">
                      {searchResults.length} signalement{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  {searchResults.map((result, index) => (
                    <div
                      key={result.id}
                      className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/30"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white font-mono font-medium">{result.phone_number}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(result.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <p className="text-gray-300 text-sm">{result.reason}</p>
                    </div>
                  ))}
                </div>
              ) : searchPhone && !searching ? (
                <p className="text-gray-500 text-center py-4">
                  Aucun signalement trouvé pour ce numéro
                </p>
              ) : null}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
