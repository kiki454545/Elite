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

// 30 profils extraits
const profiles = [
  // 1. Clara - Limoges
  {
    username: 'Clara',
    age: 24,
    location: 'Limoges',
    country: 'FR',
    phone: '0766931338',
    hasWhatsapp: true,
    gender: 'female',
    ethnicity: 'caucasienne',
    height: 167,
    weight: 48,
    hairColor: 'noire',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'FR',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 2. Tatiana - données par défaut (WebFetch bloqué)
  {
    username: 'Tatiana',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'caucasienne',
    height: 165,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'FR',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 3. Melanie - Cannes
  {
    username: 'Melanie',
    age: 21,
    location: 'Cannes',
    country: 'FR',
    phone: '0756814207',
    hasWhatsapp: true,
    gender: 'female',
    ethnicity: 'caucasienne',
    height: 164,
    weight: 50,
    hairColor: 'chatain',
    eyeColor: 'noisette',
    measurements: '90-60-90',
    nationality: 'FR',
    languages: ['french', 'english'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 4. Lisbeh - Juvisy-sur-Orge
  {
    username: 'Lisbeh',
    age: 28,
    location: 'Juvisy-sur-Orge',
    country: 'FR',
    phone: '0753776114',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 170,
    weight: 80,
    hairColor: 'noire',
    eyeColor: 'marrons',
    measurements: '105-70-90',
    nationality: 'CO',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 5. Lorena - données par défaut (WebFetch bloqué)
  {
    username: 'Lorena',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 165,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'CO',
    languages: ['french', 'spanish'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 6. Serena - Paris
  {
    username: 'Serena',
    age: 25,
    location: 'Paris',
    country: 'FR',
    phone: '0769280262',
    hasWhatsapp: true,
    gender: 'female',
    ethnicity: 'latine',
    height: 165,
    weight: 66,
    hairColor: 'noire',
    eyeColor: 'noisette',
    measurements: '90-60-90',
    nationality: 'ES',
    languages: ['french', 'spanish'],
    available247: true,
    price: 150,
    incall: false,
    outcall: true,
    description: 'Description à remplir'
  },
  // 7. Jessyca - Paris
  {
    username: 'Jessyca',
    age: 25,
    location: 'Paris',
    country: 'FR',
    phone: '0652728555',
    hasWhatsapp: true,
    gender: 'female',
    ethnicity: 'latine',
    height: 165,
    weight: 66,
    hairColor: 'chatain',
    eyeColor: 'noisette',
    measurements: '90-60-90',
    nationality: 'CO',
    languages: ['french', 'spanish'],
    available247: true,
    price: 150,
    incall: true,
    outcall: false,
    description: 'Description à remplir'
  },
  // 8. Leila - données par défaut (WebFetch bloqué)
  {
    username: 'Leila',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'arabe',
    height: 165,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'FR',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 9. Luisa - Orange
  {
    username: 'Luisa',
    age: 21,
    location: 'Orange',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: true,
    gender: 'female',
    ethnicity: 'latine',
    height: 150,
    weight: 55,
    hairColor: 'chatain',
    eyeColor: 'marrons',
    measurements: '70-50-70',
    nationality: 'CO',
    languages: ['french', 'english', 'spanish'],
    available247: true,
    price: 150,
    incall: false,
    outcall: true,
    description: 'Description à remplir'
  },
  // 10. Donna - données par défaut (WebFetch bloqué)
  {
    username: 'Donna',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 165,
    weight: 55,
    hairColor: 'brune',
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
  // 11. Lina - données par défaut (WebFetch bloqué)
  {
    username: 'Lina',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'arabe',
    height: 165,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'FR',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 12. Laura2 - données par défaut (WebFetch bloqué)
  {
    username: 'Laura2',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 165,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'ES',
    languages: ['french', 'spanish'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 13. Nina - données par défaut (WebFetch bloqué)
  {
    username: 'Nina',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'arabe',
    height: 165,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'FR',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: false,
    outcall: true,
    description: 'Description à remplir'
  },
  // 14. Samia - données par défaut (WebFetch bloqué)
  {
    username: 'Samia',
    age: 30,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'arabe',
    height: 160,
    weight: 80,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '100-80-100',
    nationality: 'FR',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 15. Belle - données par défaut (WebFetch bloqué)
  {
    username: 'Belle',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 165,
    weight: 55,
    hairColor: 'brune',
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
  // 16. Shaima - données par défaut (WebFetch bloqué)
  {
    username: 'Shaima',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'arabe',
    height: 165,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'FR',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 17. Natasha - Boulogne-Billancourt
  {
    username: 'Natasha',
    age: 22,
    location: 'Boulogne-Billancourt',
    country: 'FR',
    phone: '0745956781',
    hasWhatsapp: true,
    gender: 'female',
    ethnicity: 'latine',
    height: 165,
    weight: 60,
    hairColor: 'blonde',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'CO',
    languages: ['french'],
    available247: false,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 18. Kassandra - Béziers
  {
    username: 'Kassandra',
    age: 35,
    location: 'Béziers',
    country: 'FR',
    phone: '0756817521',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'caucasienne',
    height: 156,
    weight: 58,
    hairColor: 'chatain',
    eyeColor: 'gris',
    measurements: '95-80-115',
    nationality: 'BE',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: true,
    outcall: false,
    description: 'Description à remplir'
  },
  // 19. May - Grenoble
  {
    username: 'May',
    age: 19,
    location: 'Grenoble',
    country: 'FR',
    phone: '0746568532',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 157,
    weight: 56,
    hairColor: 'chatain',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'MX',
    languages: ['french', 'spanish'],
    available247: true,
    price: 150,
    incall: true,
    outcall: false,
    description: 'Description à remplir'
  },
  // 20. Sarah - Bourgoin-Jallieu (Salopedu69)
  {
    username: 'Sarah',
    age: 23,
    location: 'Bourgoin-Jallieu',
    country: 'FR',
    phone: '0602756922',
    hasWhatsapp: true,
    gender: 'female',
    ethnicity: 'arabe',
    height: 159,
    weight: 56,
    hairColor: 'noire',
    eyeColor: 'marrons',
    measurements: '85-60-85',
    nationality: 'FR',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: false,
    outcall: true,
    description: 'Description à remplir'
  },
  // 21. Eva - données par défaut (WebFetch bloqué)
  {
    username: 'Eva',
    age: 23,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'caucasienne',
    height: 165,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'FR',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 22. Katy - données par défaut (WebFetch bloqué)
  {
    username: 'Katy',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 165,
    weight: 55,
    hairColor: 'brune',
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
  // 23. Valentina - données par défaut (WebFetch bloqué)
  {
    username: 'Valentina',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 165,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'CO',
    languages: ['french', 'spanish'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 24. Dominique - données par défaut (WebFetch bloqué)
  {
    username: 'Dominique',
    age: 30,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'caucasienne',
    height: 165,
    weight: 55,
    hairColor: 'blonde',
    eyeColor: 'bleus',
    measurements: '90-60-90',
    nationality: 'FR',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 25. Sofia2 - données par défaut (WebFetch bloqué)
  {
    username: 'Sofia2',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 165,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'CO',
    languages: ['french', 'spanish'],
    available247: true,
    price: 150,
    incall: false,
    outcall: true,
    description: 'Description à remplir'
  },
  // 26. Elvira - Reims
  {
    username: 'Elvira',
    age: 23,
    location: 'Reims',
    country: 'FR',
    phone: '0614147043',
    hasWhatsapp: true,
    gender: 'female',
    ethnicity: 'caucasienne',
    height: 164,
    weight: 44,
    hairColor: 'brune',
    eyeColor: 'bleus',
    measurements: '85-60-60',
    nationality: 'FR',
    languages: ['french'],
    available247: true,
    price: 150,
    incall: true,
    outcall: false,
    description: 'Description à remplir'
  },
  // 27. Eli - données par défaut (WebFetch bloqué)
  {
    username: 'Eli',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 165,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'VE',
    languages: ['french', 'spanish'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 28. Olivia - Marseille
  {
    username: 'Olivia',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0774954541',
    hasWhatsapp: true,
    gender: 'female',
    ethnicity: 'latine',
    height: 166,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '100-65-100',
    nationality: 'CO',
    languages: ['french', 'spanish', 'english'],
    available247: true,
    price: 150,
    incall: true,
    outcall: false,
    description: 'Description à remplir'
  },
  // 29. Brenda - données par défaut (WebFetch bloqué)
  {
    username: 'Brenda',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'latine',
    height: 165,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '90-60-90',
    nationality: 'CO',
    languages: ['french', 'spanish'],
    available247: true,
    price: 150,
    incall: true,
    outcall: true,
    description: 'Description à remplir'
  },
  // 30. Jade - données par défaut (WebFetch rate limited)
  {
    username: 'Jade',
    age: 25,
    location: 'Marseille',
    country: 'FR',
    phone: '0600000000',
    hasWhatsapp: false,
    gender: 'female',
    ethnicity: 'caucasienne',
    height: 165,
    weight: 55,
    hairColor: 'brune',
    eyeColor: 'marrons',
    measurements: '90-60-90',
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
  console.log(`\n📧 ${emailNumber}. ${data.username} (${email})`)

  // 1. Créer le compte
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email: email,
    password: PASSWORD,
    email_confirm: true
  })

  if (createError) {
    console.error(`   ❌ Erreur: ${createError.message}`)
    return null
  }

  const userId = userData.user.id

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

  console.log(`   ✅ OK - ${ad.id}`)

  return {
    username: data.username,
    email: email,
    adId: ad.id
  }
}

async function main() {
  console.log('🚀 Import de 30 profils')
  console.log('='.repeat(50))

  let nextNumber = await getNextEmailNumber()
  const results = []

  for (const profile of profiles) {
    const result = await createProfile(nextNumber, profile)
    if (result) {
      results.push(result)
      nextNumber++
    }
    // Petite pause pour éviter rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ ${results.length}/30 profils créés!`)
  console.log('='.repeat(50))
  console.log('\n📋 RÉCAPITULATIF:\n')

  for (const r of results) {
    console.log(`${r.username}: ${r.email} | ${r.adId}`)
  }

  console.log("\n⚠️ N'oublie pas de remplir les descriptions et photos!")
}

main()
