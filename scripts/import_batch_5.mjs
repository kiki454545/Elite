import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non défini')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const PASSWORD = 'aaaaaa'
const EMAIL_PREFIX = 'escorte'
const EMAIL_DOMAIN = '@gmail.com'

const profiles = [
  {
    username: 'Lucia',
    age: 23,
    location: 'Marseille',
    country: 'FR',
    phone: '0774231509',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 160,
    weight: 60,
    hairColor: 'noire',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'CO',
    languages: ['spanish'],
    available247: true,
    price: 150,
    incall: true,
    outcall: false,
    description: 'Description à remplir'
  },
  {
    username: 'Vanesa',
    age: 29,
    location: 'Marseille',
    country: 'FR',
    phone: '0686142635',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 162,
    weight: 59,
    hairColor: 'noire',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'BR',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  {
    username: 'Barbara',
    age: 29,
    location: 'Marseille',
    country: 'FR',
    phone: '0758162856',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 168,
    weight: 75,
    hairColor: 'noire',
    eyeColor: 'marrons',
    measurements: '120-65-100',
    nationality: 'CO',
    languages: ['french', 'spanish'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  {
    username: 'Rosa',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0774432005',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 159,
    weight: 56,
    hairColor: 'chatain',
    eyeColor: 'marrons',
    measurements: '70-90-70',
    nationality: 'AR',
    languages: ['french', 'spanish'],
    available247: false,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  {
    username: 'Milla',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0777059729',
    hasWhatsapp: true,
    gender: 'female',
    ethnicity: 'arabe',
    height: 165,
    weight: 70,
    hairColor: 'chatain',
    eyeColor: 'noisette',
    measurements: '95-65-90',
    nationality: 'FR',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  }
]

async function getNextEmailNumber() {
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

async function createProfile(emailNumber, data) {
  const email = `${EMAIL_PREFIX}${emailNumber}${EMAIL_DOMAIN}`
  console.log(`\n📧 Création: ${data.username} (${email})`)

  // 1. Créer le compte
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email: email,
    password: PASSWORD,
    email_confirm: true
  })

  if (createError) {
    console.error(`   ❌ Erreur compte: ${createError.message}`)
    return null
  }

  const userId = userData.user.id
  console.log(`   ✅ Compte: ${userId}`)

  // 2. Créer le profil
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
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
    })

  if (profileError) {
    console.error(`   ❌ Erreur profil: ${profileError.message}`)
    return null
  }
  console.log(`   ✅ Profil créé`)

  // 3. Créer l'annonce
  const { data: ad, error: adError } = await supabase
    .from('ads')
    .insert({
      user_id: userId,
      title: `${data.username} - ${data.location}`,
      description: data.description,
      location: data.location,
      country: data.country,
      price: data.price,
      categories: ['escort'],
      services: [],
      photos: ['https://upfsgpzcvdvtuygwaizd.supabase.co/storage/v1/object/public/ad-photos/placeholder.jpg'],
      video_url: null,
      phone_number: data.phone,
      has_whatsapp: data.hasWhatsapp,
      has_telegram: false,
      accepts_calls: true,
      accepts_sms: true,
      available24_7: data.available247,
      availability_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      availability_hours: '00:00 - 23:59',
      incall: data.incall,
      outcall: data.outcall,
      views: 0,
      weekly_views: 0,
      favorites_count: 0,
      status: 'approved'
    })
    .select()
    .single()

  if (adError) {
    console.error(`   ❌ Erreur annonce: ${adError.message}`)
    return null
  }

  console.log(`   ✅ Annonce: ${ad.id}`)

  return {
    username: data.username,
    email: email,
    password: PASSWORD,
    userId: userId,
    adId: ad.id,
    url: `https://www.sexelite.eu/ads/${ad.id}`
  }
}

async function main() {
  console.log('🚀 Import de 5 profils')
  console.log('='.repeat(50))

  let nextNumber = await getNextEmailNumber()
  const results = []

  for (const profile of profiles) {
    const result = await createProfile(nextNumber, profile)
    if (result) {
      results.push(result)
      nextNumber++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ IMPORT TERMINÉ!')
  console.log('='.repeat(50))
  console.log('\n📋 RÉCAPITULATIF:\n')

  for (const r of results) {
    console.log(`${r.username}:`)
    console.log(`   📧 ${r.email}`)
    console.log(`   🔑 ${r.password}`)
    console.log(`   📝 ${r.adId}`)
    console.log(`   🔗 ${r.url}`)
    console.log('')
  }

  console.log("⚠️ N'oublie pas de remplir les descriptions et photos manuellement!")
}

main()
