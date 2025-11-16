'use client'

import { createContext, useContext, ReactNode, useState, useMemo } from 'react'
import { useConversations, useMessages as useSupabaseMessages } from '@/hooks/useMessages'
import { useAuth } from './AuthContext'

interface ChatMessage {
  id: string
  senderId: string
  text: string
  timestamp: Date
  isOwn: boolean
  read: boolean
  image?: string  // URL de l'image (optionnel)
}

interface Conversation {
  id: string
  adId: string
  username: string
  avatar: string
  online: boolean
  lastMessage: string
  timestamp: string
  lastMessageTime: number  // Timestamp numérique pour le tri
  unread: boolean
}

interface MessagesContextType {
  conversations: Conversation[]
  getConversation: (id: string) => Conversation | undefined
  getMessages: (conversationId: string) => ChatMessage[]
  sendMessage: (conversationId: string, text: string, image?: string) => void
  markAsRead: (conversationId: string) => void
  deleteConversation: (conversationId: string) => void
  unreadCount: number
  loading: boolean
  error: string | null
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

// Fonction pour formater le timestamp
function formatTimestamp(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days === 1) return 'Hier'
  return `Il y a ${days}j`
}

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { conversations: supabaseConversations, loading, error, deleteConversation: deleteSupabaseConversation, refetch } = useConversations()
  const [messagesCache, setMessagesCache] = useState<{ [key: string]: ChatMessage[] }>({})

  // Transformer les conversations Supabase en format attendu
  const conversations: Conversation[] = useMemo(() =>
    supabaseConversations.map(conv => ({
      id: conv.id,
      adId: '', // Pas d'adId dans le nouveau schéma Supabase
      username: conv.otherUser?.username || 'Utilisateur',
      avatar: conv.otherUser?.avatar_url || '',
      online: false, // À implémenter avec presence si nécessaire
      lastMessage: conv.last_message || 'Pas de messages',
      timestamp: conv.last_message_at ? formatTimestamp(conv.last_message_at) : '',
      lastMessageTime: conv.last_message_at?.getTime() || 0,
      unread: (conv.unreadCount || 0) > 0
    })),
    [supabaseConversations]
  )

  const getConversation = (id: string): Conversation | undefined => {
    return conversations.find(conv => conv.id === id)
  }

  const getMessages = (conversationId: string): ChatMessage[] => {
    return messagesCache[conversationId] || []
  }

  const sendMessage = async (conversationId: string, text: string, image?: string) => {
    if (!user?.id) return

    // Pour l'instant, on ne gère que le texte (pas les images)
    // L'envoi sera géré directement par les composants utilisant useMessages(conversationId)
    // On met à jour le cache local
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      text,
      timestamp: new Date(),
      isOwn: true,
      read: true,
      image
    }

    setMessagesCache(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }))
  }

  const markAsRead = async (conversationId: string) => {
    // Rafraîchir les conversations pour mettre à jour le compteur
    await refetch()
  }

  const deleteConversation = async (conversationId: string) => {
    const success = await deleteSupabaseConversation(conversationId)
    if (success) {
      await refetch()
    }
    return success
  }

  const unreadCount = conversations.filter(conv => conv.unread).length

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        getConversation,
        getMessages,
        sendMessage,
        markAsRead,
        deleteConversation,
        unreadCount,
        loading,
        error
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessagesContext)
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider')
  }
  return context
}
