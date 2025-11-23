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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupAdPhotosStorage() {
  console.log('🚀 Configuration du stockage pour les photos d\'annonces...\n')

  // 1. Vérifier si le bucket existe
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error('❌ Erreur lors de la récupération des buckets:', listError)
    process.exit(1)
  }

  const adPhotosBucket = buckets.find(b => b.name === 'ad-photos')

  if (!adPhotosBucket) {
    console.log('📦 Création du bucket ad-photos...')

    // Créer le bucket
    const { data, error } = await supabase.storage.createBucket('ad-photos', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg']
    })

    if (error) {
      console.error('❌ Erreur lors de la création du bucket:', error)
      process.exit(1)
    }

    console.log('✅ Bucket ad-photos créé avec succès')
  } else {
    console.log('ℹ️ Le bucket ad-photos existe déjà')

    // Vérifier s'il est public
    if (!adPhotosBucket.public) {
      console.log('⚠️ Le bucket n\'est pas public, mise à jour...')

      const { data, error } = await supabase.storage.updateBucket('ad-photos', {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg']
      })

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du bucket:', error)
        console.log('\n⚠️ Veuillez rendre le bucket public manuellement dans l\'interface Supabase')
      } else {
        console.log('✅ Bucket ad-photos mis à jour avec succès')
      }
    } else {
      console.log('✅ Le bucket est déjà public')
    }
  }

  // 2. Créer une politique d'accès public pour la lecture
  console.log('\n📋 Configuration des politiques d\'accès...')

  // Note: Les politiques de storage doivent être créées via SQL
  console.log('\n⚠️ Pour permettre l\'accès public aux photos, exécutez ce SQL dans Supabase SQL Editor:')
  console.log(`
-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

-- Créer une politique pour permettre la lecture publique
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ad-photos');

-- Créer une politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ad-photos');

-- Créer une politique pour permettre la suppression aux propriétaires
CREATE POLICY "Allow users to delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ad-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  `)

  console.log('\n✅ Script terminé!')
  console.log('\n📝 Prochaines étapes:')
  console.log('1. Copiez et exécutez le SQL ci-dessus dans Supabase SQL Editor')
  console.log('2. Vérifiez que le bucket ad-photos est bien PUBLIC dans Storage → ad-photos → Settings')
  console.log('3. Testez l\'upload d\'une nouvelle photo')
}

setupAdPhotosStorage()
