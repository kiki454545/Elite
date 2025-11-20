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
    console.log('🔧 Modification de la colonne price...\n')

    // D'abord, vérifier le type actuel
    const { data: currentData, error: checkError } = await supabase
      .from('ads')
      .select('price')
      .limit(1)

    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError.message)
      return
    }

    console.log('📊 Données actuelles:', currentData)

    // Utiliser une requête SQL brute via l'API
    const sqlQuery = `
      ALTER TABLE ads
      ALTER COLUMN price TYPE TEXT
      USING CASE
        WHEN price IS NULL THEN NULL
        ELSE price::TEXT
      END;
    `

    console.log('\n📝 Requête SQL à exécuter:')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(sqlQuery)
    console.log('═══════════════════════════════════════════════════════════\n')

    console.log('⚠️  Cette requête doit être exécutée dans le Supabase Dashboard')
    console.log('   1. Allez sur https://supabase.com/dashboard')
    console.log('   2. Sélectionnez votre projet')
    console.log('   3. Allez dans SQL Editor')
    console.log('   4. Collez et exécutez la requête ci-dessus\n')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

console.log('🚀 Vérification de la colonne price...\n')
fixPriceColumn()
