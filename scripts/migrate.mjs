import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2NTEwOSwiZXhwIjoyMDc4NTQxMTA5fQ.QzeSZvbBIz-kL85FM_CoVTTQ6fRRtPl6GSGq4WqrZpU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Map pour garder les UUID générés
const userIdMap = new Map()

// Fonction pour obtenir ou créer un UUID pour un userId
function getOrCreateUUID(oldId) {
  if (!userIdMap.has(oldId)) {
    userIdMap.set(oldId, randomUUID())
  }
  return userIdMap.get(oldId)
}

// Données d'exemple (juste 3 profils pour tester)
const mockAdsExample = [
  {
    id: '1',
    userId: '1',
    username: 'Sophie',
    title: 'Belle brune disponible',
    description: 'Sublime brune aux yeux verts, douce et attentionnée.',
    age: 24,
    location: 'Paris 8ème',
    country: 'FR',
    category: 'escort',
    photos: ['photo1.jpg', 'photo2.jpg'],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    price: 200,
    services: ['Massage', 'GFE'],
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
    description: 'Masseuse professionnelle diplômée.',
    age: 26,
    location: 'Lyon 2ème',
    country: 'FR',
    category: 'massage',
    photos: ['photo1.jpg'],
    price: 150,
    services: ['Massage tantrique'],
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
    description: 'Étudiante charmante et cultivée.',
    age: 23,
    location: 'Marseille',
    country: 'FR',
    category: 'vip',
    photos: [],
    price: 300,
    services: ['Accompagnement'],
    availability: 'Sur rendez-vous',
    verified: false,
    rank: 'standard',
    online: true,
    views: 156,
    favorites: 5
  }
]

async function migrateData() {
  console.log('🚀 Début de la migration vers Supabase...\n')

  try {
    // 1. Créer les profils
    console.log('📝 Étape 1: Création des profils utilisateurs...')

    const profiles = mockAdsExample.map(ad => ({
      id: getOrCreateUUID(ad.userId),
      username: ad.username,
      email: `${ad.username.toLowerCase()}@example.com`,
      age: ad.age,
      verified: ad.verified,
      rank: ad.rank,
      avatar_url: ad.photos && ad.photos.length > 0 ? ad.photos[0] : null
    }))

    for (const profile of profiles) {
      const { error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' })

      if (error) {
        console.error(`   ❌ Erreur pour ${profile.username}:`, error.message)
      } else {
        console.log(`   ✅ Profil créé: ${profile.username}`)
      }
    }

    // 2. Créer les annonces
    console.log('\n📝 Étape 2: Création des annonces...')

    const ads = mockAdsExample.map(ad => ({
      id: randomUUID(),
      user_id: getOrCreateUUID(ad.userId),
      username: ad.username,
      title: ad.title,
      description: ad.description,
      age: ad.age,
      location: ad.location,
      country: ad.country,
      category: ad.category,
      photos: ad.photos || [],
      video: ad.video || null,
      price: ad.price || null,
      services: ad.services || [],
      availability: ad.availability || null,
      verified: ad.verified,
      rank: ad.rank,
      online: ad.online,
      views: ad.views || 0,
      favorites: ad.favorites || 0
    }))

    for (const ad of ads) {
      const { error } = await supabase
        .from('ads')
        .upsert(ad, { onConflict: 'id' })

      if (error) {
        console.error(`   ❌ Erreur pour ${ad.title}:`, error.message)
      } else {
        console.log(`   ✅ Annonce créée: ${ad.title}`)
      }
    }

    console.log('\n✨ Migration terminée avec succès!')
    console.log(`\n📊 Résumé:`)
    console.log(`   • ${profiles.length} profils migrés`)
    console.log(`   • ${ads.length} annonces migrées`)

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error)
    process.exit(1)
  }
}

migrateData()
