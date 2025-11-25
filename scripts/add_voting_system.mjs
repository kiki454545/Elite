import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nkknpszjoldbaborpflr.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra25wc3pqb2xkYmFib3JwZmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk1NjQ0NywiZXhwIjoyMDYzNTMyNDQ3fQ.yBnC1a7-H0QP7l7aHqczo2OobiuOOd-dXRLPEqtDzNI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createVotingSystem() {
  console.log('🗳️ Création du système de vote...\n')

  // 1. Créer la table profile_votes
  console.log('📊 Création de la table profile_votes...')
  const { error: tableError } = await supabase.rpc('exec_sql', {
    sql: `
      -- Table pour stocker les votes des utilisateurs
      CREATE TABLE IF NOT EXISTS profile_votes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('top1', 'top5', 'top10', 'top50')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Un utilisateur ne peut voter qu'une fois par profil
        UNIQUE(voter_id, profile_id)
      );

      -- Index pour optimiser les requêtes
      CREATE INDEX IF NOT EXISTS idx_profile_votes_profile_id ON profile_votes(profile_id);
      CREATE INDEX IF NOT EXISTS idx_profile_votes_voter_id ON profile_votes(voter_id);
      CREATE INDEX IF NOT EXISTS idx_profile_votes_vote_type ON profile_votes(vote_type);
      CREATE INDEX IF NOT EXISTS idx_profile_votes_created_at ON profile_votes(created_at);

      -- RLS
      ALTER TABLE profile_votes ENABLE ROW LEVEL SECURITY;

      -- Politique pour voir tous les votes (pour les comptages)
      DROP POLICY IF EXISTS "Anyone can view votes" ON profile_votes;
      CREATE POLICY "Anyone can view votes" ON profile_votes
        FOR SELECT USING (true);

      -- Politique pour voter (utilisateur connecté avec compte > 1 semaine)
      DROP POLICY IF EXISTS "Users can vote" ON profile_votes;
      CREATE POLICY "Users can vote" ON profile_votes
        FOR INSERT WITH CHECK (
          auth.uid() = voter_id
          AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND created_at <= NOW() - INTERVAL '7 days'
          )
        );

      -- Politique pour modifier son propre vote
      DROP POLICY IF EXISTS "Users can update own votes" ON profile_votes;
      CREATE POLICY "Users can update own votes" ON profile_votes
        FOR UPDATE USING (auth.uid() = voter_id);

      -- Politique pour supprimer son propre vote
      DROP POLICY IF EXISTS "Users can delete own votes" ON profile_votes;
      CREATE POLICY "Users can delete own votes" ON profile_votes
        FOR DELETE USING (auth.uid() = voter_id);
    `
  })

  if (tableError) {
    console.log('⚠️ Erreur RPC, essai avec requêtes directes...')

    // Créer la table avec une requête SQL directe
    const { error: createError } = await supabase.from('profile_votes').select('id').limit(1)

    if (createError && createError.code === '42P01') {
      // Table n'existe pas, on la crée via l'API REST n'est pas possible
      // On va utiliser une approche différente
      console.log('⚠️ La table doit être créée manuellement dans Supabase Dashboard')
      console.log('\n📝 Exécutez ce SQL dans Supabase Dashboard > SQL Editor:\n')
      console.log(`
-- Table pour stocker les votes des utilisateurs
CREATE TABLE IF NOT EXISTS profile_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('top1', 'top5', 'top10', 'top50')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Un utilisateur ne peut voter qu'une fois par profil
  UNIQUE(voter_id, profile_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_profile_votes_profile_id ON profile_votes(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_votes_voter_id ON profile_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_profile_votes_vote_type ON profile_votes(vote_type);
CREATE INDEX IF NOT EXISTS idx_profile_votes_created_at ON profile_votes(created_at);

-- RLS
ALTER TABLE profile_votes ENABLE ROW LEVEL SECURITY;

-- Politique pour voir tous les votes (pour les comptages)
DROP POLICY IF EXISTS "Anyone can view votes" ON profile_votes;
CREATE POLICY "Anyone can view votes" ON profile_votes
  FOR SELECT USING (true);

-- Politique pour voter (utilisateur connecté)
DROP POLICY IF EXISTS "Users can vote" ON profile_votes;
CREATE POLICY "Users can vote" ON profile_votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- Politique pour modifier son propre vote
DROP POLICY IF EXISTS "Users can update own votes" ON profile_votes;
CREATE POLICY "Users can update own votes" ON profile_votes
  FOR UPDATE USING (auth.uid() = voter_id);

-- Politique pour supprimer son propre vote
DROP POLICY IF EXISTS "Users can delete own votes" ON profile_votes;
CREATE POLICY "Users can delete own votes" ON profile_votes
  FOR DELETE USING (auth.uid() = voter_id);
      `)
    } else {
      console.log('✅ Table profile_votes existe déjà')
    }
  } else {
    console.log('✅ Table profile_votes créée avec succès')
  }

  // 2. Ajouter une colonne vote_score aux profiles si elle n'existe pas
  console.log('\n📊 Ajout de la colonne vote_score aux profiles...')
  const { error: alterError } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vote_score INTEGER DEFAULT 0;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS top_rank INTEGER DEFAULT NULL;
    `
  })

  if (alterError) {
    console.log('⚠️ Ajoutez ces colonnes manuellement:')
    console.log(`
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vote_score INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS top_rank INTEGER DEFAULT NULL;
    `)
  } else {
    console.log('✅ Colonnes vote_score et top_rank ajoutées')
  }

  // 3. Créer une fonction pour calculer le score
  console.log('\n📊 Création de la fonction de calcul de score...')
  console.log(`
-- Fonction pour calculer le score d'un profil basé sur les votes
-- Points: top1 = 50pts, top5 = 20pts, top10 = 10pts, top50 = 5pts
CREATE OR REPLACE FUNCTION calculate_vote_score(p_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_score INTEGER;
BEGIN
  SELECT COALESCE(SUM(
    CASE vote_type
      WHEN 'top1' THEN 50
      WHEN 'top5' THEN 20
      WHEN 'top10' THEN 10
      WHEN 'top50' THEN 5
      ELSE 0
    END
  ), 0) INTO total_score
  FROM profile_votes
  WHERE profile_id = p_profile_id;

  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le score automatiquement après un vote
CREATE OR REPLACE FUNCTION update_profile_vote_score()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET vote_score = calculate_vote_score(OLD.profile_id)
    WHERE id = OLD.profile_id;
    RETURN OLD;
  ELSE
    UPDATE profiles
    SET vote_score = calculate_vote_score(NEW.profile_id)
    WHERE id = NEW.profile_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_vote_score ON profile_votes;
CREATE TRIGGER trigger_update_vote_score
AFTER INSERT OR UPDATE OR DELETE ON profile_votes
FOR EACH ROW EXECUTE FUNCTION update_profile_vote_score();
  `)

  console.log('\n✅ Script terminé!')
  console.log('\n📋 Résumé des actions à faire dans Supabase Dashboard:')
  console.log('1. Aller dans SQL Editor')
  console.log('2. Copier et exécuter le SQL ci-dessus')
  console.log('3. Vérifier que la table profile_votes est créée')
}

createVotingSystem().catch(console.error)
