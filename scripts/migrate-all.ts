import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { mockAds } from '../src/data/mockAds'

const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2NTEwOSwiZXhwIjoyMDc4NTQxMTA5fQ.QzeSZvbBIz-kL85FM_CoVTTQ6fRRtPl6GSGq4WqrZpU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Map pour garder les UUID générés
const userIdMap = new Map<string, string>()

// Fonction pour obtenir ou créer un UUID pour un userId
function getOrCreateUUID(oldId: string): string {
  if (!userIdMap.has(oldId)) {
    userIdMap.set(oldId, randomUUID())
  }
  return userIdMap.get(oldId)!
}

async function migrateAllData() {
  console.log('🚀 Début de la migration complète vers Supabase...\n')
  console.log(`📦 ${mockAds.length} annonces à migrer\n`)

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
    let profilesSkipped = 0

    for (const profile of uniqueProfiles) {
      const { error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' })

      if (error) {
        if (error.code === '23505') {
          profilesSkipped++
        } else {
          console.error(`   ❌ Erreur pour ${profile.username}:`, error.message)
        }
      } else {
        profilesCreated++
        if (profilesCreated % 10 === 0) {
          console.log(`   ✅ ${profilesCreated}/${uniqueProfiles.length} profils créés...`)
        }
      }
    }

    console.log(`   ✅ Profils: ${profilesCreated} créés, ${profilesSkipped} déjà existants`)

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
    console.log(`   • ${profilesCreated} profils créés (${profilesSkipped} déjà existants)`)
    console.log(`   • ${adsCreated} annonces créées`)
    console.log(`\n🎯 Total: ${uniqueProfiles.length} profils et ${adsCreated} annonces dans Supabase`)

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error)
    process.exit(1)
  }
}

migrateAllData()
