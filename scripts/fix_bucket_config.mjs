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

async function fixBucketConfig() {
  console.log('🔧 Correction de la configuration du bucket ad-photos...\n')

  // 1. Vérifier la configuration actuelle
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error('❌ Erreur:', listError)
    process.exit(1)
  }

  const adPhotosBucket = buckets.find(b => b.name === 'ad-photos')

  if (!adPhotosBucket) {
    console.error('❌ Bucket ad-photos introuvable')
    process.exit(1)
  }

  console.log('📦 Configuration actuelle:')
  console.log('   Public:', adPhotosBucket.public)
  console.log('   Allowed MIME types:', adPhotosBucket.allowed_mime_types)
  console.log('   File size limit:', adPhotosBucket.file_size_limit)

  // 2. Mettre à jour la configuration
  console.log('\n🔧 Mise à jour de la configuration...')

  const { data, error } = await supabase.storage.updateBucket('ad-photos', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  })

  if (error) {
    console.error('❌ Erreur:', error)
    console.log('\n⚠️ IMPORTANT:')
    console.log('Le bucket ne peut pas être mis à jour via l\'API.')
    console.log('Vous devez aller dans Supabase Dashboard:')
    console.log('1. Storage → ad-photos → Configuration')
    console.log('2. Décocher "Force download for all objects"')
    console.log('3. S\'assurer que le bucket est PUBLIC')
    console.log('4. Dans "Allowed MIME types", ajouter: image/png, image/jpeg, image/jpg, image/webp')
    process.exit(1)
  }

  console.log('✅ Configuration mise à jour!')

  // 3. Vérifier la nouvelle configuration
  const { data: updatedBuckets } = await supabase.storage.listBuckets()
  const updatedBucket = updatedBuckets?.find(b => b.name === 'ad-photos')

  console.log('\n✅ Nouvelle configuration:')
  console.log('   Public:', updatedBucket?.public)
  console.log('   Allowed MIME types:', updatedBucket?.allowed_mime_types)
  console.log('   File size limit:', updatedBucket?.file_size_limit)
}

fixBucketConfig()
