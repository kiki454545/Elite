const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://upfsgpzcvdvtuygwaizd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2NTEwOSwiZXhwIjoyMDc4NTQxMTA5fQ.QzeSZvbBIz-kL85FM_CoVTTQ6fRRtPl6GSGq4WqrZpU'
)

const ads = [
  {
    // Seyanaa
    profile: {
      username: 'Seyanaa',
      email: `seyanaa_${Date.now()}@imported.sexelite.eu`,
      age: 24,
      verified: false,
      rank: 'standard',
      height: 165,
      weight: 68,
      measurements: '110-50-60',
      breast_size: 'F',
      hair_color: 'noire',
      eye_color: 'marrons',
      nationality: 'Française',
      languages: ['Français'],
      gender: 'female'
    },
    ad: {
      title: 'Seyanaa - Belle orientale sensuelle à Paris',
      description: 'Française d\'origine algérienne, je suis une jeune femme de 24 ans avec une silhouette généreuse et naturelle. Je reçois dans un cadre discret et agréable. Je suis douce, attentionnée et je prends le temps de créer une vraie complicité. Hygiène irréprochable exigée.',
      location: 'Paris',
      country: 'France',
      categories: ['escort'],
      phone_number: '0774711913',
      accepts_sms: true,
      accepts_calls: true,
      has_whatsapp: false,
      has_telegram: false,
      services: ['Fellation protégée', 'Cunnilingus', 'Massage sensuel', 'Fétichisme'],
      meeting_places: ['À domicile', 'Hôtel'],
      incall: true,
      outcall: false,
      accepts_couples: true,
      available24_7: false,
      availability_days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
      photos: []
    }
  },
  {
    // Naya Cruz
    profile: {
      username: 'Naya Cruz',
      email: `naya_cruz_${Date.now()}@imported.sexelite.eu`,
      age: 21,
      verified: false,
      rank: 'standard',
      height: 160,
      weight: 63,
      measurements: '95-56-95',
      breast_size: 'C',
      hair_color: 'noire',
      eye_color: 'verts',
      nationality: 'Espagnole',
      languages: ['Anglais', 'Espagnol'],
      gender: 'female'
    },
    ad: {
      title: 'Naya Cruz - Jeune espagnole radieuse Paris 15e',
      description: 'Jeune femme radieuse avec une silhouette naturellement harmonieuse et des courbes délicatement dessinées. Mes photos sont 100% authentiques. Je propose des rencontres discrètes dans un cadre chic et raffiné. Disponible 24h/24, 7j/7. Contact par SMS uniquement.',
      location: 'Paris',
      arrondissement: '15ème',
      country: 'France',
      categories: ['escort'],
      phone_number: '0759691932',
      accepts_sms: true,
      accepts_calls: false,
      has_whatsapp: true,
      has_telegram: false,
      services: ['GFE', 'Massage sensuel', 'Câlins'],
      meeting_places: ['À domicile', 'Hôtel', 'Déplacement'],
      incall: true,
      outcall: true,
      accepts_couples: false,
      available24_7: true,
      photos: []
    }
  },
  {
    // Jasmine
    profile: {
      username: 'Jasmine75',
      email: `jasmine75_${Date.now()}@imported.sexelite.eu`,
      age: 21,
      verified: false,
      rank: 'standard',
      height: 160,
      weight: 85,
      measurements: '44-44-44',
      breast_size: 'D',
      hair_color: 'noire',
      eye_color: 'marrons',
      nationality: 'Française',
      languages: ['Français', 'Anglais'],
      gender: 'female'
    },
    ad: {
      title: 'Jasmine - Beauté haïtienne et guadeloupéenne à Paris',
      description: 'Jasmine, d\'origine haïtienne et guadeloupéenne. Naturelle, douce et agréable. Jolie visage, bouche pulpeuse avec une hygiène irréprochable. Je reçois à domicile dans un cadre discret. Disponible 24h/24. Paiement en espèces uniquement. Pas de numéro masqué.',
      location: 'Paris',
      country: 'France',
      categories: ['escort'],
      phone_number: '0658699930',
      accepts_sms: true,
      accepts_calls: true,
      has_whatsapp: false,
      has_telegram: false,
      services: ['Tous services', 'Massage', 'GFE'],
      meeting_places: ['À domicile'],
      incall: true,
      outcall: true,
      accepts_couples: false,
      available24_7: true,
      photos: []
    }
  },
  {
    // Angelina Glam
    profile: {
      username: 'Angelina Glam',
      email: `angelina_glam_${Date.now()}@imported.sexelite.eu`,
      age: 20,
      verified: false,
      rank: 'standard',
      height: 154,
      weight: 55,
      measurements: '90-60-90',
      breast_size: 'C',
      hair_color: 'noire',
      eye_color: 'noisette',
      nationality: 'Espagnole',
      languages: ['Anglais', 'Espagnol'],
      gender: 'female'
    },
    ad: {
      title: 'Angelina Glam - Jeune colombienne sensuelle Paris',
      description: 'Jeune femme latine de 20 ans, je propose des rendez-vous intenses et sensuels. Je reçois dans un lieu chic ou je peux me déplacer. Disponible 24h/24, 7j/7. Contact par SMS uniquement, les appels sont refusés. Photos 100% réelles.',
      location: 'Paris',
      arrondissement: '15ème',
      country: 'France',
      categories: ['escort'],
      phone_number: '0768361398',
      accepts_sms: true,
      accepts_calls: false,
      has_whatsapp: false,
      has_telegram: false,
      services: ['GFE', 'Massage sensuel', 'Moments intenses'],
      meeting_places: ['À domicile', 'Hôtel', 'Déplacement'],
      incall: true,
      outcall: true,
      accepts_couples: false,
      available24_7: true,
      photos: []
    }
  },
  {
    // Nina GFE
    profile: {
      username: 'Nina GFE',
      email: `nina_gfe_${Date.now()}@imported.sexelite.eu`,
      age: 37,
      verified: false,
      rank: 'standard',
      height: 160,
      weight: 62,
      measurements: '40-50-40',
      breast_size: 'C',
      hair_color: 'chatain',
      eye_color: 'noisette',
      nationality: 'Italienne',
      languages: ['Anglais', 'Italien'],
      gender: 'female'
    },
    ad: {
      title: 'Nina GFE - Italienne expérimentée Paris 13e/14e/15e',
      description: 'Femme italienne de 37 ans, je propose des moments de qualité et de complicité. Massages sensuels, tous les actes du Kama-sutra. Je demande le respect durant les appels et messages, ainsi qu\'une hygiène irréprochable. Disponible 24h/24, 7j/7.',
      location: 'Paris',
      arrondissement: '13ème',
      country: 'France',
      categories: ['escort'],
      phone_number: '0757844009',
      accepts_sms: true,
      accepts_calls: true,
      has_whatsapp: false,
      has_telegram: false,
      services: ['GFE', 'Massage sensuel', 'Kama-sutra', 'Moments complices'],
      meeting_places: ['À domicile', 'Hôtel'],
      incall: true,
      outcall: false,
      accepts_couples: false,
      available24_7: true,
      photos: []
    }
  }
]

// IDs des utilisateurs déjà créés
const existingUserIds = [
  '6cc5519f-fd42-4393-b1ca-61130320240a', // Seyanaa
  '85dc8ddb-d693-48c7-afc1-c175667dad72', // Naya Cruz
  '5e4ee6ad-1682-469d-b8ab-bb39a4294f29', // Jasmine75
  '9a96b029-7882-4c02-b527-9c6bbfb238cb', // Angelina Glam
  '18d0dbf9-558e-4bd3-bc99-27a2c1af792e'  // Nina GFE
]

async function importAds() {
  console.log('🚀 Début de l\'import des profils et annonces...\n')

  for (let i = 0; i < ads.length; i++) {
    const { profile, ad } = ads[i]
    const userId = existingUserIds[i]
    console.log(`📝 [${i + 1}/${ads.length}] Import de ${profile.username} (${userId})...`)

    try {
      // 1. Créer/mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error(`   ❌ Erreur création profil:`, profileError.message)
        continue
      }
      console.log(`   ✅ Profil créé`)

      // 3. Créer l'annonce
      const { data: adData, error: adError } = await supabase
        .from('ads')
        .insert({
          user_id: userId,
          ...ad,
          status: 'approved',
          views: Math.floor(Math.random() * 100) + 10,
          favorites_count: Math.floor(Math.random() * 20),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (adError) {
        console.error(`   ❌ Erreur création annonce:`, adError.message)
        continue
      }
      console.log(`   ✅ Annonce créée: ${adData.id}`)
      console.log(`   🎉 ${profile.username} importé avec succès!\n`)

    } catch (error) {
      console.error(`   ❌ Erreur inattendue:`, error.message)
    }
  }

  console.log('✨ Import terminé!')
}

importAds()
