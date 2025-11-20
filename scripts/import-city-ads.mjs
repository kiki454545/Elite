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

async function getNextEmailNumber() {
  // Récupérer le dernier email créé pour continuer la numérotation
  const { data: { users }, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('❌ Erreur récupération users:', error.message)
    return 1
  }

  const escorteMalteEmails = users
    .map(u => u.email)
    .filter(email => email.startsWith('escortemalte'))
    .map(email => {
      const match = email.match(/escortemalte(\d+)@gmail\.com/)
      return match ? parseInt(match[1]) : 0
    })
    .filter(num => num > 0)

  return escorteMalteEmails.length > 0 ? Math.max(...escorteMalteEmails) + 1 : 1
}

async function importAds(cityName, jsonFileName) {
  try {
    console.log(`📥 Importation des annonces de ${cityName}...\n`)

    const jsonPath = join(__dirname, '..', 'data', jsonFileName)
    const jsonData = JSON.parse(readFileSync(jsonPath, 'utf8'))

    console.log(`📊 ${jsonData.ads.length} annonces à importer\n`)

    let startEmailNumber = await getNextEmailNumber()
    console.log(`📧 Numérotation des emails commence à: escortemalte${startEmailNumber}@gmail.com\n`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < jsonData.ads.length; i++) {
      const ad = jsonData.ads[i]
      try {
        console.log(`\n🔄 Importation de "${ad.name}"...`)

        const email = `escortemalte${startEmailNumber + i}@gmail.com`
        const password = 'Malta2025!'

        // Vérifier si le username existe déjà pour gérer les doublons
        const { data: existingProfiles } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', ad.name)

        let finalUsername = ad.name
        if (existingProfiles && existingProfiles.length > 0) {
          // Il y a déjà un ou plusieurs profils avec ce nom
          const count = existingProfiles.length + 1
          finalUsername = `${ad.name} ${count}`
          console.log(`   ⚠️  Doublon détecté, renommage: "${ad.name}" → "${finalUsername}"`)
        }

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
            username: finalUsername,
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
            username: finalUsername,
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

        // S'assurer qu'il y a une description
        const description = ad.description || `Escort professionnelle disponible à ${ad.location}. Contactez-moi pour plus d'informations.`

        const { data: adData, error: adError } = await supabase
          .from('ads')
          .insert({
            user_id: userId,
            title: finalUsername,
            description: description,
            location: ad.location,
            country: ad.country,
            categories: ['escort'],
            services: ad.services || [],
            meeting_places: ad.meetingPlaces,
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
    console.log(`📧 Emails utilisés: escortemalte${startEmailNumber} à escortemalte${startEmailNumber + jsonData.ads.length - 1}`)

  } catch (error) {
    console.error('❌ Erreur globale:', error.message)
    process.exit(1)
  }
}

// Vérifier les arguments
const args = process.argv.slice(2)
if (args.length !== 2) {
  console.error('Usage: node scripts/import-city-ads.mjs <cityName> <jsonFileName>')
  console.error('Exemple: node scripts/import-city-ads.mjs "Mdina" mdina-ads.json')
  process.exit(1)
}

const cityName = args[0]
const jsonFileName = args[1]

console.log(`🚀 Démarrage de l'importation des annonces de ${cityName}...\n`)
importAds(cityName, jsonFileName)
