'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Flag, Reply, AlertTriangle, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import { AdComment } from '@/types/ad'

interface AdCommentsProps {
  adId: string
  adOwnerId: string
}

export function AdComments({ adId, adOwnerId }: AdCommentsProps) {
  const { user, profile } = useAuth()
  const { t } = useLanguage()
  const [comments, setComments] = useState<AdComment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reportModal, setReportModal] = useState<{ commentId: string; username: string } | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const COMMENTS_PER_PAGE = 10

  useEffect(() => {
    fetchComments()
  }, [adId])

  async function fetchComments(pageNum: number = 1, append: boolean = false) {
    try {
      setLoading(true)

      // Compter le nombre total de commentaires (parents uniquement)
      const { count } = await supabase
        .from('ad_comments')
        .select('*', { count: 'exact', head: true })
        .eq('ad_id', adId)
        .is('parent_id', null)

      setTotalCount(count || 0)

      // Calculer la pagination pour les commentaires parents
      const from = (pageNum - 1) * COMMENTS_PER_PAGE
      const to = from + COMMENTS_PER_PAGE - 1

      // Récupérer les commentaires parents avec pagination
      const { data: parentComments, error: parentError } = await supabase
        .from('ad_comments')
        .select(`
          *,
          profiles:user_id (username, verified, avatar_url)
        `)
        .eq('ad_id', adId)
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (parentError) throw parentError

      // Récupérer toutes les réponses pour ces commentaires parents
      const parentIds = parentComments?.map((c: any) => c.id) || []
      let repliesData: any[] = []

      if (parentIds.length > 0) {
        const { data: replies, error: repliesError } = await supabase
          .from('ad_comments')
          .select(`
            *,
            profiles:user_id (username, verified, avatar_url)
          `)
          .eq('ad_id', adId)
            .in('parent_id', parentIds)
          .order('created_at', { ascending: true })

        if (repliesError) throw repliesError
        repliesData = replies || []
      }

      // Combiner les parents et les réponses
      const commentsData = [...(parentComments || []), ...repliesData]

      if (!commentsData || commentsData.length === 0) {
        if (!append) setComments([])
        setHasMore(false)
        return
      }

      // Vérifier s'il y a plus de commentaires
      setHasMore((count || 0) > pageNum * COMMENTS_PER_PAGE)

      // Récupérer les IDs uniques des utilisateurs pour charger leurs photos d'annonces
      const userIds = [...new Set(commentsData?.map((c: any) => c.user_id) || [])]

      // Récupérer la première photo de chaque utilisateur depuis leurs annonces
      const userPhotos = new Map<string, string>()
      if (userIds.length > 0) {
        const { data: adsData } = await supabase
          .from('ads')
          .select('user_id, photos')
          .in('user_id', userIds)
          .not('photos', 'is', null)
          .limit(1)

        adsData?.forEach((ad: any) => {
          if (ad.photos && ad.photos.length > 0 && !userPhotos.has(ad.user_id)) {
            userPhotos.set(ad.user_id, ad.photos[0])
          }
        })
      }

      // Organiser les commentaires avec leurs réponses
      const commentsMap = new Map<string, AdComment>()
      const rootComments: AdComment[] = []

      commentsData?.forEach((comment: any) => {
        const commentObj: AdComment = {
          ...comment,
          username: comment.profiles?.username || t('comments.anonymous'),
          user_verified: comment.profiles?.verified || false,
          user_avatar: userPhotos.get(comment.user_id) || comment.profiles?.avatar_url || null,
          replies: []
        }
        commentsMap.set(comment.id, commentObj)

        if (!comment.parent_id) {
          rootComments.push(commentObj)
        }
      })

      // Attacher les réponses aux commentaires parents
      commentsData?.forEach((comment: any) => {
        if (comment.parent_id && commentsMap.has(comment.parent_id)) {
          const parent = commentsMap.get(comment.parent_id)!
          const reply = commentsMap.get(comment.id)!
          parent.replies!.push(reply)
        }
      })

      if (append) {
        setComments((prev) => [...prev, ...rootComments])
      } else {
        setComments(rootComments)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitComment() {
    if (!user || !newComment.trim()) return

    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('ad_comments')
        .insert([{
          ad_id: adId,
          user_id: user.id,
          content: newComment.trim(),
          parent_id: null
        }])

      if (error) throw error

      setNewComment('')
      setPage(1)
      await fetchComments(1, false)
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReportComment() {
    if (!user || !reportModal || !reportReason.trim()) return

    try {
      setReportSubmitting(true)

      // Insérer dans la table reports
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_type: 'comment',
          reported_id: reportModal.commentId,
          reason: reportReason.trim(),
          status: 'pending'
        })

      if (error) throw error

      // Afficher le message de succès
      setShowSuccessMessage(true)
      setReportModal(null)
      setReportReason('')

      // Masquer le message après 3 secondes
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    } catch (error) {
      console.error('Erreur lors du signalement:', error)
      alert(t('comments.reportError'))
    } finally {
      setReportSubmitting(false)
    }
  }

  async function loadMoreComments() {
    const nextPage = page + 1
    setPage(nextPage)
    await fetchComments(nextPage, true)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    // Format de la date et heure
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const fullDateTime = `${day}/${month}/${year} ${hours}:${minutes}`

    if (diffMins < 1) return t('comments.justNow')
    if (diffMins < 60) return t('comments.minutesAgo', { minutes: diffMins })
    if (diffHours < 24) return `${t('comments.today')} ${hours}:${minutes}`
    if (diffDays === 1) return `${t('comments.yesterday')} ${hours}:${minutes}`
    return fullDateTime
  }

  function CommentItem({ comment, isReply = false }: { comment: AdComment; isReply?: boolean }) {
    const isOwner = comment.user_id === adOwnerId
    const canReply = user && user.id === adOwnerId && !isReply
    const [localReplyContent, setLocalReplyContent] = useState('')
    const [showReplyForm, setShowReplyForm] = useState(false)

    const handleLocalSubmitReply = async () => {
      if (!user || !localReplyContent.trim()) return

      try {
        setSubmitting(true)

        const { error } = await supabase
          .from('ad_comments')
          .insert([{
            ad_id: adId,
            user_id: user.id,
            content: localReplyContent.trim(),
            parent_id: comment.id
          }])

        if (error) throw error

        setLocalReplyContent('')
        setShowReplyForm(false)
        setPage(1)
        await fetchComments(1, false)
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la réponse:', error)
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isReply ? 'ml-12 mt-3' : ''}`}
      >
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                {comment.user_avatar ? (
                  <img
                    src={comment.user_avatar}
                    alt={comment.username || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {comment.username?.[0]?.toUpperCase() || 'A'}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm">{comment.username}</span>
                  {comment.user_verified && (
                    <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 p-0.5 rounded-full">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {isOwner && (
                    <span className="bg-pink-500/20 text-pink-400 text-xs px-2 py-0.5 rounded-full font-medium">
                      {t('comments.owner')}
                    </span>
                  )}
                </div>
                <span className="text-gray-400 text-xs">{formatDate(comment.created_at)}</span>
              </div>
            </div>

            {user && user.id !== comment.user_id && (
              <button
                onClick={() => setReportModal({ commentId: comment.id, username: comment.username || 'cet utilisateur' })}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title={t('comments.report')}
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-gray-200 text-sm leading-relaxed mb-3">{comment.content}</p>

          {canReply && !showReplyForm && (
            <button
              onClick={() => setShowReplyForm(true)}
              className="flex items-center gap-1 text-pink-400 hover:text-pink-300 text-xs font-medium transition-colors"
            >
              <Reply className="w-3 h-3" />
              {t('comments.reply')}
            </button>
          )}

          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              <textarea
                value={localReplyContent}
                onChange={(e) => setLocalReplyContent(e.target.value)}
                placeholder={t('comments.yourReply')}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleLocalSubmitReply}
                  disabled={!localReplyContent.trim() || submitting}
                  className="flex items-center gap-1 bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                  {t('comments.send')}
                </button>
                <button
                  onClick={() => {
                    setShowReplyForm(false)
                    setLocalReplyContent('')
                  }}
                  className="text-gray-400 hover:text-white text-xs font-medium transition-colors px-3"
                >
                  {t('comments.cancel')}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Réponses */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3 mt-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-pink-500" />
        <h3 className="text-xl font-bold text-white">
          {t('comments.title')} {totalCount > 0 && `(${totalCount})`}
        </h3>
      </div>

      {/* Formulaire d'ajout de commentaire */}
      {user ? (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('comments.addComment')}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {t('comments.publish')}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-6 text-center">
          <p className="text-gray-400 text-sm">
            {t('comments.loginToComment')}
          </p>
        </div>
      )}

      {/* Liste des commentaires */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">{t('comments.noComments')}</p>
          <p className="text-gray-500 text-sm mt-1">{t('comments.beFirst')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>

          {/* Bouton Voir plus */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMoreComments}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('comments.loading')}
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    {t('comments.loadMore', { count: totalCount - comments.length })}
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Message de succès */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Flag className="w-5 h-5" />
            <span className="font-medium">{t('comments.reportSuccess')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de signalement */}
      <AnimatePresence>
        {reportModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReportModal(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {t('comments.reportThisComment')}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {t('comments.fromUser', { username: reportModal.username })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReportModal(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder={t('comments.reportPlaceholder')}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none mb-4"
                  rows={4}
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setReportModal(null)}
                    className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                  >
                    {t('comments.cancel')}
                  </button>
                  <button
                    onClick={handleReportComment}
                    disabled={!reportReason.trim() || reportSubmitting}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-red-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {reportSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Flag className="w-4 h-4" />
                    )}
                    {t('comments.report')}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
