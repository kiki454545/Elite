-- ============================================
-- Fonction RPC pour bannir/débannir des utilisateurs
-- ============================================
-- Cette fonction permet aux admins de bannir des utilisateurs
-- en contournant les RLS policies qui bloquent les mises à jour front-end

-- 1. Fonction pour bannir un utilisateur
CREATE OR REPLACE FUNCTION ban_user(
  target_user_id UUID,
  ban_duration_days INT DEFAULT NULL, -- NULL = ban permanent
  ban_reason_text TEXT DEFAULT NULL,
  admin_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Exécute avec les permissions du propriétaire de la fonction
AS $$
DECLARE
  ban_until TIMESTAMP WITH TIME ZONE;
  result JSON;
BEGIN
  -- Vérifier que l'utilisateur qui appelle la fonction est admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Accès refusé: vous devez être administrateur';
  END IF;

  -- Calculer la date de fin du ban (NULL = permanent)
  IF ban_duration_days IS NOT NULL THEN
    ban_until := NOW() + (ban_duration_days || ' days')::INTERVAL;
  ELSE
    ban_until := NULL; -- Ban permanent
  END IF;

  -- Mettre à jour le profil
  UPDATE profiles
  SET
    banned_until = ban_until,
    ban_reason = ban_reason_text,
    banned_at = NOW(),
    banned_by = COALESCE(admin_user_id, auth.uid())
  WHERE id = target_user_id;

  -- Vérifier que la mise à jour a réussi
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur non trouvé';
  END IF;

  -- Mettre en pause toutes les annonces actives de l'utilisateur
  UPDATE ads
  SET status = 'paused'
  WHERE user_id = target_user_id
    AND status = 'approved';

  -- Retourner le résultat
  SELECT json_build_object(
    'success', true,
    'user_id', target_user_id,
    'banned_until', ban_until,
    'ban_reason', ban_reason_text,
    'banned_at', NOW(),
    'banned_by', COALESCE(admin_user_id, auth.uid())
  ) INTO result;

  RETURN result;
END;
$$;

-- 2. Fonction pour débannir un utilisateur
CREATE OR REPLACE FUNCTION unban_user(
  target_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Vérifier que l'utilisateur qui appelle la fonction est admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Accès refusé: vous devez être administrateur';
  END IF;

  -- Mettre à jour le profil
  UPDATE profiles
  SET
    banned_until = NULL,
    ban_reason = NULL,
    banned_at = NULL,
    banned_by = NULL
  WHERE id = target_user_id;

  -- Vérifier que la mise à jour a réussi
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur non trouvé';
  END IF;

  -- Réactiver toutes les annonces qui étaient en pause
  UPDATE ads
  SET status = 'approved'
  WHERE user_id = target_user_id
    AND status = 'paused';

  -- Retourner le résultat
  SELECT json_build_object(
    'success', true,
    'user_id', target_user_id,
    'unbanned_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- 3. Ajouter des commentaires
COMMENT ON FUNCTION ban_user IS 'Bannit un utilisateur (accessible uniquement aux admins)';
COMMENT ON FUNCTION unban_user IS 'Débannit un utilisateur (accessible uniquement aux admins)';

-- 4. Donner les permissions aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION ban_user TO authenticated;
GRANT EXECUTE ON FUNCTION unban_user TO authenticated;

-- 5. Test de la fonction (à exécuter après création)
-- SELECT ban_user(
--   'ID_UTILISATEUR_A_BANNIR'::UUID,
--   7, -- 7 jours
--   'Test de bannissement',
--   NULL -- Utilise l'ID de l'admin connecté
-- );
