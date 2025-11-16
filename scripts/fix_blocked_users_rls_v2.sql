-- Supprimer TOUTES les politiques existantes sur blocked_users
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'blocked_users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON blocked_users', pol.policyname);
    END LOOP;
END $$;

-- Créer les nouvelles politiques
CREATE POLICY "Users can view blocked users"
  ON blocked_users FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() = blocked_user_id
  );

CREATE POLICY "Users can block other users"
  ON blocked_users FOR INSERT
  WITH CHECK (auth.uid() = user_id AND user_id != blocked_user_id);

CREATE POLICY "Users can unblock other users"
  ON blocked_users FOR DELETE
  USING (auth.uid() = user_id);
