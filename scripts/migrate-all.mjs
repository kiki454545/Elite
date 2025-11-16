import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

// Lire le fichier mockAds.ts
const mockAdsPath = path.join(__dirname, '../src/data/mockAds.ts')
const mockAdsContent = fs.readFileSync(mockAdsPath, 'utf-8')

// Extraire les données du tableau (parse simple)
const mockAdsMatch = mockAdsContent.match(/export const mockAds: Ad\[\] = \[([\s\S]*)\]\s*$/m)
if (!mockAdsMatch) {
  console.error('❌ Impossible de parser mockAds.ts')
  process.exit(1)
}

// Parser le contenu manuellement (simplifié)
const adsData = mockAdsContent.match(/\{[\s\S]*?\}/g)

console.log(`📦 Trouvé ${adsData ? adsData.length : 0} annonces dans mockAds.ts`)

// Créer un tableau d'annonces simplifié depuis le contenu
const mockAds = []

// Parser chaque annonce
for (const adStr of adsData || []) {
  const ad = {}

  // Extraire les champs
  const idMatch = adStr.match(/id:\s*'(\d+)'/)
  const userIdMatch = adStr.match(/userId:\s*'(\d+)'/)
  const usernameMatch = adStr.match(/username:\s*'([^']+)'/)
  const titleMatch = adStr.match(/title:\s*'([^']+)'/)
  const descriptionMatch = adStr.match(/description:\s*'([^']+)'/)
  const ageMatch = adStr.match(/age:\s*(\d+)/)
  const locationMatch = adStr.match(/location:\s*'([^']+)'/)
  const countryMatch = adStr.match(/country:\s*'([^']+)'/)
  const categoryMatch = adStr.match(/category:\s*'([^']+)'/)
  const photosMatch = adStr.match(/photos:\s*\[(.*?)\]/)
  const videoMatch = adStr.match(/video:\s*'([^']+)'/)
  const priceMatch = adStr.match(/price:\s*(\d+)/)
  const servicesMatch = adStr.match(/services:\s*\[(.*?)\]/)
  const availabilityMatch = adStr.match(/availability:\s*'([^']+)'/)
  const verifiedMatch = adStr.match(/verified:\s*(true|false)/)
  const rankMatch = adStr.match(/rank:\s*'([^']+)'/)
  const onlineMatch = adStr.match(/online:\s*(true|false)/)
  const viewsMatch = adStr.match(/views:\s*(\d+)/)
  const favoritesMatch = adStr.match(/favorites:\s*(\d+)/)

  if (idMatch && userIdMatch && usernameMatch && titleMatch) {
    ad.id = idMatch[1]
    ad.userId = userIdMatch[1]
    ad.username = usernameMatch[1]
    ad.title = titleMatch[1]
    ad.description = descriptionMatch ? descriptionMatch[1] : ''
    ad.age = ageMatch ? parseInt(ageMatch[1]) : 25
    ad.location = locationMatch ? locationMatch[1] : ''
    ad.country = countryMatch ? countryMatch[1] : 'FR'
    ad.category = categoryMatch ? categoryMatch[1] : 'escort'
    ad.photos = photosMatch ? photosMatch[1].split(',').map(p => p.trim().replace(/'/g, '')).filter(p => p) : []
    ad.video = videoMatch ? videoMatch[1] : null
    ad.price = priceMatch ? parseInt(priceMatch[1]) : null
    ad.services = servicesMatch ? servicesMatch[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(s => s) : []
    ad.availability = availabilityMatch ? availabilityMatch[1] : null
    ad.verified = verifiedMatch ? verifiedMatch[1] === 'true' : false
    ad.rank = rankMatch ? rankMatch[1] : 'standard'
    ad.online = onlineMatch ? onlineMatch[1] === 'true' : false
    ad.views = viewsMatch ? parseInt(viewsMatch[1]) : 0
    ad.favorites = favoritesMatch ? parseInt(favoritesMatch[1]) : 0

    mockAds.push(ad)
  }
}

console.log(`✅ Parsé ${mockAds.length} annonces\n`)

async function migrateAllData() {
  console.log('🚀 Début de la migration complète vers Supabase...\n')

  try {
    // 1. Créer les profils
    console.log('📝 Étape 1: Création des profils utilisateurs...')

    const profiles = mockAds.map(ad => ({
      id: getOrCreateUUID(ad.userId),
      username: ad.username,
      email: `${ad.username.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
      age: ad.age,
      verified: ad.verified,
      rank: ad.rank,
      avatar_url: ad.photos && ad.photos.length > 0 ? ad.photos[0] : null
    }))

    // Supprimer les doublons
    const uniqueProfiles = Array.from(
      new Map(profiles.map(p => [p.id, p])).values()
    )

    console.log(`   → ${uniqueProfiles.length} profils uniques à créer`)

    let profilesCreated = 0
    for (const profile of uniqueProfiles) {
      const { error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' })

      if (error) {
        console.error(`   ❌ Erreur pour ${profile.username}:`, error.message)
      } else {
        profilesCreated++
        if (profilesCreated % 10 === 0) {
          console.log(`   ✅ ${profilesCreated}/${uniqueProfiles.length} profils créés...`)
        }
      }
    }
    console.log(`   ✅ Tous les profils créés (${profilesCreated}/${uniqueProfiles.length})`)

    // 2. Créer les annonces
    console.log('\n📝 Étape 2: Création des annonces...')

    const ads = mockAds.map(ad => ({
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

    console.log(`   → ${ads.length} annonces à créer`)

    let adsCreated = 0
    for (const ad of ads) {
      const { error } = await supabase
        .from('ads')
        .insert(ad)

      if (error) {
        console.error(`   ❌ Erreur pour ${ad.title}:`, error.message)
      } else {
        adsCreated++
        if (adsCreated % 10 === 0) {
          console.log(`   ✅ ${adsCreated}/${ads.length} annonces créées...`)
        }
      }
    }
    console.log(`   ✅ Toutes les annonces créées (${adsCreated}/${ads.length})`)

    console.log('\n✨ Migration complète terminée avec succès!')
    console.log(`\n📊 Résumé:`)
    console.log(`   • ${profilesCreated} profils migrés`)
    console.log(`   • ${adsCreated} annonces migrées`)

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error)
    process.exit(1)
  }
}

migrateAllData()
