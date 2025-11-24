'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Coins, Send } from 'lucide-react'
import { GIFTS, RARITY_COLORS, Gift } from '@/config/gifts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'

interface GiftModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientName: string
}

export function GiftModal({ isOpen, onClose, recipientId, recipientName }: GiftModalProps) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [userCoins, setUserCoins] = useState(0)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [filterRarity, setFilterRarity] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all')

  // Charger le solde de l'utilisateur
  useEffect(() => {
    if (isOpen && user) {
      fetchUserCoins()
    }
  }, [isOpen, user])

  const fetchUserCoins = async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('elite_coins')
      .eq('id', user.id)
      .single()

    if (data) {
      setUserCoins(data.elite_coins || 0)
    }
  }

  const handleSendGift = async () => {
    if (!selectedGift || !user) return

    // Vérifier si l'utilisateur a assez de coins
    if (userCoins < selectedGift.coins) {
      setMessage({ text: 'Vous n\'avez pas assez d\'EliteCoins', type: 'error' })
      return
    }

    setSending(true)

    try {
      // 1. Déduire les coins de l'expéditeur
      const { error: deductError } = await supabase.rpc('deduct_coins', {
        user_id: user.id,
        amount: selectedGift.coins
      })

      if (deductError) throw deductError

      // 2. Ajouter les coins au destinataire
      const { error: addError } = await supabase.rpc('add_coins', {
        user_id: recipientId,
        amount: selectedGift.coins
      })

      if (addError) throw addError

      // 3. Enregistrer la transaction
      const { error: transactionError } = await supabase
        .from('gift_transactions')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          gift_id: selectedGift.id,
          gift_name: selectedGift.name,
          gift_emoji: selectedGift.emoji,
          coins_amount: selectedGift.coins
        })

      if (transactionError) throw transactionError

      // 4. Créer ou récupérer la conversation
      let conversationId: string | null = null

      // Vérifier si une conversation existe déjà
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${recipientId}),and(user1_id.eq.${recipientId},user2_id.eq.${user.id})`)
        .maybeSingle()

      if (existingConv) {
        conversationId = existingConv.id
      } else {
        // Créer une nouvelle conversation
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            user1_id: user.id,
            user2_id: recipientId,
            last_message: null,
            last_message_at: new Date().toISOString()
          })
          .select()
          .single()

        if (convError) throw convError
        conversationId = newConv.id
      }

      // 5. Envoyer un message automatique
      if (conversationId) {
        const giftMessage = t('adDetailPage.giftModal.giftMessage', {
          emoji: selectedGift.emoji,
          name: selectedGift.name,
          coins: selectedGift.coins
        })

        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: giftMessage,
            read: false
          })

        if (messageError) throw messageError

        // Mettre à jour la conversation
        await supabase
          .from('conversations')
          .update({
            last_message: giftMessage,
            last_message_at: new Date().toISOString()
          })
          .eq('id', conversationId)
      }

      // Succès !
      setMessage({ text: `${selectedGift.emoji} ${selectedGift.name} envoyé à ${recipientName} !`, type: 'success' })
      setUserCoins(prev => prev - selectedGift.coins)
      setSelectedGift(null)

      // Fermer après 2 secondes
      setTimeout(() => {
        onClose()
        setMessage(null)
      }, 2000)

    } catch (error) {
      console.error('Erreur lors de l\'envoi du cadeau:', error)
      setMessage({ text: 'Erreur lors de l\'envoi du cadeau', type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const filteredGifts = filterRarity === 'all'
    ? GIFTS
    : GIFTS.filter(gift => gift.rarity === filterRarity)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div>
              <h2 className="text-2xl font-bold text-white">{t('adDetailPage.giftModal.title')}</h2>
              <p className="text-gray-400 text-sm mt-1">À {recipientName}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Bouton Recharger */}
              <button
                onClick={() => {
                  router.push('/shop')
                  onClose()
                }}
                className="px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-medium text-sm rounded-lg transition-all shadow-lg"
              >
                {t('adDetailPage.giftModal.recharge')}
              </button>
              {/* Solde */}
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-400/10 rounded-lg border border-amber-400/30">
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-amber-400">{userCoins}</span>
              </div>
              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Filtres de rareté */}
          <div className="flex gap-2 p-4 border-b border-gray-800 overflow-x-auto">
            {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map((rarity) => (
              <button
                key={rarity}
                onClick={() => setFilterRarity(rarity)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filterRarity === rarity
                    ? rarity === 'all'
                      ? 'bg-pink-500 text-white'
                      : `bg-gradient-to-r ${RARITY_COLORS[rarity].bg} text-white`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {rarity === 'all' ? 'Tous' :
                 rarity === 'common' ? 'Commun' :
                 rarity === 'rare' ? 'Rare' :
                 rarity === 'epic' ? 'Épique' :
                 'Légendaire'}
              </button>
            ))}
          </div>

          {/* Grille de cadeaux */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredGifts.map((gift) => {
                const colors = RARITY_COLORS[gift.rarity]
                const isSelected = selectedGift?.id === gift.id
                const canAfford = userCoins >= gift.coins

                return (
                  <motion.button
                    key={gift.id}
                    whileHover={{ scale: canAfford ? 1.05 : 1 }}
                    whileTap={{ scale: canAfford ? 0.95 : 1 }}
                    onClick={() => canAfford && setSelectedGift(gift)}
                    disabled={!canAfford}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `bg-gradient-to-br ${colors.bg} ${colors.border} shadow-lg ${colors.glow}`
                        : canAfford
                        ? `bg-gray-800/50 border-gray-700 hover:border-gray-600`
                        : 'bg-gray-900/50 border-gray-800 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {/* Emoji du cadeau */}
                    <div className="text-5xl mb-2">{gift.emoji}</div>

                    {/* Nom */}
                    <div className="text-white font-medium text-sm mb-2">{gift.name}</div>

                    {/* Prix */}
                    <div className={`flex items-center justify-center gap-1 ${
                      canAfford ? 'text-amber-400' : 'text-gray-500'
                    }`}>
                      <Coins className="w-4 h-4" />
                      <span className="font-bold text-sm">{gift.coins}</span>
                    </div>

                    {/* Badge de sélection */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full" />
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Footer avec bouton d'envoi */}
          <div className="p-6 border-t border-gray-800 bg-gray-900/50">
            {message && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                  : 'bg-red-500/20 border border-red-500/50 text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            {selectedGift ? (
              <button
                onClick={handleSendGift}
                disabled={sending}
                className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Envoyer {selectedGift.emoji} {selectedGift.name} ({selectedGift.coins} coins)</span>
                  </>
                )}
              </button>
            ) : (
              <div className="text-center text-gray-400 py-4">
                Sélectionnez un cadeau à envoyer
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
