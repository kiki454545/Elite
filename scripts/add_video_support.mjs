import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addVideoSupport() {
  try {
    console.log('🎬 Ajout du support vidéo pour les annonces...\n')

    // 1. Ajouter la colonne video_url à la table ads
    console.log('📊 Ajout de la colonne video_url...')
    const { error: columnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE ads
        ADD COLUMN IF NOT EXISTS video_url TEXT;
      `
    })

    if (columnError) {
      // Si RPC n'existe pas, utiliser une requête directe
      const { error: altError } = await supabase
        .from('ads')
        .select('video_url')
        .limit(1)

      if (altError && altError.message.includes('column "video_url" does not exist')) {
        console.log('⚠️  Impossible d\'ajouter la colonne automatiquement.')
        console.log('📝 Exécutez cette requête SQL manuellement dans Supabase Dashboard:')
        console.log('\nALTER TABLE ads ADD COLUMN IF NOT EXISTS video_url TEXT;\n')
      } else {
        console.log('✅ Colonne video_url déjà présente')
      }
    } else {
      console.log('✅ Colonne video_url ajoutée')
    }

    // 2. Créer le bucket de storage pour les vidéos
    console.log('\n📦 Création du bucket de storage pour les vidéos...')

    // Vérifier si le bucket existe déjà
    const { data: buckets } = await supabase.storage.listBuckets()
    const videosBucketExists = buckets?.some(b => b.name === 'ad-videos')

    if (!videosBucketExists) {
      const { data: bucket, error: bucketError } = await supabase.storage.createBucket('ad-videos', {
        public: true,
        fileSizeLimit: 52428800, // 50 MB max
        allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm']
      })

      if (bucketError) {
        console.log('⚠️  Erreur lors de la création du bucket:', bucketError.message)
        console.log('📝 Créez manuellement le bucket "ad-videos" dans Supabase Dashboard')
        console.log('   - Public: Oui')
        console.log('   - Taille max: 50 MB')
        console.log('   - Types MIME: video/mp4, video/quicktime, video/webm')
      } else {
        console.log('✅ Bucket ad-videos créé avec succès')
      }
    } else {
      console.log('✅ Bucket ad-videos déjà existant')
    }

    // 3. Configurer les politiques RLS pour le bucket
    console.log('\n🔒 Configuration des politiques de sécurité...')
    console.log('📝 Exécutez ces requêtes SQL dans Supabase Dashboard > SQL Editor:\n')

    console.log(`-- Permettre aux utilisateurs authentifiés d'uploader des vidéos
CREATE POLICY "Users can upload their own ad videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ad-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permettre à tout le monde de voir les vidéos (bucket public)
CREATE POLICY "Anyone can view ad videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ad-videos');

-- Permettre aux utilisateurs de supprimer leurs propres vidéos
CREATE POLICY "Users can delete their own ad videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ad-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permettre aux utilisateurs de mettre à jour leurs propres vidéos
CREATE POLICY "Users can update their own ad videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ad-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
`)

    console.log('\n✅ Configuration terminée!')
    console.log('\n📋 Résumé:')
    console.log('   - Colonne video_url ajoutée à la table ads')
    console.log('   - Bucket ad-videos créé (50 MB max, vidéos uniquement)')
    console.log('   - Durée max recommandée: 30 secondes')
    console.log('   - Formats supportés: MP4, MOV, WebM')
    console.log('\n⚠️  N\'oubliez pas d\'exécuter les politiques RLS ci-dessus!')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

addVideoSupport()
