import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AdStats {
  totalAds: number
  topCities: { city: string; count: number }[]
  loading: boolean
}

export function useAllAds() {
  const [stats, setStats] = useState<AdStats>({
    totalAds: 0,
    topCities: [],
    loading: true
  })

  useEffect(() => {
    fetchAllAdsStats()
  }, [])

  async function fetchAllAdsStats() {
    try {
      // Récupérer TOUTES les annonces approuvées (sans filtre de pays)
      const { data: adsData, error } = await supabase
        .from('ads')
        .select('location')
        .eq('status', 'approved')

      if (error) {
        console.error('Erreur lors de la récupération des stats:', error)
        return
      }

      if (!adsData) {
        setStats({ totalAds: 0, topCities: [], loading: false })
        return
      }

      // Compter le nombre total d'annonces
      const totalAds = adsData.length

      // Compter les annonces par ville
      const cityCounts = adsData.reduce((acc, ad) => {
        acc[ad.location] = (acc[ad.location] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Trier les villes par nombre d'annonces et prendre les 4 premières
      const topCities = Object.entries(cityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([city, count]) => ({ city, count }))

      setStats({ totalAds, topCities, loading: false })
    } catch (err) {
      console.error('Erreur lors de la récupération des stats:', err)
      setStats({ totalAds: 0, topCities: [], loading: false })
    }
  }

  return stats
}
