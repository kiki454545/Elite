import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProfilesWithAds() {
  try {
    console.log('🔍 Vérification des profils associés aux annonces...\n')

    // 1. Récupérer toutes les annonces
    const { data: ads, error: adsError } = await supabase
      .from('ads')
      .select('id, title, user_id')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(5)

    if (adsError) {
      console.error('❌ Erreur:', adsError)
      return
    }

    console.log(`📊 ${ads.length} annonces récupérées (affichage des 5 premières)\n`)

    for (const ad of ads) {
      console.log(`\n📝 Annonce: "${ad.title}" (${ad.id})`)
      console.log(`   User ID: ${ad.user_id}`)

      // 2. Récupérer le profil associé
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, age, rank, verified')
        .eq('id', ad.user_id)
        .single()

      if (profileError) {
        console.log(`   ❌ Erreur profil: ${profileError.message}`)
      } else if (!profile) {
        console.log(`   ❌ Profil non trouvé`)
      } else {
        console.log(`   ✅ Profil trouvé:`)
        console.log(`      - Username: ${profile.username}`)
        console.log(`      - Age: ${profile.age}`)
        console.log(`      - Rank: ${profile.rank}`)
        console.log(`      - Verified: ${profile.verified}`)
      }
    }

  } catch (error) {
    console.error('❌ Erreur globale:', error.message)
  }
}

console.log('🚀 Démarrage de la vérification...\n')
checkProfilesWithAds()
