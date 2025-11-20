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

const MEETING_PLACES = ['Incall', 'Hôtel', 'Outcall', 'Plan voiture']

async function checkAllAds() {
  try {
    console.log('🔍 Vérification de TOUTES les annonces...\n')

    // Récupérer toutes les annonces
    const { data: ads, error } = await supabase
      .from('ads')
      .select('id, title, services, meeting_places')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    console.log(`📊 ${ads.length} annonces trouvées\n`)

    let problemCount = 0
    let okCount = 0

    ads.forEach((ad, index) => {
      const servicesArray = ad.services || []
      const meetingPlacesArray = ad.meeting_places || []

      // Vérifier si des meeting_places sont dans services
      const meetingPlacesInServices = servicesArray.filter(service =>
        MEETING_PLACES.includes(service)
      )

      if (meetingPlacesInServices.length > 0) {
        problemCount++
        console.log(`⚠️  #${index + 1} - "${ad.title}" (ID: ${ad.id})`)
        console.log(`   Services: ${JSON.stringify(servicesArray)}`)
        console.log(`   Meeting places: ${JSON.stringify(meetingPlacesArray)}`)
        console.log(`   ❌ Meeting places trouvés dans services: ${meetingPlacesInServices.join(', ')}`)
        console.log('')
      } else {
        okCount++
        if (index < 3) { // Afficher les 3 premières pour exemple
          console.log(`✅ #${index + 1} - "${ad.title}"`)
          console.log(`   Services: ${JSON.stringify(servicesArray)}`)
          console.log(`   Meeting places: ${JSON.stringify(meetingPlacesArray)}`)
          console.log('')
        }
      }
    })

    console.log('\n📋 RÉSUMÉ')
    console.log('═══════════════════════════════════════')
    console.log(`✅ ${okCount} annonces OK`)
    console.log(`⚠️  ${problemCount} annonces avec des problèmes`)
    console.log(`📊 ${ads.length} annonces au total`)

    if (problemCount > 0) {
      console.log('\n⚠️  Des annonces ont des meeting_places dans la colonne services!')
      console.log('Exécutez le script de migration pour corriger cela.')
    } else {
      console.log('\n✅ Toutes les annonces sont correctes!')
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

checkAllAds()
