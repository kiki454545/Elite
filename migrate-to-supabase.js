const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erreur: NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définis dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Données mockées des annonces
const mockAds = [
  {
    id: '1',
    userId: '1',
    username: 'Sophie',
    title: 'Belle brune disponible',
    description: 'Sublime brune aux yeux verts, douce et attentionnée. Je propose des moments de détente et de complicité dans un cadre agréable et discret.',
    age: 24,
    location: 'Paris 8ème',
    country: 'FR',
    category: 'escort',
    photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg'],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    price: 200,
    services: ['Massage', 'GFE', 'Dîner romantique', 'Accompagnement', 'Oral', 'Striptease'],
    availability: 'Disponible tous les jours de 14h à minuit',
    verified: true,
    rank: 'elite',
    online: true,
    views: 245,
    favorites: 12
  },
  {
    id: '2',
    userId: '2',
    username: 'Emma',
    title: 'Massage sensuel',
    description: 'Masseuse professionnelle diplômée. Je vous propose des massages sensuels dans une ambiance zen et relaxante.',
    age: 26,
    location: 'Lyon 2ème',
    country: 'FR',
    category: 'massage',
    photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
    price: 150,
    services: ['Massage tantrique', 'Massage body-body', 'Tantrique', 'Body-body'],
    availability: 'Du lundi au vendredi, 10h-20h',
    verified: true,
    rank: 'vip',
    online: false,
    views: 189,
    favorites: 8
  },
  {
    id: '3',
    userId: '3',
    username: 'Léa',
    title: 'Escorte de luxe',
    description: 'Étudiante charmante et cultivée, je vous accompagne lors de vos événements ou soirées privées.',
    age: 23,
    location: 'Marseille',
    country: 'FR',
    category: 'vip',
    photos: [],
    price: 300,
    services: ['Accompagnement', 'Dîner romantique', 'GFE'],
    availability: 'Sur rendez-vous, 48h à l\'avance',
    verified: false,
    rank: 'standard',
    online: true,
    views: 156,
    favorites: 5
  }
  // ... Ajoutez toutes les autres annonces ici
]

async function migrateData() {
  console.log('🚀 Début de la migration vers Supabase...\n')

  try {
    // 1. Créer les profils des utilisateurs
    console.log('📝 Étape 1: Création des profils utilisateurs...')

    const profiles = mockAds.map(ad => ({
      id: ad.userId,
      username: ad.username,
      email: `${ad.username.toLowerCase()}@example.com`,
      age: ad.age,
      verified: ad.verified,
      rank: ad.rank,
      avatar_url: ad.photos[0] || null
    }))

    // Supprimer les doublons (même userId)
    const uniqueProfiles = Array.from(
      new Map(profiles.map(p => [p.id, p])).values()
    )

    console.log(`   → ${uniqueProfiles.length} profils à créer`)

    for (const profile of uniqueProfiles) {
      const { error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' })

      if (error && error.code !== '23505') { // Ignorer les erreurs de duplication
        console.error(`   ❌ Erreur pour le profil ${profile.username}:`, error.message)
      } else {
        console.log(`   ✅ Profil créé: ${profile.username}`)
      }
    }

    console.log('\n📝 Étape 2: Création des annonces...')

    const ads = mockAds.map(ad => ({
      id: ad.id,
      user_id: ad.userId,
      username: ad.username,
      title: ad.title,
      description: ad.description,
      age: ad.age,
      location: ad.location,
      country: ad.country,
      category: ad.category,
      photos: ad.photos,
      video: ad.video || null,
      price: ad.price || null,
      services: ad.services,
      availability: ad.availability || null,
      verified: ad.verified,
      rank: ad.rank,
      online: ad.online,
      views: ad.views,
      favorites: ad.favorites
    }))

    console.log(`   → ${ads.length} annonces à créer`)

    for (const ad of ads) {
      const { error } = await supabase
        .from('ads')
        .upsert(ad, { onConflict: 'id' })

      if (error && error.code !== '23505') {
        console.error(`   ❌ Erreur pour l'annonce ${ad.title}:`, error.message)
      } else {
        console.log(`   ✅ Annonce créée: ${ad.title}`)
      }
    }

    console.log('\n✨ Migration terminée avec succès!')
    console.log(`\n📊 Résumé:`)
    console.log(`   • ${uniqueProfiles.length} profils migrés`)
    console.log(`   • ${ads.length} annonces migrées`)

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error)
    process.exit(1)
  }
}

// Exécuter la migration
migrateData()
