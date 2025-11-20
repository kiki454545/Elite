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

async function checkSpecificAd() {
  try {
    // Récupérer la dernière annonce approved
    const { data: ad, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      throw error
    }

    console.log('📋 DÉTAILS DE L\'ANNONCE LA PLUS RÉCENTE')
    console.log('═══════════════════════════════════════\n')
    console.log(`Titre: ${ad.title}`)
    console.log(`ID: ${ad.id}`)
    console.log(`User ID: ${ad.user_id}`)
    console.log(`Status: ${ad.status}`)
    console.log(`\n🔍 DONNÉES IMPORTANTES:\n`)
    console.log(`Services (colonne 'services'):`)
    console.log(JSON.stringify(ad.services, null, 2))
    console.log(`\nMeeting Places (colonne 'meeting_places'):`)
    console.log(JSON.stringify(ad.meeting_places, null, 2))
    console.log(`\nCategories:`)
    console.log(JSON.stringify(ad.categories, null, 2))

    console.log(`\n\n🌐 URL de l'annonce:`)
    console.log(`https://sexelite.fr/ads/${ad.id}`)

    // Vérifier si des meeting_places sont dans services
    const MEETING_PLACES = ['Incall', 'Hôtel', 'Outcall', 'Plan voiture']
    const servicesArray = ad.services || []
    const meetingPlacesInServices = servicesArray.filter(s => MEETING_PLACES.includes(s))

    if (meetingPlacesInServices.length > 0) {
      console.log(`\n⚠️  PROBLÈME DÉTECTÉ!`)
      console.log(`Les valeurs suivantes sont dans 'services' mais devraient être dans 'meeting_places':`)
      console.log(meetingPlacesInServices.join(', '))
    } else {
      console.log(`\n✅ Les données sont correctement séparées`)
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

checkSpecificAd()
