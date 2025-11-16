import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createBlockedUsersTable() {
  console.log('🚀 Création de la table blocked_users...')

  // Créer la table blocked_users
  const { error: createError } = await supabase.rpc('exec_sql', {
    sql: `
      -- Créer la table blocked_users si elle n'existe pas
      CREATE TABLE IF NOT EXISTS blocked_users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        blocked_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, blocked_user_id)
      );

      -- Créer des index pour améliorer les performances
      CREATE INDEX IF NOT EXISTS idx_blocked_users_user_id ON blocked_users(user_id);
      CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_user_id ON blocked_users(blocked_user_id);

      -- Activer RLS
      ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

      -- Politique: Les utilisateurs peuvent voir leurs propres blocages
      DROP POLICY IF EXISTS "Users can view their own blocked users" ON blocked_users;
      CREATE POLICY "Users can view their own blocked users"
        ON blocked_users FOR SELECT
        USING (auth.uid() = user_id);

      -- Politique: Les utilisateurs peuvent bloquer d'autres utilisateurs
      DROP POLICY IF EXISTS "Users can block other users" ON blocked_users;
      CREATE POLICY "Users can block other users"
        ON blocked_users FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      -- Politique: Les utilisateurs peuvent débloquer d'autres utilisateurs
      DROP POLICY IF EXISTS "Users can unblock other users" ON blocked_users;
      CREATE POLICY "Users can unblock other users"
        ON blocked_users FOR DELETE
        USING (auth.uid() = user_id);
    `
  })

  if (createError) {
    console.error('❌ Erreur lors de la création de la table:', createError)

    // Essayer avec des requêtes séparées
    console.log('🔄 Tentative avec des requêtes séparées...')

    try {
      // Note: Supabase JS ne permet pas d'exécuter du SQL arbitraire directement
      // Vous devrez exécuter ce SQL manuellement dans le SQL Editor de Supabase
      console.log(`
📝 Veuillez exécuter ce SQL manuellement dans le SQL Editor de Supabase:

-- Créer la table blocked_users si elle n'existe pas
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_blocked_users_user_id ON blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_user_id ON blocked_users(blocked_user_id);

-- Activer RLS
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leurs propres blocages
DROP POLICY IF EXISTS "Users can view their own blocked users" ON blocked_users;
CREATE POLICY "Users can view their own blocked users"
  ON blocked_users FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent bloquer d'autres utilisateurs
DROP POLICY IF EXISTS "Users can block other users" ON blocked_users;
CREATE POLICY "Users can block other users"
  ON blocked_users FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent débloquer d'autres utilisateurs
DROP POLICY IF EXISTS "Users can unblock other users" ON blocked_users;
CREATE POLICY "Users can unblock other users"
  ON blocked_users FOR DELETE
  USING (auth.uid() = user_id);
      `)

      console.log('\n✅ Instructions affichées. Veuillez exécuter le SQL manuellement.')
    } catch (err) {
      console.error('❌ Erreur:', err)
    }
    return
  }

  console.log('✅ Table blocked_users créée avec succès!')
}

// Exécuter la migration
createBlockedUsersTable()
  .then(() => {
    console.log('✅ Migration terminée')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur lors de la migration:', error)
    process.exit(1)
  })
