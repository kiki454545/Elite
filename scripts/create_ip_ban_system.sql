-- ============================================
-- Système de bannissement d'adresses IP
-- ============================================
-- Ce script crée la table et les fonctions pour bannir des IPs

-- 1. Créer la table banned_ips
CREATE TABLE IF NOT EXISTS banned_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  banned_by UUID REFERENCES profiles(id),
  banned_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer un index sur l'adresse IP pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_banned_ips_ip_address ON banned_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_banned_ips_banned_until ON banned_ips(banned_until) WHERE banned_until IS NOT NULL;

-- 3. Ajouter des commentaires
COMMENT ON TABLE banned_ips IS 'Table contenant les adresses IP bannies du site';
COMMENT ON COLUMN banned_ips.ip_address IS 'Adresse IP bannie';
COMMENT ON COLUMN banned_ips.reason IS 'Raison du bannissement';
COMMENT ON COLUMN banned_ips.banned_at IS 'Date et heure du bannissement';
COMMENT ON COLUMN banned_ips.banned_by IS 'ID de l''admin qui a banni l''IP';
COMMENT ON COLUMN banned_ips.banned_until IS 'Date de fin du ban (NULL = permanent)';

-- 4. Fonction pour bannir une IP
CREATE OR REPLACE FUNCTION ban_ip(
  target_ip TEXT,
  ban_reason TEXT DEFAULT NULL,
  ban_duration_days INT DEFAULT NULL,
  admin_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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

  -- Insérer ou mettre à jour le ban d'IP
  INSERT INTO banned_ips (ip_address, reason, banned_at, banned_by, banned_until)
  VALUES (target_ip, ban_reason, NOW(), COALESCE(admin_user_id, auth.uid()), ban_until)
  ON CONFLICT (ip_address)
  DO UPDATE SET
    reason = EXCLUDED.reason,
    banned_at = EXCLUDED.banned_at,
    banned_by = EXCLUDED.banned_by,
    banned_until = EXCLUDED.banned_until;

  -- Retourner le résultat
  SELECT json_build_object(
    'success', true,
    'ip_address', target_ip,
    'banned_until', ban_until,
    'reason', ban_reason,
    'banned_at', NOW(),
    'banned_by', COALESCE(admin_user_id, auth.uid())
  ) INTO result;

  RETURN result;
END;
$$;

-- 5. Fonction pour débannir une IP
CREATE OR REPLACE FUNCTION unban_ip(
  target_ip TEXT
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

  -- Supprimer le ban d'IP
  DELETE FROM banned_ips
  WHERE ip_address = target_ip;

  -- Vérifier que la suppression a réussi
  IF NOT FOUND THEN
    RAISE EXCEPTION 'IP non trouvée dans la liste des IPs bannies';
  END IF;

  -- Retourner le résultat
  SELECT json_build_object(
    'success', true,
    'ip_address', target_ip,
    'unbanned_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- 6. Fonction pour vérifier si une IP est bannie
CREATE OR REPLACE FUNCTION is_ip_banned(
  check_ip TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ban_record RECORD;
  result JSON;
BEGIN
  -- Chercher l'IP dans la table banned_ips
  SELECT * INTO ban_record
  FROM banned_ips
  WHERE ip_address = check_ip;

  -- Si l'IP n'est pas dans la table, elle n'est pas bannie
  IF NOT FOUND THEN
    RETURN json_build_object(
      'is_banned', false
    );
  END IF;

  -- Vérifier si le ban est toujours actif
  IF ban_record.banned_until IS NULL OR ban_record.banned_until > NOW() THEN
    -- Ban actif (permanent ou temporaire non expiré)
    RETURN json_build_object(
      'is_banned', true,
      'reason', ban_record.reason,
      'banned_until', ban_record.banned_until,
      'banned_at', ban_record.banned_at
    );
  ELSE
    -- Ban expiré, supprimer l'entrée
    DELETE FROM banned_ips WHERE ip_address = check_ip;
    RETURN json_build_object(
      'is_banned', false
    );
  END IF;
END;
$$;

-- 7. Donner les permissions
GRANT SELECT ON banned_ips TO authenticated;
GRANT EXECUTE ON FUNCTION ban_ip TO authenticated;
GRANT EXECUTE ON FUNCTION unban_ip TO authenticated;
GRANT EXECUTE ON FUNCTION is_ip_banned TO authenticated;
GRANT EXECUTE ON FUNCTION is_ip_banned TO anon;

-- 8. Commentaires sur les fonctions
COMMENT ON FUNCTION ban_ip IS 'Bannit une adresse IP (accessible uniquement aux admins)';
COMMENT ON FUNCTION unban_ip IS 'Débannit une adresse IP (accessible uniquement aux admins)';
COMMENT ON FUNCTION is_ip_banned IS 'Vérifie si une adresse IP est bannie';
