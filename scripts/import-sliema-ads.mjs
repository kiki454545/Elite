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

async function importAds() {
  try {
    console.log('📥 Importation des annonces de Sliema...\n')

    const jsonPath = join(__dirname, '..', 'data', 'sliema-ads.json')
    const jsonData = JSON.parse(readFileSync(jsonPath, 'utf8'))

    console.log(`📊 ${jsonData.ads.length} annonces à importer\n`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < jsonData.ads.length; i++) {
      const ad = jsonData.ads[i]
      try {
        console.log(`\n🔄 Importation de "${ad.name}"...`)

        // Email commence à 66 (après Birkirkara qui va de 60 à 65)
        const email = `escortemalte${i + 66}@gmail.com`
        const password = 'Malta2025!'

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            imported: true,
            source: 'sexomalta.com'
          }
        })

        if (authError) {
          console.log(`   ❌ Erreur création auth: ${authError.message}`)
          errorCount++
          continue
        }

        const userId = authData.user.id
        console.log(`   ✅ User créé: ${email}`)

        await new Promise(resolve => setTimeout(resolve, 2000))

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single()

        if (!existingProfile) {
          console.log(`   ⚠️  Profil non créé par le trigger, création manuelle...`)

          const profileData = {
            id: userId,
            email: email,
            username: ad.name,
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
          console.log(`   ✅ Profil créé manuellement`)
        } else {
          const profileUpdates = {
            username: ad.name,
            age: ad.age,
            gender: ad.gender,
            phone_number: ad.phone,
            has_whatsapp: ad.whatsapp,
            available24_7: ad.workingHours === '24/7',
            rank: 'standard',
            verified: false
          }

          if (ad.height) profileUpdates.height = ad.height
          if (ad.weight) profileUpdates.weight = ad.weight
          if (ad.cupSize) profileUpdates.breast_size = ad.cupSize

          const { error: profileError } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', userId)

          if (profileError) {
            console.log(`   ⚠️  Erreur mise à jour profil: ${profileError.message}`)
          } else {
            console.log(`   ✅ Profil mis à jour`)
          }
        }

        const { data: adData, error: adError } = await supabase
          .from('ads')
          .insert({
            user_id: userId,
            title: ad.name,
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
          .select()
          .single()

        if (adError) {
          console.log(`   ❌ Erreur création annonce: ${adError.message}`)
          errorCount++
          continue
        }

        console.log(`   ✅ Annonce créée avec succès (ID: ${adData.id})`)
        successCount++

      } catch (err) {
        console.log(`   ❌ Erreur: ${err.message}`)
        errorCount++
      }
    }

    console.log('\n\n📋 RÉSUMÉ DE L\'IMPORTATION')
    console.log('═══════════════════════════════════════')
    console.log(`✅ ${successCount} annonces importées avec succès`)
    console.log(`❌ ${errorCount} erreurs`)
    console.log(`📊 ${jsonData.ads.length} annonces au total`)

  } catch (error) {
    console.error('❌ Erreur globale:', error.message)
    process.exit(1)
  }
}

console.log('🚀 Démarrage de l\'importation des annonces de Sliema...\n')
importAds()
