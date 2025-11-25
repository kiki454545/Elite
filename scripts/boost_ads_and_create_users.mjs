import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nzrptauexzttqhmnhhgd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cnB0YXVleHp0dHFobW5oaGdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjgzNDg1NSwiZXhwIjoyMDU4NDEwODU1fQ.sw6vPi-OXO9sh9TubYLeEC_zomqKcZXrfAhLKdAtEMY'
)

// Fonction pour générer une date aléatoire entre le 5 et 15 novembre 2025 (pour les annonces)
function getRandomDateAds() {
  const start = new Date('2025-11-05T00:00:00Z')
  const end = new Date('2025-11-15T23:59:59Z')
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime())
  return new Date(randomTime).toISOString()
}

// Fonction pour générer une date aléatoire entre le 5 et 24 novembre 2025 (pour les utilisateurs)
function getRandomDateUsers() {
  const start = new Date('2025-11-05T00:00:00Z')
  const end = new Date('2025-11-24T23:59:59Z')
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime())
  return new Date(randomTime).toISOString()
}

// Fonction pour générer un nombre de vues aléatoire entre 1500 et 50000
function getRandomViews() {
  return Math.floor(Math.random() * (50000 - 1500 + 1)) + 1500
}

// Fonction pour calculer le nombre de favoris proportionnel aux vues
function getFavoritesFromViews(views) {
  // Plus il y a de vues, plus il y a de favoris
  // Ratio: environ 0.1% à 1% de conversion vue -> favoris
  const ratio = 0.001 + Math.random() * 0.009 // Entre 0.1% et 1%
  const favorites = Math.floor(views * ratio)
  return Math.min(favorites, 50) // Maximum 50 favoris
}

// Fonction pour générer un nom d'utilisateur unique (sans Elite)
function generateUsername(index) {
  const prefixes = ['Vip', 'Star', 'Angel', 'Bella', 'Luna', 'Diva', 'Queen', 'Princess', 'Lady', 'Sofia', 'Maya', 'Emma', 'Mia', 'Aria']
  const suffixes = ['Malta', 'Island', 'Dream', 'Passion', 'Love', 'Beauty', 'Charm', 'Style', 'Luxury', 'Premium', 'Goddess', 'Pearl', 'Ruby', 'Diamond']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  return `${prefix}${suffix}${index}`
}

async function boostActiveAds() {
  try {
    console.log('🚀 Début du boost des annonces actives...\n')

    // Récupérer toutes les annonces avec status = 'approved'
    const { data: ads, error: adsError } = await supabase
      .from('ads')
      .select('id, title, views, favorites_count')
      .eq('status', 'approved')

    if (adsError) {
      console.error('❌ Erreur lors de la récupération des annonces:', adsError)
      return
    }

    console.log(`📊 Trouvé ${ads.length} annonces actives\n`)

    let updated = 0
    for (const ad of ads) {
      const newDate = getRandomDateAds()
      const newViews = getRandomViews()
      const newFavorites = getFavoritesFromViews(newViews)

      const { error: updateError } = await supabase
        .from('ads')
        .update({
          created_at: newDate,
          views: newViews,
          favorites_count: newFavorites
        })
        .eq('id', ad.id)

      if (updateError) {
        console.error(`❌ Erreur mise à jour annonce ${ad.id}:`, updateError)
      } else {
        updated++
        if (updated % 10 === 0) {
          console.log(`✅ ${updated}/${ads.length} annonces mises à jour...`)
        }
      }
    }

    console.log(`\n✅ ${updated} annonces boostées avec succès!\n`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

async function createNewUsers() {
  try {
    console.log('👥 Création de 3546 nouveaux utilisateurs...\n')

    const totalUsers = 3546
    const batchSize = 100
    let created = 0

    for (let i = 0; i < totalUsers; i += batchSize) {
      const batch = []
      const currentBatchSize = Math.min(batchSize, totalUsers - i)

      for (let j = 0; j < currentBatchSize; j++) {
        const index = i + j + 1
        const username = generateUsername(index)
        const email = `user${index}_${Date.now()}@elite-malta.com`

        batch.push({
          email: email,
          username: username,
          created_at: getRandomDateUsers(),
          elite_coins: 0
        })
      }

      // Insérer le batch
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(batch)

      if (insertError) {
        console.error(`❌ Erreur lors de l'insertion du batch ${i}-${i + currentBatchSize}:`, insertError)
      } else {
        created += currentBatchSize
        console.log(`✅ ${created}/${totalUsers} utilisateurs créés...`)
      }
    }

    console.log(`\n✅ ${created} utilisateurs créés avec succès!\n`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

async function main() {
  console.log('=' .repeat(60))
  console.log('🎯 BOOST DES ANNONCES ET CRÉATION D\'UTILISATEURS')
  console.log('=' .repeat(60))
  console.log()

  // Étape 1: Booster les annonces
  await boostActiveAds()

  // Étape 2: Créer les nouveaux utilisateurs
  await createNewUsers()

  console.log('=' .repeat(60))
  console.log('✅ TERMINÉ!')
  console.log('=' .repeat(60))
}

main()
