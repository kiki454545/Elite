-- ========================================
-- CRÉER LES FONCTIONS RPC POUR LE BOOST
-- À exécuter dans le SQL Editor de Supabase
-- ========================================

-- Fonction 1: Boost des annonces actives
CREATE OR REPLACE FUNCTION boost_active_ads()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ad_record RECORD;
  new_date TIMESTAMP;
  new_views INT;
  new_favorites INT;
  ratio FLOAT;
  updated_count INT := 0;
BEGIN
  FOR ad_record IN
    SELECT id FROM ads WHERE status = 'approved'
  LOOP
    -- Date aléatoire entre 5 et 15 novembre 2025
    new_date := '2025-11-05 00:00:00'::timestamp +
                (random() * ('2025-11-15 23:59:59'::timestamp - '2025-11-05 00:00:00'::timestamp));

    -- Vues aléatoires entre 1500 et 50000
    new_views := 1500 + floor(random() * (50000 - 1500 + 1))::int;

    -- Favoris proportionnels aux vues (0.1% à 1%, max 50)
    ratio := 0.001 + (random() * 0.009);
    new_favorites := LEAST(floor(new_views * ratio)::int, 50);

    -- Mise à jour
    UPDATE ads
    SET
      created_at = new_date,
      views = new_views,
      favorites_count = new_favorites
    WHERE id = ad_record.id;

    updated_count := updated_count + 1;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'message', 'Annonces boostées avec succès',
    'updated_count', updated_count
  );
END;
$$;

-- Fonction 2: Création de nouveaux utilisateurs
CREATE OR REPLACE FUNCTION create_new_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  i INT;
  username TEXT;
  email TEXT;
  created_date TIMESTAMP;
  prefixes TEXT[] := ARRAY['Vip', 'Star', 'Angel', 'Bella', 'Luna', 'Diva', 'Queen', 'Princess', 'Lady', 'Sofia', 'Maya', 'Emma', 'Mia', 'Aria'];
  suffixes TEXT[] := ARRAY['Malta', 'Island', 'Dream', 'Passion', 'Love', 'Beauty', 'Charm', 'Style', 'Luxury', 'Premium', 'Goddess', 'Pearl', 'Ruby', 'Diamond'];
  prefix TEXT;
  suffix TEXT;
  created_count INT := 0;
BEGIN
  FOR i IN 1..3546 LOOP
    -- Générer un nom d'utilisateur aléatoire
    prefix := prefixes[1 + floor(random() * array_length(prefixes, 1))::int];
    suffix := suffixes[1 + floor(random() * array_length(suffixes, 1))::int];
    username := prefix || suffix || i::text;

    -- Générer un email unique
    email := 'user' || i::text || '_' || extract(epoch from now())::bigint::text || '@elite-malta.com';

    -- Date aléatoire entre 5 et 24 novembre 2025
    created_date := '2025-11-05 00:00:00'::timestamp +
                    (random() * ('2025-11-24 23:59:59'::timestamp - '2025-11-05 00:00:00'::timestamp));

    -- Insertion
    BEGIN
      INSERT INTO profiles (email, username, created_at, elite_coins)
      VALUES (email, username, created_date, 0);
      created_count := created_count + 1;
    EXCEPTION WHEN OTHERS THEN
      -- Ignorer les erreurs de contrainte unique
      NULL;
    END;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'message', 'Utilisateurs créés avec succès',
    'created_count', created_count
  );
END;
$$;

-- Afficher un message de succès
SELECT 'Fonctions RPC créées avec succès!' as status;
