-- Créer la table pour la liste noire des numéros
CREATE TABLE IF NOT EXISTS phone_blacklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Index pour rechercher rapidement par numéro
  CONSTRAINT unique_user_phone UNIQUE(user_id, phone_number)
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_phone_blacklist_user_id ON phone_blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_blacklist_phone_number ON phone_blacklist(phone_number);

-- Activer RLS
ALTER TABLE phone_blacklist ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir tous les signalements (pour la recherche publique)
DROP POLICY IF EXISTS "Anyone can view blacklist entries" ON phone_blacklist;
CREATE POLICY "Anyone can view blacklist entries"
  ON phone_blacklist FOR SELECT
  USING (true);

-- Politique: Les utilisateurs peuvent ajouter des numéros
DROP POLICY IF EXISTS "Users can add phone numbers" ON phone_blacklist;
CREATE POLICY "Users can add phone numbers"
  ON phone_blacklist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent supprimer leurs propres entrées
DROP POLICY IF EXISTS "Users can delete their own entries" ON phone_blacklist;
CREATE POLICY "Users can delete their own entries"
  ON phone_blacklist FOR DELETE
  USING (auth.uid() = user_id);
