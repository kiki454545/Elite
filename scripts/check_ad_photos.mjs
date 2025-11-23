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

async function checkAdPhotos() {
  console.log('🔍 Vérification des photos d\'annonces...\n')

  // Récupérer une annonce récente avec des photos
  const { data: ads, error } = await supabase
    .from('ads')
    .select('id, title, photos')
    .not('photos', 'is', null)
    .limit(5)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }

  if (!ads || ads.length === 0) {
    console.log('⚠️ Aucune annonce avec des photos trouvée')
    process.exit(0)
  }

  console.log(`✅ ${ads.length} annonce(s) trouvée(s) avec des photos:\n`)

  for (const ad of ads) {
    console.log(`📌 Annonce: ${ad.title} (${ad.id})`)
    console.log(`   Nombre de photos: ${ad.photos.length}`)

    if (ad.photos.length > 0) {
      console.log(`   Première photo:`)
      console.log(`   ${ad.photos[0]}`)

      // Tester si l'URL est accessible
      try {
        const response = await fetch(ad.photos[0])
        if (response.ok) {
          console.log(`   ✅ Photo accessible (${response.status})`)
        } else {
          console.log(`   ❌ Photo non accessible (${response.status})`)
        }
      } catch (error) {
        console.log(`   ❌ Erreur lors de la vérification: ${error.message}`)
      }
    }

    console.log('')
  }

  // Vérifier les fichiers dans le storage
  console.log('\n📦 Vérification du stockage Supabase...')

  const { data: files, error: listError } = await supabase
    .storage
    .from('ad-photos')
    .list('', {
      limit: 10,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (listError) {
    console.error('❌ Erreur lors de la liste des fichiers:', listError)
  } else {
    console.log(`\n✅ ${files?.length || 0} fichier(s) trouvé(s) dans ad-photos:`)

    if (files && files.length > 0) {
      files.slice(0, 5).forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name}`)

        // Générer l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('ad-photos')
          .getPublicUrl(file.name)

        console.log(`      URL: ${publicUrl}`)
      })
    }
  }

  console.log('\n✅ Vérification terminée!')
}

checkAdPhotos()
