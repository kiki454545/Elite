-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own blocked users" ON blocked_users;
DROP POLICY IF EXISTS "Users can block other users" ON blocked_users;
DROP POLICY IF EXISTS "Users can unblock other users" ON blocked_users;

-- Politique: Les utilisateurs peuvent voir les blocages où ils sont impliqués
CREATE POLICY "Users can view blocked users"
  ON blocked_users FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() = blocked_user_id
  );

-- Politique: Les utilisateurs peuvent bloquer d'autres utilisateurs
CREATE POLICY "Users can block other users"
  ON blocked_users FOR INSERT
  WITH CHECK (auth.uid() = user_id AND user_id != blocked_user_id);

-- Politique: Les utilisateurs peuvent débloquer d'autres utilisateurs
CREATE POLICY "Users can unblock other users"
  ON blocked_users FOR DELETE
  USING (auth.uid() = user_id);
