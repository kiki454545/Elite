import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addCommentsSystem() {
  try {
    console.log('🔧 Ajout du système de commentaires...')

    // Lire le fichier SQL
    const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '008_add_comments_system.sql')
    const sql = readFileSync(sqlPath, 'utf8')

    console.log('\n📝 Veuillez exécuter le SQL suivant dans Supabase SQL Editor:\n')
    console.log('=' .repeat(80))
    console.log(sql)
    console.log('=' .repeat(80))
    console.log('\nℹ️  Instructions:')
    console.log('1. Allez sur https://supabase.com/dashboard/project/[votre-projet]/sql/new')
    console.log('2. Copiez-collez le SQL ci-dessus')
    console.log('3. Cliquez sur "Run"')
    console.log('\n✅ Une fois la migration exécutée, le système de commentaires sera actif!')

  } catch (err) {
    console.error('❌ Erreur:', err)
    process.exit(1)
  }
}

addCommentsSystem()
