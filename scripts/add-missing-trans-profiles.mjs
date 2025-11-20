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

// Lire le fichier JSON
const jsonPath = join(__dirname, '..', 'data', 'san-gwann-ads.json')
const jsonData = JSON.parse(readFileSync(jsonPath, 'utf8'))

console.log('📥 Ajout des 3 profils manquants...\\n')

// Les 3 profils qui ont échoué étaient aux positions 2, 6, et 12 (QUEEN CAROLINA, Lady Sara, Joselyn Trans)
const failedIndices = [1, 5, 11] // index 0-based
const failedEmails = ['escortemalte2@gmail.com', 'escortemalte6@gmail.com', 'escortemalte12@gmail.com']

for (let i = 0; i < failedIndices.length; i++) {
  const adIndex = failedIndices[i]
  const email = failedEmails[i]
  const ad = jsonData.ads[adIndex]

  console.log(`\\n🔄 Création du profil pour "${ad.name}" (${email})...`)

  // Trouver l'user_id
  const { data: authData } = await supabase.auth.admin.listUsers()
  const user = authData.users.find(u => u.email === email)

  if (!user) {
    console.log(`   ❌ Utilisateur ${email} non trouvé`)
    continue
  }

  const userId = user.id

  // Créer le profil
  const profileData = {
    id: userId,
    email: email,
    username: ad.name,
    age: ad.age,
    gender: ad.gender, // Maintenant "female"
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

  const { error: profileError } = await supabase
    .from('profiles')
    .insert(profileData)

  if (profileError) {
    console.log(`   ❌ Erreur création profil: ${profileError.message}`)
    continue
  }

  console.log(`   ✅ Profil créé`)

  // Créer l'annonce
  const { error: adError } = await supabase
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

  if (adError) {
    console.log(`   ❌ Erreur création annonce: ${adError.message}`)
  } else {
    console.log(`   ✅ Annonce créée`)
  }
}

console.log('\\n✅ Terminé!')
