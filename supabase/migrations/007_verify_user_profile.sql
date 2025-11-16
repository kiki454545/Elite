-- ==========================================
-- VÉRIFIER ET CORRIGER LES PROFILS UTILISATEURS
-- ==========================================

-- Cette requête permet de voir les utilisateurs auth et leurs profils
-- Exécutez-la d'abord pour diagnostiquer le problème
SELECT
  au.id as auth_user_id,
  au.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.username
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- Si un profil existe avec le bon email mais pas le bon ID,
-- on peut le supprimer et le recréer avec le bon ID
-- (À UTILISER AVEC PRÉCAUTION - vérifiez d'abord les résultats de la requête ci-dessus)

-- Supprimer les profils orphelins (qui n'ont pas d'utilisateur auth correspondant)
-- DELETE FROM profiles
-- WHERE id NOT IN (SELECT id FROM auth.users);

-- Insérer les profils manquants
-- INSERT INTO profiles (id, username, email, age, verified, rank)
-- SELECT
--   au.id,
--   COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
--   au.email,
--   18 as age,
--   false as verified,
--   'standard' as rank
-- FROM auth.users au
-- LEFT JOIN profiles p ON au.id = p.id
-- WHERE p.id IS NULL
-- ON CONFLICT (id) DO NOTHING;
