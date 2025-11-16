import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  try {
    console.log('📦 Configuration du storage pour les photos d\'annonces...')

    // Créer le bucket pour les photos d'annonces
    const { data: bucket, error: bucketError } = await supabase
      .storage
      .createBucket('ad-photos', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg']
      })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Le bucket ad-photos existe déjà')
      } else {
        console.error('❌ Erreur lors de la création du bucket:', bucketError)
        return
      }
    } else {
      console.log('✅ Bucket ad-photos créé avec succès!')
    }

    console.log('\n✅ Storage configuré!')

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

setupStorage()
