import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createVerificationStorage() {
  console.log('📦 Création du bucket pour les photos de vérification...')

  try {
    // Créer le bucket
    const { data: bucket, error: bucketError } = await supabase
      .storage
      .createBucket('verification-photos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      })

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      throw bucketError
    }

    console.log('✅ Bucket créé avec succès')

    // Configurer les policies RLS pour le bucket
    console.log('🔒 Configuration des policies de sécurité...')

    // Policy pour permettre aux utilisateurs authentifiés d'uploader
    const uploadPolicy = {
      name: 'Users can upload verification photos',
      definition: `(bucket_id = 'verification-photos' AND auth.role() = 'authenticated')`,
      action: 'INSERT'
    }

    // Policy pour permettre à tout le monde de lire (pour les admins)
    const readPolicy = {
      name: 'Anyone can read verification photos',
      definition: `bucket_id = 'verification-photos'`,
      action: 'SELECT'
    }

    // Note: Les policies de storage se configurent dans l'interface Supabase
    console.log('⚠️  Configurez manuellement les policies dans Supabase Dashboard:')
    console.log('   1. Allez dans Storage > verification-photos')
    console.log('   2. Ajoutez une policy pour INSERT (authenticated users)')
    console.log('   3. Ajoutez une policy pour SELECT (public read)')

    console.log('✅ Configuration terminée')
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

createVerificationStorage()
