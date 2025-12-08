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
      // Récupérer le count exact (sans limite 1000)
      const { count: totalAds, error: countError } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

      if (countError) {
        console.error('Erreur lors de la récupération du count:', countError)
        return
      }

      // Récupérer les locations avec pagination pour calculer les top villes
      const batchSize = 1000
      let allLocations: string[] = []
      let from = 0
      let hasMore = true

      while (hasMore) {
        const { data: adsData, error } = await supabase
          .from('ads')
          .select('location')
          .eq('status', 'approved')
          .range(from, from + batchSize - 1)

        if (error) {
          console.error('Erreur lors de la récupération des locations:', error)
          break
        }

        if (!adsData || adsData.length === 0) {
          hasMore = false
          break
        }

        allLocations = [...allLocations, ...adsData.map(ad => ad.location)]
        hasMore = adsData.length === batchSize
        from += batchSize
      }

      // Compter les annonces par ville
      const cityCounts = allLocations.reduce((acc, location) => {
        acc[location] = (acc[location] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Trier les villes par nombre d'annonces et prendre les 4 premières
      const topCities = Object.entries(cityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([city, count]) => ({ city, count }))

      setStats({ totalAds: totalAds || 0, topCities, loading: false })
    } catch (err) {
      console.error('Erreur lors de la récupération des stats:', err)
      setStats({ totalAds: 0, topCities: [], loading: false })
    }
  }

  return stats
}
