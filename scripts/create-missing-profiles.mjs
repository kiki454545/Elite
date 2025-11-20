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

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔨 Création des profils manquants...\n')

// Lire le fichier JSON
const jsonPath = join(__dirname, '..', 'data', 'san-gwann-ads.json')
const jsonData = JSON.parse(readFileSync(jsonPath, 'utf8'))

// Récupérer toutes les annonces de San Ġwann
const { data: ads } = await supabase
  .from('ads')
  .select('id, title, user_id')
  .eq('location', 'San Ġwann')

for (const ad of ads) {
  // Trouver les données correspondantes dans le JSON
  const adData = jsonData.ads.find(a => a.name === ad.title)

  if (adData) {
    console.log(`Création du profil pour "${ad.title}"...`)

    // Créer le profil
    const profileData = {
      id: ad.user_id,
      username: adData.name,
      age: adData.age,
      gender: adData.gender,
      phone_number: adData.phone,
      has_whatsapp: adData.whatsapp,
      available24_7: adData.workingHours === '24/7',
      rank: 'standard',
      verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (adData.height) profileData.height = adData.height
    if (adData.weight) profileData.weight = adData.weight
    if (adData.cupSize) profileData.breast_size = adData.cupSize

    const { error } = await supabase
      .from('profiles')
      .insert(profileData)

    if (error) {
      console.log(`  ❌ Erreur: ${error.message}`)
    } else {
      console.log(`  ✅ Profil créé`)
    }
  }
}

console.log('\n✅ Tous les profils ont été créés!')
