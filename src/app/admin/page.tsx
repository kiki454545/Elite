'use client'

import { motion } from 'framer-motion'
import { Shield, Ticket, CheckCircle, Clock, XCircle, AlertCircle, User, Calendar, MessageSquare, Users, Search, Flag, Eye, History, Filter, ChevronLeft, ChevronRight, Coins, Ban } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface SupportTicket {
  id: string
  user_id: string
  subject: string
  message: string
  status: 'open' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  user?: {
    username: string
    rank: string
  }
}

interface VerificationRequest {
  id: string
  user_id: string
  verification_photos: string[]
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  admin_id?: string
  created_at: string
  reviewed_at?: string
  user?: {
    username: string
  }
}

interface Profile {
  id: string
  username: string
  email: string
  age?: number
  verified: boolean
  rank: string
  is_admin: boolean
  created_at: string
  adsCount?: number
  banned_until?: string | null
  ban_reason?: string | null
  banned_at?: string | null
  banned_by?: string | null
  elite_coins?: number
}

interface Report {
  id: string
  reporter_id: string
  reported_type: 'profile' | 'comment' | 'message'
  reported_id: string
  reason: string
  description?: string
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed'
  admin_notes?: string
  admin_id?: string
  created_at: string
  reviewed_at?: string
  reporter?: {
    username: string
  }
  reported_profile?: {
    username: string
  }
  reported_comment?: {
    id: string
    content: string
    created_at: string
    user_id: string
    ad_id: string
    user: {
      username: string
    }
  }
  reported_message?: {
    id: string
    content: string
    created_at: string
    sender_id: string
    conversation_id: string
    sender: {
      username: string
    }
  }
}

interface AdminHistoryEntry {
  id: string
  admin_id: string
  admin_username: string
  action_type: 'ticket_closed' | 'verification_approved' | 'verification_rejected' | 'report_resolved' | 'profile_deleted' | 'profile_verified'
  target_type: 'ticket' | 'verification' | 'report' | 'profile'
  target_id: string
  target_username?: string
  details?: string
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'tickets' | 'verification' | 'profiles' | 'reports' | 'history'>('tickets')

  // Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [adminResponse, setAdminResponse] = useState('')
  const [ticketMessages, setTicketMessages] = useState<any[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [closeReason, setCloseReason] = useState('')
  const [ticketToClose, setTicketToClose] = useState<string | null>(null)

  // Verification
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [verificationLoading, setVerificationLoading] = useState(true)
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Profiles
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [profileSearch, setProfileSearch] = useState('')
  const [profilesPage, setProfilesPage] = useState(1)
  const [totalProfilesCount, setTotalProfilesCount] = useState(0)
  const PROFILES_PER_PAGE = 20

  // Ban system
  const [showBanModal, setShowBanModal] = useState(false)
  const [selectedProfileForBan, setSelectedProfileForBan] = useState<Profile | null>(null)
  const [banDuration, setBanDuration] = useState<string>('1') // En jours
  const [banReason, setBanReason] = useState('')
  const [banType, setBanType] = useState<'temporary' | 'permanent'>('temporary')
  const [banIpToo, setBanIpToo] = useState(false) // Option pour bannir l'IP aussi
  const [processingBan, setProcessingBan] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Elite Coins management
  const [showCoinsModal, setShowCoinsModal] = useState(false)
  const [selectedProfileForCoins, setSelectedProfileForCoins] = useState<Profile | null>(null)
  const [coinsAmount, setCoinsAmount] = useState<string>('')
  const [coinsOperation, setCoinsOperation] = useState<'add' | 'remove'>('add')
  const [processingCoins, setProcessingCoins] = useState(false)

  // Reports
  const [reports, setReports] = useState<Report[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [conversationMessages, setConversationMessages] = useState<any[]>([])
  const [showConversation, setShowConversation] = useState(false)
  const [loadingConversation, setLoadingConversation] = useState(false)

  // History
  const [history, setHistory] = useState<AdminHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historySearch, setHistorySearch] = useState('')
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all')
  const [historyDateFilter, setHistoryDateFilter] = useState<string>('all')
  const [expandedHistoryTicket, setExpandedHistoryTicket] = useState<string | null>(null)
  const [historyTicketMessages, setHistoryTicketMessages] = useState<any[]>([])

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'message' | 'comment', id: string } | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState<{ type: 'message' | 'comment' } | null>(null)

  // Total EliteCoins
  const [totalCoins, setTotalCoins] = useState(0)
  const [coinsLoading, setCoinsLoading] = useState(true)

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    async function checkAdmin() {
      if (!user?.id) {
        router.push('/auth')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        router.push('/')
        return
      }

      setIsAdmin(true)
    }

    if (!loading) {
      checkAdmin()
    }
  }, [user, loading, router])

  // Charger les tickets
  useEffect(() => {
    if (isAdmin) {
      loadTickets()
    }
  }, [isAdmin])

  // Charger les demandes de vérification
  useEffect(() => {
    if (isAdmin) {
      loadVerificationRequests()
    }
  }, [isAdmin])

  // Charger les profils
  useEffect(() => {
    if (isAdmin) {
      loadProfiles()
    }
  }, [isAdmin, profilesPage, profileSearch])

  // Charger les signalements
  useEffect(() => {
    if (isAdmin) {
      loadReports()
    }
  }, [isAdmin])

  // Charger l'historique
  useEffect(() => {
    if (isAdmin) {
      loadHistory()
    }
  }, [isAdmin])

  // Charger le total des EliteCoins
  useEffect(() => {
    if (isAdmin) {
      loadTotalCoins()
    }
  }, [isAdmin])

  async function loadTotalCoins() {
    try {
      setCoinsLoading(true)

      // Utiliser une fonction RPC pour calculer la somme côté serveur (plus efficace)
      // Sinon, on doit charger tous les profils par batch
      let allProfiles: any[] = []
      let from = 0
      const batchSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('profiles')
          .select('elite_coins')
          .range(from, from + batchSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allProfiles = [...allProfiles, ...data]
          from += batchSize
          hasMore = data.length === batchSize
        } else {
          hasMore = false
        }
      }

      const total = allProfiles.reduce((sum, profile) => sum + (profile.elite_coins || 0), 0)
      setTotalCoins(total)
    } catch (error) {
      console.error('Erreur lors du chargement du total des coins:', error)
    } finally {
      setCoinsLoading(false)
    }
  }

  async function loadTickets() {
    try {
      setTicketsLoading(true)
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      // Charger les infos utilisateur pour chaque ticket avec le rang
      const ticketsWithUsers = await Promise.all(
        (data || []).map(async (ticket) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('username, rank')
            .eq('id', ticket.user_id)
            .single()

          return {
            ...ticket,
            user: userData
          }
        })
      )

      // Trier par rang (Elite > VIP > Plus > Standard) puis par date (plus ancien d'abord)
      const rankPriority: Record<string, number> = {
        'elite': 4,
        'vip': 3,
        'plus': 2,
        'standard': 1
      }

      const sortedTickets = ticketsWithUsers.sort((a, b) => {
        const rankA = rankPriority[a.user?.rank || 'standard'] || 1
        const rankB = rankPriority[b.user?.rank || 'standard'] || 1

        // Si les rangs sont différents, trier par rang (du plus élevé au plus bas)
        if (rankA !== rankB) {
          return rankB - rankA
        }

        // Si même rang, trier par date (du plus ancien au plus récent)
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })

      setTickets(sortedTickets)
    } catch (error) {
      console.error('Erreur lors du chargement des tickets:', error)
    } finally {
      setTicketsLoading(false)
    }
  }

  async function loadVerificationRequests() {
    try {
      setVerificationLoading(true)
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          user:profiles!verification_requests_user_id_fkey(username)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVerificationRequests(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des demandes de vérification:', error)
    } finally {
      setVerificationLoading(false)
    }
  }

  async function loadTicketMessages(ticketId: string) {
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
      setTicketMessages(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  async function sendAdminReply(ticketId: string, message: string) {
    try {
      // Créer le message admin
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          user_id: user?.id,
          message: message.trim(),
          is_admin: true
        })

      if (messageError) throw messageError

      // Recharger les messages
      await loadTicketMessages(ticketId)
      setAdminResponse('')
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error)
    }
  }

  async function closeTicket(ticketId: string, reason?: string) {
    try {
      // Si une raison est fournie, l'envoyer comme message admin
      if (reason && reason.trim()) {
        await supabase
          .from('ticket_messages')
          .insert({
            ticket_id: ticketId,
            user_id: user?.id,
            message: reason.trim(),
            is_admin: true
          })
      }

      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', ticketId)

      if (error) throw error

      // Ajouter à l'historique
      const ticket = tickets.find(t => t.id === ticketId)
      await addHistoryEntry(
        'ticket_closed',
        'ticket',
        ticketId,
        ticket?.user?.username,
        { subject: ticket?.subject, reason }
      )

      await loadTickets()
      setSelectedTicket(null)
      setAdminResponse('')
      setShowCloseModal(false)
      setCloseReason('')
      setTicketToClose(null)
    } catch (error) {
      console.error('Erreur lors de la fermeture du ticket:', error)
    }
  }

  async function approveVerification(requestId: string) {
    try {
      // Mettre à jour la demande de vérification
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          admin_id: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (requestError) throw requestError

      // Mettre à jour le profil pour marquer comme vérifié
      const request = verificationRequests.find(r => r.id === requestId)
      if (request) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ verified: true })
          .eq('id', request.user_id)

        if (profileError) throw profileError

        // Ajouter à l'historique
        await addHistoryEntry(
          'verification_approved',
          'verification',
          requestId,
          request.user?.username
        )
      }

      await loadVerificationRequests()
      setSelectedVerification(null)
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error)
    }
  }

  async function rejectVerification(requestId: string, reason: string) {
    try {
      const request = verificationRequests.find(r => r.id === requestId)

      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          admin_id: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error

      // Ajouter à l'historique
      await addHistoryEntry(
        'verification_rejected',
        'verification',
        requestId,
        request?.user?.username,
        { reason }
      )

      await loadVerificationRequests()
      setSelectedVerification(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
    }
  }

  async function loadProfiles() {
    try {
      setProfilesLoading(true)

      // Compter le nombre total de profils (avec recherche si applicable)
      let countQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (profileSearch.trim()) {
        countQuery = countQuery.or(`username.ilike.%${profileSearch}%,email.ilike.%${profileSearch}%`)
      }

      const { count: totalCount } = await countQuery
      setTotalProfilesCount(totalCount || 0)

      // Charger seulement la page actuelle (20 profils)
      const from = (profilesPage - 1) * PROFILES_PER_PAGE
      const to = from + PROFILES_PER_PAGE - 1

      let query = supabase
        .from('profiles')
        .select('id, username, email, age, verified, rank, is_admin, created_at, banned_until, ban_reason, banned_at, banned_by, elite_coins')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (profileSearch.trim()) {
        query = query.or(`username.ilike.%${profileSearch}%,email.ilike.%${profileSearch}%`)
      }

      const { data, error } = await query

      if (error) throw error

      // Compter les annonces pour chaque profil
      const profilesWithAds = await Promise.all(
        (data || []).map(async (profile) => {
          const { count } = await supabase
            .from('ads')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)

          return {
            ...profile,
            adsCount: count || 0
          }
        })
      )

      setProfiles(profilesWithAds)
    } catch (error) {
      console.error('Erreur lors du chargement des profils:', error)
    } finally {
      setProfilesLoading(false)
    }
  }

  async function banUser(userId: string, duration: string, reason: string, isPermanent: boolean) {
    console.log('🔨 banUser appelé avec:', { userId, duration, reason, isPermanent, adminId: user?.id })

    try {
      setProcessingBan(true)

      // Utiliser la fonction RPC pour bannir l'utilisateur (contourne les RLS policies)
      const { data, error } = await supabase.rpc('ban_user', {
        target_user_id: userId,
        ban_duration_days: isPermanent ? null : parseInt(duration),
        ban_reason_text: reason,
        admin_user_id: user?.id
      })

      console.log('📊 Résultat RPC ban_user:', { data, error })

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        setToast({
          message: `Erreur: ${error.message}`,
          type: 'error'
        })
        setTimeout(() => setToast(null), 5000)
        throw error
      }

      console.log('✅ Ban appliqué avec succès!')

      // Si l'option est cochée, bannir aussi l'IP de l'utilisateur
      if (banIpToo && selectedProfileForBan) {
        // Récupérer l'IP de l'utilisateur depuis son profil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('last_ip')
          .eq('id', userId)
          .single()

        if (profileData?.last_ip) {
          const { error: ipBanError } = await supabase.rpc('ban_ip', {
            target_ip: profileData.last_ip,
            ban_reason: `IP de ${selectedProfileForBan.username} - ${reason}`,
            ban_duration_days: isPermanent ? null : parseInt(duration),
            admin_user_id: user?.id
          })

          if (ipBanError) {
            console.error('Erreur lors du ban de l\'IP:', ipBanError)
            setToast({
              message: `Utilisateur banni, mais erreur lors du ban de l'IP: ${ipBanError.message}`,
              type: 'error'
            })
            setTimeout(() => setToast(null), 5000)
          } else {
            console.log('✅ IP bannie avec succès:', profileData.last_ip)
          }
        } else {
          console.warn('⚠️ Pas d\'IP trouvée pour cet utilisateur')
        }
      }

      // Ajouter à l'historique
      await addHistoryEntry(
        'profile_banned' as any,
        'profile',
        userId,
        selectedProfileForBan?.username,
        {
          duration: isPermanent ? 'Permanent' : `${duration} jours`,
          reason,
          ipBanned: banIpToo
        }
      )

      await loadProfiles()
      setShowBanModal(false)
      setSelectedProfileForBan(null)
      setBanDuration('1')
      setBanReason('')
      setBanType('temporary')
      setBanIpToo(false)

      const successMessage = banIpToo
        ? `${selectedProfileForBan?.username} et son IP ont été bannis avec succès`
        : `${selectedProfileForBan?.username} a été banni avec succès`

      setToast({
        message: successMessage,
        type: 'success'
      })
      setTimeout(() => setToast(null), 5000)
    } catch (error: any) {
      console.error('❌ Erreur lors du bannissement:', error)
      setToast({
        message: `Erreur lors du bannissement: ${error.message || 'Erreur inconnue'}`,
        type: 'error'
      })
      setTimeout(() => setToast(null), 5000)
    } finally {
      setProcessingBan(false)
    }
  }

  async function unbanUser(userId: string, username: string) {
    try {
      // Utiliser la fonction RPC pour débannir l'utilisateur (contourne les RLS policies)
      const { data, error } = await supabase.rpc('unban_user', {
        target_user_id: userId
      })

      if (error) {
        console.error('❌ Erreur lors du débannissement:', error)
        setToast({
          message: `Erreur: ${error.message}`,
          type: 'error'
        })
        setTimeout(() => setToast(null), 5000)
        throw error
      }

      console.log('✅ Utilisateur débanni avec succès!')

      // Ajouter à l'historique
      await addHistoryEntry(
        'profile_unbanned' as any,
        'profile',
        userId,
        username,
        null
      )

      await loadProfiles()

      setToast({
        message: `${username} a été débanni avec succès`,
        type: 'success'
      })
      setTimeout(() => setToast(null), 5000)
    } catch (error: any) {
      console.error('Erreur lors du débannissement:', error)
      setToast({
        message: `Erreur lors du débannissement: ${error.message || 'Erreur inconnue'}`,
        type: 'error'
      })
      setTimeout(() => setToast(null), 5000)
    }
  }

  async function manageCoins(userId: string, amount: number, operation: 'add' | 'remove') {
    try {
      setProcessingCoins(true)

      // Récupérer le solde actuel
      const { data: profileData } = await supabase
        .from('profiles')
        .select('elite_coins, username')
        .eq('id', userId)
        .single()

      if (!profileData) {
        throw new Error('Profil non trouvé')
      }

      const currentCoins = profileData.elite_coins || 0
      let newCoins = currentCoins

      if (operation === 'add') {
        newCoins = currentCoins + amount
      } else {
        newCoins = Math.max(0, currentCoins - amount) // Ne pas descendre en dessous de 0
      }

      // Mettre à jour le solde
      const { error } = await supabase
        .from('profiles')
        .update({ elite_coins: newCoins })
        .eq('id', userId)

      if (error) {
        setToast({
          message: `Erreur: ${error.message}`,
          type: 'error'
        })
        setTimeout(() => setToast(null), 5000)
        throw error
      }

      // Ajouter à l'historique
      await addHistoryEntry(
        'coins_adjusted' as any,
        'profile',
        userId,
        selectedProfileForCoins?.username,
        {
          operation,
          amount,
          previousBalance: currentCoins,
          newBalance: newCoins
        }
      )

      await loadProfiles()
      setShowCoinsModal(false)
      setSelectedProfileForCoins(null)
      setCoinsAmount('')
      setCoinsOperation('add')

      setToast({
        message: `${operation === 'add' ? 'Ajout' : 'Retrait'} de ${amount} Elite Coins effectué avec succès`,
        type: 'success'
      })
      setTimeout(() => setToast(null), 5000)
    } catch (error: any) {
      console.error('❌ Erreur lors de la gestion des coins:', error)
      setToast({
        message: `Erreur: ${error.message || 'Erreur inconnue'}`,
        type: 'error'
      })
      setTimeout(() => setToast(null), 5000)
    } finally {
      setProcessingCoins(false)
    }
  }

  async function loadReports() {
    try {
      setReportsLoading(true)
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Récupérer les infos des reporters et des profils/commentaires/messages signalés
      const reportsWithDetails = await Promise.all(
        (data || []).map(async (report) => {
          const { data: reporter } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', report.reporter_id)
            .single()

          let reported_profile = null
          let reported_comment = null
          let reported_message = null

          if (report.reported_type === 'profile') {
            const { data: reportedUser } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', report.reported_id)
              .single()
            reported_profile = reportedUser
          } else if (report.reported_type === 'comment') {
            // Charger le commentaire avec les infos de l'auteur
            const { data: commentData } = await supabase
              .from('ad_comments')
              .select(`
                id,
                content,
                created_at,
                user_id,
                ad_id,
                user:profiles!ad_comments_user_id_fkey(username)
              `)
              .eq('id', report.reported_id)
              .maybeSingle()
            reported_comment = commentData
          } else if (report.reported_type === 'message') {
            // Charger le message avec les infos de l'expéditeur
            const { data: messageData } = await supabase
              .from('messages')
              .select(`
                id,
                content,
                created_at,
                sender_id,
                conversation_id,
                sender:profiles!messages_sender_id_fkey(username)
              `)
              .eq('id', report.reported_id)
              .maybeSingle()
            reported_message = messageData
          }

          return {
            ...report,
            reporter,
            reported_profile,
            reported_comment,
            reported_message
          }
        })
      )

      setReports(reportsWithDetails)
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error)
    } finally {
      setReportsLoading(false)
    }
  }

  async function updateReportStatus(reportId: string, status: string, notes?: string) {
    try {
      const report = reports.find(r => r.id === reportId)

      const updateData: any = {
        status,
        reviewed_at: new Date().toISOString(),
        admin_id: user?.id
      }

      if (notes) {
        updateData.admin_notes = notes
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId)

      if (error) throw error

      // Ajouter à l'historique si traité
      if (status !== 'pending') {
        await addHistoryEntry(
          'report_resolved',
          'report',
          reportId,
          report?.reported_profile?.username,
          { status, notes, reason: report?.reason }
        )
      }

      await loadReports()
      setSelectedReport(null)
      setAdminNotes('')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du signalement:', error)
    }
  }

  // Historique
  async function loadHistory() {
    try {
      setHistoryLoading(true)
      const { data, error } = await supabase
        .from('admin_history')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setHistory(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  async function addHistoryEntry(
    actionType: AdminHistoryEntry['action_type'],
    targetType: AdminHistoryEntry['target_type'],
    targetId: string,
    targetUsername?: string,
    details?: any
  ) {
    try {
      const { error } = await supabase
        .from('admin_history')
        .insert({
          admin_id: user?.id,
          admin_username: user?.user_metadata?.username || user?.email || 'Admin',
          action_type: actionType,
          target_type: targetType,
          target_id: targetId,
          target_username: targetUsername,
          details: details ? JSON.stringify(details) : null
        })

      if (error) throw error

      await loadHistory()
    } catch (error) {
      console.error('Erreur lors de l\'ajout à l\'historique:', error)
    }
  }

  async function loadHistoryTicketMessages(ticketId: string) {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          user:profiles(username)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setHistoryTicketMessages(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
      setHistoryTicketMessages([])
    }
  }

  async function loadConversationMessages(conversationId: string) {
    try {
      setLoadingConversation(true)
      setShowConversation(true)

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username),
          receiver:profiles!messages_receiver_id_fkey(username)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setConversationMessages(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement de la conversation:', error)
      setConversationMessages([])
    } finally {
      setLoadingConversation(false)
    }
  }

  function deleteMessage(messageId: string) {
    setDeleteTarget({ type: 'message', id: messageId })
    setShowDeleteModal(true)
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    try {
      if (deleteTarget.type === 'message') {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', deleteTarget.id)

        if (error) throw error
      } else if (deleteTarget.type === 'comment') {
        const { error } = await supabase
          .from('ad_comments')
          .delete()
          .eq('id', deleteTarget.id)

        if (error) throw error
      }

      // Afficher le message de succès
      setShowSuccessMessage({ type: deleteTarget.type })
      setShowDeleteModal(false)
      setDeleteTarget(null)
      await loadReports()

      // Masquer le message après 3 secondes
      setTimeout(() => {
        setShowSuccessMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  function deleteComment(commentId: string) {
    setDeleteTarget({ type: 'comment', id: commentId })
    setShowDeleteModal(true)
  }

  // Helper functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'normal': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4 text-blue-500" />
      case 'in_progress': return <AlertCircle className="w-4 h-4 text-orange-500" />
      case 'closed': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return null
    }
  }

  const getRankBadge = (rank: string) => {
    switch (rank) {
      case 'elite':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900">
            👑 ELITE
          </span>
        )
      case 'vip':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            💎 VIP
          </span>
        )
      case 'plus':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            ⭐ PLUS
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
            Standard
          </span>
        )
    }
  }

  // Computed values
  const pendingTickets = tickets.filter(t => t.status !== 'closed').length
  const pendingVerifications = verificationRequests.filter(v => v.status === 'pending').length
  const pendingReports = reports.filter(r => r.status === 'pending').length
  const totalProfiles = totalProfilesCount

  // Calculer le nombre de pages
  const totalPages = Math.ceil(totalProfilesCount / PROFILES_PER_PAGE)

  // Filtrer l'historique
  const filteredHistory = history.filter(entry => {
    // Filtre par recherche (pseudo ou admin)
    const matchesSearch = !historySearch ||
      entry.target_username?.toLowerCase().includes(historySearch.toLowerCase()) ||
      entry.admin_username.toLowerCase().includes(historySearch.toLowerCase())

    // Filtre par type
    const matchesType = historyTypeFilter === 'all' || entry.action_type.includes(historyTypeFilter)

    // Filtre par date
    let matchesDate = true
    if (historyDateFilter !== 'all') {
      const entryDate = new Date(entry.created_at)
      const now = new Date()

      switch (historyDateFilter) {
        case 'today':
          matchesDate = entryDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = entryDate >= weekAgo
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = entryDate >= monthAgo
          break
      }
    }

    return matchesSearch && matchesType && matchesDate
  })

  // Loading state
  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title="Panel Admin" showBackButton={true} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{pendingTickets}</div>
                <div className="text-sm text-gray-400">Tickets ouverts</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4 border border-purple-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{pendingVerifications}</div>
                <div className="text-sm text-gray-400">Vérifications</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-4 border border-green-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalProfiles}</div>
                <div className="text-sm text-gray-400">Profils</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-4 border border-red-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Flag className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{pendingReports}</div>
                <div className="text-sm text-gray-400">Signalements</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 rounded-xl p-4 border border-amber-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {coinsLoading ? '...' : totalCoins.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">EliteCoins total</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 bg-gray-900 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'tickets'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Ticket className="w-4 h-4" />
              <span className="hidden md:inline">Tickets</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'verification'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden md:inline">Vérifications</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'profiles'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Profils</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'reports'
                ? 'bg-red-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Flag className="w-4 h-4" />
              <span className="hidden md:inline">Signalements</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-gray-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden md:inline">Historique</span>
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'tickets' ? (
          <div className="space-y-4">
            {ticketsLoading ? (
              <div className="text-center text-gray-400 py-12">Chargement...</div>
            ) : tickets.filter(t => t.status !== 'closed').length === 0 ? (
              <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
                <Ticket className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucun ticket en attente</p>
              </div>
            ) : (
              tickets.filter(t => t.status !== 'closed').map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {ticket.user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{ticket.subject}</h3>
                          <AlertCircle className={`w-4 h-4 ${getPriorityColor(ticket.priority)}`} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
                          <User className="w-3 h-3" />
                          <span>{ticket.user?.username || 'Utilisateur inconnu'}</span>
                          {ticket.user?.rank && getRankBadge(ticket.user.rank)}
                          <Calendar className="w-3 h-3 ml-2" />
                          <span>{new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>

                        {selectedTicket?.id === ticket.id ? (
                          <div className="mt-3 space-y-3">
                            {/* Conversation */}
                            <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                              {loadingMessages ? (
                                <div className="text-center text-gray-400 py-4">Chargement...</div>
                              ) : ticketMessages.length === 0 ? (
                                <p className="text-gray-400 text-sm">Aucun message</p>
                              ) : (
                                <div className="space-y-3">
                                  {ticketMessages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                                      <div className={`max-w-[80%] rounded-lg p-3 ${
                                        msg.is_admin
                                          ? 'bg-purple-500/20 border border-purple-500/30'
                                          : 'bg-gray-700'
                                      }`}>
                                        {msg.is_admin && (
                                          <div className="flex items-center gap-2 mb-1">
                                            <MessageSquare className="w-3 h-3 text-purple-400" />
                                            <span className="text-xs font-medium text-purple-400">Support</span>
                                          </div>
                                        )}
                                        <p className="text-white text-sm whitespace-pre-wrap">{msg.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                          {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Formulaire de réponse */}
                            <div className="space-y-2">
                              <textarea
                                value={adminResponse}
                                onChange={(e) => setAdminResponse(e.target.value)}
                                placeholder="Écrivez votre réponse..."
                                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none text-sm resize-none"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (adminResponse.trim()) {
                                      sendAdminReply(ticket.id, adminResponse)
                                    }
                                  }}
                                  disabled={!adminResponse.trim()}
                                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Envoyer la réponse
                                </button>
                                <button
                                  onClick={() => {
                                    setTicketToClose(ticket.id)
                                    setShowCloseModal(true)
                                  }}
                                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all"
                                >
                                  Fermer le ticket
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedTicket(null)
                                    setAdminResponse('')
                                  }}
                                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{ticket.message}</p>
                            <button
                              onClick={() => {
                                setSelectedTicket(ticket)
                                loadTicketMessages(ticket.id)
                              }}
                              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            >
                              Voir la conversation
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : activeTab === 'verification' ? (
          <div className="space-y-4">
            {verificationLoading ? (
              <div className="text-center text-gray-400 py-12">Chargement...</div>
            ) : verificationRequests.filter(v => v.status === 'pending').length === 0 ? (
              <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
                <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucune demande de vérification en attente</p>
              </div>
            ) : (
              verificationRequests.filter(v => v.status === 'pending').map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-900 rounded-xl p-5 border border-gray-800"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {request.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{request.user?.username || 'Utilisateur inconnu'}</h3>
                        {request.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                        {request.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {request.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-3">Photos de vérification ({request.verification_photos?.length || 0})</p>
                    <div className={`grid gap-4 ${request.verification_photos?.length === 1 ? 'grid-cols-1' : request.verification_photos?.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {request.verification_photos?.map((photoUrl, index) => (
                        <div key={index}>
                          <img
                            src={photoUrl}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-gray-700 cursor-pointer hover:border-purple-500 transition-colors"
                            onClick={() => window.open(photoUrl, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {request.status === 'rejected' && request.rejection_reason && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-400">
                        <strong>Raison du rejet:</strong> {request.rejection_reason}
                      </p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    selectedVerification?.id === request.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Raison du rejet (optionnel)..."
                          className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none text-sm resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveVerification(request.id)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => rejectVerification(request.id, rejectionReason)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          >
                            Rejeter
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVerification(null)
                              setRejectionReason('')
                            }}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedVerification(request)}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      >
                        Examiner
                      </button>
                    )
                  )}
                </motion.div>
              ))
            )}
          </div>
        ) : activeTab === 'profiles' ? (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom d'utilisateur ou email..."
                  value={profileSearch}
                  onChange={(e) => {
                    setProfileSearch(e.target.value)
                    setProfilesPage(1) // Réinitialiser à la page 1 lors d'une recherche
                  }}
                  className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:border-green-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Info pagination */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  Affichage de {profiles.length > 0 ? (profilesPage - 1) * PROFILES_PER_PAGE + 1 : 0} à {Math.min(profilesPage * PROFILES_PER_PAGE, totalProfilesCount)} sur {totalProfilesCount} profils
                </span>
                <span className="text-gray-400">
                  Page {profilesPage} / {totalPages}
                </span>
              </div>
            </div>

            {profilesLoading ? (
              <div className="text-center text-gray-400 py-12">Chargement...</div>
            ) : profiles.length === 0 ? (
              <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucun profil trouvé</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {profiles.map((profile, index) => (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {profile.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-semibold">{profile.username}</h3>
                              {profile.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                              {profile.is_admin && <Shield className="w-4 h-4 text-yellow-500" />}
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{profile.email}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{profile.age} ans</span>
                              <span>Rank: {profile.rank}</span>
                              <span>{profile.adsCount} annonce{profile.adsCount !== 1 ? 's' : ''}</span>
                              <span>{new Date(profile.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(() => {
                            // Vérifier si l'utilisateur est actuellement banni
                            const isBanned = profile.ban_reason && (
                              !profile.banned_until || // Ban permanent (pas de date de fin)
                              new Date(profile.banned_until) > new Date() // Ban temporaire encore actif
                            )

                            return isBanned ? (
                              <button
                                onClick={() => unbanUser(profile.id, profile.username)}
                                className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Débannir
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedProfileForBan(profile)
                                  setShowBanModal(true)
                                }}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                              >
                                <Ban className="w-3 h-3" />
                                Bannir
                              </button>
                            )
                          })()}
                          <button
                            onClick={() => {
                              setSelectedProfileForCoins(profile)
                              setShowCoinsModal(true)
                            }}
                            className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                          >
                            <Coins className="w-3 h-3" />
                            Coins
                          </button>
                          <button
                            onClick={() => router.push(`/admin/profile/${profile.id}`)}
                            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Voir
                          </button>
                        </div>
                      </div>
                      {/* Badge de ban si actif */}
                      {(() => {
                        const isBanned = profile.ban_reason && (
                          !profile.banned_until ||
                          new Date(profile.banned_until) > new Date()
                        )

                        return isBanned && (
                          <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                            <div className="flex items-center gap-2 text-xs">
                              <Ban className="w-3 h-3 text-red-400" />
                              <span className="text-red-400 font-medium">
                                {profile.banned_until
                                  ? `Banni jusqu'au ${new Date(profile.banned_until).toLocaleDateString('fr-FR')}`
                                  : 'Banni définitivement'
                                }
                              </span>
                            </div>
                            {profile.ban_reason && (
                              <p className="text-xs text-red-300 mt-1">Raison: {profile.ban_reason}</p>
                            )}
                          </div>
                        )
                      })()}
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setProfilesPage(Math.max(1, profilesPage - 1))}
                      disabled={profilesPage === 1}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium transition-all hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Première page */}
                      {profilesPage > 3 && (
                        <>
                          <button
                            onClick={() => setProfilesPage(1)}
                            className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium transition-all hover:bg-gray-700"
                          >
                            1
                          </button>
                          {profilesPage > 4 && <span className="text-gray-500">...</span>}
                        </>
                      )}

                      {/* Pages autour de la page actuelle */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(profilesPage - 2, totalPages - 4)) + i
                        if (pageNum > totalPages) return null
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setProfilesPage(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              profilesPage === pageNum
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-800 text-white hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}

                      {/* Dernière page */}
                      {profilesPage < totalPages - 2 && (
                        <>
                          {profilesPage < totalPages - 3 && <span className="text-gray-500">...</span>}
                          <button
                            onClick={() => setProfilesPage(totalPages)}
                            className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium transition-all hover:bg-gray-700"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setProfilesPage(Math.min(totalPages, profilesPage + 1))}
                      disabled={profilesPage === totalPages}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium transition-all hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : activeTab === 'reports' ? (
          <div className="space-y-4">
            {reportsLoading ? (
              <div className="text-center text-gray-400 py-12">Chargement...</div>
            ) : reports.filter(r => r.status === 'pending').length === 0 ? (
              <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
                <Flag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucun signalement en attente</p>
              </div>
            ) : (
              reports.filter(r => r.status === 'pending').map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-900 rounded-xl p-5 border border-gray-800"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      <Flag className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">
                          {report.reported_type === 'profile'
                            ? 'Profil signalé'
                            : report.reported_type === 'comment'
                            ? 'Commentaire signalé'
                            : 'Message signalé'}
                        </h3>
                        {report.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                        {report.status === 'reviewed' && <CheckCircle className="w-4 h-4 text-blue-500" />}
                        {report.status === 'action_taken' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {report.status === 'dismissed' && <XCircle className="w-4 h-4 text-gray-500" />}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <User className="w-3 h-3" />
                          <span>Signalé par: {report.reporter?.username || 'Inconnu'}</span>
                          {report.reported_type === 'profile' && report.reported_profile && (
                            <>
                              <span className="mx-1">→</span>
                              <span>Profil: {report.reported_profile.username}</span>
                            </>
                          )}
                          {report.reported_type === 'comment' && report.reported_comment && (
                            <>
                              <span className="mx-1">→</span>
                              <span>Par: {report.reported_comment.user.username}</span>
                            </>
                          )}
                          {report.reported_type === 'message' && report.reported_message && (
                            <>
                              <span className="mx-1">→</span>
                              <span>De: {report.reported_message.sender.username}</span>
                            </>
                          )}
                          <Calendar className="w-3 h-3 ml-2" />
                          <span>{new Date(report.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {report.reported_type === 'profile' && (
                          <button
                            onClick={() => router.push(`/admin/profile/${report.reported_id}`)}
                            className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-2 py-1 rounded transition-all flex items-center gap-1"
                          >
                            <User className="w-3 h-3" />
                            Voir le profil
                          </button>
                        )}
                      </div>

                      {/* Affichage du commentaire signalé */}
                      {report.reported_type === 'comment' && (
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 mb-3">
                          {report.reported_comment ? (
                            <>
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <p className="text-xs text-gray-500">Commentaire signalé :</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => router.push(`/ads/${report.reported_comment?.ad_id}`)}
                                    className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded transition-all flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Voir l'annonce
                                  </button>
                                  <button
                                    onClick={() => deleteComment(report.reported_comment!.id)}
                                    className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded transition-all flex items-center gap-1"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-white mb-2">{report.reported_comment.content}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span>Par: {report.reported_comment.user.username}</span>
                                <span>•</span>
                                <span>{new Date(report.reported_comment.created_at).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              ⚠️ Ce commentaire a été supprimé
                            </p>
                          )}
                        </div>
                      )}

                      {/* Affichage du message signalé */}
                      {report.reported_type === 'message' && (
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 mb-3">
                          {report.reported_message ? (
                            <>
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <p className="text-xs text-gray-500">Message signalé :</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => loadConversationMessages(report.reported_message!.conversation_id)}
                                    className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded transition-all flex items-center gap-1"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    Voir la conversation
                                  </button>
                                  <button
                                    onClick={() => deleteMessage(report.reported_message!.id)}
                                    className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded transition-all flex items-center gap-1"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-white mb-2">{report.reported_message.content}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span>De: {report.reported_message.sender.username}</span>
                                <span>•</span>
                                <span>{new Date(report.reported_message.created_at).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              ⚠️ Ce message a été supprimé
                            </p>
                          )}
                        </div>
                      )}

                      <div className="bg-gray-800 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-red-400 mb-1">Raison: {report.reason}</p>
                        {report.description && (
                          <p className="text-sm text-gray-300">{report.description}</p>
                        )}
                      </div>

                      {report.admin_notes && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                          <p className="text-sm text-blue-400">
                            <strong>Notes admin:</strong> {report.admin_notes}
                          </p>
                        </div>
                      )}

                      {selectedReport?.id === report.id && report.status === 'pending' && (
                        <div className="space-y-3">
                          <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Notes administratives (optionnel)..."
                            className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none text-sm resize-none"
                            rows={2}
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => updateReportStatus(report.id, 'action_taken', adminNotes)}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            >
                              Action prise
                            </button>
                            <button
                              onClick={() => updateReportStatus(report.id, 'dismissed', adminNotes)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            >
                              Ignorer
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReport(null)
                                setAdminNotes('')
                              }}
                              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {report.status === 'pending' && selectedReport?.id !== report.id && (
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Traiter
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        ) : activeTab === 'history' ? (
          <div className="space-y-4">
            {/* Filtres de recherche */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par pseudo ou admin..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:border-purple-500 focus:outline-none text-sm"
                />
              </div>

              <select
                value={historyTypeFilter}
                onChange={(e) => setHistoryTypeFilter(e.target.value)}
                className="bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-purple-500 focus:outline-none text-sm"
              >
                <option value="all">Tous les types</option>
                <option value="ticket">Tickets</option>
                <option value="verification">Vérifications</option>
                <option value="report">Signalements</option>
                <option value="profile">Profils</option>
              </select>

              <select
                value={historyDateFilter}
                onChange={(e) => setHistoryDateFilter(e.target.value)}
                className="bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-800 focus:border-purple-500 focus:outline-none text-sm"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>

            {/* Liste de l'historique */}
            {historyLoading ? (
              <div className="text-center text-gray-400 py-12">Chargement...</div>
            ) : filteredHistory.length === 0 ? (
              <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
                <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucune action trouvée</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map((entry, index) => {
                  const getActionIcon = () => {
                    switch (entry.action_type) {
                      case 'ticket_closed': return <Ticket className="w-5 h-5 text-blue-500" />
                      case 'verification_approved': return <CheckCircle className="w-5 h-5 text-green-500" />
                      case 'verification_rejected': return <XCircle className="w-5 h-5 text-red-500" />
                      case 'report_resolved': return <Flag className="w-5 h-5 text-orange-500" />
                      case 'profile_deleted': return <AlertCircle className="w-5 h-5 text-red-500" />
                      case 'profile_verified': return <CheckCircle className="w-5 h-5 text-blue-500" />
                      default: return <History className="w-5 h-5 text-gray-500" />
                    }
                  }

                  const getActionText = () => {
                    switch (entry.action_type) {
                      case 'ticket_closed': return 'a fermé un ticket'
                      case 'verification_approved': return 'a approuvé une vérification'
                      case 'verification_rejected': return 'a refusé une vérification'
                      case 'report_resolved': return 'a traité un signalement'
                      case 'profile_deleted': return 'a supprimé un profil'
                      case 'profile_verified': return 'a vérifié un profil'
                      default: return 'a effectué une action'
                    }
                  }

                  const details = entry.details ? JSON.parse(entry.details) : null
                  const isTicket = entry.action_type === 'ticket_closed'

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gray-800 rounded-lg flex-shrink-0">
                          {getActionIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <p className="text-white text-sm">
                                <span className="font-semibold">{entry.admin_username}</span>
                                {' '}{getActionText()}
                                {entry.target_username && (
                                  <> pour <span className="font-semibold text-purple-400">{entry.target_username}</span></>
                                )}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(entry.created_at).toLocaleDateString('fr-FR')}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(entry.created_at).toLocaleTimeString('fr-FR')}
                                </div>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              entry.target_type === 'ticket' ? 'bg-blue-500/20 text-blue-400' :
                              entry.target_type === 'verification' ? 'bg-green-500/20 text-green-400' :
                              entry.target_type === 'report' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {entry.target_type}
                            </span>
                          </div>
                          {details && (
                            <div className="bg-gray-800/50 rounded-lg p-3 mt-2">
                              {details.subject && (
                                <p className="text-xs text-gray-300 mb-1">
                                  <span className="text-gray-500">Sujet:</span> {details.subject}
                                </p>
                              )}
                              {details.reason && (
                                <p className="text-xs text-gray-300 mb-1">
                                  <span className="text-gray-500">Raison:</span> {details.reason}
                                </p>
                              )}
                              {details.response && (
                                <p className="text-xs text-gray-300 mb-1">
                                  <span className="text-gray-500">Réponse:</span> {details.response}
                                </p>
                              )}
                              {details.notes && (
                                <p className="text-xs text-gray-300">
                                  <span className="text-gray-500">Notes:</span> {details.notes}
                                </p>
                              )}
                              {details.status && (
                                <p className="text-xs text-gray-300">
                                  <span className="text-gray-500">Statut:</span> {details.status}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Bouton pour voir la conversation du ticket */}
                          {isTicket && (
                            <div className="mt-3">
                              {expandedHistoryTicket === entry.target_id ? (
                                <div className="space-y-3">
                                  {/* Conversation */}
                                  <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                                    {historyTicketMessages.length === 0 ? (
                                      <p className="text-gray-400 text-sm text-center py-4">Aucun message dans ce ticket</p>
                                    ) : (
                                      <div className="space-y-3">
                                        {historyTicketMessages.map((msg) => (
                                          <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[80%] rounded-lg p-3 ${
                                              msg.is_admin
                                                ? 'bg-purple-500/20 border border-purple-500/30'
                                                : 'bg-gray-700'
                                            }`}>
                                              {msg.is_admin && (
                                                <div className="flex items-center gap-2 mb-1">
                                                  <MessageSquare className="w-3 h-3 text-purple-400" />
                                                  <span className="text-xs font-medium text-purple-400">Support</span>
                                                </div>
                                              )}
                                              <p className="text-white text-sm whitespace-pre-wrap">{msg.message}</p>
                                              <p className="text-xs text-gray-400 mt-1">
                                                {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                                                  day: 'numeric',
                                                  month: 'short',
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                                })}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setExpandedHistoryTicket(null)
                                      setHistoryTicketMessages([])
                                    }}
                                    className="text-xs text-gray-400 hover:text-white transition-colors"
                                  >
                                    Masquer la conversation
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setExpandedHistoryTicket(entry.target_id)
                                    loadHistoryTicketMessages(entry.target_id)
                                  }}
                                  className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  Voir la conversation du ticket
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Modal de conversation */}
      {showConversation && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConversation(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Conversation complète
                    </h3>
                    <p className="text-sm text-gray-400">
                      {conversationMessages.length} message(s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConversation(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {loadingConversation ? (
                  <div className="text-center text-gray-400 py-8">Chargement...</div>
                ) : conversationMessages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">Aucun message</div>
                ) : (
                  conversationMessages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg ${
                        msg.sender_id === user?.id
                          ? 'bg-blue-500/20 ml-8'
                          : 'bg-gray-800 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          {msg.sender?.username || 'Utilisateur'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{msg.content}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded transition-all flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Supprimer ce message
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setShowConversation(false)}
                className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        </>
      )}

      {/* Modal de fermeture de ticket */}
      {showCloseModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCloseModal(false)}
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
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Fermer le ticket
                    </h3>
                    <p className="text-sm text-gray-400">
                      Ajouter une note de fermeture (optionnel)
                    </p>
                  </div>
                </div>

                <textarea
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  placeholder="Ex: Problème résolu, ticket traité, etc..."
                  className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none text-sm resize-none mb-4"
                  rows={4}
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCloseModal(false)
                      setCloseReason('')
                      setTicketToClose(null)
                    }}
                    className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      if (ticketToClose) {
                        closeTicket(ticketToClose, closeReason)
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    Fermer le ticket
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Modale de confirmation de suppression */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowDeleteModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-red-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* En-tête */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Confirmer la suppression</h2>
                    <p className="text-sm text-gray-400">Cette action est irréversible</p>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
                  <p className="text-gray-300">
                    Êtes-vous sûr de vouloir supprimer ce {deleteTarget?.type === 'message' ? 'message' : 'commentaire'} ?
                  </p>
                  <p className="text-sm text-red-400 mt-2">
                    ⚠️ Cette action est définitive et ne peut pas être annulée.
                  </p>
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setDeleteTarget(null)
                    }}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Modal de bannissement */}
      {showBanModal && selectedProfileForBan && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setShowBanModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-red-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* En-tête */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <Ban className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Bannir un utilisateur</h2>
                    <p className="text-sm text-gray-400">{selectedProfileForBan.username}</p>
                  </div>
                </div>

                {/* Type de ban */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type de bannissement
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setBanType('temporary')}
                      className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                        banType === 'temporary'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Temporaire
                    </button>
                    <button
                      onClick={() => setBanType('permanent')}
                      className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                        banType === 'permanent'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Permanent
                    </button>
                  </div>
                </div>

                {/* Durée (si temporaire) */}
                {banType === 'temporary' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Durée du ban (en jours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={banDuration}
                      onChange={(e) => setBanDuration(e.target.value)}
                      className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                      placeholder="Ex: 7"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Jusqu'au {new Date(Date.now() + parseInt(banDuration || '1') * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}

                {/* Raison */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Raison du bannissement *
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Ex: Violation des règles, spam, comportement inapproprié..."
                    className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none text-sm resize-none"
                    rows={4}
                    required
                  />
                </div>

                {/* Option pour bannir l'IP aussi */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={banIpToo}
                      onChange={(e) => setBanIpToo(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-red-500 focus:ring-red-500 focus:ring-offset-gray-900"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      Bannir aussi l'adresse IP de cet utilisateur
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Empêche toute connexion depuis cette IP
                  </p>
                </div>

                {/* Avertissement */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-400">
                    ⚠️ L'utilisateur sera immédiatement déconnecté et ne pourra plus se connecter {banType === 'permanent' ? 'définitivement' : `pendant ${banDuration} jour(s)`}.
                    {banIpToo && ' Son adresse IP sera également bloquée.'}
                  </p>
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowBanModal(false)
                      setSelectedProfileForBan(null)
                      setBanDuration('1')
                      setBanReason('')
                      setBanType('temporary')
                      setBanIpToo(false)
                    }}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-all"
                    disabled={processingBan}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => banUser(selectedProfileForBan.id, banDuration, banReason, banType === 'permanent')}
                    disabled={!banReason.trim() || processingBan || (banType === 'temporary' && (!banDuration || parseInt(banDuration) < 1))}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingBan ? 'Bannissement...' : 'Bannir'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Modal de gestion des Elite Coins */}
      {showCoinsModal && selectedProfileForCoins && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setShowCoinsModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-yellow-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* En-tête */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <Coins className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Gérer les Elite Coins</h2>
                    <p className="text-sm text-gray-400">{selectedProfileForCoins.username}</p>
                  </div>
                </div>

                {/* Solde actuel */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-400 mb-1">Solde actuel</p>
                  <p className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                    <Coins className="w-6 h-6" />
                    {selectedProfileForCoins.elite_coins || 0}
                  </p>
                </div>

                {/* Type d'opération */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Opération
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCoinsOperation('add')}
                      className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                        coinsOperation === 'add'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => setCoinsOperation('remove')}
                      className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                        coinsOperation === 'remove'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Retirer
                    </button>
                  </div>
                </div>

                {/* Montant */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Montant *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={coinsAmount}
                    onChange={(e) => setCoinsAmount(e.target.value)}
                    className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                    placeholder="Ex: 100"
                  />
                </div>

                {/* Aperçu */}
                {coinsAmount && parseInt(coinsAmount) > 0 && (
                  <div className={`border rounded-lg p-3 mb-4 ${
                    coinsOperation === 'add'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <p className="text-sm text-gray-300">
                      Nouveau solde : <strong className={coinsOperation === 'add' ? 'text-green-400' : 'text-red-400'}>
                        {coinsOperation === 'add'
                          ? (selectedProfileForCoins.elite_coins || 0) + parseInt(coinsAmount)
                          : Math.max(0, (selectedProfileForCoins.elite_coins || 0) - parseInt(coinsAmount))
                        } Elite Coins
                      </strong>
                    </p>
                  </div>
                )}

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCoinsModal(false)
                      setSelectedProfileForCoins(null)
                      setCoinsAmount('')
                      setCoinsOperation('add')
                    }}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-all"
                    disabled={processingCoins}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => manageCoins(selectedProfileForCoins.id, parseInt(coinsAmount), coinsOperation)}
                    disabled={!coinsAmount || parseInt(coinsAmount) < 1 || processingCoins}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      coinsOperation === 'add'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                    } text-white`}
                  >
                    {processingCoins ? 'Traitement...' : coinsOperation === 'add' ? 'Ajouter' : 'Retirer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Toast de succès */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">
            {showSuccessMessage.type === 'message' ? 'Message' : 'Commentaire'} supprimé avec succès !
          </span>
        </motion.div>
      )}

      {/* Toast pour ban/unban */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </motion.div>
      )}
    </div>
  )
}
