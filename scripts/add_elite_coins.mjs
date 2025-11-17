import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addEliteCoins() {
  try {
    console.log('🪙 Setting up elite_coins system...')

    // Créer une fonction PostgreSQL pour exécuter du SQL arbitraire
    const setupSQL = `
      -- Créer une fonction pour exécuter du SQL (si elle n'existe pas)
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    const { error: funcError } = await supabase.rpc('exec_sql', { sql: setupSQL }).single()

    // Ajouter la colonne elite_coins
    const addColumnSQL = `
      DO $$
      BEGIN
        -- Ajouter la colonne si elle n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'profiles' AND column_name = 'elite_coins'
        ) THEN
          ALTER TABLE profiles ADD COLUMN elite_coins INTEGER DEFAULT 0 NOT NULL;
          RAISE NOTICE 'Column elite_coins added';
        ELSE
          RAISE NOTICE 'Column elite_coins already exists';
        END IF;
      END $$;

      -- Mettre à jour tous les profils existants
      UPDATE profiles SET elite_coins = 0 WHERE elite_coins IS NULL;

      -- Ajouter un commentaire
      COMMENT ON COLUMN profiles.elite_coins IS 'Solde de monnaie virtuelle EliteCoin de l''utilisateur';
    `

    console.log('\n📝 SQL to execute in Supabase Dashboard > SQL Editor:\n')
    console.log('═'.repeat(70))
    console.log(addColumnSQL)
    console.log('═'.repeat(70))

    console.log('\n📋 Instructions:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the SQL above')
    console.log('4. Click "Run"')
    console.log('\n✅ Once done, the elite_coins system will be ready!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

addEliteCoins()
