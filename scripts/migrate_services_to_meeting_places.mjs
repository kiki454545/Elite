import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Liste des meeting places qui ne doivent PAS être dans services
const MEETING_PLACES = ['Incall', 'Hôtel', 'Outcall', 'Plan voiture']

async function migrateData() {
  try {
    console.log('🔍 Recherche des annonces à migrer...\n')

    // Récupérer toutes les annonces
    const { data: ads, error } = await supabase
      .from('ads')
      .select('id, title, services, meeting_places')

    if (error) {
      throw error
    }

    console.log(`📊 ${ads.length} annonces trouvées\n`)

    let migratedCount = 0
    let alreadyOkCount = 0

    for (const ad of ads) {
      let needsUpdate = false
      let cleanedServices = ad.services || []
      let updatedMeetingPlaces = ad.meeting_places || []

      // Trouver les meeting_places qui sont dans services
      const meetingPlacesInServices = cleanedServices.filter(service =>
        MEETING_PLACES.includes(service)
      )

      if (meetingPlacesInServices.length > 0) {
        console.log(`🔧 Migration de l'annonce: "${ad.title}" (ID: ${ad.id})`)
        console.log(`   Services avant: ${JSON.stringify(ad.services)}`)
        console.log(`   Meeting places avant: ${JSON.stringify(ad.meeting_places)}`)

        // Retirer les meeting_places des services
        cleanedServices = cleanedServices.filter(service =>
          !MEETING_PLACES.includes(service)
        )

        // Ajouter ces meeting_places à meeting_places (sans doublons)
        meetingPlacesInServices.forEach(place => {
          if (!updatedMeetingPlaces.includes(place)) {
            updatedMeetingPlaces.push(place)
          }
        })

        console.log(`   Services après: ${JSON.stringify(cleanedServices)}`)
        console.log(`   Meeting places après: ${JSON.stringify(updatedMeetingPlaces)}`)

        needsUpdate = true
      }

      if (needsUpdate) {
        // Mettre à jour l'annonce
        const { error: updateError } = await supabase
          .from('ads')
          .update({
            services: cleanedServices,
            meeting_places: updatedMeetingPlaces
          })
          .eq('id', ad.id)

        if (updateError) {
          console.log(`   ❌ Erreur lors de la mise à jour: ${updateError.message}`)
        } else {
          console.log(`   ✅ Annonce migrée avec succès`)
          migratedCount++
        }
        console.log('')
      } else {
        alreadyOkCount++
      }
    }

    console.log('\n📋 RÉSUMÉ DE LA MIGRATION')
    console.log('═══════════════════════════════════════')
    console.log(`✅ ${migratedCount} annonces migrées`)
    console.log(`👍 ${alreadyOkCount} annonces déjà correctes`)
    console.log(`📊 ${ads.length} annonces au total`)

    if (migratedCount > 0) {
      console.log('\n✨ Migration terminée avec succès!')
      console.log('Les meeting_places ont été déplacés de la colonne services vers meeting_places.')
    } else {
      console.log('\n✨ Aucune migration nécessaire, toutes les annonces sont correctes!')
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

console.log('🚀 Démarrage de la migration des services vers meeting_places...\n')
migrateData()
