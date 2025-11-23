import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
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

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugEditPage() {
  console.log('🔍 Débogage de la page d\'édition...\n')

  // 1. Récupérer une annonce
  const { data: ads, error: adsError } = await supabase
    .from('ads')
    .select('*')
    .limit(1)
    .order('created_at', { ascending: false })

  if (adsError || !ads || ads.length === 0) {
    console.error('❌ Erreur:', adsError || 'Aucune annonce trouvée')
    process.exit(1)
  }

  const ad = ads[0]
  console.log('📌 Annonce sélectionnée:', ad.title, `(${ad.id})`)
  console.log('   Photos actuelles:', ad.photos?.length || 0)
  console.log('   User ID:', ad.user_id)

  // 2. Lister les fichiers dans le storage pour cet utilisateur
  console.log('\n📦 Fichiers dans le storage pour cet utilisateur...')

  const { data: files, error: listError } = await supabase
    .storage
    .from('ad-photos')
    .list(ad.user_id, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (listError) {
    console.error('❌ Erreur liste:', listError)
  } else {
    console.log(`✅ ${files?.length || 0} fichier(s) trouvé(s):`)
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        const { data: { publicUrl } } = supabase.storage
          .from('ad-photos')
          .getPublicUrl(`${ad.user_id}/${file.name}`)
        console.log(`   ${index + 1}. ${file.name}`)
        console.log(`      URL: ${publicUrl}`)
      })
    }
  }

  // 3. Simuler une mise à jour avec ces URLs
  if (files && files.length > 0) {
    console.log('\n🧪 Test de mise à jour de l\'annonce...')

    const photoUrls = files.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from('ad-photos')
        .getPublicUrl(`${ad.user_id}/${file.name}`)
      return publicUrl
    })

    console.log('   URLs à ajouter:', photoUrls)

    const { data: updatedAd, error: updateError } = await supabase
      .from('ads')
      .update({ photos: photoUrls })
      .eq('id', ad.id)
      .eq('user_id', ad.user_id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erreur mise à jour:', updateError)
    } else {
      console.log('✅ Annonce mise à jour avec succès!')
      console.log('   Nouvelles photos:', updatedAd.photos?.length || 0)
    }
  }

  console.log('\n✅ Débogage terminé!')
}

debugEditPage()
