import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Debug de l\'affichage dans la recherche...\n')

async function debugSearchDisplay() {
  try {
    // 1. Vérifier les annonces avec profils séparés (nouvelle méthode)
    console.log('📋 Test du query avec profils séparés (nouvelle méthode):')
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'approved')
      .eq('country', 'FR')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erreur:', error)
      return
    }

    console.log(`✅ ${data?.length || 0} annonce(s) trouvée(s)\n`)

    if (!data || data.length === 0) {
      console.log('Aucune annonce trouvée')
      return
    }

    // Récupérer les profils
    const userIds = data.map((item) => item.user_id)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, rank')
      .in('id', userIds)

    if (profilesError) {
      console.error('❌ Erreur profils:', profilesError)
      return
    }

    console.log(`✅ ${profiles?.length || 0} profil(s) trouvé(s)\n`)

    // Créer un index
    const profilesMap = new Map()
    profiles?.forEach(profile => {
      profilesMap.set(profile.id, profile)
    })

    // Afficher les détails de chaque annonce
    data?.forEach((item, index) => {
      const profile = profilesMap.get(item.user_id)
      console.log(`\n--- Annonce ${index + 1} ---`)
      console.log(`ID: ${item.id}`)
      console.log(`user_id: ${item.user_id}`)
      console.log(`title (dans ads): ${item.title}`)
      console.log(`location: ${item.location}`)
      console.log(`photos: ${item.photos?.length || 0} photo(s)`)
      console.log(`Profil trouvé:`, profile)

      // Simuler la transformation en Ad comme dans le code
      const username = profile?.username || item.title || 'Utilisateur'
      const rank = profile?.rank || 'standard'

      console.log(`\n🎯 Ce qui sera affiché:`)
      console.log(`  username: ${username}`)
      console.log(`  rank: ${rank}`)
      console.log(`  photos[0]: ${item.photos?.[0] || 'Aucune'}`)
    })

    // 2. Test avec recherche géolocalisation
    console.log('\n\n📍 Test de recherche par géolocalisation:')

    // Chercher Paris
    const { data: paris } = await supabase
      .from('french_cities')
      .select('*')
      .ilike('name', 'Paris')
      .single()

    if (paris) {
      console.log(`Recherche depuis Paris (${paris.latitude}, ${paris.longitude})`)

      const { data: geoResults, error: geoError } = await supabase
        .rpc('search_ads_by_distance', {
          search_lat: paris.latitude,
          search_lon: paris.longitude,
          max_distance_km: 100,
          limit_count: 50,
          offset_count: 0
        })

      if (geoError) {
        console.error('❌ Erreur géolocalisation:', geoError)
      } else {
        console.log(`✅ ${geoResults?.length || 0} résultat(s)\n`)

        if (geoResults && geoResults.length > 0) {
          // Récupérer les profils séparément comme dans le code
          const userIds = geoResults.map((item) => item.user_id)
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, rank')
            .in('id', userIds)

          console.log('Profils récupérés:', profiles)

          // Créer un index
          const profilesMap = new Map()
          profiles?.forEach(profile => {
            profilesMap.set(profile.id, profile)
          })

          // Simuler la transformation
          geoResults.forEach((item, index) => {
            const profile = profilesMap.get(item.user_id)
            console.log(`\n--- Résultat géo ${index + 1} ---`)
            console.log(`title (dans résultat): ${item.title}`)
            console.log(`user_id: ${item.user_id}`)
            console.log(`profile trouvé:`, profile)
            console.log(`username qui sera affiché: ${profile?.username || item.title || 'Utilisateur'}`)
            console.log(`distance: ${item.distance_km} km`)
          })
        }
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

debugSearchDisplay()
