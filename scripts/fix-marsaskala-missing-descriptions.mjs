import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixMissingDescriptions() {
  try {
    console.log('🔧 Correction des descriptions manquantes de Marsaskala...\n')

    const jsonPath = join(__dirname, '..', 'data', 'marsaskala-ads.json')
    const jsonData = JSON.parse(readFileSync(jsonPath, 'utf8'))

    // Laura est à l'index 13, ANGEL est à l'index 14
    const profilesToFix = [
      { originalName: 'Laura', newName: 'Laura 2', email: 'escortemalte146@gmail.com', index: 13 },
      { originalName: 'ANGEL', newName: 'ANGEL', email: 'escortemalte147@gmail.com', index: 14 }
    ]

    let successCount = 0
    let errorCount = 0

    for (const profile of profilesToFix) {
      try {
        console.log(`\n🔄 Correction de "${profile.originalName}"...`)

        // Trouver l'utilisateur par email
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

        if (listError) {
          console.log(`   ❌ Erreur listage users: ${listError.message}`)
          errorCount++
          continue
        }

        const user = users.find(u => u.email === profile.email)

        if (!user) {
          console.log(`   ❌ User non trouvé pour ${profile.email}`)
          errorCount++
          continue
        }

        const userId = user.id
        console.log(`   ✅ User trouvé: ${userId}`)

        const ad = jsonData.ads[profile.index]

        if (!ad) {
          console.log(`   ❌ Annonce non trouvée à l'index ${profile.index}`)
          errorCount++
          continue
        }

        // Créer une description par défaut
        const description = `Escort professionnelle disponible à ${ad.location}. Contactez-moi pour plus d'informations.`

        // Créer l'annonce avec une description
        const { error: adError } = await supabase
          .from('ads')
          .insert({
            user_id: userId,
            title: profile.newName,
            description: description,
            location: ad.location,
            country: ad.country,
            categories: ['escort'],
            services: ad.services || [],
            meeting_places: ad.meetingPlaces,
            price: ad.price,
            status: 'approved',
            photos: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (adError) {
          console.log(`   ❌ Erreur création annonce: ${adError.message}`)
          errorCount++
          continue
        }

        console.log(`   ✅ Annonce créée avec description par défaut`)
        successCount++

      } catch (err) {
        console.log(`   ❌ Erreur: ${err.message}`)
        errorCount++
      }
    }

    console.log('\n\n📋 RÉSUMÉ')
    console.log('═══════════════════════════════')
    console.log(`✅ ${successCount} annonces corrigées`)
    console.log(`❌ ${errorCount} erreurs`)

  } catch (error) {
    console.error('❌ Erreur globale:', error.message)
    process.exit(1)
  }
}

console.log('🚀 Démarrage de la correction...\n')
fixMissingDescriptions()
