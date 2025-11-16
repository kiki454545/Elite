'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MessageCircle, Plus, Clock, CheckCircle, AlertCircle, Send, X } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface TicketMessage {
  id: string
  ticket_id: string
  user_id: string
  message: string
  is_admin: boolean
  created_at: string
  user?: {
    username: string
  }
}

interface SupportTicket {
  id: string
  user_id: string
  subject: string
  message: string
  status: 'open' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  updated_at: string
}

export default function SupportPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Nouveau ticket
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Réponse
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  useEffect(() => {
    if (user) {
      loadTickets()
    }
  }, [user])

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id)
    }
  }, [selectedTicket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadTickets = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTickets(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (ticketId: string) => {
    try {
      setLoadingMessages(true)
      const { data, error } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          user:profiles(username)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !subject.trim() || !message.trim()) return

    setError('')
    setSubmitting(true)

    try {
      // Créer le ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: subject.trim(),
          message: message.trim(),
          priority,
          status: 'open'
        })
        .select()
        .single()

      if (ticketError) throw ticketError

      // Créer le premier message
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketData.id,
          user_id: user.id,
          message: message.trim(),
          is_admin: false
        })

      if (messageError) throw messageError

      // Recharger les tickets
      await loadTickets()

      // Réinitialiser le formulaire
      setSubject('')
      setMessage('')
      setPriority('normal')
      setShowNewTicket(false)
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error)
      setError('Erreur lors de la création du ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedTicket || !replyMessage.trim()) return

    setSendingReply(true)

    try {
      // Créer le message
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          message: replyMessage.trim(),
          is_admin: false
        })

      if (messageError) throw messageError

      // Mettre à jour le statut du ticket si fermé
      if (selectedTicket.status === 'closed') {
        await supabase
          .from('support_tickets')
          .update({ status: 'open' })
          .eq('id', selectedTicket.id)

        await loadTickets()
      }

      // Recharger les messages
      await loadMessages(selectedTicket.id)
      setReplyMessage('')
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    } finally {
      setSendingReply(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'closed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'En attente'
      case 'closed':
        return 'Résolu'
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500'
      case 'high':
        return 'text-orange-500'
      case 'normal':
        return 'text-blue-500'
      case 'low':
        return 'text-gray-500'
      default:
        return 'text-gray-500'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent'
      case 'high':
        return 'Haute'
      case 'normal':
        return 'Normale'
      case 'low':
        return 'Basse'
      default:
        return priority
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
    <div className="min-h-screen bg-gray-950">
      <Header title="Support" showBackButton={true} backUrl="/my-ads" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Vue de conversation si un ticket est sélectionné */}
        {selectedTicket ? (
          <div className="space-y-4">
            {/* En-tête du ticket */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-400 hover:text-white transition-colors mb-3 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Retour à mes tickets
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      {getStatusIcon(selectedTicket.status)}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(selectedTicket.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className={`font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                          Priorité: {getPriorityText(selectedTicket.priority)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  selectedTicket.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {getStatusText(selectedTicket.status)}
                </span>
              </div>
            </div>

            {/* Conversation */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
              {/* Messages */}
              <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Aucun message
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[70%] ${msg.is_admin ? 'order-1' : 'order-2'}`}>
                          <div className={`rounded-2xl p-4 ${
                            msg.is_admin
                              ? 'bg-purple-500/20 border border-purple-500/30'
                              : 'bg-gray-800 border border-gray-700'
                          }`}>
                            {msg.is_admin && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                  <MessageCircle className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-xs font-medium text-purple-400">Support</span>
                              </div>
                            )}
                            <p className="text-white whitespace-pre-wrap">{msg.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Formulaire de réponse */}
              {selectedTicket.status !== 'closed' && (
                <div className="border-t border-gray-800 p-4">
                  <form onSubmit={handleSendReply} className="flex gap-3">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-purple-500 focus:outline-none"
                      disabled={sendingReply}
                    />
                    <button
                      type="submit"
                      disabled={sendingReply || !replyMessage.trim()}
                      className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sendingReply ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </div>
              )}

              {selectedTicket.status === 'closed' && (
                <div className="border-t border-gray-800 p-4 bg-green-500/10">
                  <p className="text-green-400 text-sm text-center">
                    ✓ Ce ticket a été résolu et fermé
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Header avec bouton nouveau ticket */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Centre de support</h1>
                <p className="text-gray-400">Gérez vos demandes d'assistance</p>
              </div>
              <button
                onClick={() => setShowNewTicket(!showNewTicket)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nouveau ticket
              </button>
            </div>

            {/* Formulaire nouveau ticket */}
            <AnimatePresence>
              {showNewTicket && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Créer un nouveau ticket</h2>
                    <button
                      onClick={() => setShowNewTicket(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sujet
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Décrivez brièvement votre problème..."
                        className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Priorité
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                      >
                        <option value="low">Basse</option>
                        <option value="normal">Normale</option>
                        <option value="high">Haute</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Décrivez votre problème en détail..."
                        rows={6}
                        className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
                        required
                      />
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Envoyer le ticket
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewTicket(false)
                          setSubject('')
                          setMessage('')
                          setPriority('normal')
                          setError('')
                        }}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Liste des tickets */}
            {tickets.length === 0 ? (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Aucun ticket</h3>
                <p className="text-gray-400 mb-6">
                  Vous n'avez pas encore créé de ticket de support
                </p>
                <button
                  onClick={() => setShowNewTicket(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Créer mon premier ticket
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-gray-800 rounded-lg">
                          {getStatusIcon(ticket.status)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{ticket.subject}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                              {getPriorityText(ticket.priority)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                        ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {getStatusText(ticket.status)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{ticket.message}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
