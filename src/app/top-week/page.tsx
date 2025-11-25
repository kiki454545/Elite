'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal, Star, ArrowLeft, Loader2, Eye, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import { RANK_CONFIG, RankType } from '@/types/profile'

interface TopProfile {
  id: string
  username: string
  avatar_url: string | null
  verified: boolean
  rank: RankType
  vote_score: number
  top_position: number
  ad_id: string | null
  top1_votes: number
  top5_votes: number
  top10_votes: number
  top50_votes: number
}

function RankBadge({ rank }: { rank: RankType }) {
  if (!rank || rank === 'standard') return null
  const config = RANK_CONFIG[rank]
  if (!config) return null
  return (
    <div className={`flex items-center gap-1 ${config.bgColor} px-2 py-0.5 rounded-full border ${config.borderColor} ${config.glowColor} transition-all`}>
      <span className="text-xs">{config.icon}</span>
      <span className={`text-[10px] font-bold ${config.textColor} tracking-wide uppercase`}>
        {config.label}
      </span>
    </div>
  )
}

function PositionBadge({ position }: { position: number }) {
  if (position === 1) {
    return (
      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg shadow-yellow-500/50">
        <Crown className="w-6 h-6 text-white" />
      </div>
    )
  }
  if (position === 2) {
    return (
      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full shadow-lg shadow-gray-400/50">
        <Medal className="w-6 h-6 text-white" />
      </div>
    )
  }
  if (position === 3) {
    return (
      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full shadow-lg shadow-amber-600/50">
        <Medal className="w-6 h-6 text-white" />
      </div>
    )
  }
  if (position <= 5) {
    return (
      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
        <span className="text-white font-bold">{position}</span>
      </div>
    )
  }
  if (position <= 10) {
    return (
      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full">
        <span className="text-white font-bold">{position}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full border border-gray-700">
      <span className="text-gray-300 font-bold">{position}</span>
    </div>
  )
}

export default function TopWeekPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<TopProfile[]>([])
  const [filter, setFilter] = useState<'all' | 'top1' | 'top5' | 'top10' | 'top50'>('all')

  useEffect(() => {
    async function fetchTopProfiles() {
      setLoading(true)
      try {
        // Récupérer les profils avec leurs votes
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            avatar_url,
            verified,
            rank,
            ads(id)
          `)

        if (profilesError) {
          console.error('Erreur profils:', profilesError)
          return
        }

        // Récupérer tous les votes
        const { data: votesData, error: votesError } = await supabase
          .from('profile_votes')
          .select('profile_id, vote_type')

        if (votesError) {
          console.error('Erreur votes:', votesError)
          return
        }

        // Calculer les scores pour chaque profil
        const profileScores = new Map<string, {
          score: number
          top1: number
          top5: number
          top10: number
          top50: number
        }>()

        votesData?.forEach((vote) => {
          const current = profileScores.get(vote.profile_id) || { score: 0, top1: 0, top5: 0, top10: 0, top50: 0 }

          switch (vote.vote_type) {
            case 'top1':
              current.score += 50
              current.top1++
              break
            case 'top5':
              current.score += 20
              current.top5++
              break
            case 'top10':
              current.score += 10
              current.top10++
              break
            case 'top50':
              current.score += 5
              current.top50++
              break
          }

          profileScores.set(vote.profile_id, current)
        })

        // Filtrer les profils qui ont des votes et une annonce
        const rankedProfiles: TopProfile[] = profilesData
          ?.filter((p) => {
            const scores = profileScores.get(p.id)
            const hasAd = p.ads && p.ads.length > 0
            return scores && scores.score > 0 && hasAd
          })
          .map((p) => {
            const scores = profileScores.get(p.id)!
            return {
              id: p.id,
              username: p.username,
              avatar_url: p.avatar_url,
              verified: p.verified,
              rank: p.rank as RankType,
              vote_score: scores.score,
              top_position: 0,
              ad_id: p.ads?.[0]?.id || null,
              top1_votes: scores.top1,
              top5_votes: scores.top5,
              top10_votes: scores.top10,
              top50_votes: scores.top50,
            }
          })
          .sort((a, b) => b.vote_score - a.vote_score)
          .map((p, index) => ({ ...p, top_position: index + 1 }))
          .slice(0, 50) || []

        setProfiles(rankedProfiles)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopProfiles()
  }, [])

  const filteredProfiles = profiles.filter((p) => {
    if (filter === 'all') return true
    if (filter === 'top1') return p.top_position <= 1
    if (filter === 'top5') return p.top_position <= 5
    if (filter === 'top10') return p.top_position <= 10
    if (filter === 'top50') return p.top_position <= 50
    return true
  })

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-white hover:text-pink-500 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white">
              {language === 'fr' ? 'Classement Top' : 'Top Ranking'}
            </h1>
          </div>
        </div>
      </header>

      {/* Filtres */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: language === 'fr' ? 'Tous' : 'All', emoji: '🏆' },
            { key: 'top1', label: 'Top 1', emoji: '🥇' },
            { key: 'top5', label: 'Top 5', emoji: '🥈' },
            { key: 'top10', label: 'Top 10', emoji: '🥉' },
            { key: 'top50', label: 'Top 50', emoji: '⭐' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                filter === f.key
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-4" />
            <p className="text-gray-400">
              {language === 'fr' ? 'Chargement du classement...' : 'Loading ranking...'}
            </p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              {language === 'fr' ? 'Aucun profil classé' : 'No ranked profiles'}
            </h2>
            <p className="text-gray-400">
              {language === 'fr'
                ? 'Soyez le premier à voter pour vos profils préférés !'
                : 'Be the first to vote for your favorite profiles!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProfiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => profile.ad_id && router.push(`/ads/${profile.ad_id}`)}
                className={`bg-gray-900 rounded-xl border ${
                  profile.top_position === 1
                    ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                    : profile.top_position <= 3
                    ? 'border-amber-500/30'
                    : 'border-gray-800'
                } p-4 cursor-pointer hover:bg-gray-800/50 transition-all`}
              >
                <div className="flex items-center gap-4">
                  {/* Position */}
                  <PositionBadge position={profile.top_position} />

                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-700">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">
                            {profile.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {profile.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold truncate">{profile.username}</h3>
                      <RankBadge rank={profile.rank} />
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {profile.top1_votes > 0 && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                          🥇 {profile.top1_votes}
                        </span>
                      )}
                      {profile.top5_votes > 0 && (
                        <span className="text-xs bg-gray-500/20 text-gray-300 px-1.5 py-0.5 rounded">
                          🥈 {profile.top5_votes}
                        </span>
                      )}
                      {profile.top10_votes > 0 && (
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                          🥉 {profile.top10_votes}
                        </span>
                      )}
                      {profile.top50_votes > 0 && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                          ⭐ {profile.top50_votes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Voir */}
                  <Eye className="w-5 h-5 text-gray-500" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info sur le système de vote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl p-5"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            {language === 'fr' ? 'Comment fonctionne le classement ?' : 'How does the ranking work?'}
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            {language === 'fr'
              ? 'Votez pour vos profils préférés ! Plus un profil reçoit de votes, plus il monte dans le classement.'
              : 'Vote for your favorite profiles! The more votes a profile receives, the higher it ranks.'}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-sm bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">🥇 Top 1</span>
            <span className="text-sm bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full">🥈 Top 5</span>
            <span className="text-sm bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full">🥉 Top 10</span>
            <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">⭐ Top 50</span>
          </div>
          <p className="text-xs text-gray-400">
            {language === 'fr'
              ? 'Note : Seuls les comptes créés depuis plus de 7 jours peuvent voter.'
              : 'Note: Only accounts created more than 7 days ago can vote.'}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
