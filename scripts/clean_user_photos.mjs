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

async function cleanUserPhotos() {
  const userId = '217af6f9-ab44-4e1a-adc4-fbb00882e699'

  console.log(`🗑️  Nettoyage des photos pour l'utilisateur ${userId}...\n`)

  // 1. Lister tous les fichiers de l'utilisateur
  const { data: files, error: listError } = await supabase
    .storage
    .from('ad-photos')
    .list(userId, {
      limit: 100
    })

  if (listError) {
    console.error('❌ Erreur:', listError)
    process.exit(1)
  }

  if (!files || files.length === 0) {
    console.log('✅ Aucun fichier à supprimer')
    process.exit(0)
  }

  console.log(`📋 ${files.length} fichier(s) trouvé(s)`)

  // 2. Supprimer tous les fichiers
  const filePaths = files.map(file => `${userId}/${file.name}`)

  console.log('\n🗑️  Suppression en cours...')

  const { data, error: deleteError } = await supabase
    .storage
    .from('ad-photos')
    .remove(filePaths)

  if (deleteError) {
    console.error('❌ Erreur lors de la suppression:', deleteError)
    process.exit(1)
  }

  console.log(`✅ ${filePaths.length} fichier(s) supprimé(s)`)

  // 3. Mettre à jour l'annonce pour vider le tableau de photos
  console.log('\n📝 Mise à jour de l\'annonce...')

  const { data: ad, error: updateError } = await supabase
    .from('ads')
    .update({ photos: [] })
    .eq('user_id', userId)
    .select()

  if (updateError) {
    console.error('❌ Erreur:', updateError)
    process.exit(1)
  }

  console.log('✅ Annonce mise à jour')
  console.log('\n✅ Nettoyage terminé!')
  console.log('Vous pouvez maintenant re-uploader les photos via l\'interface.')
}

cleanUserPhotos()
