'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, MapPin, Eye, Share2, Flag, MessageCircle, Crown, Phone, Calendar, Check, X, Users, Home, Car, Globe, Loader2, Clock, ArrowUp, Coins } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCountry } from '@/contexts/CountryContext'
import { RANK_CONFIG, RankType } from '@/types/profile'
import { Watermark } from '@/components/Watermark'
import { useAdById } from '@/hooks/useAds'
import { useConversations } from '@/hooks/useMessages'
import { useAuth } from '@/contexts/AuthContext'
import { DAYS_OF_WEEK } from '@/types/ad'
import { translateHairColor, translateEyeColor, translateEthnicity, translateHairRemoval, translateBreastType, getCountryName, getLanguageName } from '@/types/constants'
import { AdComments } from '@/components/AdComments'
import { GiftModal } from '@/components/GiftModal'
import { VoteButton } from '@/components/VoteButton'
import { VoteStats, VoteBadgeCompact } from '@/components/VoteStats'
import { supabase } from '@/lib/supabase'
import { translateAdData } from '@/i18n/config'

function RankBadge({ rank }: { rank: RankType }) {
  if (!rank || rank === 'standard') return null
  const config = RANK_CONFIG[rank]
  if (!config) return null
  return (
    <div className={`flex items-center gap-1 ${config.bgColor} px-2 py-1 rounded-full border ${config.borderColor} ${config.glowColor} transition-all`}>
      <span className="text-xs">{config.icon}</span>
      <span className={`text-[10px] font-bold ${config.textColor} tracking-wide uppercase`}>
        {config.label}
      </span>
    </div>
  )
}

export default function AdDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { t, language } = useLanguage()
  const { isRestricted, selectedCountry } = useCountry()
  const { user, isAuthenticated } = useAuth()
  const { createConversation, error: conversationError } = useConversations()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [showGiftModal, setShowGiftModal] = useState(false)

  // Helper pour générer le message WhatsApp selon la langue
  const getWhatsAppMessage = (username: string, title: string, country: string) => {
    // Pays francophones
    const frenchCountries = ['FR', 'BE', 'CH', 'LU', 'MC']

    if (frenchCountries.includes(country) || language === 'fr') {
      return `Bonjour ${username}, je vous contacte suite à votre annonce "${title}" sur SexElite.eu.`
    } else {
      return `Hello ${username}, I'm contacting you regarding your ad "${title}" on SexElite.eu.`
    }
  }

  // Helper pour afficher un toast
  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Handlers pour le swipe sur mobile
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentPhotoIndex < media.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
    if (isRightSwipe && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    }
  }

  // Gérer l'affichage du bouton scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  // Fonction pour remonter en haut
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Fonction pour signaler un profil
  const handleReportProfile = async () => {
    if (!user || !ad) {
      showToast(t('adDetailPage.reportModal.mustBeLoggedIn'), 'error')
      return
    }

    if (!reportReason.trim()) {
      showToast(t('adDetailPage.reportModal.selectReasonError'), 'error')
      return
    }

    setIsSubmittingReport(true)
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_type: 'profile',
          reported_id: ad.userId,
          reason: reportReason,
          description: reportDescription.trim() || null
        })

      if (error) throw error

      showToast(t('adDetailPage.reportModal.success'), 'success')
      setShowReportModal(false)
      setReportReason('')
      setReportDescription('')
    } catch (error) {
      console.error('Erreur lors du signalement:', error)
      showToast(t('adDetailPage.reportModal.error'), 'error')
    } finally {
      setIsSubmittingReport(false)
    }
  }

  // Charger l'annonce depuis Supabase
  const { ad, loading, error } = useAdById(params.id as string)
  const [isBlocked, setIsBlocked] = useState(false)
  const [checkingBlock, setCheckingBlock] = useState(true)

  const [blockReason, setBlockReason] = useState<'you_blocked' | 'they_blocked' | null>(null)

  // Vérifier si l'utilisateur est bloqué
  useEffect(() => {
    async function checkIfBlocked() {
      if (!user || !ad) {
        console.log('🔒 Pas de vérification de blocage - user ou ad manquant', { user: !!user, ad: !!ad })
        setCheckingBlock(false)
        return
      }

      console.log('🔒 Vérification du blocage...', {
        currentUserId: user.id,
        adOwnerId: ad.userId
      })

      try {
        // Vérifier si l'utilisateur actuel est bloqué par le propriétaire de l'annonce
        const { data: blockData1, error: error1 } = await supabase
          .from('blocked_users')
          .select('id')
          .eq('user_id', ad.userId)
          .eq('blocked_user_id', user.id)
          .maybeSingle()

        console.log('🔒 Check 1 (propriétaire a bloqué visiteur):', {
          blocked: !!blockData1,
          error: error1?.message
        })

        // Vérifier si l'utilisateur actuel a bloqué le propriétaire de l'annonce
        const { data: blockData2, error: error2 } = await supabase
          .from('blocked_users')
          .select('id')
          .eq('user_id', user.id)
          .eq('blocked_user_id', ad.userId)
          .maybeSingle()

        console.log('🔒 Check 2 (visiteur a bloqué propriétaire):', {
          blocked: !!blockData2,
          error: error2?.message
        })

        const blocked = !!(blockData1 || blockData2)
        console.log('🔒 Résultat final:', { blocked })

        if (!error1 && !error2) {
          setIsBlocked(blocked)
          if (blockData1) {
            setBlockReason('they_blocked')
          } else if (blockData2) {
            setBlockReason('you_blocked')
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification du blocage:', error)
      } finally {
        setCheckingBlock(false)
      }
    }

    checkIfBlocked()
  }, [user, ad])

  // État de chargement
  if (loading || checkingBlock) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-gray-400">{t('adDetailPage.loading')}</p>
        </div>
      </div>
    )
  }

  // Vérifier la restriction géographique
  if (ad && isRestricted && ad.country !== selectedCountry.code) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              🚫 {t('adDetailPage.geoRestriction')}
            </h2>
            <p className="text-gray-400 mb-6">
              {t('adDetailPage.geoRestrictionMessage')}
              <br /><br />
              {t('adDetailPage.geoRestrictionAdLocation', { country: ad.country })}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              {t('adDetailPage.backToFrenchAds')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Si l'utilisateur est bloqué
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {t('adDetailPage.accessDenied')}
            </h2>
            <p className="text-gray-400 mb-6">
              {blockReason === 'they_blocked'
                ? t('adDetailPage.theyBlockedYou')
                : t('adDetailPage.youBlockedThem')}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              {t('adDetailPage.backToHome')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Gestion des erreurs
  if (error || !ad) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {error ? 'Erreur lors du chargement' : t('ads.noAds')}
          </h2>
          {error && <p className="text-gray-400 mb-4">{error}</p>}
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    )
  }

  // Photos depuis Supabase ou mockées si aucune photo
  const photos = ad.photos && ad.photos.length > 0
    ? ad.photos
    : [
        `https://picsum.photos/seed/${ad.id}/800/1200`,
        `https://picsum.photos/seed/${ad.id}-2/800/1200`,
        `https://picsum.photos/seed/${ad.id}-3/800/1200`,
      ]

  // Créer un tableau de médias avec la vidéo en premier si elle existe
  const media = ad.video
    ? [{ type: 'video' as const, url: ad.video }, ...photos.map(url => ({ type: 'photo' as const, url }))]
    : photos.map(url => ({ type: 'photo' as const, url }))

  const handleToggleFavorite = () => {
    // Vérifier que l'utilisateur ne met pas sa propre annonce en favoris
    if (user?.id === ad.userId) {
      showToast(t('adDetailPage.cannotAddOwnAdToFavorites'), 'error')
      return
    }
    toggleFavorite(ad.id)
  }

  const handleContact = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    // Vérifier que l'utilisateur ne contacte pas sa propre annonce
    if (user?.id === ad.userId) {
      showToast(t('adDetailPage.cannotContactOwnAd'), 'error')
      return
    }

    // Vérifier si l'utilisateur accepte les messages privés
    if (ad.acceptsMessages === false) {
      showToast(t('adDetailPage.userDoesNotAcceptMessages'), 'info')
      return
    }

    setIsCreatingConversation(true)

    try {
      // Créer ou récupérer la conversation avec le propriétaire de l'annonce
      const conversationId = await createConversation(ad.userId)

      if (conversationId) {
        // Rediriger vers la conversation
        router.push(`/messages/${conversationId}`)
      } else {
        // Afficher l'erreur spécifique si disponible
        if (conversationError?.includes('contacter cet utilisateur')) {
          showToast(t('adDetailPage.cannotContactThisUser'), 'error')
        } else {
          showToast(t('adDetailPage.errorCreatingConversation'), 'error')
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error)
      showToast(t('adDetailPage.errorCreatingConversation'), 'error')
    } finally {
      setIsCreatingConversation(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-white hover:text-pink-500 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            {/* Bouton Envoyer un cadeau */}
            {ad && ad.userId !== user?.id && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (!isAuthenticated) {
                    showToast(t('adDetailPage.loginToSendGift'), 'error')
                    return
                  }
                  setShowGiftModal(true)
                }}
                className="p-2 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-500/20 hover:from-amber-400/30 hover:to-yellow-500/30 border border-amber-400/30 text-amber-400 hover:text-amber-300 transition-all"
                title={t('adDetailPage.giftModal.sendGift')}
              >
                <Coins className="w-5 h-5" />
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (!isAuthenticated) {
                  showToast(t('adDetailPage.loginToReport'), 'error')
                  return
                }
                setShowReportModal(true)
              }}
              className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              title={t('adDetailPage.reportModal.title')}
            >
              <Flag className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photos */}
          <div className="lg:col-span-1">
            {/* Photo/Video Gallery */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="sticky top-24"
            >
              <div
                className="relative aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden mb-3"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {media[currentPhotoIndex].type === 'video' ? (
                  <div className="absolute inset-0">
                    <video
                      src={media[currentPhotoIndex].url}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <Watermark size="medium" />
                  </div>
                ) : (
                  <>
                    <img
                      src={media[currentPhotoIndex].url}
                      alt={ad.username}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10" />
                    <Watermark size="medium" />
                  </>
                )}

                {/* Navigation arrows */}
                {currentPhotoIndex > 0 && (
                  <button
                    onClick={() => setCurrentPhotoIndex(currentPhotoIndex - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/70 transition-colors z-10"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                {currentPhotoIndex < media.length - 1 && (
                  <button
                    onClick={() => setCurrentPhotoIndex(currentPhotoIndex + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/70 transition-colors z-10"
                  >
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                )}
              </div>

              {/* Media thumbnails */}
              <div className="flex gap-2 overflow-x-auto">
                {media.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`flex-shrink-0 w-20 aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${
                      index === currentPhotoIndex
                        ? 'border-pink-500'
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <>
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Info */}
          <div className="lg:col-span-2 space-y-4">

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl p-5 border border-gray-800"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white">
                  {ad.username}, {ad.age}
                </h1>
                {ad.verified && (
                  <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 p-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-transform hover:scale-110">
                    <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {ad.online && (
                  <div className="flex items-center gap-1 bg-green-500 px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-xs text-white font-medium">{t('ads.online')}</span>
                  </div>
                )}
                <RankBadge rank={ad.rank} />
                <VoteBadgeCompact profileId={ad.userId} />
              </div>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <button
                  onClick={() => router.push(`/?country=${ad.country}&city=${encodeURIComponent(ad.location)}`)}
                  className="flex items-center gap-1 hover:text-pink-400 transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  <span className="underline decoration-dotted underline-offset-2">
                    {ad.location}
                    {ad.arrondissement && ` - ${ad.arrondissement}`}
                  </span>
                </button>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{ad.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{ad.favorites}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleFavorite}
                className={`p-2.5 rounded-full transition-colors ${
                  isFavorite(ad.id)
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-800 text-pink-500 hover:bg-gray-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(ad.id) ? 'fill-current' : ''}`} />
              </motion.button>
              {/* Bouton de vote */}
              <VoteButton profileId={ad.userId} />
              {ad && user && ad.userId !== user.id && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!isAuthenticated) {
                      showToast(t('adDetailPage.loginToSendGift'), 'error')
                      return
                    }
                    setShowGiftModal(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600 transition-all shadow-lg"
                >
                  <Coins className="w-5 h-5" />
                  <span className="font-medium text-sm">{t('adDetailPage.giftModal.sendGift')}</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>


        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-2xl p-5 border border-gray-800"
        >
          <h2 className="text-lg font-bold text-white mb-3">{t('ads.about')}</h2>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{ad.description}</p>
        </motion.div>

        {/* Physical Attributes & Info Combined */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-2xl p-5 border border-gray-800"
        >
          <h2 className="text-lg font-bold text-white mb-3">{t('ads.characteristics')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Genre */}
            {ad.gender && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('adDetailPage.gender')}</p>
                <p className="text-white text-sm font-medium">
                  {ad.gender === 'female' && t('adDetailPage.genderFemale')}
                  {ad.gender === 'male' && t('adDetailPage.genderMale')}
                  {ad.gender === 'couple' && t('adDetailPage.genderCouple')}
                  {ad.gender === 'transsexual' && t('adDetailPage.genderTranssexual')}
                </p>
              </div>
            )}

            {/* Attributs physiques */}
            {ad.physicalAttributes?.height && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('ads.height')}</p>
                <p className="text-white text-sm font-medium">{ad.physicalAttributes.height} cm</p>
              </div>
            )}
            {ad.physicalAttributes?.weight && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('ads.weight')}</p>
                <p className="text-white text-sm font-medium">{ad.physicalAttributes.weight} kg</p>
              </div>
            )}
            {ad.physicalAttributes?.measurements && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('ads.measurements')}</p>
                <p className="text-white text-sm font-medium">{ad.physicalAttributes.measurements}</p>
              </div>
            )}
            {ad.physicalAttributes?.cupSize && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('ads.cupSize')}</p>
                <p className="text-white text-sm font-medium">{ad.physicalAttributes.cupSize}</p>
              </div>
            )}
            {ad.physicalAttributes?.hairColor && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('ads.hair')}</p>
                <p className="text-white text-sm font-medium">{translateHairColor(ad.physicalAttributes.hairColor)}</p>
              </div>
            )}
            {ad.physicalAttributes?.eyeColor && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('ads.eyes')}</p>
                <p className="text-white text-sm font-medium">{translateEyeColor(ad.physicalAttributes.eyeColor)}</p>
              </div>
            )}
            {ad.country && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('adDetailPage.nationality')}</p>
                <p className="text-white text-sm font-medium">{getCountryName(ad.country)}</p>
              </div>
            )}
            {ad.physicalAttributes?.bodyType && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('ads.bodyType')}</p>
                <p className="text-white text-sm font-medium">{ad.physicalAttributes.bodyType}</p>
              </div>
            )}
            {ad.physicalAttributes?.tattoos !== undefined && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('ads.tattoos')}</p>
                <div className="flex items-center gap-1">
                  {ad.physicalAttributes.tattoos ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-red-500" />
                  )}
                  <p className="text-white text-sm font-medium">{ad.physicalAttributes.tattoos ? t('common.yes') : t('common.no')}</p>
                </div>
              </div>
            )}
            {ad.physicalAttributes?.piercings !== undefined && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('ads.piercings')}</p>
                <div className="flex items-center gap-1">
                  {ad.physicalAttributes.piercings ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-red-500" />
                  )}
                  <p className="text-white text-sm font-medium">{ad.physicalAttributes.piercings ? t('common.yes') : t('common.no')}</p>
                </div>
              </div>
            )}
            {ad.physicalAttributes?.breastType && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('adDetailPage.breastType')}</p>
                <p className="text-white text-sm font-medium">{translateBreastType(ad.physicalAttributes.breastType)}</p>
              </div>
            )}
            {ad.physicalAttributes?.hairRemoval && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('adDetailPage.hairRemoval')}</p>
                <p className="text-white text-sm font-medium">{translateHairRemoval(ad.physicalAttributes.hairRemoval)}</p>
              </div>
            )}

            {/* Langues */}
            {ad.languages && ad.languages.length > 0 && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg">
                <p className="text-gray-400 text-xs mb-0.5">{t('adDetailPage.languages')}</p>
                <p className="text-white text-sm font-medium">{ad.languages.join(', ')}</p>
              </div>
            )}

            {/* Ce qu'on souhaite rencontrer */}
            {ad.interestedIn && (
              <div className="bg-gray-800/50 p-2.5 rounded-lg col-span-2">
                <p className="text-gray-400 text-xs mb-0.5">{t('adDetailPage.interestedInMeeting')}</p>
                <p className="text-white text-sm font-medium">
                  {[
                    ad.interestedIn.men && t('adDetailPage.interestedInMen'),
                    ad.interestedIn.women && t('adDetailPage.interestedInWomen'),
                    ad.interestedIn.couples && t('adDetailPage.interestedInCouples'),
                    ad.interestedIn.transsexuals && t('adDetailPage.interestedInTranssexuals')
                  ].filter(Boolean).join(', ') || t('adDetailPage.notSpecified')}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Lieux de rencontre */}
        {ad.meetingPlaces && ad.meetingPlaces.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-2xl p-5 border border-gray-800"
          >
            <h2 className="text-lg font-bold text-white mb-3">{t('adDetailPage.meetingPlaces')}</h2>
            <div className="flex flex-wrap gap-2">
              {ad.meetingPlaces.map((place, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-blue-500/10 to-cyan-600/10 border border-blue-500/30 text-gray-200 px-3 py-1.5 rounded-full text-xs font-medium"
                >
                  {translateAdData(`meetingPlaces.${place}`, language)}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Services proposés */}
        {ad.services && ad.services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gray-900 rounded-2xl p-5 border border-gray-800"
          >
            <h2 className="text-lg font-bold text-white mb-3">{t('adDetailPage.servicesOffered')}</h2>
            <div className="flex flex-wrap gap-2">
              {ad.services.map((service, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/30 text-gray-200 px-3 py-1.5 rounded-full text-xs"
                >
                  {translateAdData(`services.${service}`, language)}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Availability & Contact - Combined */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 rounded-2xl p-5 border border-gray-800"
        >
          <h2 className="text-lg font-bold text-white mb-4">{t('availability.title')}</h2>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Left side - Availability Details */}
            <div className="space-y-4">
              {/* Days and Hours availability */}
              {ad.contactInfo?.availability && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    <p className="text-gray-400 text-sm font-medium">{t('adDetailPage.availabilityTitle')}</p>
                  </div>

                  {ad.contactInfo.availability.available247 ? (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3">
                      <p className="text-green-400 font-medium text-sm">🌟 {t('adDetailPage.available247')}</p>
                    </div>
                  ) : ad.contactInfo.availability.days && ad.contactInfo.availability.days.length > 0 ? (
                    <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                      {DAYS_OF_WEEK.map((day) => {
                        const isAvailable = ad.contactInfo?.availability?.days?.includes(day)
                        if (!isAvailable) return null
                        return (
                          <div key={day} className="flex justify-between items-center text-sm">
                            <span className="text-white font-medium">{day}:</span>
                            <span className="text-pink-400">
                              {ad.contactInfo?.availability?.hours || '10:00 - 23:00'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">{t('adDetailPage.notSpecified')}</p>
                  )}
                </div>
              )}

              {/* Lieu */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-pink-500" />
                  <p className="text-gray-400 text-sm font-medium">{t('adDetailPage.location')}</p>
                </div>
                <button
                  onClick={() => router.push(`/?country=${ad.country}&city=${encodeURIComponent(ad.location)}`)}
                  className="text-white text-sm hover:text-pink-400 transition-colors underline decoration-dotted underline-offset-2"
                >
                  {ad.location}
                  {ad.arrondissement && ` - ${ad.arrondissement}`}
                </button>
              </div>

              {/* Langues parlées */}
              {ad.languages && ad.languages.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-pink-500" />
                    <p className="text-gray-400 text-sm font-medium">{t('adDetailPage.spokenLanguages')}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ad.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="bg-gray-800 text-white px-2 py-1 rounded text-xs"
                      >
                        {getLanguageName(lang)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Contact Info */}
            <div className="space-y-3">
              {ad.contactInfo && ad.contactInfo.phone && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-start gap-3">
                    <div className="bg-pink-500/20 p-2 rounded-lg">
                      <Phone className="w-5 h-5 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-xs mb-1">{t('adDetailPage.phone')}</p>
                      <a
                        href={`tel:${ad.contactInfo.phone}`}
                        className="text-white text-base font-semibold hover:text-pink-400 transition-colors"
                      >
                        {ad.contactInfo.phone}
                      </a>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ad.contactInfo.acceptsCalls && (
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded flex items-center gap-1 text-gray-300">
                            <Phone className="w-3 h-3" />
                            {t('adDetailPage.calls')}
                          </span>
                        )}
                        {ad.contactInfo.acceptsSMS && (
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded flex items-center gap-1 text-gray-300">
                            <MessageCircle className="w-3 h-3" />
                            {t('adDetailPage.sms')}
                          </span>
                        )}
                        {ad.contactInfo.whatsapp && (
                          <a
                            href={`https://wa.me/${ad.contactInfo.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getWhatsAppMessage(ad.username, ad.title, ad.country))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-green-500/30 transition-colors cursor-pointer"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            WhatsApp
                          </a>
                        )}
                        {ad.contactInfo.telegram && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded flex items-center gap-1">
                            ✈️ Telegram
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {ad.contactInfo?.email && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-xs mb-1">{t('adDetailPage.email')}</p>
                      <a
                        href={`mailto:${ad.contactInfo.email}`}
                        className="text-white text-base font-semibold hover:text-purple-400 transition-colors break-all"
                      >
                        {ad.contactInfo.email}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
          </div>
        </div>

        {/* Vote Stats - Classement et XP */}
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <VoteStats profileId={ad.userId} showProgress={true} />
          </motion.div>
        </div>

        {/* Section Commentaires */}
        <div className="max-w-4xl mx-auto px-4 pb-24 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AdComments adId={ad.id} adOwnerId={ad.userId} />
          </motion.div>
        </div>

      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-30 bg-gradient-to-br from-pink-500 to-purple-600 text-white p-3 rounded-full shadow-2xl hover:from-pink-600 hover:to-purple-700 transition-all hover:shadow-pink-500/50"
        >
          <ArrowUp className="w-6 h-6" />
        </motion.button>
      )}

      {/* Fixed Contact Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-950 via-gray-950 to-transparent z-20">
        <div className="max-w-4xl mx-auto">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContact}
            disabled={isCreatingConversation}
            className={`w-full ${
              ad.acceptsMessages === false
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
            } text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isCreatingConversation ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('adDetailPage.creatingConversation')}
              </>
            ) : ad.acceptsMessages === false ? (
              <>
                <X className="w-5 h-5" />
                {t('adDetailPage.privateMessagesDisabled')}
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5" />
                {t('buttons.contact')}
              </>
            )}
          </motion.button>
        </div>
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


      {/* Modal de signalement */}
      {showReportModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmittingReport && setShowReportModal(false)}
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
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Flag className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {t('adDetailPage.reportModal.title')}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('adDetailPage.reportModal.reasonLabel')}
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    disabled={isSubmittingReport}
                  >
                    <option value="">{t('adDetailPage.reportModal.selectReason')}</option>
                    <option value="fake_profile">{t('adDetailPage.reportModal.fakeProfile')}</option>
                    <option value="inappropriate_content">{t('adDetailPage.reportModal.inappropriateContent')}</option>
                    <option value="scam">{t('adDetailPage.reportModal.scam')}</option>
                    <option value="harassment">{t('adDetailPage.reportModal.harassment')}</option>
                    <option value="underage">{t('adDetailPage.reportModal.underage')}</option>
                    <option value="other">{t('adDetailPage.reportModal.other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('adDetailPage.reportModal.descriptionLabel')}
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder={t('adDetailPage.reportModal.descriptionPlaceholder')}
                    className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none resize-none"
                    rows={4}
                    disabled={isSubmittingReport}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowReportModal(false)
                      setReportReason('')
                      setReportDescription('')
                    }}
                    disabled={isSubmittingReport}
                    className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {t('adDetailPage.reportModal.cancel')}
                  </button>
                  <button
                    onClick={handleReportProfile}
                    disabled={isSubmittingReport || !reportReason}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-red-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReport ? t('adDetailPage.reportModal.sending') : t('adDetailPage.reportModal.submit')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Gift Modal */}
      {ad && (
        <GiftModal
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          recipientId={ad.userId}
          recipientName={ad.username}
        />
      )}
    </div>
  )
}
