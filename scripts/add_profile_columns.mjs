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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Démarrage de la migration...\n')

    // Lire le fichier de migration
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '013_add_profile_complete_info.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Lecture du fichier de migration: 013_add_profile_complete_info.sql')
    console.log('📊 Exécution de la migration SQL...\n')

    // Exécuter la migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      // Si la fonction exec_sql n'existe pas, essayer d'exécuter directement via l'API REST
      console.log('⚠️  La fonction exec_sql n\'existe pas, tentative d\'exécution via l\'API REST...\n')

      // Diviser le SQL en commandes individuelles
      const commands = migrationSQL
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('COMMENT'))

      console.log(`📝 ${commands.length} commandes SQL à exécuter\n`)

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i]
        console.log(`[${i + 1}/${commands.length}] Exécution: ${command.substring(0, 60)}...`)

        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ sql: command })
        })

        if (!response.ok && response.status !== 404) {
          const errorText = await response.text()
          console.error(`❌ Erreur lors de l'exécution de la commande ${i + 1}:`, errorText)
        }
      }
    }

    console.log('\n✅ Migration terminée avec succès!\n')
    console.log('📋 Colonnes ajoutées à la table profiles:')
    console.log('   Coordonnées:')
    console.log('   - phone, whatsapp, telegram, email_contact, accepts_sms')
    console.log('   Disponibilités:')
    console.log('   - schedule, availability, available_24_7, outcall, incall')
    console.log('   Langues:')
    console.log('   - languages (TEXT[])')
    console.log('   Attributs physiques:')
    console.log('   - height, weight, measurements, cup_size')
    console.log('   - hair_color, eye_color, ethnicity, body_type')
    console.log('   - tattoos, piercings')
    console.log('   Autres:')
    console.log('   - accepts_couples, description, services, category')
    console.log('   - location, country\n')

    // Vérifier que les colonnes ont été ajoutées
    console.log('🔍 Vérification des colonnes ajoutées...\n')
    const { data: columns, error: columnsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (columnsError) {
      console.error('❌ Erreur lors de la vérification:', columnsError.message)
    } else {
      console.log('✅ Structure de la table profiles vérifiée avec succès!')
      if (columns && columns.length > 0) {
        console.log('📊 Colonnes disponibles:', Object.keys(columns[0]).join(', '))
      }
    }

  } catch (err) {
    console.error('❌ Erreur lors de la migration:', err.message)
    process.exit(1)
  }
}

// Exécuter la migration
runMigration()
