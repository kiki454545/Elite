import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Ad } from '@/types/ad'
import { useAuth } from '@/contexts/AuthContext'

export function useAds(country?: string, city?: string) {
  const { user } = useAuth()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔄 useAds: Rechargement des annonces pour pays:', country, 'ville:', city)

    // Ne pas charger si le pays n'est pas encore défini
    if (!country) {
      console.log('⏸️  Attente de la détection du pays...')
      setLoading(true)
      return
    }

    fetchAds()
  }, [country, city, user])

  async function fetchAds() {
    try {
      setLoading(true)
      setError(null)

      // Filtrer par pays (obligatoire)
      if (!country) {
        setAds([])
        setLoading(false)
        return
      }

      // 1. Récupérer les annonces avec pagination (limite Supabase 1000)
      const batchSize = 1000
      let allAdsData: any[] = []
      let from = 0
      let hasMore = true

      while (hasMore) {
        let adsQuery = supabase
          .from('ads')
          .select('*')
          .eq('status', 'approved')
          .eq('country', country)
          .order('created_at', { ascending: false })
          .range(from, from + batchSize - 1)

        // Filtrer par ville si spécifié
        if (city) {
          adsQuery = adsQuery.eq('location', city)
        }

        const { data: adsData, error: adsError } = await adsQuery

        if (adsError) {
          console.error('Erreur Supabase complète:', adsError)
          throw new Error(`${adsError.message} (Code: ${adsError.code})`)
        }

        if (!adsData || adsData.length === 0) {
          hasMore = false
          break
        }

        allAdsData = [...allAdsData, ...adsData]
        hasMore = adsData.length === batchSize
        from += batchSize
      }

      if (allAdsData.length === 0) {
        setAds([])
        return
      }

      // 2. Récupérer les profils des utilisateurs avec pagination par lots
      const userIds = [...new Set(allAdsData.map(ad => ad.user_id))] // Unique IDs
      console.log('🔍 Recherche des profils pour', userIds.length, 'users')

      const profilesMap = new Map()
      const profileBatchSize = 500 // Supabase limite les IN queries

      for (let i = 0; i < userIds.length; i += profileBatchSize) {
        const batchIds = userIds.slice(i, i + profileBatchSize)
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, age, rank')
          .in('id', batchIds)

        if (profilesError) {
          console.error('❌ Erreur lors de la récupération des profils:', profilesError)
        } else if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap.set(profile.id, profile)
          })
        }
      }

      console.log('✅ Profils récupérés:', profilesMap.size)

      // 3. Transformer les données
      const transformedAds: Ad[] = allAdsData.map((ad: any) => {
        const profile = profilesMap.get(ad.user_id)
        return {
          id: ad.id,
          userId: ad.user_id,
          username: profile?.username || 'Anonyme',
          title: ad.title,
          description: ad.description || '',
          age: profile?.age || 0,
          location: ad.location,
          arrondissement: ad.arrondissement,
          country: ad.country,
          category: ad.categories?.[0] || 'escort',
          photos: ad.photos || [],
          video: ad.video_url,
          price: ad.price,
          services: ad.services || [],
          meetingPlaces: [
            ad.meeting_at_home && 'Incall',
            ad.meeting_at_hotel && 'Hôtel',
            ad.meeting_in_car && 'Plan voiture',
            ad.meeting_at_escort && 'Outcall'
          ].filter(Boolean) as string[],
          availability: '',
          verified: ad.verified || false,
          rank: profile?.rank || 'standard',
          online: profile?.online || false,
          views: ad.views || 0,
          favorites: ad.favorites_count || 0,
          createdAt: new Date(ad.created_at),
          updatedAt: ad.updated_at ? new Date(ad.updated_at) : new Date(ad.created_at),
          // Nouvelles propriétés
          contactInfo: ad.contact_info,
          languages: ad.languages || [],
          acceptsCouples: ad.accepts_couples,
          outcall: ad.outcall,
          incall: ad.incall,
          physicalAttributes: ad.physical_attributes
        }
      })

      setAds(transformedAds)
    } catch (err) {
      console.error('Erreur lors de la récupération des annonces:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return { ads, loading, error, refetch: fetchAds }
}

export function useAdById(id: string) {
  const { user } = useAuth()
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAd()
  }, [id])

  async function fetchAd() {
    try {
      setLoading(true)
      setError(null)

      // 1. Récupérer l'annonce
      const { data, error: fetchError } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      if (data) {
        // 2. Récupérer le profil de l'utilisateur avec ses attributs physiques
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, age, rank, verified, languages, interested_in, height, weight, measurements, breast_size, breast_type, hair_color, eye_color, hair_removal, tattoo, ethnicity, body_type, piercings, nationality, gender, accepts_messages')
          .eq('id', data.user_id)
          .single()

        if (profileError) {
          console.error('Erreur lors de la récupération du profil:', profileError)
        }

        // Récupérer les infos de contact depuis l'annonce (ads)
        const contactInfo = {
          phone: data.phone_number || undefined,
          acceptsSMS: data.accepts_sms || false,
          acceptsCalls: data.accepts_calls ?? true,
          whatsapp: data.has_whatsapp || false,
          telegram: data.has_telegram || false,
          email: data.contact_email || undefined,
          mymUrl: data.mym_url || undefined,
          onlyfansUrl: data.onlyfans_url || undefined,
          availability: {
            available247: data.available24_7 || false,
            days: data.availability_days || [],
            hours: data.availability_hours || undefined
          }
        }

        // Debug: Log les données brutes
        console.log('🔍 DEBUG useAdById - Données brutes de Supabase:')
        console.log('  services:', data.services)
        console.log('  meeting_at_home:', data.meeting_at_home, 'meeting_at_hotel:', data.meeting_at_hotel)

        const transformedAd: Ad = {
          id: data.id,
          userId: data.user_id,
          username: profileData?.username || 'Anonyme',
          title: data.title,
          description: data.description || '',
          age: profileData?.age || 0,
          gender: profileData?.gender,
          location: data.location,
          arrondissement: data.arrondissement,
          country: profileData?.nationality || data.country,
          category: data.categories?.[0] || 'escort',
          photos: data.photos || [],
          video: data.video_url,
          price: data.price,
          services: data.services || [],
          meetingPlaces: [
            data.meeting_at_home && 'Incall',
            data.meeting_at_hotel && 'Hôtel',
            data.meeting_in_car && 'Plan voiture',
            data.meeting_at_escort && 'Outcall'
          ].filter(Boolean) as string[],
          availability: '',
          verified: profileData?.verified || false,
          rank: profileData?.rank || 'standard',
          online: false,
          views: data.views || 0,
          favorites: data.favorites_count || 0,
          createdAt: new Date(data.created_at),
          updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(data.created_at),
          // Nouvelles propriétés (utiliser les données du profil si pas dans l'annonce)
          contactInfo: contactInfo || undefined,
          languages: profileData?.languages || [],
          acceptsCouples: data.accepts_couples,
          outcall: data.outcall,
          incall: data.incall,
          acceptsMessages: profileData?.accepts_messages !== false,
          physicalAttributes: profileData ? {
            height: profileData.height,
            weight: profileData.weight,
            measurements: profileData.measurements,
            cupSize: profileData.breast_size,
            hairColor: profileData.hair_color,
            eyeColor: profileData.eye_color,
            ethnicity: profileData.ethnicity,
            bodyType: profileData.body_type,
            tattoos: profileData.tattoo,
            piercings: profileData.piercings,
            hairRemoval: profileData.hair_removal,
            breastType: profileData.breast_type
          } : undefined,
          interestedIn: profileData?.interested_in
        }

        setAd(transformedAd)

        // Incrémenter le compteur de vues via l'API (tracking IP)
        try {
          await fetch('/api/views', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              adId: id,
              userId: user?.id || null
            }),
          })
        } catch (viewError) {
          // Ignorer silencieusement les erreurs de tracking
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'annonce:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return { ad, loading, error, refetch: fetchAd }
}

export function useCreateAd() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createAd(adData: Partial<Ad>) {
    try {
      setLoading(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('ads')
        .insert([{
          user_id: adData.userId,
          username: adData.username,
          title: adData.title,
          description: adData.description,
          age: adData.age,
          location: adData.location,
          country: adData.country,
          category: adData.category,
          photos: adData.photos,
          video: adData.video,
          price: adData.price,
          services: adData.services,
          availability: adData.availability,
          verified: adData.verified,
          rank: adData.rank,
          online: adData.online
        }])
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return data
    } catch (err) {
      console.error('Erreur lors de la création de l\'annonce:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createAd, loading, error }
}

export function useUpdateAd() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function updateAd(id: string, updates: Partial<Ad>) {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('ads')
        .update({
          title: updates.title,
          description: updates.description,
          age: updates.age,
          location: updates.location,
          category: updates.category,
          photos: updates.photos,
          video: updates.video,
          price: updates.price,
          services: updates.services,
          availability: updates.availability,
          online: updates.online
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return data
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'annonce:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updateAd, loading, error }
}

export function useDeleteAd() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function deleteAd(id: string) {
    try {
      setLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('ads')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      return true
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'annonce:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deleteAd, loading, error }
}
