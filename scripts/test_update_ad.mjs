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

async function testUpdateAd() {
  console.log('🧪 Test de mise à jour d\'annonce...\n')

  // 1. Récupérer une annonce
  const { data: ads } = await supabase
    .from('ads')
    .select('*')
    .limit(1)
    .order('created_at', { ascending: false })

  if (!ads || ads.length === 0) {
    console.error('❌ Aucune annonce trouvée')
    process.exit(1)
  }

  const ad = ads[0]
  console.log('📌 Annonce:', ad.title, `(${ad.id})`)
  console.log('   User ID:', ad.user_id)
  console.log('   Photos actuelles:', ad.photos || [])

  // 2. Récupérer les URLs des fichiers dans le storage
  const { data: files } = await supabase
    .storage
    .from('ad-photos')
    .list('', { limit: 10 })

  if (!files || files.length === 0) {
    console.error('❌ Aucun fichier dans le storage')
    process.exit(1)
  }

  const testUrls = files.slice(0, 2).map(file => {
    const { data: { publicUrl } } = supabase.storage
      .from('ad-photos')
      .getPublicUrl(file.name)
    return publicUrl
  })

  console.log('\n📸 URLs de test:', testUrls)

  // 3. Tester la mise à jour DIRECTEMENT (sans API)
  console.log('\n🔧 Test de mise à jour directe...')

  const { data: updatedAd, error } = await supabase
    .from('ads')
    .update({
      photos: testUrls,
      description: `${ad.description || 'Test'} [Updated: ${new Date().toISOString()}]`
    })
    .eq('id', ad.id)
    .select()
    .single()

  if (error) {
    console.error('❌ Erreur mise à jour directe:', error)
  } else {
    console.log('✅ Mise à jour directe réussie!')
    console.log('   Photos:', updatedAd.photos)
  }

  // 4. Tester la mise à jour via l'API
  console.log('\n🌐 Test de mise à jour via API...')

  const response = await fetch('http://localhost:3000/api/ads/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      adId: ad.id,
      userId: ad.user_id,
      updateData: {
        photos: testUrls,
        description: `${ad.description || 'Test'} [API Updated: ${new Date().toISOString()}]`
      },
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('❌ Erreur API:', errorData)
  } else {
    const result = await response.json()
    console.log('✅ Mise à jour API réussie!')
    console.log('   Photos:', result.data.photos)
  }

  console.log('\n✅ Tests terminés!')
}

testUpdateAd()
