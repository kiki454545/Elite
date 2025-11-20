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

async function fixDuplicates() {
  try {
    console.log('🔧 Correction des doublons de Gzira...\n')

    const jsonPath = join(__dirname, '..', 'data', 'gzira-ads.json')
    const jsonData = JSON.parse(readFileSync(jsonPath, 'utf8'))

    // Profils avec noms modifiés pour éviter les doublons
    // Cielo est à l'index 17, Sara est à l'index 19
    const duplicates = [
      { originalName: 'Cielo', newName: 'Cielo 2', email: 'escortemalte125@gmail.com', index: 17 },
      { originalName: 'Sara', newName: 'Sara 4', email: 'escortemalte127@gmail.com', index: 19 }
    ]

    let successCount = 0
    let errorCount = 0

    for (const dup of duplicates) {
      try {
        console.log(`\n🔄 Correction de "${dup.originalName}" → "${dup.newName}"...`)

        // Trouver l'utilisateur par email
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

        if (listError) {
          console.log(`   ❌ Erreur listage users: ${listError.message}`)
          errorCount++
          continue
        }

        const user = users.find(u => u.email === dup.email)

        if (!user) {
          console.log(`   ❌ User non trouvé pour ${dup.email}`)
          errorCount++
          continue
        }

        const userId = user.id
        console.log(`   ✅ User trouvé: ${userId}`)

        const ad = jsonData.ads[dup.index]

        if (!ad) {
          console.log(`   ❌ Annonce non trouvée à l'index ${dup.index}`)
          errorCount++
          continue
        }

        const profileData = {
          id: userId,
          email: dup.email,
          username: dup.newName,
          age: ad.age,
          gender: ad.gender,
          phone_number: ad.phone,
          has_whatsapp: ad.whatsapp,
          available24_7: ad.workingHours === '24/7',
          rank: 'standard',
          verified: false,
          country: ad.country || 'MT'
        }

        if (ad.height) profileData.height = ad.height
        if (ad.weight) profileData.weight = ad.weight
        if (ad.cupSize) profileData.breast_size = ad.cupSize

        const { error: createError } = await supabase
          .from('profiles')
          .insert(profileData)

        if (createError) {
          console.log(`   ❌ Erreur création profil: ${createError.message}`)
          errorCount++
          continue
        }

        console.log(`   ✅ Profil créé: ${dup.newName}`)

        // Créer l'annonce
        const { error: adError } = await supabase
          .from('ads')
          .insert({
            user_id: userId,
            title: dup.newName,
            description: ad.description,
            location: ad.location,
            country: ad.country,
            categories: ['escort'],
            services: ad.services,
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

        console.log(`   ✅ Annonce créée`)
        successCount++

      } catch (err) {
        console.log(`   ❌ Erreur: ${err.message}`)
        errorCount++
      }
    }

    console.log('\n\n📋 RÉSUMÉ')
    console.log('═══════════════════════════════')
    console.log(`✅ ${successCount} profils corrigés`)
    console.log(`❌ ${errorCount} erreurs`)

  } catch (error) {
    console.error('❌ Erreur globale:', error.message)
    process.exit(1)
  }
}

console.log('🚀 Démarrage de la correction des doublons...\n')
fixDuplicates()
