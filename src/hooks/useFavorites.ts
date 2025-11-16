import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface Favorite {
  id: string
  user_id: string
  ad_id: string
  created_at: Date
}

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchFavorites()
    } else {
      // Si pas d'utilisateur, charger depuis localStorage
      const localFavorites = localStorage.getItem('favorites')
      if (localFavorites) {
        setFavorites(JSON.parse(localFavorites))
      }
      setLoading(false)
    }
  }, [user?.id])

  async function fetchFavorites() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select('ad_id')
        .eq('user_id', user?.id)

      if (fetchError) {
        throw fetchError
      }

      const favoriteIds = (data || []).map(fav => fav.ad_id)
      setFavorites(favoriteIds)
    } catch (err) {
      console.error('Erreur lors de la récupération des favoris:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  async function addFavorite(adId: string) {
    try {
      if (!user?.id) {
        // Mode hors connexion : enregistrer dans localStorage
        const newFavorites = [...favorites, adId]
        setFavorites(newFavorites)
        localStorage.setItem('favorites', JSON.stringify(newFavorites))
        return true
      }

      const { error: insertError } = await supabase
        .from('favorites')
        .insert([{
          user_id: user.id,
          ad_id: adId
        }])

      if (insertError) {
        throw insertError
      }

      // Incrémenter le compteur de favoris de l'annonce
      await supabase.rpc('increment_favorites', { ad_id: adId })

      setFavorites([...favorites, adId])
      return true
    } catch (err) {
      console.error('Erreur lors de l\'ajout aux favoris:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    }
  }

  async function removeFavorite(adId: string) {
    try {
      if (!user?.id) {
        // Mode hors connexion : supprimer du localStorage
        const newFavorites = favorites.filter(id => id !== adId)
        setFavorites(newFavorites)
        localStorage.setItem('favorites', JSON.stringify(newFavorites))
        return true
      }

      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('ad_id', adId)

      if (deleteError) {
        throw deleteError
      }

      // Décrémenter le compteur de favoris de l'annonce
      await supabase.rpc('decrement_favorites', { ad_id: adId })

      setFavorites(favorites.filter(id => id !== adId))
      return true
    } catch (err) {
      console.error('Erreur lors de la suppression des favoris:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    }
  }

  async function toggleFavorite(adId: string) {
    if (favorites.includes(adId)) {
      return await removeFavorite(adId)
    } else {
      return await addFavorite(adId)
    }
  }

  function isFavorite(adId: string) {
    return favorites.includes(adId)
  }

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites
  }
}

export function useFavoriteAds() {
  const { user } = useAuth()
  const [favoriteAds, setFavoriteAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchFavoriteAds()
    } else {
      setLoading(false)
    }
  }, [user?.id])

  async function fetchFavoriteAds() {
    try {
      setLoading(true)
      setError(null)

      // Récupérer les favoris avec les détails des annonces
      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          ads!inner (
            id,
            user_id,
            title,
            description,
            location,
            arrondissement,
            country,
            categories,
            photos,
            video_url,
            price,
            meeting_places,
            verified,
            views,
            favorites_count,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Transformer les données
      const ads = (data || [])
        .filter((fav: any) => fav.ads) // Filtrer les favoris sans annonce (annonce supprimée)
        .map((fav: any) => {
          const ad = fav.ads
          return {
            id: ad.id,
            userId: ad.user_id,
            username: ad.title || 'Utilisateur',
            title: ad.title || '',
            description: ad.description || '',
            age: 25, // Valeur par défaut
            location: ad.location,
            arrondissement: ad.arrondissement,
            country: ad.country,
            category: (ad.categories && ad.categories[0]) || 'escort',
            photos: ad.photos || [],
            video: ad.video_url,
            price: ad.price,
            services: ad.meeting_places || [],
            availability: '',
            verified: ad.verified || false,
            rank: 'standard' as const,
            online: false,
            views: ad.views || 0,
            favorites: ad.favorites_count || 0,
            createdAt: new Date(ad.created_at),
            updatedAt: ad.updated_at ? new Date(ad.updated_at) : new Date(ad.created_at)
          }
        })

      setFavoriteAds(ads)
    } catch (err) {
      console.error('Erreur lors de la récupération des annonces favorites:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return {
    favoriteAds,
    loading,
    error,
    refetch: fetchFavoriteAds
  }
}
