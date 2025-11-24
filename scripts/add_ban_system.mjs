import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addBanSystem() {
  console.log('🔨 Ajout du système de ban...\n')

  try {
    // Vérifier si les colonnes existent déjà
    const { data: profiles, error: checkError } = await supabase
      .from('profiles')
      .select('id, banned_until, ban_reason')
      .limit(1)

    if (!checkError) {
      console.log('✅ Les colonnes de ban existent déjà')
      return
    }

    // Ajouter les colonnes de ban
    const { error: addColumnsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Ajouter les colonnes de ban dans la table profiles
        ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS ban_reason TEXT DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS banned_by UUID DEFAULT NULL;

        -- Créer un index sur banned_until pour améliorer les performances
        CREATE INDEX IF NOT EXISTS idx_profiles_banned_until
        ON profiles(banned_until)
        WHERE banned_until IS NOT NULL;

        -- Ajouter un commentaire pour la documentation
        COMMENT ON COLUMN profiles.banned_until IS 'Date et heure jusqu''à laquelle l''utilisateur est banni (NULL si pas banni)';
        COMMENT ON COLUMN profiles.ban_reason IS 'Raison du bannissement';
        COMMENT ON COLUMN profiles.banned_at IS 'Date et heure du bannissement';
        COMMENT ON COLUMN profiles.banned_by IS 'ID de l''admin qui a appliqué le ban';
      `
    })

    if (addColumnsError) {
      // Si la fonction RPC n'existe pas, utiliser SQL direct
      console.log('⚠️  Fonction RPC non disponible, utilisation de SQL direct...')

      // On va créer les colonnes une par une
      const columns = [
        {
          name: 'banned_until',
          sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE DEFAULT NULL'
        },
        {
          name: 'ban_reason',
          sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT DEFAULT NULL'
        },
        {
          name: 'banned_at',
          sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE DEFAULT NULL'
        },
        {
          name: 'banned_by',
          sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_by UUID DEFAULT NULL'
        }
      ]

      for (const column of columns) {
        try {
          // Essayer d'ajouter la colonne via une requête UPDATE (workaround)
          await supabase.from('profiles').select('id').limit(1)
          console.log(`ℹ️  Besoin d'exécuter manuellement: ${column.sql}`)
        } catch (err) {
          console.log(`⚠️  Pour ${column.name}: ${err.message}`)
        }
      }

      console.log('\n📋 Exécutez ce SQL dans l\'éditeur SQL de Supabase:')
      console.log('─'.repeat(80))
      console.log(`
-- Ajouter les colonnes de ban
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ban_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS banned_by UUID DEFAULT NULL;

-- Créer un index sur banned_until
CREATE INDEX IF NOT EXISTS idx_profiles_banned_until
ON profiles(banned_until)
WHERE banned_until IS NOT NULL;

-- Ajouter des commentaires
COMMENT ON COLUMN profiles.banned_until IS 'Date et heure jusqu''à laquelle l''utilisateur est banni (NULL si pas banni)';
COMMENT ON COLUMN profiles.ban_reason IS 'Raison du bannissement';
COMMENT ON COLUMN profiles.banned_at IS 'Date et heure du bannissement';
COMMENT ON COLUMN profiles.banned_by IS 'ID de l''admin qui a appliqué le ban';
      `)
      console.log('─'.repeat(80))
      console.log('\n⚠️  Une fois le SQL exécuté, relancez ce script pour vérifier\n')
      return
    }

    console.log('✅ Colonnes de ban ajoutées avec succès!')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    throw error
  }
}

// Exécuter la migration
addBanSystem()
  .then(() => {
    console.log('\n✅ Migration terminée!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur lors de la migration:', error)
    process.exit(1)
  })
