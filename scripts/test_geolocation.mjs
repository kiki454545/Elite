import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Test de la géolocalisation...\n')

async function testGeolocation() {
  try {
    // 1. Vérifier les villes
    console.log('📍 Vérification des villes:')
    const { data: montreuil } = await supabase
      .from('french_cities')
      .select('*')
      .ilike('name', 'Montreuil')
      .single()

    console.log('Montreuil:', montreuil)

    const { data: paris } = await supabase
      .from('french_cities')
      .select('*')
      .ilike('name', 'Paris')
      .single()

    console.log('Paris:', paris)

    // 2. Vérifier les annonces
    console.log('\n📋 Vérification des annonces:')
    const { data: ads } = await supabase
      .from('ads')
      .select('id, title, location, latitude, longitude')

    console.log(`Nombre d'annonces: ${ads?.length || 0}`)
    ads?.forEach(ad => {
      console.log(`  - ${ad.title || 'Sans titre'} à ${ad.location} (${ad.latitude}, ${ad.longitude})`)
    })

    // 3. Tester la fonction RPC avec Montreuil
    if (montreuil) {
      console.log('\n🧪 Test de la fonction search_ads_by_distance:')
      console.log(`Recherche depuis Montreuil (${montreuil.latitude}, ${montreuil.longitude}) dans un rayon de 100km`)

      const { data: results, error } = await supabase
        .rpc('search_ads_by_distance', {
          search_lat: montreuil.latitude,
          search_lon: montreuil.longitude,
          max_distance_km: 100,
          limit_count: 50,
          offset_count: 0
        })

      if (error) {
        console.error('❌ Erreur:', error)
      } else {
        console.log(`✅ ${results?.length || 0} annonce(s) trouvée(s)`)
        results?.forEach(result => {
          console.log(`  - ${result.title || 'Sans titre'} à ${result.location} (${Math.round(result.distance_km)} km)`)
        })
      }
    }

    // 4. Calculer manuellement la distance Montreuil-Paris
    if (montreuil && paris) {
      console.log('\n📏 Distance Montreuil-Paris:')
      const { data: distance } = await supabase
        .rpc('calculate_distance', {
          lat1: montreuil.latitude,
          lon1: montreuil.longitude,
          lat2: paris.latitude,
          lon2: paris.longitude
        })
      console.log(`Distance calculée: ${distance} km`)
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testGeolocation()
