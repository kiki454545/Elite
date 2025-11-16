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

async function fixFavoritesFunctions() {
  try {
    console.log('🔧 Correction des fonctions RPC pour les favoris...')

    // Lire le fichier SQL
    const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '006_fix_favorites_column.sql')
    const sql = readFileSync(sqlPath, 'utf8')

    // Exécuter le SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // Si la fonction exec_sql n'existe pas, on essaie d'exécuter directement avec l'API REST
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { data: await response.json(), error: null }
    })

    if (error) {
      console.error('❌ Erreur:', error)
      console.log('\n📝 Veuillez exécuter le SQL suivant manuellement dans Supabase SQL Editor:')
      console.log('\n' + sql)
      process.exit(1)
    }

    console.log('✅ Fonctions RPC corrigées avec succès!')
    console.log('\nℹ️  Les fonctions increment_favorites et decrement_favorites utilisent maintenant la colonne "favorites_count"')

  } catch (err) {
    console.error('❌ Erreur:', err)
    console.log('\n📝 Veuillez exécuter le contenu du fichier supabase/migrations/006_fix_favorites_column.sql manuellement dans Supabase SQL Editor')
    process.exit(1)
  }
}

fixFavoritesFunctions()
