'use client'

import { motion } from 'framer-motion'
import { Trophy, TrendingUp } from 'lucide-react'
import { useVoting } from '@/hooks/useVoting'
import { useLanguage } from '@/contexts/LanguageContext'
import { XPBadge, XPProgress } from './XPBadge'

interface VoteStatsProps {
  profileId: string
  className?: string
  showProgress?: boolean
}

export function VoteStats({ profileId, className = '', showProgress = false }: VoteStatsProps) {
  const { language } = useLanguage()
  const { loading, voteStats } = useVoting(profileId)

  // Ne pas afficher si pas de votes
  if (loading || voteStats.totalScore === 0) return null

  const totalVotes = voteStats.top1Count + voteStats.top5Count + voteStats.top10Count + voteStats.top50Count

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl p-4 ${className}`}
    >
      {/* Header avec badge et score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-white font-semibold">
            {language === 'fr' ? 'Classement & Votes' : 'Ranking & Votes'}
          </span>
        </div>
        <XPBadge xp={voteStats.totalScore} size="sm" />
      </div>

      {/* Nombre de votes */}
      <div className="flex items-center gap-1.5 mb-3">
        <TrendingUp className="w-4 h-4 text-green-400" />
        <span className="text-sm text-gray-300">
          {totalVotes} {language === 'fr' ? 'votes reçus' : 'votes received'}
        </span>
      </div>

      {/* Détail des votes */}
      <div className="grid grid-cols-4 gap-2">
        <VoteCountBadge
          emoji="🥇"
          label="Top 1"
          count={voteStats.top1Count}
          color="from-yellow-400 to-amber-500"
          bgColor="bg-yellow-500/20"
        />
        <VoteCountBadge
          emoji="🥈"
          label="Top 5"
          count={voteStats.top5Count}
          color="from-gray-300 to-gray-400"
          bgColor="bg-gray-500/20"
        />
        <VoteCountBadge
          emoji="🥉"
          label="Top 10"
          count={voteStats.top10Count}
          color="from-amber-600 to-amber-700"
          bgColor="bg-amber-500/20"
        />
        <VoteCountBadge
          emoji="⭐"
          label="Top 50"
          count={voteStats.top50Count}
          color="from-blue-400 to-cyan-500"
          bgColor="bg-blue-500/20"
        />
      </div>

      {/* Progression vers le prochain badge */}
      {showProgress && (
        <div className="mt-4 pt-3 border-t border-amber-500/20">
          <XPProgress xp={voteStats.totalScore} />
        </div>
      )}
    </motion.div>
  )
}

interface VoteCountBadgeProps {
  emoji: string
  label: string
  count: number
  color: string
  bgColor: string
}

function VoteCountBadge({ emoji, label, count, color, bgColor }: VoteCountBadgeProps) {
  return (
    <div className={`${bgColor} rounded-lg p-2 text-center`}>
      <div className="text-lg mb-0.5">{emoji}</div>
      <div className={`text-sm font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
        {count}
      </div>
      <div className="text-[10px] text-gray-500 hidden sm:block">{label}</div>
    </div>
  )
}

// Composant compact pour afficher juste le badge à côté du favori
interface VoteBadgeCompactProps {
  profileId: string
  className?: string
}

export function VoteBadgeCompact({ profileId, className = '' }: VoteBadgeCompactProps) {
  const { loading, voteStats } = useVoting(profileId)

  if (loading || voteStats.totalScore === 0) return null

  return (
    <XPBadge xp={voteStats.totalScore} size="sm" className={className} />
  )
}
