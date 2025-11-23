import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function findAdByUser() {
  console.log('🔍 Recherche des annonces pour user_id: 217af6f9-ab44-4e1a-adc4-fbb00882e699\n')

  const { data: ads, error } = await supabase
    .from('ads')
    .select('*')
    .eq('user_id', '217af6f9-ab44-4e1a-adc4-fbb00882e699')

  if (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }

  if (!ads || ads.length === 0) {
    console.log('⚠️ Aucune annonce trouvée pour cet utilisateur')
    process.exit(0)
  }

  console.log(`✅ ${ads.length} annonce(s) trouvée(s):\n`)

  for (const ad of ads) {
    console.log(`📌 ${ad.title} (${ad.id})`)
    console.log(`   Créée: ${ad.created_at}`)
    console.log(`   Modifiée: ${ad.updated_at}`)
    console.log(`   Photos: ${ad.photos?.length || 0}`)

    if (ad.photos && ad.photos.length > 0) {
      console.log(`   URLs:`)
      ad.photos.forEach((url, i) => {
        console.log(`     ${i + 1}. ${url}`)
      })
    }
    console.log('')
  }

  console.log('✅ Recherche terminée!')
}

findAdByUser()
