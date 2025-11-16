'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, MoreVertical, Image as ImageIcon, User, Flag, Trash2, BellOff, Bell, Loader2, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useMessages as useMessagesContext } from '@/contexts/MessagesContext'
import { useMessages as useSupabaseMessages, useConversations } from '@/hooks/useMessages'
import { supabase } from '@/lib/supabase'

export default function ConversationPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { getConversation, deleteConversation, markAsRead } = useMessagesContext()
  const conversationId = params.id as string
  const { conversations } = useConversations()

  // Utiliser le hook Supabase pour les messages en temps réel
  const { messages: supabaseMessages, loading, error, sendMessage: sendSupabaseMessage } = useSupabaseMessages(conversationId)

  const [newMessage, setNewMessage] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedMessageToReport, setSelectedMessageToReport] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [viewingImage, setViewingImage] = useState<string | null>(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [checkingBlock, setCheckingBlock] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasScrolledRef = useRef(false)

  const conversation = getConversation(conversationId)

  // Vérifier si l'utilisateur est bloqué
  useEffect(() => {
    async function checkIfBlocked() {
      if (!user || !conversation) {
        setCheckingBlock(false)
        return
      }

      // Trouver l'ID de l'autre utilisateur
      const currentConv = conversations.find(c => c.id === conversationId)
      if (!currentConv) {
        setCheckingBlock(false)
        return
      }

      const otherUserId = currentConv.user1_id === user.id ? currentConv.user2_id : currentConv.user1_id

      try {
        const { data: blockData1 } = await supabase
          .from('blocked_users')
          .select('id')
          .eq('user_id', otherUserId)
          .eq('blocked_user_id', user.id)
          .maybeSingle()

        const { data: blockData2 } = await supabase
          .from('blocked_users')
          .select('id')
          .eq('user_id', user.id)
          .eq('blocked_user_id', otherUserId)
          .maybeSingle()

        setIsBlocked(!!(blockData1 || blockData2))
      } catch (error) {
        console.error('Erreur lors de la vérification du blocage:', error)
      } finally {
        setCheckingBlock(false)
      }
    }

    checkIfBlocked()
  }, [user, conversation, conversationId, conversations])

  // Transformer les messages Supabase au format attendu
  const messages = supabaseMessages.map(msg => ({
    id: msg.id,
    senderId: msg.sender_id,
    text: msg.content,
    timestamp: msg.created_at,
    isOwn: msg.sender_id === user?.id,
    read: msg.read,
    image: undefined
  }))

  // Redirect if conversation doesn't exist or if blocked (after loading completes)
  useEffect(() => {
    if (!loading && !checkingBlock) {
      if (!conversation) {
        router.push('/messages')
      } else if (isBlocked) {
        router.push('/messages')
      }
    }
  }, [loading, checkingBlock, conversation, isBlocked, router])

  // Marquer les messages comme lus et rafraîchir le compteur
  useEffect(() => {
    if (conversationId && !loading) {
      // Attendre un petit délai pour que markMessagesAsRead de useSupabaseMessages s'exécute
      const timer = setTimeout(() => {
        markAsRead(conversationId)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [conversationId, loading, markAsRead])

  useEffect(() => {
    // Scroll initial une seule fois
    if (conversationId && !hasScrolledRef.current && messages.length > 0) {
      hasScrolledRef.current = true
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      }, 100)
    }
  }, [conversationId, messages.length])

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newMessage.trim() === '') return

    const success = await sendSupabaseMessage(newMessage)
    if (success) {
      setNewMessage('')
      inputRef.current?.focus()

      // Scroll vers le bas après l'envoi d'un message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return 'À l\'instant'
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const handleViewProfile = () => {
    setShowMenu(false)
    // Rediriger vers le profil de l'annonce
    router.push(`/ads/${conversation?.adId}`)
  }

  const handleReport = (messageId?: string) => {
    setShowMenu(false)
    setSelectedMessageToReport(messageId || null)
    setShowReportModal(true)
  }

  const submitReport = async () => {
    if (!reportReason || !user) return

    try {
      setSubmittingReport(true)

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_type: 'message',
          reported_id: selectedMessageToReport,
          reason: reportReason,
          description: reportDescription || null,
          status: 'pending'
        })

      if (error) throw error

      alert('Signalement envoyé avec succès')
      setShowReportModal(false)
      setReportReason('')
      setReportDescription('')
      setSelectedMessageToReport(null)
    } catch (error) {
      console.error('Erreur lors du signalement:', error)
      alert('Erreur lors de l\'envoi du signalement')
    } finally {
      setSubmittingReport(false)
    }
  }

  const handleDelete = () => {
    setShowMenu(false)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    setShowDeleteModal(false)
    await deleteConversation(conversationId)
    router.push('/messages')
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
  }

  const handleToggleNotifications = () => {
    setShowMenu(false)
    setNotificationsEnabled(!notificationsEnabled)
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSendImage = async () => {
    // Pour l'instant, on ne gère pas l'envoi d'images via Supabase
    // Cette fonctionnalité nécessite Supabase Storage
    alert('L\'envoi d\'images sera bientôt disponible')
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCancelImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!user) {
    router.push('/auth')
    return null
  }

  // État de chargement
  if (loading) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-gray-400">Chargement de la conversation...</p>
        </div>
      </div>
    )
  }

  // Don't render if conversation doesn't exist - useEffect will handle redirect
  if (!conversation) {
    return null
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>

            <div className="relative">
              {conversation.avatar && !conversation.avatar.includes('picsum.photos') ? (
                <img
                  src={conversation.avatar}
                  alt={conversation.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {conversation.username.charAt(0).toUpperCase()}
                </div>
              )}
              {conversation.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
              )}
            </div>

            <div>
              <h2 className="text-white font-semibold">{conversation.username}</h2>
              <p className="text-xs text-gray-400">
                {conversation.online ? 'En ligne' : 'Hors ligne'}
              </p>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="py-1">
                    {/* Voir le profil */}
                    <button
                      onClick={handleViewProfile}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-700 transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Voir le profil</span>
                    </button>

                    {/* Toggle Notifications */}
                    <button
                      onClick={handleToggleNotifications}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-700 transition-colors text-left"
                    >
                      {notificationsEnabled ? (
                        <>
                          <BellOff className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Désactiver les notifications</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Activer les notifications</span>
                        </>
                      )}
                    </button>

                    {/* Divider */}
                    <div className="border-t border-gray-700 my-1" />

                    {/* Signaler */}
                    <button
                      onClick={() => handleReport()}
                      className="w-full flex items-center gap-3 px-4 py-3 text-orange-400 hover:bg-gray-700 transition-colors text-left"
                    >
                      <Flag className="w-4 h-4" />
                      <span className="text-sm">Signaler</span>
                    </button>

                    {/* Supprimer */}
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-700 transition-colors text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Supprimer la conversation</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6" style={{ overflowY: 'scroll', WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-4xl mx-auto space-y-4 pb-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
                {message.image ? (
                  <div
                    className={`rounded-2xl overflow-hidden ${
                      message.isOwn
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 p-1'
                        : 'bg-gray-800 p-1'
                    }`}
                  >
                    <img
                      src={message.image}
                      alt="Image envoyée"
                      className="w-full h-auto max-w-xs rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setViewingImage(message.image!)
                      }}
                    />
                    {message.text && (
                      <p className="text-sm text-white px-3 py-2">{message.text}</p>
                    )}
                  </div>
                ) : (
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.isOwn
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                )}
                <p className={`text-xs text-gray-500 mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleImageClick}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <ImageIcon className="w-6 h-6" />
            </button>

            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className="w-full bg-gray-800 text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              />
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              disabled={newMessage.trim() === ''}
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                newMessage.trim() === ''
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
              }`}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCancelImage}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-4 max-w-sm w-full border border-gray-800 shadow-2xl"
            >
              {/* Image Preview */}
              <div className="relative mb-4">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-auto max-h-64 object-contain rounded-xl"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelImage}
                  className="flex-1 bg-gray-800 text-white py-2.5 rounded-xl font-medium hover:bg-gray-700 transition-colors text-sm"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendImage}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2.5 rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-colors text-sm"
                >
                  Envoyer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-800 shadow-2xl"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Supprimer la conversation
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-center text-sm mb-6">
                Êtes-vous sûr de vouloir supprimer cette conversation avec <span className="text-white font-medium">{conversation?.username}</span> ? Cette action est irréversible.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800 shadow-2xl"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="w-6 h-6 text-orange-500" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Signaler {selectedMessageToReport ? 'un message' : 'la conversation'}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-center text-sm mb-6">
                Aidez-nous à garder notre communauté sûre en signalant ce contenu inapproprié.
              </p>

              {/* Reason Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Raison du signalement *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none text-sm"
                >
                  <option value="">Sélectionnez une raison</option>
                  <option value="spam">Spam</option>
                  <option value="harassment">Harcèlement</option>
                  <option value="inappropriate">Contenu inapproprié</option>
                  <option value="scam">Arnaque</option>
                  <option value="fake">Faux profil</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Décrivez le problème..."
                  className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none text-sm resize-none"
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowReportModal(false)
                    setReportReason('')
                    setReportDescription('')
                    setSelectedMessageToReport(null)
                  }}
                  className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={submitReport}
                  disabled={!reportReason || submittingReport}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingReport ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    'Signaler'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {viewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setViewingImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full"
            >
              <img
                src={viewingImage}
                alt="Image en grand"
                className="w-full h-auto max-h-[90vh] object-contain rounded-2xl"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewingImage(null)}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/80 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
