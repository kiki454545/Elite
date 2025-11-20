import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addOnlineColumn() {
  try {
    console.log('🔧 Ajout de la colonne "online" à la table profiles...\n')

    // Vérifier si la colonne existe déjà
    const { data: columns, error: checkError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' })
      .select()

    // Si la fonction n'existe pas, on fait la migration directement
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'profiles'
            AND column_name = 'online'
          ) THEN
            ALTER TABLE profiles ADD COLUMN online BOOLEAN DEFAULT false;
            COMMENT ON COLUMN profiles.online IS 'Statut en ligne de l\'utilisateur';

            RAISE NOTICE 'Colonne online ajoutée avec succès';
          ELSE
            RAISE NOTICE 'La colonne online existe déjà';
          END IF;
        END $$;
      `
    })

    if (error) {
      // Si exec_sql n'existe pas, essayons une approche directe
      console.log('⚠️  Fonction exec_sql non disponible, utilisation de ALTER TABLE direct...\n')

      const { error: alterError } = await supabase.from('_migrations').insert({
        name: 'add_online_column',
        executed_at: new Date().toISOString()
      })

      // Tentative directe via SQL
      console.log('⚠️  Vous devez exécuter manuellement cette requête SQL dans Supabase:\n')
      console.log('-----------------------------------------------------------')
      console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS online BOOLEAN DEFAULT false;')
      console.log('COMMENT ON COLUMN profiles.online IS \'Statut en ligne de l\'utilisateur\';')
      console.log('-----------------------------------------------------------\n')

      console.log('❌ Impossible d\'ajouter automatiquement la colonne.')
      console.log('   Veuillez exécuter le SQL ci-dessus manuellement dans Supabase.')
    } else {
      console.log('✅ Colonne "online" ajoutée avec succès!\n')
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)

    console.log('\n⚠️  Vous devez exécuter manuellement cette requête SQL dans Supabase:\n')
    console.log('-----------------------------------------------------------')
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS online BOOLEAN DEFAULT false;')
    console.log('COMMENT ON COLUMN profiles.online IS \'Statut en ligne de l\'utilisateur\';')
    console.log('-----------------------------------------------------------\n')
  }
}

console.log('🚀 Démarrage de la migration...\n')
addOnlineColumn()
