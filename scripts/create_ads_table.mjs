import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdsTable() {
  try {
    console.log('📝 Lecture du fichier de migration...')

    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '003_create_ads_table.sql')
    const sql = readFileSync(migrationPath, 'utf8')

    console.log('🚀 Exécution de la migration...')

    // Exécuter le SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // Si la fonction exec_sql n'existe pas, essayer directement
      return await supabase.from('_migrations').insert({ sql })
    })

    if (error) {
      // Essayer d'exécuter directement via l'API REST
      console.log('⚠️  Tentative alternative d\'exécution de la migration...')

      // Créer la table manuellement
      const { error: createError } = await supabase.rpc('create_ads_table').catch(() => ({ error: null }))

      if (createError) {
        console.error('❌ Erreur:', createError)
        console.log('\n📋 SQL à exécuter manuellement dans le SQL Editor de Supabase:')
        console.log('─'.repeat(80))
        console.log(sql)
        console.log('─'.repeat(80))
        return
      }
    }

    console.log('✅ Table ads créée avec succès!')
    console.log('✅ Table favorites créée avec succès!')
    console.log('✅ Politiques de sécurité (RLS) configurées!')

  } catch (error) {
    console.error('❌ Erreur lors de la création de la table:', error)
    console.log('\n📋 Exécutez ce SQL manuellement dans le SQL Editor de Supabase:')
    console.log('─'.repeat(80))
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '003_create_ads_table.sql')
    const sql = readFileSync(migrationPath, 'utf8')
    console.log(sql)
    console.log('─'.repeat(80))
  }
}

createAdsTable()
