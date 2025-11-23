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

async function createNewBucket() {
  console.log('🆕 Création d\'un nouveau bucket ad-photos-v2...\n')

  // Créer le nouveau bucket avec la bonne configuration
  const { data, error } = await supabase.storage.createBucket('ad-photos-v2', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  })

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Le bucket ad-photos-v2 existe déjà')
    } else {
      console.error('❌ Erreur:', error)
      process.exit(1)
    }
  } else {
    console.log('✅ Bucket ad-photos-v2 créé avec succès!')
  }

  console.log('\n📋 Configuration à appliquer dans SQL Editor:')
  console.log(`
-- Politiques pour ad-photos-v2
DROP POLICY IF EXISTS "Allow public read access v2" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload v2" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own photos v2" ON storage.objects;

-- Lecture publique
CREATE POLICY "Allow public read access v2"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ad-photos-v2');

-- Upload pour utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to upload v2"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ad-photos-v2');

-- Suppression pour propriétaires
CREATE POLICY "Allow users to delete their own photos v2"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ad-photos-v2' AND auth.uid()::text = (storage.foldername(name))[1]);
  `)

  console.log('\n✅ Exécutez ce SQL dans Supabase SQL Editor')
  console.log('Ensuite, modifiez le code pour utiliser "ad-photos-v2" au lieu de "ad-photos"')
}

createNewBucket()
