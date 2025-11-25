import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export type VoteType = 'top1' | 'top5' | 'top10' | 'top50'

interface VoteInfo {
  canVote: boolean
  reason?: string
  currentVote?: VoteType | null
  accountAge: number // en jours
}

interface ProfileVoteStats {
  top1Count: number
  top5Count: number
  top10Count: number
  top50Count: number
  totalScore: number
}

// Points pour chaque type de vote
const VOTE_POINTS: Record<VoteType, number> = {
  top1: 50,
  top5: 20,
  top10: 10,
  top50: 5,
}

export function useVoting(profileId: string) {
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [voteInfo, setVoteInfo] = useState<VoteInfo>({
    canVote: false,
    accountAge: 0,
  })
  const [voteStats, setVoteStats] = useState<ProfileVoteStats>({
    top1Count: 0,
    top5Count: 0,
    top10Count: 0,
    top50Count: 0,
    totalScore: 0,
  })

  // Vérifier si l'utilisateur peut voter
  const checkVotingEligibility = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setVoteInfo({
        canVote: false,
        reason: 'not_authenticated',
        accountAge: 0,
      })
      setLoading(false)
      return
    }

    try {
      // Récupérer les infos du profil de l'utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        setVoteInfo({
          canVote: false,
          reason: 'profile_not_found',
          accountAge: 0,
        })
        setLoading(false)
        return
      }

      // Calculer l'âge du compte en jours
      const createdAt = new Date(profile.created_at)
      const now = new Date()
      const accountAgeDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

      // Vérifier si l'utilisateur a déjà voté pour ce profil
      const { data: existingVote } = await supabase
        .from('profile_votes')
        .select('vote_type')
        .eq('voter_id', user.id)
        .eq('profile_id', profileId)
        .single()

      // Vérifier si c'est son propre profil
      if (user.id === profileId) {
        setVoteInfo({
          canVote: false,
          reason: 'own_profile',
          currentVote: existingVote?.vote_type as VoteType | null,
          accountAge: accountAgeDays,
        })
        setLoading(false)
        return
      }

      // Vérifier l'âge minimum du compte (7 jours)
      if (accountAgeDays < 7) {
        setVoteInfo({
          canVote: false,
          reason: 'account_too_young',
          currentVote: existingVote?.vote_type as VoteType | null,
          accountAge: accountAgeDays,
        })
        setLoading(false)
        return
      }

      setVoteInfo({
        canVote: true,
        currentVote: existingVote?.vote_type as VoteType | null,
        accountAge: accountAgeDays,
      })
    } catch (error) {
      console.error('Erreur lors de la vérification du vote:', error)
      setVoteInfo({
        canVote: false,
        reason: 'error',
        accountAge: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [user, isAuthenticated, profileId])

  // Récupérer les stats de vote pour le profil
  const fetchVoteStats = useCallback(async () => {
    try {
      const { data: votes, error } = await supabase
        .from('profile_votes')
        .select('vote_type')
        .eq('profile_id', profileId)

      if (error) {
        console.error('Erreur lors de la récupération des votes:', error)
        return
      }

      const stats: ProfileVoteStats = {
        top1Count: 0,
        top5Count: 0,
        top10Count: 0,
        top50Count: 0,
        totalScore: 0,
      }

      votes?.forEach((vote) => {
        switch (vote.vote_type) {
          case 'top1':
            stats.top1Count++
            break
          case 'top5':
            stats.top5Count++
            break
          case 'top10':
            stats.top10Count++
            break
          case 'top50':
            stats.top50Count++
            break
        }
        stats.totalScore += VOTE_POINTS[vote.vote_type as VoteType] || 0
      })

      setVoteStats(stats)
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error)
    }
  }, [profileId])

  // Voter pour un profil
  const vote = async (voteType: VoteType): Promise<{ success: boolean; error?: string }> => {
    if (!voteInfo.canVote || !user) {
      return { success: false, error: voteInfo.reason || 'cannot_vote' }
    }

    setVoting(true)

    try {
      // Si l'utilisateur a déjà voté, mettre à jour son vote
      if (voteInfo.currentVote) {
        const { error } = await supabase
          .from('profile_votes')
          .update({ vote_type: voteType, updated_at: new Date().toISOString() })
          .eq('voter_id', user.id)
          .eq('profile_id', profileId)

        if (error) throw error
      } else {
        // Sinon, créer un nouveau vote
        const { error } = await supabase
          .from('profile_votes')
          .insert({
            voter_id: user.id,
            profile_id: profileId,
            vote_type: voteType,
          })

        if (error) throw error
      }

      // Mettre à jour l'état local
      setVoteInfo((prev) => ({
        ...prev,
        currentVote: voteType,
      }))

      // Rafraîchir les stats
      await fetchVoteStats()

      return { success: true }
    } catch (error: unknown) {
      console.error('Erreur lors du vote:', error)
      const errorMessage = error instanceof Error ? error.message : 'unknown_error'
      return { success: false, error: errorMessage }
    } finally {
      setVoting(false)
    }
  }

  // Retirer son vote
  const removeVote = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user || !voteInfo.currentVote) {
      return { success: false, error: 'no_vote_to_remove' }
    }

    setVoting(true)

    try {
      const { error } = await supabase
        .from('profile_votes')
        .delete()
        .eq('voter_id', user.id)
        .eq('profile_id', profileId)

      if (error) throw error

      // Mettre à jour l'état local
      setVoteInfo((prev) => ({
        ...prev,
        currentVote: null,
      }))

      // Rafraîchir les stats
      await fetchVoteStats()

      return { success: true }
    } catch (error: unknown) {
      console.error('Erreur lors de la suppression du vote:', error)
      const errorMessage = error instanceof Error ? error.message : 'unknown_error'
      return { success: false, error: errorMessage }
    } finally {
      setVoting(false)
    }
  }

  useEffect(() => {
    checkVotingEligibility()
    fetchVoteStats()
  }, [checkVotingEligibility, fetchVoteStats])

  return {
    loading,
    voting,
    voteInfo,
    voteStats,
    vote,
    removeVote,
    refetch: () => {
      checkVotingEligibility()
      fetchVoteStats()
    },
  }
}

// Hook pour récupérer le classement Top
export function useTopRanking(limit: number = 50) {
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<Array<{
    id: string
    username: string
    avatar_url: string | null
    verified: boolean
    rank: string
    vote_score: number
    top_rank: number
    ad_id?: string
  }>>([])

  const fetchTopProfiles = useCallback(async () => {
    setLoading(true)
    try {
      // Récupérer les profils avec leurs scores de vote
      // On joint avec les annonces pour obtenir l'ad_id
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          avatar_url,
          verified,
          rank,
          vote_score,
          ads!inner(id)
        `)
        .gt('vote_score', 0)
        .order('vote_score', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Erreur lors de la récupération du classement:', error)
        return
      }

      // Formatter les données avec le classement
      const formattedProfiles = data?.map((profile, index) => ({
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        verified: profile.verified,
        rank: profile.rank,
        vote_score: profile.vote_score || 0,
        top_rank: index + 1,
        ad_id: profile.ads?.[0]?.id,
      })) || []

      setProfiles(formattedProfiles)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchTopProfiles()
  }, [fetchTopProfiles])

  return {
    loading,
    profiles,
    refetch: fetchTopProfiles,
  }
}
