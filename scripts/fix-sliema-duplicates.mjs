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
    console.log('🔧 Correction des doublons de Sliema...\n')

    const jsonPath = join(__dirname, '..', 'data', 'sliema-ads.json')
    const jsonData = JSON.parse(readFileSync(jsonPath, 'utf8'))

    // Profils avec noms modifiés pour éviter les doublons
    const duplicates = [
      { originalName: 'Sara', newName: 'Sara 2', email: 'escortemalte76@gmail.com' },
      { originalName: 'Sara', newName: 'Sara 3', email: 'escortemalte100@gmail.com' },
      { originalName: 'Vanessa', newName: 'Vanessa 2', email: 'escortemalte90@gmail.com' },
      { originalName: 'Kim', newName: 'Kim 2', email: 'escortemalte97@gmail.com' },
      { originalName: 'Bella', newName: 'Bella 2', email: 'escortemalte99@gmail.com' },
      { originalName: 'Luisa', newName: 'Luisa 2', email: 'escortemalte103@gmail.com' },
      { originalName: 'Laura', newName: 'Laura 3', email: 'escortemalte105@gmail.com' }
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

        // Vérifier si le profil existe déjà
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', userId)
          .single()

        if (existingProfile) {
          console.log(`   ⚠️  Profil existe déjà avec username: ${existingProfile.username}`)

          // Mettre à jour le username
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ username: dup.newName })
            .eq('id', userId)

          if (updateError) {
            console.log(`   ❌ Erreur mise à jour profil: ${updateError.message}`)
            errorCount++
            continue
          }

          console.log(`   ✅ Username mis à jour: ${dup.newName}`)
        } else {
          // Créer le profil avec les données de l'annonce
          const ad = jsonData.ads.find(a =>
            a.name === dup.originalName &&
            jsonData.ads.indexOf(a) === duplicates.indexOf(dup)
          )

          if (!ad) {
            console.log(`   ❌ Annonce non trouvée`)
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
        }

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
