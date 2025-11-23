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

async function fixPhotosMetadata() {
  const userId = '217af6f9-ab44-4e1a-adc4-fbb00882e699'

  console.log(`🔧 Correction des métadonnées pour l'utilisateur ${userId}...\n`)

  // 1. Récupérer l'annonce avec les photos
  const { data: ad } = await supabase
    .from('ads')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!ad || !ad.photos || ad.photos.length === 0) {
    console.log('⚠️ Aucune photo trouvée')
    process.exit(0)
  }

  console.log(`📸 ${ad.photos.length} photo(s) trouvée(s)`)

  // 2. Lister les fichiers
  const { data: files, error: listError } = await supabase
    .storage
    .from('ad-photos')
    .list(userId)

  if (listError || !files) {
    console.error('❌ Erreur:', listError)
    process.exit(1)
  }

  console.log(`📦 ${files.length} fichier(s) dans le storage\n`)

  // 3. Pour chaque fichier, essayer de le mettre à jour
  for (const file of files) {
    const filePath = `${userId}/${file.name}`

    try {
      console.log(`🔧 Traitement: ${file.name}`)

      // Télécharger le fichier
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('ad-photos')
        .download(filePath)

      if (downloadError) {
        console.log(`   ❌ Erreur téléchargement: ${downloadError.message}`)
        continue
      }

      // Déterminer le type MIME basé sur l'extension
      const extension = file.name.split('.').pop()?.toLowerCase()
      let contentType = 'image/jpeg'

      if (extension === 'png') contentType = 'image/png'
      else if (extension === 'jpg' || extension === 'jpeg') contentType = 'image/jpeg'
      else if (extension === 'webp') contentType = 'image/webp'

      console.log(`   Type détecté: ${contentType}`)

      // Supprimer l'ancien
      const { error: deleteError } = await supabase.storage
        .from('ad-photos')
        .remove([filePath])

      if (deleteError) {
        console.log(`   ❌ Erreur suppression: ${deleteError.message}`)
        continue
      }

      // Re-uploader avec le bon content-type
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ad-photos')
        .upload(filePath, fileData, {
          contentType: contentType,
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.log(`   ❌ Erreur upload: ${uploadError.message}`)
        continue
      }

      console.log(`   ✅ Fichier mis à jour avec ${contentType}`)

    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`)
    }
  }

  console.log('\n✅ Correction terminée!')
  console.log('Vérifiez maintenant si les images s\'affichent.')
}

fixPhotosMetadata()
