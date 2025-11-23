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

async function checkStorageFiles() {
  console.log('🔍 Vérification des fichiers dans le dossier utilisateur...\n')

  const userId = '217af6f9-ab44-4e1a-adc4-fbb00882e699'

  // Lister les fichiers dans le dossier de l'utilisateur
  const { data: files, error } = await supabase
    .storage
    .from('ad-photos')
    .list(userId, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) {
    console.error('❌ Erreur:', error)
    console.log('\n🔍 Vérification à la racine...')

    // Essayer à la racine
    const { data: rootFiles, error: rootError } = await supabase
      .storage
      .from('ad-photos')
      .list('', {
        limit: 100
      })

    if (rootError) {
      console.error('❌ Erreur racine:', rootError)
      process.exit(1)
    }

    console.log(`\n📦 Fichiers à la racine: ${rootFiles?.length || 0}`)
    if (rootFiles) {
      rootFiles.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata?.size || 'N/A'} bytes)`)
      })
    }

    process.exit(0)
  }

  if (!files || files.length === 0) {
    console.log(`⚠️ Aucun fichier trouvé dans le dossier ${userId}`)
    process.exit(0)
  }

  console.log(`✅ ${files.length} fichier(s) trouvé(s) dans le dossier ${userId}:\n`)

  for (const file of files) {
    console.log(`📄 ${file.name}`)
    console.log(`   Taille: ${file.metadata?.size || 'N/A'} bytes`)
    console.log(`   Type: ${file.metadata?.mimetype || 'N/A'}`)
    console.log(`   Créé: ${file.created_at}`)

    const { data: { publicUrl } } = supabase.storage
      .from('ad-photos')
      .getPublicUrl(`${userId}/${file.name}`)

    console.log(`   URL: ${publicUrl}`)
    console.log('')
  }

  console.log('✅ Vérification terminée!')
}

checkStorageFiles()
