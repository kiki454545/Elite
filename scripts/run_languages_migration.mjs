import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger les variables d'environnement
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Exécution de la migration languages...')

    // Lire le fichier SQL
    const sqlContent = readFileSync(
      resolve(__dirname, 'add_languages_column.sql'),
      'utf-8'
    )

    // Exécuter chaque commande SQL
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--'))

    for (const command of commands) {
      if (command) {
        console.log('📝 Exécution:', command.substring(0, 50) + '...')
        const { error } = await supabase.rpc('exec_sql', { sql: command })

        if (error) {
          // Ignorer les erreurs "already exists"
          if (!error.message.includes('already exists') && !error.message.includes('does not exist')) {
            console.error('⚠️  Erreur:', error.message)
          } else {
            console.log('✅ OK (déjà existant)')
          }
        } else {
          console.log('✅ Succès')
        }
      }
    }

    console.log('\n✅ Migration terminée !')

    // Vérifier si la colonne existe
    const { data, error } = await supabase
      .from('profiles')
      .select('languages')
      .limit(1)

    if (error) {
      console.error('❌ Erreur lors de la vérification:', error.message)
    } else {
      console.log('✅ Colonne languages vérifiée avec succès')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

runMigration()
