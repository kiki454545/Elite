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

async function fixPriceColumn() {
  try {
    console.log('🔧 Modification de la colonne price de INTEGER vers TEXT...\n')

    // Modifier le type de la colonne price
    const { error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE ads ALTER COLUMN price TYPE TEXT USING price::TEXT;`
    })

    if (error) {
      console.log('⚠️  La fonction RPC n\'existe pas, tentative avec une requête directe...\n')

      // Si la fonction RPC n'existe pas, on doit le faire via une migration SQL
      console.log('📝 Veuillez exécuter cette commande SQL dans Supabase Dashboard:')
      console.log('═══════════════════════════════════════════════════════════')
      console.log('ALTER TABLE ads ALTER COLUMN price TYPE TEXT USING price::TEXT;')
      console.log('═══════════════════════════════════════════════════════════\n')

      console.log('📍 Ou créez une nouvelle migration avec cette commande:')
      console.log('npx supabase migration new fix_price_column')
      console.log('\nPuis ajoutez le SQL ci-dessus dans le fichier de migration créé.\n')
    } else {
      console.log('✅ Colonne price modifiée avec succès!')
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

console.log('🚀 Démarrage de la modification de la colonne price...\n')
fixPriceColumn()
