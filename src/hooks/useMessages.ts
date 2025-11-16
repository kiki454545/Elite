import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: Date
}

export interface Conversation {
  id: string
  user1_id: string
  user2_id: string
  last_message?: string
  last_message_at?: Date
  created_at: Date
  // Données du profil de l'autre utilisateur
  otherUser?: {
    id: string
    username: string
    avatar_url?: string
    verified: boolean
    rank: string
  }
  unreadCount?: number
}

export function useConversations() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchConversations()

      // S'abonner aux changements en temps réel pour les deux cas (user1 ou user2)
      const subscription1 = supabase
        .channel(`conversations_user1_${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user1_id=eq.${user.id}`
        }, () => {
          fetchConversations()
        })
        .subscribe()

      const subscription2 = supabase
        .channel(`conversations_user2_${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user2_id=eq.${user.id}`
        }, () => {
          fetchConversations()
        })
        .subscribe()

      return () => {
        subscription1.unsubscribe()
        subscription2.unsubscribe()
      }
    }
  }, [user?.id])

  async function fetchConversations() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (fetchError) {
        throw fetchError
      }

      // Récupérer la liste des utilisateurs bloqués (dans les deux sens)
      const { data: blockedByMe } = await supabase
        .from('blocked_users')
        .select('blocked_user_id')
        .eq('user_id', user?.id || '')

      const { data: blockedMe } = await supabase
        .from('blocked_users')
        .select('user_id')
        .eq('blocked_user_id', user?.id || '')

      const blockedUserIds = new Set([
        ...(blockedByMe?.map(b => b.blocked_user_id) || []),
        ...(blockedMe?.map(b => b.user_id) || [])
      ])

      // Filtrer les conversations avec des utilisateurs bloqués
      const filteredData = (data || []).filter(conv => {
        const otherUserId = conv.user1_id === user?.id ? conv.user2_id : conv.user1_id
        return !blockedUserIds.has(otherUserId)
      })

      // Récupérer les informations des autres utilisateurs
      const conversationsWithUsers = await Promise.all(
        filteredData.map(async (conv) => {
          const otherUserId = conv.user1_id === user?.id ? conv.user2_id : conv.user1_id

          // Récupérer le profil de l'autre utilisateur
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, verified, rank')
            .eq('id', otherUserId)
            .single()

          // Récupérer la première photo depuis les annonces de l'utilisateur
          const { data: adData } = await supabase
            .from('ads')
            .select('photos')
            .eq('user_id', otherUserId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          const avatarUrl = adData?.photos?.[0] || null

          // Compter les messages non lus
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', user?.id)

          return {
            id: conv.id,
            user1_id: conv.user1_id,
            user2_id: conv.user2_id,
            last_message: conv.last_message,
            last_message_at: conv.last_message_at ? new Date(conv.last_message_at) : undefined,
            created_at: new Date(conv.created_at),
            otherUser: profile ? {
              ...profile,
              avatar_url: avatarUrl
            } : undefined,
            unreadCount: count || 0
          }
        })
      )

      setConversations(conversationsWithUsers)
    } catch (err) {
      console.error('Erreur lors de la récupération des conversations:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  async function createConversation(otherUserId: string) {
    try {
      // Réinitialiser l'erreur
      setError(null)

      // Vérifier si l'utilisateur est bloqué (dans les deux sens)
      const { data: blockCheck1, error: blockError1 } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('user_id', otherUserId)
        .eq('blocked_user_id', user?.id)
        .maybeSingle()

      const { data: blockCheck2, error: blockError2 } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('user_id', user?.id)
        .eq('blocked_user_id', otherUserId)
        .maybeSingle()

      console.log('🔒 Vérification blocage messages:', {
        currentUserId: user?.id,
        otherUserId: otherUserId,
        blockCheck1: !!blockCheck1,
        blockCheck2: !!blockCheck2,
        error1: blockError1?.message,
        error2: blockError2?.message
      })

      if (blockCheck1 || blockCheck2) {
        console.log('❌ Utilisateur bloqué détecté')
        throw new Error('BLOCKED')
      }

      console.log('✅ Aucun blocage détecté, création de la conversation...')

      // Vérifier si une conversation existe déjà
      const { data: existing, error: searchError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user?.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user?.id})`)
        .maybeSingle()

      // Si on trouve une conversation existante, la retourner
      if (existing) {
        console.log('✅ Conversation existante trouvée:', existing.id)
        // Rafraîchir pour être sûr que le contexte a les données
        await fetchConversations()
        return existing.id
      }

      console.log('📝 Création d\'une nouvelle conversation...')

      // Créer une nouvelle conversation
      const { data, error: insertError } = await supabase
        .from('conversations')
        .insert([{
          user1_id: user?.id,
          user2_id: otherUserId,
          last_message: null,
          last_message_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (insertError) {
        console.error('❌ Erreur lors de la création:', insertError)
        throw insertError
      }

      console.log('✅ Conversation créée avec succès:', data.id)

      // Rafraîchir les conversations pour mettre à jour le contexte
      await fetchConversations()
      return data.id
    } catch (err) {
      console.error('❌ Erreur lors de la création de la conversation:', err)
      if (err instanceof Error && err.message === 'BLOCKED') {
        setError('Vous ne pouvez pas contacter cet utilisateur')
      } else {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      }
      return null
    }
  }

  async function deleteConversation(conversationId: string) {
    try {
      // Supprimer tous les messages de la conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)

      if (messagesError) {
        throw messagesError
      }

      // Supprimer la conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)

      if (conversationError) {
        throw conversationError
      }

      // Mettre à jour l'état local immédiatement
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))

      return true
    } catch (err) {
      console.error('Erreur lors de la suppression de la conversation:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    }
  }

  return {
    conversations,
    loading,
    error,
    createConversation,
    deleteConversation,
    refetch: fetchConversations
  }
}

export function useMessages(conversationId: string | null) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (conversationId) {
      fetchMessages()
      markMessagesAsRead()

      // S'abonner aux nouveaux messages en temps réel
      const subscription = supabase
        .channel(`messages:${conversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, (payload) => {
          setMessages((prev) => [...prev, {
            id: payload.new.id,
            conversation_id: payload.new.conversation_id,
            sender_id: payload.new.sender_id,
            content: payload.new.content,
            read: payload.new.read,
            created_at: new Date(payload.new.created_at)
          }])
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [conversationId])

  async function fetchMessages() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setMessages((data || []).map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content,
        read: msg.read,
        created_at: new Date(msg.created_at)
      })))
    } catch (err) {
      console.error('Erreur lors de la récupération des messages:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  async function markMessagesAsRead() {
    if (!conversationId || !user?.id) return

    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('read', false)
        .neq('sender_id', user.id)
    } catch (err) {
      console.error('Erreur lors du marquage des messages comme lus:', err)
    }
  }

  async function sendMessage(content: string) {
    if (!conversationId || !user?.id || !content.trim()) return false

    try {
      const { data, error: insertError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          read: false
        }])
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Ajouter le message immédiatement à l'état local
      if (data) {
        setMessages((prev) => [...prev, {
          id: data.id,
          conversation_id: data.conversation_id,
          sender_id: data.sender_id,
          content: data.content,
          read: data.read,
          created_at: new Date(data.created_at)
        }])
      }

      // Mettre à jour la conversation
      await supabase
        .from('conversations')
        .update({
          last_message: content.trim(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      return true
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    }
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages
  }
}
