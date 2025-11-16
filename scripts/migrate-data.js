const { createClient } = require('@supabase/supabase-js')
const { mockAds } = require('../src/data/mockAds')

// Charger les variables d'environnement
const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjUxMDksImV4cCI6MjA3ODU0MTEwOX0.4mnnD7pEG0mXmxCMdnnJMV0RocP8d7UIfxWFQu9Jwy0'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erreur: Configuration Supabase manquante')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function migrateData() {
  console.log('🚀 Début de la migration vers Supabase...\n')

  try {
    // 1. Créer les profils des utilisateurs
    console.log('📝 Étape 1: Création des profils utilisateurs...')

    const profiles = mockAds.map(ad => ({
      id: ad.userId,
      username: ad.username,
      email: `${ad.username.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
      age: ad.age,
      verified: ad.verified,
      rank: ad.rank,
      avatar_url: ad.photos && ad.photos.length > 0 ? ad.photos[0] : null
    }))

    // Supprimer les doublons (même userId)
    const uniqueProfiles = Array.from(
      new Map(profiles.map(p => [p.id, p])).values()
    )

    console.log(`   → ${uniqueProfiles.length} profils à créer`)

    let profilesCreated = 0
    for (const profile of uniqueProfiles) {
      const { error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' })

      if (error && error.code !== '23505') {
        console.error(`   ❌ Erreur pour le profil ${profile.username}:`, error.message)
      } else {
        profilesCreated++
        if (profilesCreated % 10 === 0) {
          console.log(`   ✅ ${profilesCreated}/${uniqueProfiles.length} profils créés...`)
        }
      }
    }
    console.log(`   ✅ Tous les profils créés (${profilesCreated}/${uniqueProfiles.length})`)

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
        .upsert(ad, { onConflict: 'id' })

      if (error && error.code !== '23505') {
        console.error(`   ❌ Erreur pour l'annonce ${ad.title}:`, error.message)
      } else {
        adsCreated++
        if (adsCreated % 10 === 0) {
          console.log(`   ✅ ${adsCreated}/${ads.length} annonces créées...`)
        }
      }
    }
    console.log(`   ✅ Toutes les annonces créées (${adsCreated}/${ads.length})`)

    console.log('\n✨ Migration terminée avec succès!')
    console.log(`\n📊 Résumé:`)
    console.log(`   • ${profilesCreated} profils migrés`)
    console.log(`   • ${adsCreated} annonces migrées`)

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error)
    process.exit(1)
  }
}

// Exécuter la migration
migrateData()
