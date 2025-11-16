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
          ads (
            id,
            user_id,
            username,
            title,
            description,
            age,
            location,
            arrondissement,
            country,
            category,
            photos,
            video,
            video_url,
            price,
            services,
            availability,
            verified,
            rank,
            online,
            views,
            favorites,
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
        .filter(fav => fav.ads) // Filtrer les favoris sans annonce (annonce supprimée)
        .map(fav => ({
          id: fav.ads.id,
          userId: fav.ads.user_id,
          username: fav.ads.username,
          title: fav.ads.title,
          description: fav.ads.description || '',
          age: fav.ads.age,
          location: fav.ads.location,
          arrondissement: fav.ads.arrondissement,
          country: fav.ads.country,
          category: fav.ads.category,
          photos: fav.ads.photos || [],
          video: fav.ads.video_url,
          price: fav.ads.price,
          services: fav.ads.services || [],
          availability: fav.ads.availability,
          verified: fav.ads.verified,
          rank: fav.ads.rank,
          online: fav.ads.online,
          views: fav.ads.views || 0,
          favorites: fav.ads.favorites || 0,
          createdAt: new Date(fav.ads.created_at),
          updatedAt: new Date(fav.ads.updated_at)
        }))

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
