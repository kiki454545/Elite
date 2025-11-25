'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, ChevronDown, Check, Loader2, Lock, Clock } from 'lucide-react'
import { useVoting, VoteType } from '@/hooks/useVoting'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface VoteButtonProps {
  profileId: string
  className?: string
}

const VOTE_OPTIONS: { type: VoteType; label: string; emoji: string; color: string }[] = [
  { type: 'top1', label: 'Top 1', emoji: '🥇', color: 'from-yellow-400 to-amber-500' },
  { type: 'top5', label: 'Top 5', emoji: '🥈', color: 'from-gray-300 to-gray-400' },
  { type: 'top10', label: 'Top 10', emoji: '🥉', color: 'from-amber-600 to-amber-700' },
  { type: 'top50', label: 'Top 50', emoji: '⭐', color: 'from-blue-400 to-cyan-500' },
]

export function VoteButton({ profileId, className = '' }: VoteButtonProps) {
  const { isAuthenticated } = useAuth()
  const { t, language } = useLanguage()
  const { loading, voting, voteInfo, voteStats, vote, removeVote } = useVoting(profileId)
  const [isOpen, setIsOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleVote = async (voteType: VoteType) => {
    if (!isAuthenticated) {
      showToast(language === 'fr' ? 'Connectez-vous pour voter' : 'Login to vote', 'error')
      return
    }

    if (!voteInfo.canVote) {
      if (voteInfo.reason === 'account_too_young') {
        const daysLeft = 7 - voteInfo.accountAge
        showToast(
          language === 'fr'
            ? `Votre compte doit avoir au moins 7 jours pour voter (${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''})`
            : `Your account must be at least 7 days old to vote (${daysLeft} day${daysLeft > 1 ? 's' : ''} left)`,
          'info'
        )
      } else if (voteInfo.reason === 'own_profile') {
        showToast(
          language === 'fr' ? 'Vous ne pouvez pas voter pour votre propre profil' : 'You cannot vote for your own profile',
          'error'
        )
      }
      return
    }

    const result = await vote(voteType)
    if (result.success) {
      const option = VOTE_OPTIONS.find((o) => o.type === voteType)
      showToast(
        language === 'fr' ? `Vote ${option?.label} enregistré !` : `${option?.label} vote registered!`,
        'success'
      )
      setIsOpen(false)
    } else {
      showToast(language === 'fr' ? 'Erreur lors du vote' : 'Error while voting', 'error')
    }
  }

  const handleRemoveVote = async () => {
    const result = await removeVote()
    if (result.success) {
      showToast(language === 'fr' ? 'Vote retiré' : 'Vote removed', 'success')
      setIsOpen(false)
    } else {
      showToast(language === 'fr' ? 'Erreur' : 'Error', 'error')
    }
  }

  const currentVoteOption = voteInfo.currentVote
    ? VOTE_OPTIONS.find((o) => o.type === voteInfo.currentVote)
    : null

  if (loading) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Bouton principal */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={voting}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
          currentVoteOption
            ? `bg-gradient-to-r ${currentVoteOption.color} text-white shadow-lg`
            : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
        } ${!voteInfo.canVote && isAuthenticated ? 'opacity-70' : ''}`}
      >
        {voting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : currentVoteOption ? (
          <>
            <span className="text-lg">{currentVoteOption.emoji}</span>
            <span className="text-sm">{currentVoteOption.label}</span>
          </>
        ) : !isAuthenticated ? (
          <>
            <Lock className="w-4 h-4" />
            <span className="text-sm">{language === 'fr' ? 'Voter' : 'Vote'}</span>
          </>
        ) : !voteInfo.canVote && voteInfo.reason === 'account_too_young' ? (
          <>
            <Clock className="w-4 h-4" />
            <span className="text-sm">{7 - voteInfo.accountAge}j</span>
          </>
        ) : (
          <>
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-sm">{language === 'fr' ? 'Voter' : 'Vote'}</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Stats de vote */}
      {voteStats.totalScore > 0 && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
          {voteStats.totalScore} pts
        </div>
      )}

      {/* Menu déroulant */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-3 bg-gray-800/50 border-b border-gray-800">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  {language === 'fr' ? 'Voter pour ce profil' : 'Vote for this profile'}
                </h3>
                {!voteInfo.canVote && voteInfo.reason === 'account_too_young' && (
                  <p className="text-xs text-gray-400 mt-1">
                    {language === 'fr'
                      ? `Compte trop récent (${voteInfo.accountAge}/7 jours)`
                      : `Account too new (${voteInfo.accountAge}/7 days)`}
                  </p>
                )}
              </div>

              {/* Options de vote */}
              <div className="p-2">
                {VOTE_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleVote(option.type)}
                    disabled={!voteInfo.canVote || voting}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      voteInfo.currentVote === option.type
                        ? `bg-gradient-to-r ${option.color} text-white`
                        : voteInfo.canVote
                        ? 'hover:bg-gray-800 text-white'
                        : 'text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{option.emoji}</span>
                      <p className="font-medium">{option.label}</p>
                    </div>
                    {voteInfo.currentVote === option.type && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>

              {/* Stats */}
              {(voteStats.top1Count > 0 ||
                voteStats.top5Count > 0 ||
                voteStats.top10Count > 0 ||
                voteStats.top50Count > 0) && (
                <div className="p-3 bg-gray-800/30 border-t border-gray-800">
                  <p className="text-xs text-gray-400 mb-2">
                    {language === 'fr' ? 'Votes reçus :' : 'Votes received:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {voteStats.top1Count > 0 && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                        🥇 {voteStats.top1Count}
                      </span>
                    )}
                    {voteStats.top5Count > 0 && (
                      <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full">
                        🥈 {voteStats.top5Count}
                      </span>
                    )}
                    {voteStats.top10Count > 0 && (
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                        🥉 {voteStats.top10Count}
                      </span>
                    )}
                    {voteStats.top50Count > 0 && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                        ⭐ {voteStats.top50Count}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Retirer le vote */}
              {voteInfo.currentVote && (
                <div className="p-2 border-t border-gray-800">
                  <button
                    onClick={handleRemoveVote}
                    disabled={voting}
                    className="w-full text-center text-sm text-red-400 hover:text-red-300 py-2 transition-colors"
                  >
                    {language === 'fr' ? 'Retirer mon vote' : 'Remove my vote'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-500'
                : toast.type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500'
            } text-white text-sm font-medium`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
