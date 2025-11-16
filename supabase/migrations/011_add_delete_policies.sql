-- ==========================================
-- AJOUTER LES POLITIQUES RLS DELETE
-- ==========================================

-- S'assurer que RLS est activé sur conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- S'assurer que RLS est activé sur messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Supprimer l'ancienne politique DELETE si elle existe
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs conversations" ON conversations;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs messages" ON messages;

-- Permettre aux utilisateurs de supprimer leurs conversations
CREATE POLICY "Les utilisateurs peuvent supprimer leurs conversations"
ON conversations
FOR DELETE
TO authenticated
USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- Permettre aux utilisateurs de supprimer les messages de leurs conversations
CREATE POLICY "Les utilisateurs peuvent supprimer leurs messages"
ON messages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (auth.uid() = conversations.user1_id OR auth.uid() = conversations.user2_id)
  )
);
