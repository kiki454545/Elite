import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger les variables d'environnement
dotenv.config({ path: resolve(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateAvailability() {
  try {
    console.log('🚀 Début de la migration - Ajout de la colonne availability...\n')

    // Lire le fichier SQL
    const sqlContent = readFileSync(resolve(__dirname, 'add_availability_column.sql'), 'utf-8')

    // Séparer les commandes SQL (en ignorant les commentaires)
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--'))

    console.log(`📝 ${sqlCommands.length} commandes SQL à exécuter\n`)

    // Exécuter chaque commande
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i]
      if (!command) continue

      console.log(`[${i + 1}/${sqlCommands.length}] Exécution...`)

      const { error } = await supabase.rpc('exec_sql', { sql: command })

      if (error) {
        console.error(`❌ Erreur lors de l'exécution de la commande ${i + 1}:`)
        console.error(error)
        console.log('\nCommande qui a échoué:')
        console.log(command.substring(0, 200) + '...\n')
      } else {
        console.log(`✅ Commande ${i + 1} exécutée avec succès`)
      }
    }

    console.log('\n✨ Migration terminée !')
    console.log('\n📋 Colonne ajoutée à la table profiles:')
    console.log('   - availability (JSONB)')
    console.log('     Structure: { "monday": {"enabled": false, "start": "09:00", "end": "17:00"}, ... }')

  } catch (err) {
    console.error('❌ Erreur lors de la migration:', err)
    process.exit(1)
  }
}

console.log('════════════════════════════════════════════════════════')
console.log('   Migration - Ajout de la colonne availability')
console.log('════════════════════════════════════════════════════════\n')

migrateAvailability()
