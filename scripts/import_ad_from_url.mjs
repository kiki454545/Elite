import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non défini')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Configuration
const PASSWORD = 'aaaaaa'
const EMAIL_PREFIX = 'escorte'
const EMAIL_DOMAIN = '@gmail.com'

// Données de l'annonce (extraites de sexemodel.com/escort/SOFIA-1465666/)
const adData = {
  username: 'Sofia',
  age: 25,
  location: 'Marseille',
  country: 'FR',
  phone: '0773384971',
  hasWhatsapp: true,
  acceptsCalls: true,
  acceptsSMS: true,

  // Caractéristiques physiques
  gender: 'female',
  ethnicity: 'metisse',  // caucasienne, africaine, asiatique, latine, arabe, metisse, autre
  height: 169,
  weight: 65,
  hairColor: 'brune',  // blonde, brune, rousse, chatain, noire, grise, blanche, coloree, autre
  eyeColor: 'verts',   // bleus, verts, marrons, noirs, gris, noisette, autre
  measurements: '95-55-100',
  breastSize: 'D',
  hairRemoval: 'rasee',  // rasee, taillee, naturelle, epilee
  nationality: 'ES',

  // Langues
  languages: ['french', 'english', 'spanish'],

  // Disponibilité
  available247: true,

  // Annonce
  title: 'Sofia - Marseille - Disponible 24/7',
  description: `Élégante, raffinée, sensuelle et cultivée, je propose mes services uniquement aux hommes de bonne éducation courtois et respectueux.
J'offre l'exclusivité de ma personne lors de notre rencontre basé sur l'échange, le plaisir et la discrétion.

Ce que j'aime :
Les massages
Les caresses
Fellation
Toutes les positions`,

  price: 150,

  // Services (ne pas remplir, laisser vide)
  services: [],

  // Lieu de rencontre
  incall: true,
  outcall: true,

  categories: ['escort']
}

async function getNextEmailNumber() {
  // Récupérer tous les utilisateurs pour trouver le prochain numéro
  const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 })

  let maxNumber = 0
  const emailRegex = new RegExp(`^${EMAIL_PREFIX}(\\d+)${EMAIL_DOMAIN.replace('.', '\\.')}$`, 'i')

  for (const user of users?.users || []) {
    const match = user.email?.match(emailRegex)
    if (match) {
      const num = parseInt(match[1])
      if (num > maxNumber) maxNumber = num
    }
  }

  return maxNumber + 1
}

async function createAccount(email) {
  console.log(`\n📧 Création du compte: ${email}`)

  const { data: user, error } = await supabase.auth.admin.createUser({
    email: email,
    password: PASSWORD,
    email_confirm: true
  })

  if (error) {
    // Si l'utilisateur existe déjà, on le récupère
    if (error.message.includes('already been registered')) {
      console.log(`   ⚠️ Compte existe déjà, récupération...`)
      const { data: users } = await supabase.auth.admin.listUsers()
      const existingUser = users?.users?.find(u => u.email === email)
      if (existingUser) {
        return existingUser
      }
    }
    throw error
  }

  console.log(`   ✅ Compte créé: ${user.user.id}`)
  return user.user
}

async function updateProfile(userId, email, data) {
  console.log(`\n👤 Mise à jour du profil...`)

  const profileData = {
    id: userId,
    email: email,
    username: data.username,
    age: data.age,
    gender: data.gender,
    nationality: data.nationality,
    height: data.height,
    weight: data.weight,
    measurements: data.measurements,
    languages: data.languages,
    interested_in: ['men'],
    verified: false,
    rank: 'standard',
    elite_coins: 0
    // Les champs avec check constraints (ethnicity, eye_color, hair_color, etc.)
    // doivent être mis à jour manuellement via l'interface
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(profileData)

  if (error) {
    console.error(`   ❌ Erreur profil:`, error.message)
    throw error
  }

  console.log(`   ✅ Profil mis à jour`)
}

async function createAd(userId, data) {
  console.log(`\n📝 Création de l'annonce...`)

  const adRecord = {
    user_id: userId,
    title: data.title,
    description: data.description,
    location: data.location,
    country: data.country,
    price: data.price,
    categories: data.categories,
    services: data.services,
    photos: ['https://upfsgpzcvdvtuygwaizd.supabase.co/storage/v1/object/public/ad-photos/placeholder.jpg'], // Photo placeholder à remplacer
    video_url: null,

    // Contact
    phone_number: data.phone,
    has_whatsapp: data.hasWhatsapp,
    has_telegram: false,
    accepts_calls: data.acceptsCalls,
    accepts_sms: data.acceptsSMS,

    // Disponibilité
    available24_7: data.available247,
    availability_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availability_hours: '00:00 - 23:59',

    // Lieu
    incall: data.incall,
    outcall: data.outcall,

    // Stats
    views: 0,
    weekly_views: 0,
    favorites_count: 0,

    // Status
    status: 'approved'
  }

  const { data: ad, error } = await supabase
    .from('ads')
    .insert(adRecord)
    .select()
    .single()

  if (error) {
    console.error(`   ❌ Erreur annonce:`, error.message)
    throw error
  }

  console.log(`   ✅ Annonce créée: ${ad.id}`)
  return ad
}

async function main() {
  console.log('🚀 Import d\'annonce depuis URL')
  console.log('=' .repeat(50))
  console.log(`📋 Données: ${adData.username} - ${adData.location}`)

  try {
    // 1. Trouver le prochain numéro d'email
    const nextNumber = await getNextEmailNumber()
    const email = `${EMAIL_PREFIX}${nextNumber}${EMAIL_DOMAIN}`

    console.log(`\n📊 Prochain email disponible: ${email}`)

    // 2. Créer le compte
    const user = await createAccount(email)

    // 3. Mettre à jour le profil
    await updateProfile(user.id, email, adData)

    // 4. Créer l'annonce
    const ad = await createAd(user.id, adData)

    console.log('\n' + '='.repeat(50))
    console.log('✅ IMPORT TERMINÉ!')
    console.log('='.repeat(50))
    console.log(`   📧 Email: ${email}`)
    console.log(`   🔑 Mot de passe: ${PASSWORD}`)
    console.log(`   👤 User ID: ${user.id}`)
    console.log(`   📝 Ad ID: ${ad.id}`)
    console.log(`   🔗 URL: https://www.sexelite.eu/ads/${ad.id}`)
    console.log('\n⚠️ N\'oublie pas d\'ajouter les photos manuellement!')

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message)
    process.exit(1)
  }
}

main()
