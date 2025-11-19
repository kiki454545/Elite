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

async function fixServicesData() {
  try {
    console.log('🔍 Recherche des annonces avec des services invalides...\n')

    // Récupérer toutes les annonces
    const { data: ads, error } = await supabase
      .from('ads')
      .select('id, title, services, meeting_places')

    if (error) {
      throw error
    }

    console.log(`📊 ${ads.length} annonces trouvées\n`)

    let fixedCount = 0
    let issuesFound = []

    for (const ad of ads) {
      let needsUpdate = false
      let cleanedServices = ad.services || []

      // Vérifier si des meeting_places sont dans services
      const invalidServices = cleanedServices.filter(service =>
        MEETING_PLACES.includes(service)
      )

      if (invalidServices.length > 0) {
        console.log(`⚠️  Annonce "${ad.title}" (ID: ${ad.id})`)
        console.log(`   Services actuels: ${JSON.stringify(ad.services)}`)
        console.log(`   Services invalides trouvés: ${JSON.stringify(invalidServices)}`)

        // Retirer les meeting_places des services
        cleanedServices = cleanedServices.filter(service =>
          !MEETING_PLACES.includes(service)
        )

        needsUpdate = true
        issuesFound.push({
          id: ad.id,
          title: ad.title,
          invalidServices,
          cleanedServices
        })
      }

      if (needsUpdate) {
        // Mettre à jour l'annonce
        const { error: updateError } = await supabase
          .from('ads')
          .update({ services: cleanedServices })
          .eq('id', ad.id)

        if (updateError) {
          console.log(`   ❌ Erreur lors de la mise à jour: ${updateError.message}`)
        } else {
          console.log(`   ✅ Services nettoyés: ${JSON.stringify(cleanedServices)}`)
          fixedCount++
        }
        console.log('')
      }
    }

    console.log('\n📋 RÉSUMÉ')
    console.log('─────────────────────────────────────')
    console.log(`✅ ${fixedCount} annonces corrigées`)
    console.log(`📊 ${ads.length - fixedCount} annonces OK`)

    if (issuesFound.length > 0) {
      console.log('\n🔧 Problèmes corrigés:')
      issuesFound.forEach(issue => {
        console.log(`\n   Annonce: ${issue.title}`)
        console.log(`   ID: ${issue.id}`)
        console.log(`   Services invalides retirés: ${issue.invalidServices.join(', ')}`)
        console.log(`   Services finaux: ${issue.cleanedServices.join(', ') || 'Aucun'}`)
      })
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

fixServicesData()
