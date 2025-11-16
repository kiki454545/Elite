'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { useMessages } from '@/contexts/MessagesContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function MessagesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { conversations } = useMessages()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')

  // Rediriger si non authentifié (dans un useEffect pour éviter l'erreur côté serveur)
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Afficher un écran de chargement pendant la vérification de session
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  // Ne rien afficher si pas authentifié (la redirection est en cours)
  if (!user) {
    return null
  }

  const filteredMessages = conversations
    .filter(msg =>
      msg.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.lastMessageTime - a.lastMessageTime) // Tri par date décroissante (plus récent en premier)

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <Header title="Messages" showBackButton={true} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:border-pink-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Messages List */}
        {filteredMessages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center"
          >
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Aucun message
            </h3>
            <p className="text-gray-400 mb-6">
              Vos conversations apparaîtront ici
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Découvrir les annonces
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`/messages/${message.id}`)}
                className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {message.avatar && !message.avatar.includes('picsum.photos') ? (
                      <img
                        src={message.avatar}
                        alt={message.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {message.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {message.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
                    )}
                  </div>

                  {/* Message Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold text-sm">
                        {message.username}
                      </h3>
                      <span className="text-gray-500 text-xs flex-shrink-0">
                        {message.timestamp}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${
                      message.unread ? 'text-white font-medium' : 'text-gray-400'
                    }`}>
                      {message.lastMessage}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {message.unread && (
                    <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
