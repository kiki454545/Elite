const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://upfsgpzcvdvtuygwaizd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2NTEwOSwiZXhwIjoyMDc4NTQxMTA5fQ.QzeSZvbBIz-kL85FM_CoVTTQ6fRRtPl6GSGq4WqrZpU'
)

// Compteur pour les emails (à modifier selon le dernier numéro utilisé)
let START_NUMBER = 50 // Changer ce numéro pour continuer la numérotation

const PASSWORD = 'aaaaaa'

const ads = [
  {
    // Seyanaa
    profile: {
      username: 'Seyanaa',
      age: 24,
      verified: false,
      rank: 'standard',
      height: 165,
      weight: 68,
      measurements: '110-50-60',
      nationality: 'Française',
      languages: ['Français'],
      gender: 'female'
    },
    ad: {
      title: 'Seyanaa',
      description: 'Française d\'origine algérienne, je suis une jeune femme de 24 ans avec une silhouette généreuse et naturelle. Je reçois dans un cadre discret et agréable. Je suis douce, attentionnée et je prends le temps de créer une vraie complicité. Hygiène irréprochable exigée.',
      location: 'Paris',
      country: 'FR',
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
      photos: []
    }
  },
  {
    // Naya Cruz
    profile: {
      username: 'Naya Cruz',
      age: 21,
      verified: false,
      rank: 'standard',
      height: 160,
      weight: 63,
      measurements: '95-56-95',
      nationality: 'Espagnole',
      languages: ['Anglais', 'Espagnol'],
      gender: 'female'
    },
    ad: {
      title: 'Naya Cruz',
      description: 'Jeune femme radieuse avec une silhouette naturellement harmonieuse et des courbes délicatement dessinées. Mes photos sont 100% authentiques. Je propose des rencontres discrètes dans un cadre chic et raffiné. Disponible 24h/24, 7j/7. Contact par SMS uniquement.',
      location: 'Paris',
      arrondissement: '15',
      country: 'FR',
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
      age: 21,
      verified: false,
      rank: 'standard',
      height: 160,
      weight: 85,
      measurements: '44-44-44',
      nationality: 'Française',
      languages: ['Français', 'Anglais'],
      gender: 'female'
    },
    ad: {
      title: 'Jasmine75',
      description: 'Jasmine, d\'origine haïtienne et guadeloupéenne. Naturelle, douce et agréable. Jolie visage, bouche pulpeuse avec une hygiène irréprochable. Je reçois à domicile dans un cadre discret. Disponible 24h/24. Paiement en espèces uniquement. Pas de numéro masqué.',
      location: 'Paris',
      country: 'FR',
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
      age: 20,
      verified: false,
      rank: 'standard',
      height: 154,
      weight: 55,
      measurements: '90-60-90',
      nationality: 'Espagnole',
      languages: ['Anglais', 'Espagnol'],
      gender: 'female'
    },
    ad: {
      title: 'Angelina Glam',
      description: 'Jeune femme latine de 20 ans, je propose des rendez-vous intenses et sensuels. Je reçois dans un lieu chic ou je peux me déplacer. Disponible 24h/24, 7j/7. Contact par SMS uniquement, les appels sont refusés. Photos 100% réelles.',
      location: 'Paris',
      arrondissement: '15',
      country: 'FR',
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
      age: 37,
      verified: false,
      rank: 'standard',
      height: 160,
      weight: 62,
      measurements: '40-50-40',
      nationality: 'Italienne',
      languages: ['Anglais', 'Italien'],
      gender: 'female'
    },
    ad: {
      title: 'Nina GFE',
      description: 'Femme italienne de 37 ans, je propose des moments de qualité et de complicité. Massages sensuels, tous les actes du Kama-sutra. Je demande le respect durant les appels et messages, ainsi qu\'une hygiène irréprochable. Disponible 24h/24, 7j/7.',
      location: 'Paris',
      arrondissement: '13',
      country: 'FR',
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

async function importAds() {
  console.log('🚀 Début de l\'import des annonces...\n')
  console.log('📧 Format email: escorteX@gmail.com')
  console.log('🔑 Mot de passe: ' + PASSWORD + '\n')

  const createdAccounts = []

  for (let i = 0; i < ads.length; i++) {
    const { profile, ad } = ads[i]
    const escorteNumber = START_NUMBER + i
    const email = `escorte${escorteNumber}@gmail.com`

    console.log(`📝 [${i + 1}/${ads.length}] Import de ${profile.username}...`)
    console.log(`   📧 Email: ${email}`)

    try {
      // 1. Créer un utilisateur auth avec mot de passe
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { imported: true, source: 'sexemodel' }
      })

      if (authError) {
        console.error(`   ❌ Erreur création auth:`, authError.message)
        continue
      }

      const userId = authData.user.id
      console.log(`   ✅ User auth créé: ${userId}`)

      // 2. Créer/mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username: profile.username,
          email: email,
          age: profile.age,
          verified: profile.verified,
          rank: profile.rank,
          height: profile.height,
          weight: profile.weight,
          measurements: profile.measurements,
          nationality: profile.nationality,
          languages: profile.languages,
          gender: profile.gender,
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

      // Sauvegarder les infos du compte créé
      createdAccounts.push({
        numero: escorteNumber,
        pseudo: profile.username,
        email: email,
        password: PASSWORD,
        adId: adData.id
      })

    } catch (error) {
      console.error(`   ❌ Erreur inattendue:`, error.message)
    }
  }

  console.log('✨ Import terminé!\n')
  console.log('📋 RÉCAPITULATIF DES COMPTES CRÉÉS:')
  console.log('=====================================')
  createdAccounts.forEach(account => {
    console.log(`${account.numero}. ${account.pseudo}`)
    console.log(`   📧 Email: ${account.email}`)
    console.log(`   🔑 Mot de passe: ${account.password}`)
    console.log(`   🆔 Annonce: ${account.adId}\n`)
  })
}

importAds()
