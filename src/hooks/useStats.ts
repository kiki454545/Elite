import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Stats {
  totalUsers: number
  totalAds: number
  onlineAds: number
  verifiedAds: number
  totalViews: number
  totalFavorites: number
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAds: 0,
    onlineAds: 0,
    verifiedAds: 0,
    totalViews: 0,
    totalFavorites: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      setLoading(true)
      setError(null)

      // Récupérer le nombre total d'utilisateurs
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (usersError) throw usersError

      // Récupérer les statistiques des annonces (uniquement les colonnes qui existent)
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('user_id, views, favorites_count')

      if (adsError) throw adsError

      // Récupérer les profils
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id')

      // Calculer les statistiques
      const totalAds = adsData?.length || 0
      const totalViews = adsData?.reduce((sum, ad) => sum + (ad.views || 0), 0) || 0
      const totalFavorites = adsData?.reduce((sum, ad) => sum + (ad.favorites_count || 0), 0) || 0

      // Pour l'instant, on met ces stats à 0 car les colonnes n'existent pas encore
      let onlineAds = 0
      let verifiedAds = 0

      setStats({
        totalUsers: usersCount || 0,
        totalAds,
        onlineAds,
        verifiedAds,
        totalViews,
        totalFavorites
      })
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, error, refetch: fetchStats }
}
