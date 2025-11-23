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

async function checkStorageStructure() {
  console.log('🔍 Vérification de la structure du storage...\n')

  // Lister TOUS les fichiers à la racine
  const { data: rootFiles, error: rootError } = await supabase
    .storage
    .from('ad-photos')
    .list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (rootError) {
    console.error('❌ Erreur:', rootError)
    process.exit(1)
  }

  console.log(`📦 Fichiers trouvés à la racine: ${rootFiles?.length || 0}\n`)

  if (rootFiles && rootFiles.length > 0) {
    for (const file of rootFiles) {
      console.log(`📄 ${file.name}`)
      console.log(`   ID: ${file.id}`)
      console.log(`   Metadata:`, file.metadata)

      // Générer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('ad-photos')
        .getPublicUrl(file.name)

      console.log(`   URL: ${publicUrl}`)
      console.log('')
    }
  }

  // Vérifier les dossiers (si structure par utilisateur)
  console.log('\n🔍 Recherche de dossiers utilisateurs...')

  const { data: ads } = await supabase
    .from('ads')
    .select('user_id')
    .limit(5)

  if (ads && ads.length > 0) {
    for (const ad of ads) {
      const { data: userFiles, error: userError } = await supabase
        .storage
        .from('ad-photos')
        .list(ad.user_id, {
          limit: 10
        })

      if (!userError && userFiles && userFiles.length > 0) {
        console.log(`✅ Dossier ${ad.user_id}: ${userFiles.length} fichier(s)`)
      }
    }
  }

  console.log('\n✅ Vérification terminée!')
}

checkStorageStructure()
