import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Fonction pour normaliser le nom de ville
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

console.log('🚀 Migration des coordonnées GPS pour les annonces existantes...\n')

async function migrateAdsCoordinates() {
  try {
    // 1. Récupérer toutes les annonces sans coordonnées
    console.log('📊 Récupération des annonces sans coordonnées...')
    const { data: ads, error: adsError } = await supabase
      .from('ads')
      .select('id, location')
      .or('latitude.is.null,longitude.is.null')

    if (adsError) throw adsError

    console.log(`✅ ${ads.length} annonces trouvées sans coordonnées\n`)

    if (ads.length === 0) {
      console.log('✨ Toutes les annonces ont déjà des coordonnées !')
      return
    }

    // 2. Récupérer toutes les villes de la base
    console.log('📍 Récupération de la liste des villes...')
    const { data: cities, error: citiesError } = await supabase
      .from('french_cities')
      .select('name, name_normalized, latitude, longitude')

    if (citiesError) throw citiesError

    console.log(`✅ ${cities.length} villes disponibles\n`)

    // Créer un index pour recherche rapide
    const cityIndex = new Map()
    cities.forEach(city => {
      cityIndex.set(city.name_normalized, {
        latitude: city.latitude,
        longitude: city.longitude
      })
    })

    // 3. Mettre à jour les annonces
    console.log('🔄 Mise à jour des annonces...\n')
    let updated = 0
    let notFound = 0
    const notFoundCities = new Set()

    for (const ad of ads) {
      const normalizedCity = normalizeName(ad.location)
      const coordinates = cityIndex.get(normalizedCity)

      if (coordinates) {
        // Mettre à jour l'annonce avec les coordonnées
        const { error: updateError } = await supabase
          .from('ads')
          .update({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          })
          .eq('id', ad.id)

        if (updateError) {
          console.error(`❌ Erreur pour l'annonce ${ad.id}:`, updateError.message)
        } else {
          updated++
          if (updated % 10 === 0) {
            console.log(`✅ ${updated} annonces mises à jour...`)
          }
        }
      } else {
        notFound++
        notFoundCities.add(ad.location)
      }
    }

    console.log(`\n🎉 Migration terminée !`)
    console.log(`✅ ${updated} annonces mises à jour avec succès`)
    console.log(`⚠️  ${notFound} annonces sans correspondance de ville\n`)

    if (notFoundCities.size > 0) {
      console.log('📋 Villes non trouvées dans la base:')
      Array.from(notFoundCities).sort().forEach(city => {
        console.log(`   - ${city}`)
      })
      console.log('\n💡 Astuce: Vous pouvez ajouter ces villes manuellement dans french_cities')
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message)
  }
}

migrateAdsCoordinates()
