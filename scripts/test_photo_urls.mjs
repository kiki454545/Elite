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

async function testPhotoUrls() {
  console.log('🧪 Test d\'accessibilité des photos...\n')

  // Récupérer l'annonce ALANA
  const { data: ad } = await supabase
    .from('ads')
    .select('*')
    .eq('id', '1db0ff94-b55c-490d-bbd5-3ff7b6327231')
    .single()

  if (!ad || !ad.photos || ad.photos.length === 0) {
    console.error('❌ Aucune photo trouvée')
    process.exit(1)
  }

  console.log(`📌 Annonce: ${ad.title}`)
  console.log(`   ${ad.photos.length} photo(s)\n`)

  for (let i = 0; i < ad.photos.length; i++) {
    const url = ad.photos[i]
    console.log(`📸 Photo ${i + 1}:`)
    console.log(`   URL: ${url}`)

    try {
      const response = await fetch(url)
      console.log(`   Status: ${response.status} ${response.statusText}`)
      console.log(`   Type: ${response.headers.get('content-type')}`)
      console.log(`   Taille: ${response.headers.get('content-length')} bytes`)

      if (response.ok) {
        console.log(`   ✅ Accessible`)
      } else {
        console.log(`   ❌ Non accessible`)
      }
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`)
    }
    console.log('')
  }

  console.log('✅ Tests terminés!')
}

testPhotoUrls()
