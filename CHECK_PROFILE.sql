-- Vérifier les profils existants
SELECT user_id, username, age, rank, verified, online
FROM profiles
LIMIT 10;

-- Vérifier les annonces et leurs user_id
SELECT id, user_id, title, location, status
FROM ads
LIMIT 10;
