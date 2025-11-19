import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addServicesColumn() {
  console.log('🔄 Ajout de la colonne services à la table ads...\n')

  try {
    // Lire le fichier SQL
    const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', '020_add_services_column.sql')
    const sql = fs.readFileSync(sqlFilePath, 'utf8')

    console.log('📄 SQL à exécuter:')
    console.log(sql)
    console.log()

    // Exécuter la migration via RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Si la fonction RPC n'existe pas, on utilise une approche alternative
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('⚠️  La fonction exec_sql n\'existe pas. Tentative d\'exécution directe...\n')

        // Exécuter chaque commande SQL séparément
        const commands = sql.split(';').filter(cmd => cmd.trim())

        for (const cmd of commands) {
          if (cmd.trim()) {
            console.log(`📝 Exécution: ${cmd.trim().substring(0, 80)}...`)
            const { error: cmdError } = await supabase.rpc('exec', { sql: cmd })

            if (cmdError) {
              console.error(`❌ Erreur:`, cmdError)
              throw cmdError
            }
          }
        }

        console.log('\n✅ Migration terminée avec succès!')
        console.log('La colonne "services" a été ajoutée à la table ads')
        console.log('Vous pouvez maintenant sélectionner des services lors de la création/modification d\'annonces')
      } else {
        throw error
      }
    } else {
      console.log('✅ Migration exécutée avec succès!')
      console.log('La colonne "services" a été ajoutée à la table ads')
      console.log('Vous pouvez maintenant sélectionner des services lors de la création/modification d\'annonces')
    }

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'exécution de la migration:')
    console.error(error)
    console.log('\n⚠️  Veuillez exécuter le SQL manuellement dans Supabase SQL Editor:')
    console.log('\nAllez sur: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new')
    console.log('\nCopiez-collez le contenu du fichier:')
    console.log('supabase/migrations/020_add_services_column.sql')
    process.exit(1)
  }
}

addServicesColumn()
