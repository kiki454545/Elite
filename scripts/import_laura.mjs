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

const adData = {
  username: 'Laura',
  age: 33,
  location: 'Marseille',
  country: 'FR',
  phone: '0773190881',
  hasWhatsapp: false,
  acceptsCalls: true,
  acceptsSMS: true,
  gender: 'female',
  ethnicity: 'latine',
  height: 165,
  weight: 65,
  hairColor: 'blonde',
  eyeColor: 'marrons',
  measurements: '100-79-100',
  nationality: 'ES',
  languages: ['french', 'portuguese', 'spanish'],
  available247: true,
  price: 150,
  incall: true,
  outcall: true,
  description: `Je SUIS laura... de origen espagnole...FATIGUÉ de perdre ton temps avec de fausses annonces ?
pas de photoshop et toujours très récents. (Pas de surprises)
je te promet une rencontre de qualiter.
Viens profiter d'un AGREABLE moment avec moi.
je VOUS propose un moment de détente et de massage. réservé à des hommes polis et respectueux. Je sollicite la bonne hygiène et la ponctualité Sachant que si vraiment intéressé le RDV est à confirmer 10/15 MINUTES avant merci!. Mes photos sont 100% réelles. A part ça je suis une fille très gentille qui aime partager de bons moments.
PD. Je chercher un apartamen prive dicrete pour travallier. Done moi info pour sms`
}

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

async function main() {
  console.log('🚀 Import de Laura')
  console.log('='.repeat(50))

  // 1. Trouver le prochain email
  const nextNumber = await getNextEmailNumber()
  const email = `${EMAIL_PREFIX}${nextNumber}${EMAIL_DOMAIN}`
  console.log('📧 Email:', email)

  // 2. Créer le compte
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email: email,
    password: PASSWORD,
    email_confirm: true
  })

  if (createError) {
    console.error('❌ Erreur création compte:', createError.message)
    return
  }

  const userId = userData.user.id
  console.log('✅ Compte créé:', userId)

  // 3. Créer le profil
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: email,
      username: adData.username,
      age: adData.age,
      gender: adData.gender,
      nationality: adData.nationality,
      height: adData.height,
      weight: adData.weight,
      measurements: adData.measurements,
      languages: adData.languages,
      interested_in: ['men'],
      verified: false,
      rank: 'standard',
      elite_coins: 0
    })

  if (profileError) {
    console.error('❌ Erreur profil:', profileError.message)
    return
  }
  console.log('✅ Profil créé')

  // 4. Créer l'annonce
  const { data: ad, error: adError } = await supabase
    .from('ads')
    .insert({
      user_id: userId,
      title: `${adData.username} - ${adData.location}`,
      description: adData.description,
      location: adData.location,
      country: adData.country,
      price: adData.price,
      categories: ['escort'],
      services: [],
      photos: ['https://upfsgpzcvdvtuygwaizd.supabase.co/storage/v1/object/public/ad-photos/placeholder.jpg'],
      video_url: null,
      phone_number: adData.phone,
      has_whatsapp: adData.hasWhatsapp,
      has_telegram: false,
      accepts_calls: adData.acceptsCalls,
      accepts_sms: adData.acceptsSMS,
      available24_7: adData.available247,
      availability_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      availability_hours: '00:00 - 23:59',
      incall: adData.incall,
      outcall: adData.outcall,
      views: 0,
      weekly_views: 0,
      favorites_count: 0,
      status: 'approved'
    })
    .select()
    .single()

  if (adError) {
    console.error('❌ Erreur annonce:', adError.message)
    return
  }

  console.log('✅ Annonce créée:', ad.id)
  console.log('')
  console.log('='.repeat(50))
  console.log('✅ IMPORT TERMINÉ!')
  console.log('='.repeat(50))
  console.log('📧 Email:', email)
  console.log('🔑 Mot de passe:', PASSWORD)
  console.log('👤 User ID:', userId)
  console.log('📝 Ad ID:', ad.id)
  console.log('🔗 URL: https://www.sexelite.eu/ads/' + ad.id)
  console.log('')
  console.log("⚠️ N'oublie pas d'ajouter les photos manuellement!")
}

main()
