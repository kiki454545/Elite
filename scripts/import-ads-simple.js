const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://upfsgpzcvdvtuygwaizd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2NTEwOSwiZXhwIjoyMDc4NTQxMTA5fQ.QzeSZvbBIz-kL85FM_CoVTTQ6fRRtPl6GSGq4WqrZpU'
)

// Compteur pour les emails (à modifier selon le dernier numéro utilisé)
let START_NUMBER = 55 // Changer ce numéro pour continuer la numérotation

const PASSWORD = 'aaaaaa'

const ads = [
  {
    // Bianca
    profile: {
      username: 'Bianca',
      age: 24,
      verified: false,
      rank: 'standard',
      height: 160,
      weight: 48,
      measurements: '90-60-90',
      nationality: 'Italienne',
      languages: ['Français', 'Italien'],
      gender: 'female'
    },
    ad: {
      title: 'Bianca',
      description: '',
      location: 'Paris',
      arrondissement: '15',
      country: 'FR',
      categories: ['escort'],
      phone_number: '0619176879',
      accepts_sms: true,
      accepts_calls: true,
      has_whatsapp: true,
      has_telegram: false,
      services: [],
      incall: true,
      outcall: false,
      accepts_couples: false,
      available24_7: false,
      photos: []
    }
  },
  {
    // meizim539
    profile: {
      username: 'Meizim',
      age: 28,
      verified: false,
      rank: 'standard',
      height: 160,
      weight: 50,
      measurements: '90-60-90',
      nationality: 'Chinoise',
      languages: ['Français'],
      gender: 'female'
    },
    ad: {
      title: 'Meizim',
      description: '',
      location: 'Paris',
      arrondissement: '9',
      country: 'FR',
      categories: ['massage'],
      phone_number: '0768883090',
      accepts_sms: true,
      accepts_calls: true,
      has_whatsapp: true,
      has_telegram: false,
      services: ['Massage chinois', 'Massage thaïlandais', 'Massage tantrique'],
      incall: true,
      outcall: false,
      accepts_couples: false,
      available24_7: true,
      photos: []
    }
  },
  {
    // CHANTAAL
    profile: {
      username: 'Chantaal',
      age: 29,
      verified: false,
      rank: 'standard',
      height: 163,
      weight: 50,
      measurements: '80-60-90',
      nationality: 'Espagnole',
      languages: ['Français', 'Espagnol'],
      gender: 'female'
    },
    ad: {
      title: 'Chantaal',
      description: '',
      location: 'Paris',
      arrondissement: '15',
      country: 'FR',
      categories: ['escort'],
      phone_number: '0752747836',
      accepts_sms: true,
      accepts_calls: false,
      has_whatsapp: false,
      has_telegram: false,
      services: [],
      incall: true,
      outcall: false,
      accepts_couples: false,
      available24_7: false,
      photos: []
    }
  },
  {
    // Baby 45 ans Montparnasse
    profile: {
      username: 'Baby',
      age: 45,
      verified: false,
      rank: 'standard',
      height: 155,
      weight: 75,
      measurements: '100-80-100',
      nationality: 'Brésilienne',
      languages: ['Français'],
      gender: 'female'
    },
    ad: {
      title: 'Baby',
      description: '',
      location: 'Paris',
      arrondissement: '15',
      country: 'FR',
      categories: ['escort'],
      phone_number: '0754888035',
      accepts_sms: true,
      accepts_calls: true,
      has_whatsapp: true,
      has_telegram: false,
      services: [],
      incall: true,
      outcall: false,
      accepts_couples: true,
      available24_7: true,
      photos: []
    }
  },
  {
    // Monique Chaude
    profile: {
      username: 'Monique',
      age: 34,
      verified: false,
      rank: 'standard',
      height: 165,
      weight: 60,
      measurements: '95-60-95',
      nationality: 'Argentine',
      languages: ['Français', 'Espagnol'],
      gender: 'female'
    },
    ad: {
      title: 'Monique',
      description: '',
      location: 'Paris',
      arrondissement: '13',
      country: 'FR',
      categories: ['escort'],
      phone_number: '0757824787',
      accepts_sms: true,
      accepts_calls: true,
      has_whatsapp: false,
      has_telegram: false,
      services: ['Massage', 'GFE'],
      incall: true,
      outcall: false,
      accepts_couples: false,
      available24_7: false,
      photos: []
    }
  },
  {
    // Wendy
    profile: {
      username: 'Wendy',
      age: 26,
      verified: false,
      rank: 'standard',
      height: 160,
      weight: 50,
      measurements: '85-60-90',
      nationality: 'Japonaise',
      languages: ['Français', 'Anglais'],
      gender: 'female'
    },
    ad: {
      title: 'Wendy',
      description: '',
      location: 'Paris',
      arrondissement: '15',
      country: 'FR',
      categories: ['escort'],
      phone_number: '0678504531',
      accepts_sms: true,
      accepts_calls: false,
      has_whatsapp: true,
      has_telegram: false,
      services: ['Massage'],
      incall: true,
      outcall: false,
      accepts_couples: true,
      available24_7: true,
      photos: []
    }
  },
  {
    // nature salwa
    profile: {
      username: 'Salwa',
      age: 22,
      verified: false,
      rank: 'standard',
      height: 160,
      weight: 55,
      measurements: '90-65-90',
      nationality: 'Française',
      languages: ['Français'],
      gender: 'female'
    },
    ad: {
      title: 'Salwa',
      description: '',
      location: 'Paris',
      arrondissement: '11',
      country: 'FR',
      categories: ['escort'],
      phone_number: '0614144478',
      accepts_sms: true,
      accepts_calls: false,
      has_whatsapp: false,
      has_telegram: false,
      services: [],
      incall: true,
      outcall: false,
      accepts_couples: false,
      available24_7: true,
      photos: []
    }
  },
  {
    // jeune duoduo
    profile: {
      username: 'Duoduo',
      age: 27,
      verified: false,
      rank: 'standard',
      height: 164,
      weight: 52,
      measurements: '85-60-90',
      nationality: 'Singapourienne',
      languages: ['Français'],
      gender: 'female'
    },
    ad: {
      title: 'Duoduo',
      description: '',
      location: 'Paris',
      arrondissement: '13',
      country: 'FR',
      categories: ['escort'],
      phone_number: '0647051984',
      accepts_sms: true,
      accepts_calls: true,
      has_whatsapp: false,
      has_telegram: false,
      services: ['Massage'],
      incall: true,
      outcall: false,
      accepts_couples: false,
      available24_7: false,
      photos: []
    }
  },
  {
    // Sabrina caliente
    profile: {
      username: 'Sabrina',
      age: 25,
      verified: false,
      rank: 'standard',
      height: 171,
      weight: 57,
      measurements: '90-60-100',
      nationality: 'Brésilienne',
      languages: ['Espagnol', 'Portugais'],
      gender: 'female'
    },
    ad: {
      title: 'Sabrina',
      description: '',
      location: 'Paris',
      arrondissement: '15',
      country: 'FR',
      categories: ['escort'],
      phone_number: '0745559012',
      accepts_sms: true,
      accepts_calls: true,
      has_whatsapp: false,
      has_telegram: false,
      services: ['Massage'],
      incall: true,
      outcall: false,
      accepts_couples: false,
      available24_7: false,
      photos: []
    }
  },
  {
    // Lavinia
    profile: {
      username: 'Lavinia',
      age: 25,
      verified: false,
      rank: 'standard',
      height: 157,
      weight: 58,
      measurements: '90-75-100',
      nationality: 'Portugaise',
      languages: ['Français', 'Portugais'],
      gender: 'female'
    },
    ad: {
      title: 'Lavinia',
      description: '',
      location: 'Paris',
      arrondissement: '9',
      country: 'FR',
      categories: ['escort'],
      phone_number: '0780955168',
      accepts_sms: true,
      accepts_calls: false,
      has_whatsapp: false,
      has_telegram: false,
      services: ['Massage tantrique', 'GFE'],
      incall: true,
      outcall: false,
      accepts_couples: false,
      available24_7: false,
      photos: []
    }
  },
  {
    // Antho
    profile: {
      username: 'Antho',
      age: 20,
      verified: false,
      rank: 'standard',
      height: 165,
      weight: 55,
      measurements: '100-60-120',
      nationality: 'Vénézuélienne',
      languages: ['Français', 'Anglais', 'Espagnol'],
      gender: 'female'
    },
    ad: {
      title: 'Antho',
      description: '',
      location: 'Paris',
      arrondissement: '9',
      country: 'FR',
      categories: ['escort'],
      phone_number: '0644668519',
      accepts_sms: true,
      accepts_calls: true,
      has_whatsapp: true,
      has_telegram: false,
      services: ['GFE', 'Massage', 'Fétichisme'],
      incall: true,
      outcall: false,
      accepts_couples: false,
      available24_7: true,
      photos: []
    }
  },
  {
    // Ambar
    profile: {
      username: 'Ambar',
      age: 20,
      verified: false,
      rank: 'standard',
      height: 168,
      weight: 63,
      measurements: '90-60-90',
      nationality: 'Colombienne',
      languages: ['Français', 'Espagnol'],
      gender: 'female'
    },
    ad: {
      title: 'Ambar',
      description: '',
      location: 'Paris',
      arrondissement: '10',
      country: 'FR',
      categories: ['escort'],
      phone_number: '0773326091',
      accepts_sms: true,
      accepts_calls: true,
      has_whatsapp: false,
      has_telegram: false,
      services: [],
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
          views: 0,
          favorites_count: 0,
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
