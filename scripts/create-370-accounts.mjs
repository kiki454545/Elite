import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Listes pour générer des pseudos aléatoires
const adjectives = [
  'Belle', 'Sexy', 'Douce', 'Chaude', 'Divine', 'Sensuelle', 'Coquine', 'Délicate',
  'Charmante', 'Élégante', 'Raffinée', 'Intense', 'Passionnée', 'Tendre', 'Sulfureuse',
  'Mystérieuse', 'Exotique', 'Fatale', 'Envoûtante', 'Captivante', 'Féline', 'Gracieuse',
  'Pulpeuse', 'Voluptueuse', 'Câline', 'Espiègle', 'Malicieuse', 'Ardente', 'Fiévreuse',
  'Enivrante', 'Radieuse', 'Lumineuse', 'Éclatante', 'Sublime', 'Magnifique', 'Superbe',
  'Torride', 'Brûlante', 'Incendiaire', 'Enjouée', 'Mutine', 'Câline', 'Taquine',
  'Ensorcelante', 'Affolante', 'Troublante', 'Ravissante', 'Exquise', 'Délicieuse'
]

const nouns = [
  'Ange', 'Déesse', 'Perle', 'Fleur', 'Étoile', 'Lune', 'Sirène', 'Nymphe',
  'Muse', 'Féerie', 'Rêve', 'Désir', 'Plaisir', 'Extase', 'Passion', 'Flamme',
  'Velours', 'Satin', 'Soie', 'Nacre', 'Opale', 'Rubis', 'Saphir', 'Diamant',
  'Orchidée', 'Rose', 'Jasmin', 'Vanille', 'Cannelle', 'Miel', 'Caramel', 'Fraise',
  'Cerise', 'Pêche', 'Abricot', 'Mangue', 'Papaye', 'Litchi', 'Chocolat', 'Champagne',
  'Cognac', 'Whisky', 'Tequila', 'Mojito', 'Martini', 'Bellini', 'Spritz', 'Nectar'
]

const cities = [
  'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
  'Montpellier', 'Lille', 'Rennes', 'Reims', 'Toulon', 'Grenoble', 'Dijon', 'Angers',
  'Nîmes', 'Villeurbanne', 'Clermont', 'Aix', 'Brest', 'Tours', 'Amiens', 'Limoges',
  'Annecy', 'Perpignan', 'Besançon', 'Orléans', 'Metz', 'Rouen', 'Mulhouse', 'Caen',
  'Nancy', 'Argenteuil', 'Montreuil', 'Roubaix', 'Tourcoing', 'Avignon', 'Poitiers',
  'Dunkerque', 'Versailles', 'Courbevoie', 'Créteil', 'Vitry', 'Pau', 'Colombes'
]

function generateRandomUsername() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const city = cities[Math.floor(Math.random() * cities.length)]
  const number = Math.floor(Math.random() * 99) + 1

  // Varier les formats de pseudos
  const formats = [
    `${adjective}${noun}${number}`,
    `${noun}De${city}`,
    `${adjective}${city}${number}`,
    `${noun}${number}`,
    `Miss${city}${number}`,
    `${adjective}${noun}`,
    `${city}${noun}${number}`,
  ]

  return formats[Math.floor(Math.random() * formats.length)]
}

// Mot de passe de 10 caractères (complexe pour la sécurité)
const PASSWORD = 'SexElite24'

async function createAccount(accountNumber) {
  const username = generateRandomUsername()
  const email = `sexelite${accountNumber}@gmail.com`

  try {
    // Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: {
        username: username
      }
    })

    if (authError) {
      console.error(`❌ Erreur compte #${accountNumber} (${email}):`, authError.message)
      return { success: false, accountNumber, email, error: authError.message }
    }

    // Créer le profil dans la table profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: username,
        email: email,
        age: Math.floor(Math.random() * 20) + 20, // Âge entre 20 et 40
        rank: 'standard',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error(`⚠️  Profil non créé pour #${accountNumber} (${email}):`, profileError.message)
      return { success: true, accountNumber, email, username, profileError: profileError.message }
    }

    console.log(`✅ Compte #${accountNumber} créé: ${username} (${email})`)
    return { success: true, accountNumber, email, username }

  } catch (error) {
    console.error(`❌ Erreur inattendue compte #${accountNumber}:`, error)
    return { success: false, accountNumber, email, error: error.message }
  }
}

async function createAllAccounts() {
  console.log('🚀 Création de 370 comptes...\n')
  console.log(`📧 Format email: sexelite1@gmail.com à sexelite370@gmail.com`)
  console.log(`🔑 Mot de passe (identique pour tous): ${PASSWORD}\n`)
  console.log('━'.repeat(80) + '\n')

  const results = []
  const batchSize = 10 // Créer 10 comptes à la fois pour éviter de surcharger l'API

  for (let i = 1; i <= 370; i += batchSize) {
    const batch = []
    const end = Math.min(i + batchSize - 1, 370)

    console.log(`📦 Création des comptes ${i} à ${end}...`)

    for (let j = i; j <= end; j++) {
      batch.push(createAccount(j))
    }

    const batchResults = await Promise.all(batch)
    results.push(...batchResults)

    // Pause de 1 seconde entre chaque lot pour éviter le rate limiting
    if (i + batchSize <= 370) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log('\n' + '━'.repeat(80))
  console.log('\n📊 RÉSUMÉ:\n')

  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  console.log(`✅ Comptes créés avec succès: ${successful}/370`)
  console.log(`❌ Échecs: ${failed}/370`)
  console.log(`\n🔑 MOT DE PASSE POUR TOUS LES COMPTES: ${PASSWORD}`)

  if (failed > 0) {
    console.log('\n⚠️  Comptes en échec:')
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - Compte #${r.accountNumber} (${r.email}): ${r.error}`)
    })
  }

  console.log('\n' + '━'.repeat(80))
}

createAllAccounts()
  .then(() => {
    console.log('\n✅ Script terminé')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
