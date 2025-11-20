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

console.log('🔧 Correction des profils en double...\n')

// Lire le fichier JSON
const jsonPath = join(__dirname, '..', 'data', 'msida-ads.json')
const jsonData = JSON.parse(readFileSync(jsonPath, 'utf8'))

// Les profils qui ont échoué avec leurs index et emails
const duplicates = [
  { index: 14, email: 'escortemalte29@gmail.com', originalName: 'Catalina', newName: 'Catalina 2' },
  { index: 28, email: 'escortemalte43@gmail.com', originalName: 'Melissa', newName: 'Melissa 2' },
  { index: 36, email: 'escortemalte51@gmail.com', originalName: 'Laura', newName: 'Laura' }, // Pas de doublon visible, peut-être un autre Laura existe
  { index: 40, email: 'escortemalte55@gmail.com', originalName: 'Paulina', newName: 'Paulina 2' }
]

for (const dup of duplicates) {
  const ad = jsonData.ads[dup.index]

  console.log(`\n🔄 Traitement de "${dup.originalName}" (${dup.email})...`)

  // Trouver l'user_id
  const { data: authData } = await supabase.auth.admin.listUsers()
  const user = authData.users.find(u => u.email === dup.email)

  if (!user) {
    console.log(`   ❌ Utilisateur ${dup.email} non trouvé`)
    continue
  }

  const userId = user.id

  // Créer le profil avec un nom modifié
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

  const { error: profileError } = await supabase
    .from('profiles')
    .insert(profileData)

  if (profileError) {
    console.log(`   ❌ Erreur création profil: ${profileError.message}`)
    continue
  }

  console.log(`   ✅ Profil créé avec le nom "${dup.newName}"`)

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
  } else {
    console.log(`   ✅ Annonce créée`)
  }
}

console.log('\n✅ Terminé!')
