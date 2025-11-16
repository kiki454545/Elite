-- ==========================================
-- POLITIQUES RLS POUR TOUTES LES TABLES
-- ==========================================

-- ==========================================
-- 1. TABLE ADS (Annonces)
-- ==========================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Tout le monde peut voir les annonces" ON ads;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs annonces" ON ads;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs annonces" ON ads;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs annonces" ON ads;

-- Activer RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les annonces (même non connecté)
CREATE POLICY "Tout le monde peut voir les annonces"
ON ads
FOR SELECT
TO authenticated, anon
USING (true);

-- Les utilisateurs authentifiés peuvent créer des annonces
CREATE POLICY "Les utilisateurs peuvent créer leurs annonces"
ON ads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres annonces
CREATE POLICY "Les utilisateurs peuvent modifier leurs annonces"
ON ads
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres annonces
CREATE POLICY "Les utilisateurs peuvent supprimer leurs annonces"
ON ads
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- 2. TABLE FAVORITES (Favoris)
-- ==========================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs favoris" ON favorites;
DROP POLICY IF EXISTS "Les utilisateurs peuvent ajouter des favoris" ON favorites;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs favoris" ON favorites;

-- Activer RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres favoris
CREATE POLICY "Les utilisateurs peuvent voir leurs favoris"
ON favorites
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent ajouter des favoris
CREATE POLICY "Les utilisateurs peuvent ajouter des favoris"
ON favorites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs favoris
CREATE POLICY "Les utilisateurs peuvent supprimer leurs favoris"
ON favorites
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- 3. TABLE CONVERSATIONS (Conversations)
-- ==========================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs conversations" ON conversations;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des conversations" ON conversations;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs conversations" ON conversations;

-- Activer RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs conversations
CREATE POLICY "Les utilisateurs peuvent voir leurs conversations"
ON conversations
FOR SELECT
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Les utilisateurs peuvent créer des conversations
CREATE POLICY "Les utilisateurs peuvent créer des conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Les utilisateurs peuvent modifier leurs conversations (pour last_message)
CREATE POLICY "Les utilisateurs peuvent modifier leurs conversations"
ON conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id)
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ==========================================
-- 4. TABLE MESSAGES (Messages)
-- ==========================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les messages de leurs conversations" ON messages;
DROP POLICY IF EXISTS "Les utilisateurs peuvent envoyer des messages" ON messages;
DROP POLICY IF EXISTS "Les utilisateurs peuvent marquer les messages comme lus" ON messages;

-- Activer RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir les messages de leurs conversations
CREATE POLICY "Les utilisateurs peuvent voir les messages de leurs conversations"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);

-- Les utilisateurs peuvent envoyer des messages
CREATE POLICY "Les utilisateurs peuvent envoyer des messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);

-- Les utilisateurs peuvent marquer les messages comme lus
CREATE POLICY "Les utilisateurs peuvent marquer les messages comme lus"
ON messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);

-- ==========================================
-- ACCORDER LES PERMISSIONS D'EXÉCUTION DES FONCTIONS
-- ==========================================

-- S'assurer que les fonctions sont accessibles
GRANT EXECUTE ON FUNCTION increment_favorites(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION decrement_favorites(UUID) TO authenticated, anon;
