-- ==========================================
-- CORRIGER LES POLITIQUES RLS POUR CONVERSATIONS
-- ==========================================

-- S'assurer que RLS est activé
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs conversations" ON conversations;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des conversations" ON conversations;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leurs conversations" ON conversations;

-- Permettre aux utilisateurs authentifiés de voir leurs conversations
CREATE POLICY "Les utilisateurs peuvent voir leurs conversations"
ON conversations
FOR SELECT
TO authenticated
USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- Permettre aux utilisateurs authentifiés de créer des conversations
CREATE POLICY "Les utilisateurs peuvent créer des conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- Permettre aux utilisateurs de mettre à jour leurs conversations
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs conversations"
ON conversations
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
)
WITH CHECK (
  auth.uid() = user1_id OR auth.uid() = user2_id
);
