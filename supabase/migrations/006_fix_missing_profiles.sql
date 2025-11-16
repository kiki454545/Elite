-- ==========================================
-- FIX PROFILS MANQUANTS
-- ==========================================
-- Cette migration crée les profils manquants pour les utilisateurs qui n'en ont pas

-- Insérer les profils manquants pour tous les utilisateurs auth.users qui n'ont pas de profil
INSERT INTO profiles (id, username, email, age, verified, rank)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
  au.email,
  18 as age, -- âge par défaut
  false as verified,
  'standard' as rank
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
